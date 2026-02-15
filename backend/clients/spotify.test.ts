import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getClientCredentialsToken,
  getTrack,
  getRefreshToken,
} from "./spotify";

describe("Spotify client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getClientCredentialsToken", () => {
    it("exchanges client id and secret for an access token", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          access_token: "test-token",
          token_type: "Bearer",
          expires_in: 3600,
        }),
      });

      const token = await getClientCredentialsToken("client-id", "client-secret");
      expect(token).toBe("test-token");

      const [url, options] = (fetch as any).mock.calls[0];
      expect(url).toBe("https://accounts.spotify.com/api/token");
      expect(options.method).toBe("POST");
    });
  });

  describe("getTrack", () => {
    it("fetches a track by id and returns song data", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: "abc123",
          name: "Test Song",
          artists: [{ name: "Test Artist" }],
          album: {
            name: "Test Album",
            images: [
              { url: "large.jpg" },
              { url: "medium.jpg" },
              { url: "small.jpg" },
            ],
          },
        }),
      });

      const song = await getTrack("abc123", "bearer-token");
      expect(song).toEqual({
        id: "abc123",
        name: "Test Song",
        artistName: "Test Artist",
        albumName: "Test Album",
        imageLargeUrl: "large.jpg",
        imageMediumUrl: "medium.jpg",
        imageSmallUrl: "small.jpg",
      });
    });
  });

  describe("getRefreshToken", () => {
    it("exchanges refresh token for access token", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          access_token: "refreshed-token",
          token_type: "Bearer",
        }),
      });

      const token = await getRefreshToken("refresh-token", "client-id", "client-secret");
      expect(token).toBe("refreshed-token");
    });
  });
});
