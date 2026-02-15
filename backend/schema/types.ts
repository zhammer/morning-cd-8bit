import { builder } from "./builder";
import type { Listen } from "../db/schema";
import type { Song } from "../clients/spotify";

// MusicProvider enum
export const MusicProviderEnum = builder.enumType("MusicProvider", {
  values: ["SPOTIFY"] as const,
});

// Song type
export const SongRef = builder.objectRef<Song>("Song");
builder.objectType(SongRef, {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name", { nullable: true }),
    songProvider: t.field({
      type: MusicProviderEnum,
      nullable: true,
      resolve: () => "SPOTIFY" as const,
    }),
    artistName: t.exposeString("artistName", { nullable: true }),
    albumName: t.exposeString("albumName", { nullable: true }),
    imageLargeUrl: t.exposeString("imageLargeUrl", { nullable: true }),
    imageMediumUrl: t.exposeString("imageMediumUrl", { nullable: true }),
    imageSmallUrl: t.exposeString("imageSmallUrl", { nullable: true }),
  }),
});

// Listen type — the DB row plus an optional resolved Song
export type ListenWithSong = Listen & { song?: Song | null };

export const ListenRef = builder.objectRef<ListenWithSong>("Listen");
builder.objectType(ListenRef, {
  fields: (t) => ({
    id: t.exposeID("id"),
    listenerName: t.exposeString("listenerName", { nullable: true }),
    listenTimeUtc: t.field({
      type: "DateTime",
      nullable: true,
      resolve: (listen) => listen.listenTimeUtc,
    }),
    note: t.exposeString("note", { nullable: true }),
    ianaTimezone: t.exposeString("ianaTimezone", { nullable: true }),
    song: t.field({
      type: SongRef,
      nullable: true,
      resolve: (listen) => listen.song || null,
    }),
  }),
});

// SunlightWindow type
export const SunlightWindowRef = builder.objectRef<{
  sunriseUtc: Date;
  sunsetUtc: Date;
}>("SunlightWindow");
builder.objectType(SunlightWindowRef, {
  fields: (t) => ({
    sunriseUtc: t.field({ type: "DateTime", nullable: false, resolve: (sw) => sw.sunriseUtc }),
    sunsetUtc: t.field({ type: "DateTime", nullable: false, resolve: (sw) => sw.sunsetUtc }),
  }),
});

// PageInfo type
export const PageInfoRef = builder.objectRef<{
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}>("PageInfo");
builder.objectType(PageInfoRef, {
  fields: (t) => ({
    hasNextPage: t.exposeBoolean("hasNextPage"),
    hasPreviousPage: t.exposeBoolean("hasPreviousPage"),
    startCursor: t.exposeString("startCursor", { nullable: true }),
    endCursor: t.exposeString("endCursor", { nullable: true }),
  }),
});

// ListenEdge type
export const ListenEdgeRef = builder.objectRef<{
  node: ListenWithSong;
  cursor: string;
}>("ListenEdge");
builder.objectType(ListenEdgeRef, {
  fields: (t) => ({
    node: t.field({ type: ListenRef, nullable: true, resolve: (edge) => edge.node }),
    cursor: t.field({ type: "DateTime", nullable: true, resolve: (edge) => edge.cursor }),
  }),
});

// ListenConnection type
export const ListenConnectionRef = builder.objectRef<{
  edges: Array<{ node: ListenWithSong; cursor: string }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}>("ListenConnection");
builder.objectType(ListenConnectionRef, {
  fields: (t) => ({
    pageInfo: t.field({ type: PageInfoRef, resolve: (conn) => conn.pageInfo }),
    edges: t.field({ type: [ListenEdgeRef], resolve: (conn) => conn.edges }),
  }),
});

// ListenInput
export const ListenInputRef = builder.inputType("ListenInput", {
  fields: (t) => ({
    songId: t.string({ required: true }),
    songProvider: t.field({ type: MusicProviderEnum, required: false }),
    listenerName: t.string({ required: true }),
    note: t.string({ required: false }),
    ianaTimezone: t.string({ required: true }),
  }),
});
