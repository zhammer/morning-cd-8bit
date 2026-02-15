import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../clients/spotify", () => ({
  getRefreshToken: vi.fn(),
  createPlaylist: vi.fn(),
  addTrackToPlaylist: vi.fn(),
  getPlaylistTracks: vi.fn(),
}));

import * as spotify from "../clients/spotify";
import { addListenToPlaylist } from "./playlists";

describe("playlists service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (spotify.getRefreshToken as any).mockResolvedValue("access-token");
    (spotify.createPlaylist as any).mockResolvedValue("playlist-123");
    (spotify.addTrackToPlaylist as any).mockResolvedValue(undefined);
    (spotify.getPlaylistTracks as any).mockResolvedValue([]);
  });

  it("creates a new playlist and adds the song when no playlist exists for the date", async () => {
    // Mock DB: no existing playlist, then insert succeeds
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      }),
    } as any;

    await addListenToPlaylist(mockDb, {
      songId: "track-abc",
      listenDate: "2026-02-15",
      spotifyClientId: "cid",
      spotifyClientSecret: "csec",
      spotifyRefreshToken: "rtok",
    });

    expect(spotify.createPlaylist).toHaveBeenCalled();
    expect(spotify.addTrackToPlaylist).toHaveBeenCalledWith(
      "access-token",
      "playlist-123",
      "track-abc"
    );
  });

  it("uses existing playlist when one exists for the date", async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { musicProviderPlaylistId: "existing-playlist" },
            ]),
          }),
        }),
      }),
    } as any;

    await addListenToPlaylist(mockDb, {
      songId: "track-abc",
      listenDate: "2026-02-15",
      spotifyClientId: "cid",
      spotifyClientSecret: "csec",
      spotifyRefreshToken: "rtok",
    });

    expect(spotify.createPlaylist).not.toHaveBeenCalled();
    expect(spotify.addTrackToPlaylist).toHaveBeenCalledWith(
      "access-token",
      "existing-playlist",
      "track-abc"
    );
  });

  it("skips adding if song is already in the playlist", async () => {
    (spotify.getPlaylistTracks as any).mockResolvedValue(["track-abc"]);

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { musicProviderPlaylistId: "existing-playlist" },
            ]),
          }),
        }),
      }),
    } as any;

    await addListenToPlaylist(mockDb, {
      songId: "track-abc",
      listenDate: "2026-02-15",
      spotifyClientId: "cid",
      spotifyClientSecret: "csec",
      spotifyRefreshToken: "rtok",
    });

    expect(spotify.addTrackToPlaylist).not.toHaveBeenCalled();
  });
});
