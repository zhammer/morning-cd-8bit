import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSunlightWindow } from "./sunlight";

vi.mock("../clients/sunrise-sunset", () => ({
  getSunriseSunset: vi.fn(),
}));

import { getSunriseSunset } from "../clients/sunrise-sunset";

describe("getSunlightWindow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (getSunriseSunset as any).mockResolvedValue({
      sunriseUtc: new Date("2026-02-15T11:30:00Z"),
      sunsetUtc: new Date("2026-02-15T22:45:00Z"),
    });
  });

  it("looks up coordinates for a valid timezone and returns sunrise/sunset", async () => {
    const result = await getSunlightWindow("America/New_York", "2026-02-15");

    expect(getSunriseSunset).toHaveBeenCalledTimes(1);
    const [lat, lng, date] = (getSunriseSunset as any).mock.calls[0];
    expect(typeof lat).toBe("number");
    expect(typeof lng).toBe("number");
    expect(date).toBe("2026-02-15");

    expect(result).toEqual({
      sunriseUtc: new Date("2026-02-15T11:30:00Z"),
      sunsetUtc: new Date("2026-02-15T22:45:00Z"),
    });
  });

  it("throws for an invalid timezone", async () => {
    await expect(
      getSunlightWindow("Invalid/Timezone", "2026-02-15")
    ).rejects.toThrow("Invalid IANA timezone");
  });
});
