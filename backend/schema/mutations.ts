import { builder } from "./builder";
import { ListenRef, ListenInputRef } from "./types";
import { submitListen } from "../services/listens";
import { addListenToPlaylist } from "../services/playlists";
import { getTrack, getClientCredentialsToken } from "../clients/spotify";

builder.mutationType({
  fields: (t) => ({
    submitListen: t.field({
      type: ListenRef,
      nullable: true,
      args: {
        input: t.arg({ type: ListenInputRef, required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const listen = await submitListen(ctx.db, {
          songId: args.input.songId,
          songProvider: args.input.songProvider || "SPOTIFY",
          listenerName: args.input.listenerName,
          note: args.input.note || undefined,
          ianaTimezone: args.input.ianaTimezone,
        });

        const token = await getClientCredentialsToken(
          process.env.SPOTIFY_CLIENT_ID!,
          process.env.SPOTIFY_CLIENT_SECRET!
        );
        const song = await getTrack(listen.songId, token);

        // Fire-and-forget: add to daily playlist
        const listenDate = listen.listenTimeUtc.toISOString().split("T")[0];
        addListenToPlaylist(ctx.db, {
          songId: listen.songId,
          listenDate,
          spotifyClientId: process.env.SPOTIFY_CLIENT_ID!,
          spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
          spotifyRefreshToken: process.env.SPOTIFY_USER_REFRESH_TOKEN!,
        }).catch((err) => {
          console.error("Failed to add listen to playlist:", err);
        });

        return { ...listen, song };
      },
    }),
  }),
});
