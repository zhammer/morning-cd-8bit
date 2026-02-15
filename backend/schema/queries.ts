import { builder } from "./builder";
import { ListenRef, ListenConnectionRef, SunlightWindowRef } from "./types";
import { getListen, getListens } from "../services/listens";
import { getSunlightWindow } from "../services/sunlight";
import { getTrack, getClientCredentialsToken } from "../clients/spotify";

builder.queryType({
  fields: (t) => ({
    listen: t.field({
      type: ListenRef,
      nullable: true,
      args: { id: t.arg.id({ required: true }) },
      resolve: async (_root, args, ctx) => {
        const listen = await getListen(ctx.db, Number(args.id));
        if (!listen) return null;
        try {
          const token = await getClientCredentialsToken(
            process.env.SPOTIFY_CLIENT_ID!,
            process.env.SPOTIFY_CLIENT_SECRET!
          );
          const song = await getTrack(listen.songId, token);
          return { ...listen, song };
        } catch {
          return { ...listen, song: null };
        }
      },
    }),

    allListens: t.field({
      type: ListenConnectionRef,
      nullable: true,
      args: {
        before: t.arg({ type: "DateTime", required: false }),
        after: t.arg({ type: "DateTime", required: false }),
        first: t.arg.int({ required: false }),
        last: t.arg.int({ required: false }),
      },
      resolve: async (_root, args, ctx) => {
        const connection = await getListens(ctx.db, {
          before: args.before ? new Date(args.before) : undefined,
          after: args.after ? new Date(args.after) : undefined,
          last: args.last || undefined,
        });

        const token = await getClientCredentialsToken(
          process.env.SPOTIFY_CLIENT_ID!,
          process.env.SPOTIFY_CLIENT_SECRET!
        );

        const edgesWithSongs = await Promise.all(
          connection.edges.map(async (edge) => {
            try {
              const song = await getTrack(edge.node.songId, token);
              return { ...edge, node: { ...edge.node, song } };
            } catch {
              return { ...edge, node: { ...edge.node, song: null } };
            }
          })
        );

        return { ...connection, edges: edgesWithSongs };
      },
    }),

    sunlightWindow: t.field({
      type: SunlightWindowRef,
      nullable: true,
      args: {
        ianaTimezone: t.arg.string({ required: true }),
        onDate: t.arg({ type: "Date", required: true }),
      },
      resolve: async (_root, args) => {
        return getSunlightWindow(args.ianaTimezone, args.onDate);
      },
    }),
  }),
});
