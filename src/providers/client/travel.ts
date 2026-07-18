import {
  ExecutionState,
  ProviderConsistency,
  SourceMode,
  type FlightSegment,
  type RecoveryCandidate,
} from "@/domain";
import { demoTravelProvider } from "@/providers/demo";
import type {
  AlternativeSearchInput,
  FlightStatusInput,
  FlightStatusResult,
  RebookingInput,
  RebookingResult,
  TravelProvider,
} from "@/providers/contracts";

const MAX_FRESHNESS_MS = 15 * 60_000;

function isFresh(value: string, observedAt: string): boolean {
  const age = Date.parse(observedAt) - Date.parse(value);
  return Number.isFinite(age) && age >= -60_000 && age <= MAX_FRESHNESS_MS;
}

function isIso(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function hasContinuousRoute(
  segments: readonly FlightSegment[],
  origin: string,
  destination: string,
  requireValidConnections = true,
): boolean {
  if (segments.length === 0) return false;
  if (segments[0]?.departureAirport !== origin) return false;
  if (segments.at(-1)?.arrivalAirport !== destination) return false;
  return segments.every((segment, index) => {
    const next = segments[index + 1];
    return (
      /^[A-Z]{3}$/.test(segment.departureAirport) &&
      /^[A-Z]{3}$/.test(segment.arrivalAirport) &&
      isIso(segment.estimatedDeparture) &&
      isIso(segment.estimatedArrival) &&
      Date.parse(segment.estimatedArrival) > Date.parse(segment.estimatedDeparture) &&
      (!next ||
        (segment.arrivalAirport === next.departureAirport &&
          (!requireValidConnections ||
            Date.parse(next.estimatedDeparture) > Date.parse(segment.estimatedArrival))))
    );
  });
}

export function isUsableLiveStatus(
  result: FlightStatusResult,
  input: FlightStatusInput,
): boolean {
  return (
    result.provider.mode === SourceMode.Live &&
    !result.provider.isSimulated &&
    isFresh(result.provider.observedAt, input.observedAt) &&
    result.segments.length === input.trip.segments.length &&
    result.segments.every((segment) => segment.provider.mode === SourceMode.Live) &&
    hasContinuousRoute(
      result.segments,
      input.trip.origin,
      input.trip.destination,
      false,
    )
  );
}

export function isUsableLiveCandidates(
  candidates: readonly RecoveryCandidate[],
  input: AlternativeSearchInput,
): boolean {
  return (
    candidates.length > 0 &&
    candidates.every(
      (candidate) =>
        candidate.provider.mode === SourceMode.Live &&
        !candidate.provider.isSimulated &&
        candidate.providerConsistency === ProviderConsistency.Consistent &&
        candidate.executionState === ExecutionState.Available &&
        candidate.seatsAvailable >= input.family.travelerCount &&
        candidate.segments.every((segment) => segment.provider.mode === SourceMode.Live) &&
        candidate.incrementalCost.currency === "INR" &&
        Number.isSafeInteger(candidate.incrementalCost.amountMinor) &&
        candidate.incrementalCost.amountMinor >= 0 &&
        isFresh(candidate.priceObservedAt, input.observedAt) &&
        isFresh(candidate.provider.observedAt, input.observedAt) &&
        hasContinuousRoute(
          candidate.segments,
          input.trip.origin,
          input.trip.destination,
        ),
    )
  );
}

export class ApiTravelProvider implements TravelProvider {
  constructor(private readonly request: typeof fetch = fetch) {}

  private async call<T>(body: object): Promise<T> {
    const response = await this.request("/api/providers/travel", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error(`Travel provider failed: ${response.status}`);
    return (await response.json()) as T;
  }

  getFlightStatus(input: FlightStatusInput): Promise<FlightStatusResult> {
    return this.call({ operation: "status", input });
  }

  searchAlternatives(
    input: AlternativeSearchInput,
  ): Promise<readonly RecoveryCandidate[]> {
    return this.call({ operation: "search", input });
  }

  executeRebooking(input: RebookingInput): Promise<RebookingResult> {
    void input;
    throw new Error("Live ticket execution is not supported.");
  }
}

export class FallbackTravelProvider implements TravelProvider {
  constructor(
    private readonly primary: TravelProvider,
    private readonly fallback: TravelProvider = demoTravelProvider,
  ) {}

  async getFlightStatus(input: FlightStatusInput): Promise<FlightStatusResult> {
    try {
      const result = await this.primary.getFlightStatus(input);
      if (isUsableLiveStatus(result, input)) return result;
    } catch {
      // A missing, timed-out, or malformed live response must not weaken demo mode.
    }
    return this.fallback.getFlightStatus(input);
  }

  async searchAlternatives(
    input: AlternativeSearchInput,
  ): Promise<readonly RecoveryCandidate[]> {
    const fixtureCandidates = await this.fallback.searchAlternatives(input);
    try {
      const result = await this.primary.searchAlternatives(input);
      if (isUsableLiveCandidates(result, input)) {
        const liveIds = new Set(result.map((candidate) => candidate.id));
        return [
          ...result,
          ...fixtureCandidates.filter((candidate) => !liveIds.has(candidate.id)),
        ];
      }
    } catch {
      // Deterministic fixtures remain the availability floor.
    }
    return fixtureCandidates;
  }

  executeRebooking(input: RebookingInput): Promise<RebookingResult> {
    return this.fallback.executeRebooking(input);
  }
}

export function createLiveFallbackTravelProvider(): TravelProvider {
  return new FallbackTravelProvider(new ApiTravelProvider());
}
