import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { RestLink } from 'apollo-link-rest';
import { createHttpLink } from 'apollo-link-http';
import { ApolloLink } from 'apollo-link';
import { Song } from '../definitions';
import { fetch as fetchPolyfill } from 'whatwg-fetch';

/**
 * TYPE DEFS
 */
const typeDefs = gql`
  extend type Query {
    questionInput: String!
    nameInput: String!
    noteInput: String!
    sundial: Sundial!
    lastSubmit: DateTime
    accessToken: String
    searchSongs(query: String!): [Song]
    song(id: ID!): Song
    aboutPageOpen: Boolean!
  }
  type Sundial {
    state: SundialState!
    # The last sunrise the occurred. Null if state == calibrating.
    lastSunrise: DateTime
  }
  enum SundialState {
    calibrating
    beforesunrise
    day
    afterSunset
  }
`;

/**
 * CACHE
 */
const cache = new InMemoryCache();
const initialData = {
  data: {
    questionInput: '',
    noteInput: '',
    nameInput: '',
    lastSubmit: localStorage.getItem('lastSubmit'),
    aboutPageOpen: false,
    sundial: {
      state: 'calibrating',
      lastSunrise: null,
      __typename: 'Sundial'
    },
    ...readPersistedCache()
  }
};
cache.writeData(initialData);

/**
 * LINK
 */
const httpLink = createHttpLink({
  fetch: (window as any).cypressGraphqlFetch || window.fetch,
  uri: (import.meta.env.VITE_MORNING_CD_API_ENDPOINT || '') + '/graphql'
});

function pluckSong(rawSong: any): Song {
  return {
    id: rawSong.id,
    name: rawSong.name,
    artistName: rawSong.artists[0].name,
    albumName: rawSong.album.name,
    imageLargeUrl: rawSong.album.images[0].url,
    imageMediumUrl: rawSong.album.images[1].url,
    imageSmallUrl: rawSong.album.images[2].url
  };
}

const restLink = new RestLink({
  // cypress hack: see https://github.com/cypress-io/cypress/issues/95
  customFetch: window.fetch || fetchPolyfill,
  uri: (import.meta.env.VITE_MORNING_CD_API_ENDPOINT || '') + '/',
  endpoints: {
    morningCd: {
      uri: (import.meta.env.VITE_MORNING_CD_API_ENDPOINT || '') + '/',
      // this transformer is only made for the accesstoken endpoint
      responseTransformer: async response => {
        const data = await response.json();
        return data.accessToken;
      }
    },
    spotify: {
      uri: 'https://api.spotify.com/v1',
      responseTransformer: async (response, typeName) => {
        if (typeName === '[Song]') {
          const responseJson = await response.json();
          const rawSongs = responseJson.tracks.items;
          return rawSongs.map(pluckSong);
        }
        if (typeName === 'Song') {
          const responseJson = await response.json();
          return pluckSong(responseJson);
        }
      }
    }
  }
});

const spotifyAuthHeadersLink = new ApolloLink((operation, forward) => {
  if (['SearchSongsQuery', 'SongQuery'].includes(operation.operationName)) {
    const { cache } = operation.getContext();
    const accessToken = cache.data.data.ROOT_QUERY.accessToken;
    operation.setContext({
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }
  if (forward) {
    return forward(operation);
  }
  return null;
});

function readPersistedCache(): {} {
  const value = localStorage.getItem('persistedApolloCache');
  return value ? JSON.parse(value) : {};
}
export function updatePersistedCache(data: {}) {
  const nextCache = { ...data, ...readPersistedCache() };
  localStorage.setItem('persistedApolloCache', JSON.stringify(nextCache));
}

const link = ApolloLink.from([spotifyAuthHeadersLink, restLink, httpLink]);

/**
 * CLIENT
 */
export const client = new ApolloClient({
  cache,
  typeDefs,
  link
});
client.onResetStore(async () => {
  cache.writeData(initialData);
});
