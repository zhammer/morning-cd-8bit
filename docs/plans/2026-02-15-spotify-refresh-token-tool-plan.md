# Spotify Refresh Token Tool Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a local script that runs Spotify's Authorization Code flow and prints a refresh token.

**Architecture:** Single TypeScript script using Node built-ins (`http`, `url`, `crypto`, `child_process`). Loads env vars from `.env.local` via `dotenv` (already a devDependency). No new dependencies.

**Tech Stack:** TypeScript, Node.js built-ins, dotenv

---

### Task 1: Create the refresh token script

**Files:**
- Create: `scripts/get-spotify-refresh-token.ts`

**Step 1: Create the script**

Create `scripts/get-spotify-refresh-token.ts` with the following:

```typescript
import 'dotenv/config';
import http from 'http';
import { URL } from 'url';
import crypto from 'crypto';
import { exec } from 'child_process';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const PORT = 8888;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPES = 'playlist-modify-public';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    'Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET.\n' +
      'Set them in .env.local or as environment variables.'
  );
  process.exit(1);
}

const state = crypto.randomBytes(16).toString('hex');

const authorizeUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
  }).toString();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url!, `http://localhost:${PORT}`);

  if (url.pathname !== '/callback') {
    res.writeHead(404);
    res.end();
    return;
  }

  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Authorization denied. You can close this window.');
    console.error(`Authorization error: ${error}`);
    server.close();
    return;
  }

  if (returnedState !== state) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('State mismatch. You can close this window.');
    console.error('State mismatch — possible CSRF attack.');
    server.close();
    return;
  }

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('No code received. You can close this window.');
    console.error('No authorization code received.');
    server.close();
    return;
  }

  // Exchange the code for tokens
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }).toString(),
  });

  const data = await tokenResponse.json();

  if (!tokenResponse.ok) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Token exchange failed. Check your terminal.');
    console.error('Token exchange failed:', data);
    server.close();
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Got your refresh token! You can close this window.');

  console.log('\n✅ Success!\n');
  console.log('Refresh token:');
  console.log(data.refresh_token);
  console.log('\nSet this as SPOTIFY_USER_REFRESH_TOKEN in your Vercel environment variables.');

  server.close();
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
  console.log('Opening Spotify authorization page in your browser...\n');

  // Open browser (macOS)
  exec(`open "${authorizeUrl}"`);
});
```

**Step 2: Run the script to verify it starts**

Run: `npx tsx scripts/get-spotify-refresh-token.ts`

Expected: Script prints "Listening on http://localhost:8888" and opens browser. Ctrl+C to stop.

**Step 3: Commit**

```bash
git add scripts/get-spotify-refresh-token.ts
git commit -m "feat: add Spotify refresh token script"
```

---

### Task 2: Add package.json script

**Files:**
- Modify: `package.json` (scripts section)

**Step 1: Add the script entry**

Add to the `scripts` section in `package.json`:

```json
"get-spotify-token": "npx tsx scripts/get-spotify-refresh-token.ts"
```

**Step 2: Verify it runs**

Run: `yarn get-spotify-token`

Expected: Same behavior as running with npx tsx directly.

**Step 3: Commit**

```bash
git add package.json
git commit -m "feat: add get-spotify-token script to package.json"
```

---

### Task 3: Load dotenv from .env.local specifically

**Files:**
- Modify: `scripts/get-spotify-refresh-token.ts` (line 1)

**Step 1: Update dotenv import to target .env.local**

The default `dotenv/config` loads `.env`, but this project uses `.env.local`. Change the import at the top of the script:

```typescript
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
```

Replace the `import 'dotenv/config';` line.

**Step 2: Verify**

Run: `yarn get-spotify-token`

Expected: If `.env.local` exists with Spotify creds, the script starts normally. If not, prints the missing env var error.

**Step 3: Commit**

```bash
git add scripts/get-spotify-refresh-token.ts
git commit -m "fix: load dotenv from .env.local"
```
