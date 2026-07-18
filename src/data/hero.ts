import {
  CabinClass,
  ExecutionState,
  ProviderConsistency,
  SegmentStatus,
  SourceMode,
  type EvaluateRecoveryInput,
  type FamilyProfile,
  type FlightSegment,
  type ProviderMetadata,
  type RecoveryCandidate,
  type RecoveryPolicy,
  type Trip,
} from "@/domain";

export const HERO_NOW = "2026-08-14T18:00:00.000Z";

export const fixtureMetadata: ProviderMetadata = {
  source: "safarset-fixtures",
  mode: SourceMode.Fixture,
  isSimulated: true,
  observedAt: HERO_NOW,
  confidence: 1,
};

export const heroFamily: FamilyProfile = {
  id: "family-gurgaon-001",
  displayName: "Mehra family",
  homeAirport: "DEL",
  adults: 2,
  children: 2,
  travelerCount: 4,
};

export const heroPolicy: RecoveryPolicy = {
  id: "policy-family-001",
  familyId: heroFamily.id,
  requireFamilyTogether: true,
  forbidSelfTransfer: true,
  maxStops: 1,
  minimumCabin: CabinClass.PremiumEconomy,
  approvedTransitAirports: ["DXB", "DOH", "IST"],
  minimumConnectionMinutes: 90,
  arrivalDeadline: "2026-08-16T14:30:00.000Z",
  autoSpendLimit: { currency: "INR", amountMinor: 7_500_000 },
  avoidOvernight: true,
};

export function createHeroTrip(cancelled = false): Trip {
  const segments: FlightSegment[] = [
    {
      id: "original-cdg-dxb",
      flightNumber: "SS101",
      departureAirport: "CDG",
      arrivalAirport: "DXB",
      scheduledDeparture: "2026-08-14T08:00:00.000Z",
      scheduledArrival: "2026-08-14T16:00:00.000Z",
      estimatedDeparture: "2026-08-14T10:30:00.000Z",
      estimatedArrival: "2026-08-14T19:00:00.000Z",
      cabin: CabinClass.PremiumEconomy,
      status: cancelled ? SegmentStatus.Cancelled : SegmentStatus.Delayed,
      seatsAvailable: 4,
      provider: fixtureMetadata,
    },
    {
      id: "original-dxb-del",
      flightNumber: "SS202",
      departureAirport: "DXB",
      arrivalAirport: "DEL",
      scheduledDeparture: "2026-08-14T18:00:00.000Z",
      scheduledArrival: "2026-08-14T22:00:00.000Z",
      estimatedDeparture: "2026-08-14T18:00:00.000Z",
      estimatedArrival: "2026-08-14T22:00:00.000Z",
      cabin: CabinClass.PremiumEconomy,
      status: SegmentStatus.Scheduled,
      seatsAvailable: 4,
      provider: fixtureMetadata,
    },
  ];

  return {
    id: "trip-paris-delhi-001",
    familyId: heroFamily.id,
    origin: "CDG",
    destination: "DEL",
    segments,
  };
}

export type CandidateOptions = Readonly<{
  id?: string;
  seatsAvailable?: number;
  selfTransfer?: boolean;
  stops?: 1 | 2;
  transitAirport?: string;
  cabin?: CabinClass;
  shortConnection?: boolean;
  lateArrival?: boolean;
  incrementalCostMinor?: number;
  priceObservedAt?: string;
  providerConsistency?: ProviderConsistency;
  executionState?: ExecutionState;
  requiresOvernight?: boolean;
  approvalRequired?: boolean;
  departureOffsetMinutes?: number;
}>;

function isoOffset(base: string, minutes: number): string {
  return new Date(Date.parse(base) + minutes * 60_000).toISOString();
}

export function createCandidate(
  options: CandidateOptions = {},
): RecoveryCandidate {
  const id = options.id ?? "candidate-doha-001";
  const transitAirport = options.transitAirport ?? "DOH";
  const cabin = options.cabin ?? CabinClass.PremiumEconomy;
  const departure = isoOffset(HERO_NOW, options.departureOffsetMinutes ?? 180);
  const firstArrival = isoOffset(departure, 360);
  const connectionMinutes = options.shortConnection ? 60 : 120;
  const secondDeparture = isoOffset(firstArrival, connectionMinutes);
  const normalFinalArrival = isoOffset(secondDeparture, 240);
  const finalArrival = options.lateArrival
    ? "2026-08-16T15:30:00.000Z"
    : normalFinalArrival;
  const seatsAvailable = options.seatsAvailable ?? 4;

  const segments: FlightSegment[] = [
    {
      id: `${id}-segment-1`,
      flightNumber: "SS301",
      departureAirport: "CDG",
      arrivalAirport: transitAirport,
      scheduledDeparture: departure,
      scheduledArrival: firstArrival,
      estimatedDeparture: departure,
      estimatedArrival: firstArrival,
      cabin,
      status: SegmentStatus.Scheduled,
      seatsAvailable,
      provider: fixtureMetadata,
    },
  ];

  if (options.stops === 2) {
    const middleArrival = isoOffset(secondDeparture, 120);
    const thirdDeparture = isoOffset(middleArrival, 120);
    segments.push({
      id: `${id}-segment-2`,
      flightNumber: "SS302",
      departureAirport: transitAirport,
      arrivalAirport: "DXB",
      scheduledDeparture: secondDeparture,
      scheduledArrival: middleArrival,
      estimatedDeparture: secondDeparture,
      estimatedArrival: middleArrival,
      cabin,
      status: SegmentStatus.Scheduled,
      seatsAvailable,
      provider: fixtureMetadata,
    });
    segments.push({
      id: `${id}-segment-3`,
      flightNumber: "SS303",
      departureAirport: "DXB",
      arrivalAirport: "DEL",
      scheduledDeparture: thirdDeparture,
      scheduledArrival: isoOffset(thirdDeparture, 240),
      estimatedDeparture: thirdDeparture,
      estimatedArrival: options.lateArrival
        ? "2026-08-16T15:30:00.000Z"
        : isoOffset(thirdDeparture, 240),
      cabin,
      status: SegmentStatus.Scheduled,
      seatsAvailable,
      provider: fixtureMetadata,
    });
  } else {
    segments.push({
      id: `${id}-segment-2`,
      flightNumber: "SS303",
      departureAirport: transitAirport,
      arrivalAirport: "DEL",
      scheduledDeparture: secondDeparture,
      scheduledArrival: finalArrival,
      estimatedDeparture: secondDeparture,
      estimatedArrival: finalArrival,
      cabin,
      status: SegmentStatus.Scheduled,
      seatsAvailable,
      provider: fixtureMetadata,
    });
  }

  return {
    id,
    segments,
    seatsAvailable,
    selfTransfer: options.selfTransfer ?? false,
    incrementalCost: {
      currency: "INR",
      amountMinor: options.incrementalCostMinor ?? 6_500_000,
    },
    priceObservedAt:
      options.priceObservedAt ?? isoOffset(HERO_NOW, -1),
    providerConsistency:
      options.providerConsistency ?? ProviderConsistency.Consistent,
    executionState: options.executionState ?? ExecutionState.Available,
    requiresOvernight: options.requiresOvernight ?? false,
    approvalRequired: options.approvalRequired ?? false,
    provider: fixtureMetadata,
  };
}

export function createHeroInput(
  candidates: readonly RecoveryCandidate[] = [createCandidate()],
  cancelled = false,
  usedIdempotencyKeys: ReadonlySet<string> = new Set(),
): EvaluateRecoveryInput {
  return {
    trip: createHeroTrip(cancelled),
    family: heroFamily,
    policy: heroPolicy,
    candidates,
    eventId: "disruption-hero-001",
    now: HERO_NOW,
    usedIdempotencyKeys,
  };
}

export const heroTrip = createHeroTrip();
export const heroCandidates = [
  createCandidate({ requiresOvernight: true }),
  createCandidate({ id: "candidate-split-002", seatsAvailable: 3 }),
  createCandidate({ id: "candidate-self-transfer-003", selfTransfer: true }),
] as const;
