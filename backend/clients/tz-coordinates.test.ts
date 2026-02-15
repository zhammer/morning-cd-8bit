import { describe, it, expect } from "vitest";
import { getCoordinatesForTimezone } from "./tz-coordinates";

describe("getCoordinatesForTimezone", () => {
  it("returns coordinates for a known timezone", () => {
    const coords = getCoordinatesForTimezone("America/New_York");
    expect(coords).not.toBeNull();
    expect(coords!.latitude).toBeCloseTo(40.714, 1);
    expect(coords!.longitude).toBeCloseTo(-74.006, 1);
  });

  it("returns null for an unknown timezone", () => {
    expect(getCoordinatesForTimezone("Invalid/Timezone")).toBeNull();
  });
});
