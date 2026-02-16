# Spotify Refresh Token Tool

## Problem

The project needs a `SPOTIFY_USER_REFRESH_TOKEN` for playlist management. There's no tooling to obtain one via Spotify's OAuth Authorization Code flow. Currently you'd have to do this manually via curl/Postman.

## Design

A single TypeScript script (`scripts/get-spotify-refresh-token.ts`) that automates the Spotify Authorization Code flow locally.

### Flow

1. Reads `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` from environment (`.env.local`)
2. Starts a temporary HTTP server on `localhost:8888`
3. Opens the browser to Spotify's `/authorize` endpoint with scope `playlist-modify-public` and redirect URI `http://localhost:8888/callback`
4. User logs in and approves in the browser
5. Spotify redirects to localhost with an authorization `code`
6. Script exchanges the code for tokens at `accounts.spotify.com/api/token`
7. Prints the refresh token, shuts down the server

### Dependencies

None new. Uses Node built-ins (`http`, `url`, `crypto`, `child_process`). Run with `npx tsx`.

### Package.json

Add script: `"get-spotify-token": "tsx scripts/get-spotify-refresh-token.ts"`

### Spotify App Setup

Add `http://localhost:8888/callback` as a redirect URI in the Spotify app dashboard (one-time).

## Decisions

- No third-party packages — the OAuth flow is ~50 lines and avoids trusting external code with credentials
- Reads env vars from `.env.local` for convenience (same file the project already uses)
- Prints token to stdout rather than writing to a file — user copies it to Vercel env vars manually
