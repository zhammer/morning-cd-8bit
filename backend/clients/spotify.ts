export interface Song {
  id: string;
  name: string;
  artistName: string;
  albumName: string;
  imageLargeUrl: string;
  imageMediumUrl: string;
  imageSmallUrl: string;
}

export async function getClientCredentialsToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Spotify auth failed: ${data.error}`);
  }
  return data.access_token;
}

export async function getRefreshToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Spotify refresh failed: ${data.error}`);
  }
  return data.access_token;
}

export async function getTrack(
  trackId: string,
  accessToken: string
): Promise<Song> {
  const response = await fetch(
    `https://api.spotify.com/v1/tracks/${trackId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!response.ok) {
    throw new Error(`Spotify getTrack failed: ${response.status}`);
  }
  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    artistName: data.artists[0].name,
    albumName: data.album.name,
    imageLargeUrl: data.album.images[0]?.url,
    imageMediumUrl: data.album.images[1]?.url,
    imageSmallUrl: data.album.images[2]?.url,
  };
}

export async function createPlaylist(
  accessToken: string,
  name: string,
  description: string
): Promise<string> {
  const response = await fetch("https://api.spotify.com/v1/me/playlists", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description, public: true }),
  });
  if (!response.ok) {
    throw new Error(`Spotify createPlaylist failed: ${response.status}`);
  }
  const data = await response.json();
  return data.id;
}

export async function addTrackToPlaylist(
  accessToken: string,
  playlistId: string,
  trackId: string
): Promise<void> {
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
    }
  );
  if (!response.ok) {
    throw new Error(`Spotify addTrackToPlaylist failed: ${response.status}`);
  }
}

export async function getPlaylistTracks(
  accessToken: string,
  playlistId: string
): Promise<string[]> {
  const trackIds: string[] = [];
  let url: string | null =
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`Spotify getPlaylistTracks failed: ${response.status}`);
    }
    const data = await response.json();
    for (const item of data.items) {
      if (item.track) {
        trackIds.push(item.track.id);
      }
    }
    url = data.next;
  }

  return trackIds;
}
