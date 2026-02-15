import { eq } from "drizzle-orm";
import { playlists } from "../db/schema";
import {
  getRefreshToken,
  createPlaylist,
  addTrackToPlaylist,
  getPlaylistTracks,
} from "../clients/spotify";
import type { Db } from "../db/client";

const PLAYLIST_EMOJIS = [
  "\u{1F338}", "\u{2B50}", "\u{1F33F}", "\u{1F341}",
  "\u{1F430}", "\u{1F331}", "\u{2744}\u{FE0F}", "\u{26F0}\u{FE0F}",
  "\u{1F50A}", "\u{1F30A}",
];

function playlistName(date: string): string {
  const emoji = PLAYLIST_EMOJIS[Math.floor(Math.random() * PLAYLIST_EMOJIS.length)];
  return `${emoji}~morning cd ${date}~${emoji}`;
}

function playlistDescription(date: string): string {
  return `Listens submitted to morning cd on ${date}.`;
}

interface AddListenToPlaylistInput {
  songId: string;
  listenDate: string;
  spotifyClientId: string;
  spotifyClientSecret: string;
  spotifyRefreshToken: string;
}

export async function addListenToPlaylist(
  db: Db,
  input: AddListenToPlaylistInput
): Promise<void> {
  const accessToken = await getRefreshToken(
    input.spotifyRefreshToken,
    input.spotifyClientId,
    input.spotifyClientSecret
  );

  // Check if a playlist already exists for this date
  const existing = await db
    .select()
    .from(playlists)
    .where(eq(playlists.playlistDate, input.listenDate))
    .limit(1);

  let playlistId: string;

  if (existing.length === 0) {
    // Create a new Spotify playlist
    playlistId = await createPlaylist(
      accessToken,
      playlistName(input.listenDate),
      playlistDescription(input.listenDate)
    );

    await db.insert(playlists).values({
      playlistDate: input.listenDate,
      musicProvider: "SPOTIFY",
      musicProviderPlaylistId: playlistId,
    });
  } else {
    playlistId = existing[0].musicProviderPlaylistId;
  }

  // Check if song is already in the playlist (idempotency)
  const trackIds = await getPlaylistTracks(accessToken, playlistId);
  if (trackIds.includes(input.songId)) {
    return;
  }

  await addTrackToPlaylist(accessToken, playlistId, input.songId);
}
