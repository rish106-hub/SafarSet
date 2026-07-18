const MINUTE_MS = 60_000;

export function timestampMs(value: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ISO timestamp: ${value}`);
  }
  return parsed;
}

export function minutesBetween(start: string, end: string): number {
  return (timestampMs(end) - timestampMs(start)) / MINUTE_MS;
}
