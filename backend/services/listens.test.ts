import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./sunlight", () => ({
  getSunlightWindow: vi.fn(),
}));

import { getSunlightWindow } from "./sunlight";
import { submitListen } from "./listens";

describe("listens service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("submitListen", () => {
    it("rejects if it is not daytime (after sunset)", async () => {
      (getSunlightWindow as any).mockResolvedValue({
        sunriseUtc: new Date("2026-02-15T11:00:00Z"),
        sunsetUtc: new Date("2026-02-15T22:00:00Z"),
      });

      // Mock DB — won't be reached since validation fails first
      const mockDb = {} as any;

      await expect(
        submitListen(
          mockDb,
          {
            songId: "abc",
            listenerName: "Test",
            ianaTimezone: "America/New_York",
          },
          new Date("2026-02-15T23:00:00Z") // after sunset
        )
      ).rejects.toThrow("not currently daytime");
    });

    it("rejects if it is not daytime (before sunrise)", async () => {
      (getSunlightWindow as any).mockResolvedValue({
        sunriseUtc: new Date("2026-02-15T11:00:00Z"),
        sunsetUtc: new Date("2026-02-15T22:00:00Z"),
      });

      const mockDb = {} as any;

      await expect(
        submitListen(
          mockDb,
          {
            songId: "abc",
            listenerName: "Test",
            ianaTimezone: "America/New_York",
          },
          new Date("2026-02-15T10:00:00Z") // before sunrise
        )
      ).rejects.toThrow("not currently daytime");
    });

    it("inserts a listen when it is daytime", async () => {
      (getSunlightWindow as any).mockResolvedValue({
        sunriseUtc: new Date("2026-02-15T11:00:00Z"),
        sunsetUtc: new Date("2026-02-15T22:00:00Z"),
      });

      const insertedListen = {
        id: 1,
        songId: "abc",
        songProvider: "SPOTIFY",
        listenerName: "Test",
        listenTimeUtc: new Date("2026-02-15T15:00:00Z"),
        note: null,
        ianaTimezone: "America/New_York",
        createdAtUtc: new Date(),
        updatedOnUtc: new Date(),
      };

      // Mock the Drizzle chain: db.insert().values().returning()
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([insertedListen]),
          }),
        }),
      } as any;

      const result = await submitListen(
        mockDb,
        {
          songId: "abc",
          listenerName: "Test",
          ianaTimezone: "America/New_York",
        },
        new Date("2026-02-15T15:00:00Z") // during daytime
      );

      expect(result.id).toBe(1);
      expect(result.songId).toBe("abc");
      expect(result.listenerName).toBe("Test");
    });
  });
});
