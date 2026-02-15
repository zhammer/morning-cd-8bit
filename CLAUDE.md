# Morning CD 8bit

## What This Is

Morning CD is a website where people share the first song they listened to each morning. This repo is being consolidated from 5 separate repos (1 frontend + 4 Python backend microservices) into a single Vercel-deployed monolith.

## Architecture

- **Frontend**: React 16.8 CRA app with Apollo Client, XState, styled-components (in `src/`)
- **Backend**: TypeScript Vercel Serverless Functions (in `api/`) with shared code (in `backend/`)
- **Database**: Vercel Postgres (Neon) via Drizzle ORM + @neondatabase/serverless
- **GraphQL**: GraphQL Yoga + Pothos (code-first schema)
- **Deploy**: Single Vercel project — frontend builds to static assets, `api/*.ts` becomes serverless functions

## Key Files

- `api/graphql.ts` — Main GraphQL endpoint (`/api/graphql`)
- `api/accesstoken.ts` — Spotify access token for frontend (`/api/accesstoken`)
- `backend/schema/` — Pothos GraphQL type definitions, queries, mutations
- `backend/services/` — Business logic (listens, sunlight, playlists)
- `backend/db/schema.ts` — Drizzle ORM table definitions (listens, playlists)
- `backend/db/client.ts` — Database connection via Neon serverless driver
- `backend/clients/` — External API clients (Spotify, sunrise-sunset.org)
- `src/apollo/index.ts` — Frontend Apollo Client setup (GraphQL + REST links)
- `cypress/plugins/schema.graphql` — Canonical GraphQL schema the frontend expects

## Environment Variables

- `DATABASE_URL` — Vercel Postgres (Neon) connection string (auto-populated by Vercel integration)
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` — Spotify app credentials
- `SPOTIFY_USER_REFRESH_TOKEN` — For playlist management on behalf of the morningcd Spotify user
- `REACT_APP_MORNING_CD_API_ENDPOINT` — Set to `/api` in production (relative, same domain)

## Commands

- `yarn start` — Run frontend dev server (CRA)
- `yarn build` — Build frontend for production
- `yarn test` — Run frontend tests (CRA/Jest)
- `yarn test:backend` — Run backend tests (Vitest)
- `yarn test:backend:watch` — Run backend tests in watch mode
- `yarn db:generate` — Generate Drizzle migrations
- `yarn db:push` — Push schema directly to database
- `yarn db:studio` — Open Drizzle Studio

## Design Decisions

- No Hasura — chose all-Vercel approach for fewer moving parts
- Frontend unchanged — same React CRA app, only API URL changes
- GraphQL schema matches existing `cypress/plugins/schema.graphql` exactly so frontend queries don't change
- Playlist updates are fire-and-forget inside submitListen mutation
- The "sundial" (day/night cycle) is core UX — frontend fetches sunlightWindow for yesterday/today/tomorrow and uses XState machine to determine app state

## Plans

- Design doc: `docs/plans/2026-02-15-backend-consolidation-design.md`
- Implementation plan: `docs/plans/2026-02-15-backend-consolidation-plan.md`
