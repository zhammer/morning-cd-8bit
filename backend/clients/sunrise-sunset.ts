export interface SunriseSunsetResult {
  sunriseUtc: Date;
  sunsetUtc: Date;
}

export async function getSunriseSunset(
  lat: number,
  lng: number,
  date: string
): Promise<SunriseSunsetResult> {
  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${date}&formatted=0`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error(`sunrise-sunset.org returned status: ${data.status}`);
  }

  return {
    sunriseUtc: new Date(data.results.sunrise),
    sunsetUtc: new Date(data.results.sunset),
  };
}
