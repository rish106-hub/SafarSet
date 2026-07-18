import {
  CabinClass,
  ExecutionState,
  ProviderConsistency,
  SegmentStatus,
  SourceMode,
  type FlightSegment,
  type ProviderMetadata,
  type RecoveryCandidate,
} from "@/domain";
import type {
  AlternativeSearchInput,
  FlightStatusInput,
  FlightStatusResult,
  RebookingInput,
  RebookingResult,
  TravelProvider,
} from "@/providers/contracts";

type JsonRecord = Record<string, unknown>;

export type AmadeusProviderOptions = Readonly<{
  apiKey: string;
  apiSecret: string;
  environment?: "test" | "production";
  request?: typeof fetch;
  now?: () => number;
}>;

const BASE_URLS = {
  test: "https://test.api.amadeus.com",
  production: "https://api.amadeus.com",
} as const;

function record(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.map(record).filter((item): item is JsonRecord => item !== null)
    : [];
}

function string(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function integer(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function cabin(value: unknown): CabinClass {
  switch (value) {
    case "FIRST": return CabinClass.First;
    case "BUSINESS": return CabinClass.Business;
    case "PREMIUM_ECONOMY": return CabinClass.PremiumEconomy;
    default: return CabinClass.Economy;
  }
}

function iso(value: unknown): string | null {
  const parsed = string(value);
  return parsed && Number.isFinite(Date.parse(parsed))
    ? new Date(parsed).toISOString()
    : null;
}

function moneyMinor(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed >= 0
    ? Math.round(parsed * 100)
    : null;
}

function provider(observedAt: string): ProviderMetadata {
  return {
    source: "Amadeus Self-Service APIs",
    mode: SourceMode.Live,
    isSimulated: false,
    observedAt,
    confidence: 0.9,
  };
}

function flightIdentity(flightNumber: string): { carrier: string; number: string } {
  const match = /^([A-Z0-9]{2})(\d{1,4})$/.exec(flightNumber.trim().toUpperCase());
  if (!match) throw new Error(`Unsupported flight number: ${flightNumber}`);
  return { carrier: match[1], number: match[2] };
}

function timing(point: JsonRecord, kind: "departure" | "arrival"): string | null {
  const movement = record(point[kind]);
  const values = records(movement?.timings);
  const preferred = values.find((item) => item.qualifier === "ETD" || item.qualifier === "ETA")
    ?? values.find((item) => item.qualifier === "STD" || item.qualifier === "STA")
    ?? values[0];
  return iso(preferred?.value);
}

export class AmadeusTravelProvider implements TravelProvider {
  private token: { value: string; expiresAt: number } | null = null;
  private tokenRequest: Promise<string> | null = null;
  private readonly baseUrl: string;
  private readonly request: typeof fetch;
  private readonly now: () => number;

  constructor(private readonly options: AmadeusProviderOptions) {
    if (!options.apiKey || !options.apiSecret) throw new Error("Amadeus credentials are missing.");
    this.baseUrl = BASE_URLS[options.environment ?? "test"];
    this.request = options.request ?? fetch;
    this.now = options.now ?? Date.now;
  }

  private async accessToken(): Promise<string> {
    if (this.token && this.token.expiresAt - 60_000 > this.now()) return this.token.value;
    if (this.tokenRequest) return this.tokenRequest;
    this.tokenRequest = (async () => {
      const response = await this.request(`${this.baseUrl}/v1/security/oauth2/token`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.options.apiKey,
          client_secret: this.options.apiSecret,
        }),
        signal: AbortSignal.timeout(4_000),
      });
      if (!response.ok) throw new Error(`Amadeus authentication failed: ${response.status}`);
      const payload = record(await response.json());
      const value = string(payload?.access_token);
      const expiresIn = integer(payload?.expires_in);
      if (!value || !expiresIn || expiresIn <= 0) throw new Error("Invalid Amadeus token response.");
      this.token = { value, expiresAt: this.now() + expiresIn * 1_000 };
      return value;
    })();
    try {
      return await this.tokenRequest;
    } finally {
      this.tokenRequest = null;
    }
  }

  private async get(path: string, parameters: URLSearchParams): Promise<JsonRecord> {
    const token = await this.accessToken();
    const response = await this.request(`${this.baseUrl}${path}?${parameters}`, {
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4_000),
    });
    if (!response.ok) throw new Error(`Amadeus request failed: ${response.status}`);
    const payload = record(await response.json());
    if (!payload) throw new Error("Invalid Amadeus response.");
    return payload;
  }

  async getFlightStatus(input: FlightStatusInput): Promise<FlightStatusResult> {
    const segments = await Promise.all(input.trip.segments.map(async (segment) => {
      const identity = flightIdentity(segment.flightNumber);
      const payload = await this.get("/v2/schedule/flights", new URLSearchParams({
        carrierCode: identity.carrier,
        flightNumber: identity.number,
        scheduledDepartureDate: segment.scheduledDeparture.slice(0, 10),
      }));
      const flight = records(payload.data)[0];
      const points = records(flight?.flightPoints);
      const departure = points[0];
      const arrival = points.at(-1);
      const estimatedDeparture = departure ? timing(departure, "departure") : null;
      const estimatedArrival = arrival ? timing(arrival, "arrival") : null;
      if (!estimatedDeparture || !estimatedArrival) throw new Error("Amadeus status is incomplete.");
      return {
        ...segment,
        estimatedDeparture,
        estimatedArrival,
        status:
          estimatedDeparture !== segment.scheduledDeparture || estimatedArrival !== segment.scheduledArrival
            ? SegmentStatus.Delayed
            : SegmentStatus.Scheduled,
        provider: provider(input.observedAt),
      } satisfies FlightSegment;
    }));
    return { segments, provider: provider(input.observedAt) };
  }

  async searchAlternatives(
    input: AlternativeSearchInput,
  ): Promise<readonly RecoveryCandidate[]> {
    const departureDate = input.disruption.detectedAt.slice(0, 10);
    const payload = await this.get("/v2/shopping/flight-offers", new URLSearchParams({
      originLocationCode: input.trip.origin,
      destinationLocationCode: input.trip.destination,
      departureDate,
      adults: String(input.family.adults),
      children: String(input.family.children),
      travelClass: input.policy.minimumCabin,
      currencyCode: "INR",
      max: "20",
    }));

    return records(payload.data).flatMap((offer, offerIndex) => {
      const itinerary = records(offer.itineraries)[0];
      const rawSegments = records(itinerary?.segments);
      const price = record(offer.price);
      const seatsAvailable = integer(offer.numberOfBookableSeats);
      const amountMinor = moneyMinor(price?.total);
      const offerId = string(offer.id) ?? String(offerIndex + 1);
      if (!itinerary || rawSegments.length === 0 || seatsAvailable === null || amountMinor === null) return [];
      const fareDetails = records(records(offer.travelerPricings)[0]?.fareDetailsBySegment);
      const segments: FlightSegment[] = [];
      for (const [index, rawSegment] of rawSegments.entries()) {
        const departure = record(rawSegment.departure);
        const arrival = record(rawSegment.arrival);
        const carrierCode = string(rawSegment.carrierCode);
        const number = string(rawSegment.number);
        const departureAirport = string(departure?.iataCode);
        const arrivalAirport = string(arrival?.iataCode);
        const departureAt = iso(departure?.at);
        const arrivalAt = iso(arrival?.at);
        if (!carrierCode || !number || !departureAirport || !arrivalAirport || !departureAt || !arrivalAt) return [];
        const segmentCabin = cabin(fareDetails.find((detail) => detail.segmentId === rawSegment.id)?.cabin);
        segments.push({
          id: `amadeus-${offerId}-segment-${index + 1}`,
          flightNumber: `${carrierCode}${number}`,
          departureAirport,
          arrivalAirport,
          scheduledDeparture: departureAt,
          scheduledArrival: arrivalAt,
          estimatedDeparture: departureAt,
          estimatedArrival: arrivalAt,
          cabin: segmentCabin,
          status: SegmentStatus.Scheduled,
          seatsAvailable,
          provider: provider(input.observedAt),
        });
      }
      const requiresOvernight = segments.some((segment, index) => {
        const next = segments[index + 1];
        return next ? Date.parse(next.estimatedDeparture) - Date.parse(segment.estimatedArrival) >= 6 * 60 * 60_000 : false;
      });
      return [{
        id: `amadeus-${offerId}`,
        segments,
        seatsAvailable,
        selfTransfer: offer.source !== "GDS",
        // Offer total is used as a conservative spend ceiling, never as a falsely low fare delta.
        incrementalCost: { currency: "INR", amountMinor },
        priceObservedAt: input.observedAt,
        providerConsistency: ProviderConsistency.Consistent,
        executionState: seatsAvailable >= input.family.travelerCount
          ? ExecutionState.Available
          : ExecutionState.Unavailable,
        requiresOvernight,
        approvalRequired: false,
        provider: provider(input.observedAt),
      } satisfies RecoveryCandidate];
    });
  }

  async executeRebooking(input: RebookingInput): Promise<RebookingResult> {
    void input;
    return {
      accepted: false,
      confirmationCode: null,
      provider: {
        source: "Amadeus execution disabled",
        mode: SourceMode.Unavailable,
        isSimulated: false,
        observedAt: new Date(this.now()).toISOString(),
        confidence: 1,
      },
    };
  }
}

let singleton: AmadeusTravelProvider | null = null;

export function getAmadeusTravelProvider(): AmadeusTravelProvider {
  if (singleton) return singleton;
  const environment = process.env.AMADEUS_ENVIRONMENT === "production" ? "production" : "test";
  singleton = new AmadeusTravelProvider({
    apiKey: process.env.AMADEUS_API_KEY ?? "",
    apiSecret: process.env.AMADEUS_API_SECRET ?? "",
    environment,
  });
  return singleton;
}
