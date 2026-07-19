import {
  SegmentStatus,
  SourceMode,
  type FlightSegment,
  type ProviderMetadata,
} from "@/domain";
import type { FlightStatusInput, FlightStatusResult, FlightStatusProvider } from "@/providers/contracts";

type JsonRecord = Record<string, unknown>;

export type AviationstackProviderOptions = Readonly<{
  apiKey: string;
  request?: typeof fetch;
}>;

const FLIGHTS_ENDPOINT = "https://api.aviationstack.com/v1/flights";

function record(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.map(record).filter((item): item is JsonRecord => item !== null)
    : [];
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function iso(value: unknown): string | null {
  const raw = text(value);
  return raw && Number.isFinite(Date.parse(raw)) ? new Date(raw).toISOString() : null;
}

function delay(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function provider(observedAt: string): ProviderMetadata {
  return {
    source: "Aviationstack flights API",
    mode: SourceMode.Live,
    isSimulated: false,
    observedAt,
    confidence: 0.9,
  };
}

function sameTime(left: string, right: string): boolean {
  return Date.parse(left) === Date.parse(right);
}

function statusFor(
  flightStatus: string | null,
  scheduledDeparture: string,
  scheduledArrival: string,
  estimatedDeparture: string,
  estimatedArrival: string,
  departureDelay: number,
  arrivalDelay: number,
): SegmentStatus {
  if (flightStatus === "cancelled") return SegmentStatus.Cancelled;
  if (
    departureDelay > 0 ||
    arrivalDelay > 0 ||
    !sameTime(scheduledDeparture, estimatedDeparture) ||
    !sameTime(scheduledArrival, estimatedArrival)
  ) {
    return SegmentStatus.Delayed;
  }
  return SegmentStatus.Scheduled;
}

function matchingFlight(rows: readonly JsonRecord[], segment: FlightSegment): JsonRecord | null {
  const targetFlight = segment.flightNumber.toUpperCase();
  const targetDate = segment.scheduledDeparture.slice(0, 10);
  return rows.find((row) => {
    const flight = record(row.flight);
    const departure = record(row.departure);
    const arrival = record(row.arrival);
    return (
      text(flight?.iata)?.toUpperCase() === targetFlight &&
      text(departure?.iata)?.toUpperCase() === segment.departureAirport &&
      text(arrival?.iata)?.toUpperCase() === segment.arrivalAirport &&
      text(row.flight_date) === targetDate
    );
  }) ?? null;
}

export class AviationstackFlightStatusProvider implements FlightStatusProvider {
  private readonly request: typeof fetch;

  constructor(private readonly options: AviationstackProviderOptions) {
    if (!options.apiKey) throw new Error("Aviationstack API key is missing.");
    this.request = options.request ?? fetch;
  }

  async getFlightStatus(input: FlightStatusInput): Promise<FlightStatusResult> {
    const segments: FlightSegment[] = [];
    for (const segment of input.trip.segments) {
      const query = new URLSearchParams({
        access_key: this.options.apiKey,
        flight_iata: segment.flightNumber,
      });
      const response = await this.request(`${FLIGHTS_ENDPOINT}?${query}`, {
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Aviationstack request failed: ${response.status}`);
      const payload = record(await response.json());
      const apiError = record(payload?.error);
      if (apiError) throw new Error(text(apiError.message) ?? "Aviationstack rejected the request.");
      const flight = matchingFlight(records(payload?.data), segment);
      if (!flight) {
        throw new Error(
          `Aviationstack returned no matching live status for ${segment.flightNumber}. ` +
          "Date-specific future and historical lookup needs a plan that supports it.",
        );
      }
      const departure = record(flight.departure);
      const arrival = record(flight.arrival);
      const estimatedDeparture = iso(departure?.estimated) ?? iso(departure?.actual) ?? iso(departure?.scheduled);
      const estimatedArrival = iso(arrival?.estimated) ?? iso(arrival?.actual) ?? iso(arrival?.scheduled);
      if (!estimatedDeparture || !estimatedArrival) {
        throw new Error(`Aviationstack status is incomplete for ${segment.flightNumber}.`);
      }
      segments.push({
        ...segment,
        estimatedDeparture,
        estimatedArrival,
        status: statusFor(
          text(flight.flight_status)?.toLowerCase() ?? null,
          segment.scheduledDeparture,
          segment.scheduledArrival,
          estimatedDeparture,
          estimatedArrival,
          delay(departure?.delay),
          delay(arrival?.delay),
        ),
        provider: provider(input.observedAt),
      });
    }
    return { segments, provider: provider(input.observedAt) };
  }
}

let singleton: AviationstackFlightStatusProvider | null = null;

export function getAviationstackFlightStatusProvider(): AviationstackFlightStatusProvider {
  if (!singleton) {
    singleton = new AviationstackFlightStatusProvider({ apiKey: process.env.AVIATIONSTACK_API_KEY ?? "" });
  }
  return singleton;
}
