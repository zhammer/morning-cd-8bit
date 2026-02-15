import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSunriseSunset } from "./sunrise-sunset";

describe("getSunriseSunset", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns sunrise and sunset UTC times for given coordinates and date", async () => {
    const mockResponse = {
      results: {
        sunrise: "2026-02-15T11:30:00+00:00",
        sunset: "2026-02-15T22:45:00+00:00",
      },
      status: "OK",
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await getSunriseSunset(40.7128, -74.006, "2026-02-15");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.sunrise-sunset.org/json?lat=40.7128&lng=-74.006&date=2026-02-15&formatted=0"
    );
    expect(result).toEqual({
      sunriseUtc: new Date("2026-02-15T11:30:00+00:00"),
      sunsetUtc: new Date("2026-02-15T22:45:00+00:00"),
    });
  });

  it("throws on non-OK status", async () => {
    const mockResponse = { results: {}, status: "INVALID_REQUEST" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await expect(
      getSunriseSunset(999, 999, "bad-date")
    ).rejects.toThrow("sunrise-sunset.org");
  });
});
