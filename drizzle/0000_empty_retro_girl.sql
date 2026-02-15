CREATE TABLE "listens" (
	"id" serial PRIMARY KEY NOT NULL,
	"song_id" varchar(50) NOT NULL,
	"song_provider" varchar(10) DEFAULT 'SPOTIFY' NOT NULL,
	"listener_name" varchar(30) NOT NULL,
	"note" varchar(100),
	"listen_time_utc" timestamp NOT NULL,
	"iana_timezone" varchar(40) NOT NULL,
	"created_at_utc" timestamp DEFAULT now() NOT NULL,
	"updated_on_utc" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"playlist_date" date NOT NULL,
	"music_provider" varchar(10) DEFAULT 'SPOTIFY' NOT NULL,
	"music_provider_playlist_id" varchar(32) NOT NULL,
	"created_at_utc" timestamp DEFAULT now() NOT NULL,
	"updated_on_utc" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "playlists_playlist_date_unique" UNIQUE("playlist_date")
);
--> statement-breakpoint
CREATE INDEX "idx_listens_listen_time_utc" ON "listens" USING btree ("listen_time_utc");--> statement-breakpoint
CREATE INDEX "idx_playlists_playlist_date" ON "playlists" USING btree ("playlist_date");