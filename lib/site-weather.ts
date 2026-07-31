export type SiteWeatherData = {
  locationLabel: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  imageryUrl: string;
  observation: {
    stationId: string;
    stationName: string;
    temperatureF: number | null;
    humidityPercent: number | null;
    dewpointF: number | null;
    windSpeedMph: number | null;
    windGustMph: number | null;
    windDirectionDegrees: number | null;
    windDirectionCardinal: string | null;
    pressureInHg: number | null;
    precipitationLastHourIn: number | null;
    precipitationLast3HoursIn: number | null;
    condition: string | null;
    observedAt: string;
    ageMinutes: number | null;
    isCurrent: boolean;
    source: string;
    sourceUrl: string;
  };
  forecast: {
    temperatureF: number | null;
    humidityPercent: number | null;
    rainChancePercent: number | null;
    precipitationAmountIn: number | null;
    skyCoverPercent: number | null;
    sunlightEstimatePercent: number | null;
    sunlightMethod: string;
    isDaytime: boolean;
    windSpeed: string | null;
    windDirection: string | null;
    condition: string | null;
    periodStartAt: string | null;
    source: string;
    sourceUrl: string;
    sourceUpdatedAt: string | null;
  } | null;
  ambientFallback: {
    temperatureF: number | null;
    source: 'nws_observation';
    observedAt: string;
  };
  fetchedAt: string;
};
