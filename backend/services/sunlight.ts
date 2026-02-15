import { getSunriseSunset, type SunriseSunsetResult } from "../clients/sunrise-sunset";
import { getCoordinatesForTimezone } from "../clients/tz-coordinates";

export async function getSunlightWindow(
  ianaTimezone: string,
  onDate: string
): Promise<SunriseSunsetResult> {
  const coords = getCoordinatesForTimezone(ianaTimezone);
  if (!coords) {
    throw new Error(`Invalid IANA timezone: ${ianaTimezone}`);
  }
  return getSunriseSunset(coords.latitude, coords.longitude, onDate);
}
