const MALFORMED_CELSIUS = /Â°C/g;
const MALFORMED_FAHRENHEIT = /Â°F/g;

export function displayTelemetryText(value: string): string {
  return value.replace(MALFORMED_CELSIUS, '°F').replace(MALFORMED_FAHRENHEIT, '°F');
}

export function displayTelemetryUnit(
  unit: string | null | undefined,
  options: { temperature?: boolean } = {}
): string {
  const normalized = displayTelemetryText(unit?.trim() ?? '');

  if (options.temperature && normalized.toUpperCase() === 'F') {
    return '°F';
  }

  return normalized;
}

export function isTemperatureTelemetryKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return normalized.includes('temperature') || normalized.includes('setpoint');
}
