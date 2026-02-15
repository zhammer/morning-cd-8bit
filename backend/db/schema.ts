import {
  pgTable,
  serial,
  varchar,
  timestamp,
  date,
  index,
} from "drizzle-orm/pg-core";

export const listens = pgTable(
  "listens",
  {
    id: serial("id").primaryKey(),
    songId: varchar("song_id", { length: 50 }).notNull(),
    songProvider: varchar("song_provider", { length: 10 }).notNull().default("SPOTIFY"),
    listenerName: varchar("listener_name", { length: 30 }).notNull(),
    note: varchar("note", { length: 100 }),
    listenTimeUtc: timestamp("listen_time_utc").notNull(),
    ianaTimezone: varchar("iana_timezone", { length: 40 }).notNull(),
    createdAtUtc: timestamp("created_at_utc").notNull().defaultNow(),
    updatedOnUtc: timestamp("updated_on_utc").notNull().defaultNow(),
  },
  (table) => [index("idx_listens_listen_time_utc").on(table.listenTimeUtc)]
);

export const playlists = pgTable(
  "playlists",
  {
    id: serial("id").primaryKey(),
    playlistDate: date("playlist_date").notNull().unique(),
    musicProvider: varchar("music_provider", { length: 10 }).notNull().default("SPOTIFY"),
    musicProviderPlaylistId: varchar("music_provider_playlist_id", { length: 32 }).notNull(),
    createdAtUtc: timestamp("created_at_utc").notNull().defaultNow(),
    updatedOnUtc: timestamp("updated_on_utc").notNull().defaultNow(),
  },
  (table) => [index("idx_playlists_playlist_date").on(table.playlistDate)]
);

export type Listen = typeof listens.$inferSelect;
export type NewListen = typeof listens.$inferInsert;
export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;
