import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import http from 'http';
import { URL } from 'url';
import crypto from 'crypto';
import { exec } from 'child_process';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const PORT = 3000;
const REDIRECT_URI = `http://127.0.0.1:${PORT}`;
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
  const url = new URL(req.url!, `http://127.0.0.1:${PORT}`);

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

  console.log('\nSuccess!\n');
  console.log('Refresh token:');
  console.log(data.refresh_token);
  console.log('\nSet this as SPOTIFY_USER_REFRESH_TOKEN in your Vercel environment variables.');

  server.close();
});

server.listen(PORT, () => {
  console.log(`Listening on http://127.0.0.1:${PORT}`);
  console.log('Opening Spotify authorization page in your browser...\n');

  // Open browser (macOS)
  exec(`open "${authorizeUrl}"`);
});
