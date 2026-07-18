import { describe, expect, it, vi } from "vitest";

import {
  ProviderConsistency,
  SourceMode,
  type ProviderMetadata,
  type RecoveryCandidate,
} from "@/domain";
import {
  HERO_NOW,
  createCandidate,
  createHeroInput,
  createHeroTrip,
  heroFamily,
  heroPolicy,
} from "@/data";
import { detectDisruption } from "@/engine";
import {
  FallbackTravelProvider,
  isUsableLiveCandidates,
  isUsableLiveStatus,
} from "@/providers/client/travel";
import { demoTravelProvider } from "@/providers/demo";
import type { AlternativeSearchInput, FlightStatusInput, TravelProvider } from "@/providers/contracts";

const liveMetadata: ProviderMetadata = {
  source: "Amadeus Self-Service APIs",
  mode: SourceMode.Live,
  isSimulated: false,
  observedAt: HERO_NOW,
  confidence: 0.9,
};

function statusInput(): FlightStatusInput {
  return { trip: createHeroTrip(), observedAt: HERO_NOW };
}

function searchInput(): AlternativeSearchInput {
  const hero = createHeroInput();
  const event = detectDisruption({
    trip: hero.trip,
    policy: hero.policy,
    eventId: hero.eventId,
    observedAt: hero.now,
  });
  if (!event) throw new Error("Hero disruption missing.");
  return {
    trip: createHeroTrip(),
    disruption: event,
    family: heroFamily,
    policy: heroPolicy,
    observedAt: HERO_NOW,
  };
}

function liveStatus() {
  const segments = createHeroTrip().segments.map((segment) => ({
    ...segment,
    provider: liveMetadata,
  }));
  return { segments, provider: liveMetadata };
}

function liveCandidate(overrides: Partial<RecoveryCandidate> = {}): RecoveryCandidate {
  const base = createCandidate();
  return {
    ...base,
    segments: base.segments.map((segment) => ({ ...segment, provider: liveMetadata })),
    priceObservedAt: HERO_NOW,
    provider: liveMetadata,
    ...overrides,
  };
}

function primary(overrides: Partial<TravelProvider>): TravelProvider {
  return {
    getFlightStatus: vi.fn(async () => liveStatus()),
    searchAlternatives: vi.fn(async () => [liveCandidate()]),
    executeRebooking: vi.fn(async () => { throw new Error("must not execute"); }),
    ...overrides,
  };
}

describe("live travel fallback", () => {
  it("accepts complete fresh live status and candidates", () => {
    expect(isUsableLiveStatus(liveStatus(), statusInput())).toBe(true);
    expect(isUsableLiveCandidates([liveCandidate()], searchInput())).toBe(true);
  });

  it("falls back when status fails or is stale", async () => {
    const failed = new FallbackTravelProvider(primary({
      getFlightStatus: vi.fn(async () => { throw new Error("timeout"); }),
    }));
    expect((await failed.getFlightStatus(statusInput())).provider.mode).toBe(SourceMode.Fixture);

    const stale = { ...liveMetadata, observedAt: "2026-08-14T17:00:00.000Z" };
    const staleProvider = new FallbackTravelProvider(primary({
      getFlightStatus: vi.fn(async () => ({
        ...liveStatus(),
        provider: stale,
      })),
    }));
    expect((await staleProvider.getFlightStatus(statusInput())).provider.mode).toBe(SourceMode.Fixture);
  });

  it("falls back for empty, stale, or conflicting offers", async () => {
    const cases: TravelProvider[] = [
      primary({ searchAlternatives: vi.fn(async () => []) }),
      primary({ searchAlternatives: vi.fn(async () => [liveCandidate({ priceObservedAt: "2026-08-14T17:00:00.000Z" })]) }),
      primary({ searchAlternatives: vi.fn(async () => [liveCandidate({ providerConsistency: ProviderConsistency.Conflicting })]) }),
    ];
    for (const provider of cases) {
      const result = await new FallbackTravelProvider(provider).searchAlternatives(searchInput());
      expect(result[0]?.provider.mode).toBe(SourceMode.Fixture);
    }
  });

  it("passes valid live offers but always simulates execution", async () => {
    const fallback = new FallbackTravelProvider(primary({}), demoTravelProvider);
    const candidates = await fallback.searchAlternatives(searchInput());
    expect(candidates[0]?.provider.mode).toBe(SourceMode.Live);
    expect(candidates.some((candidate) => candidate.provider.mode === SourceMode.Fixture)).toBe(true);

    const execution = await fallback.executeRebooking({
      tripId: "trip-paris-delhi-001",
      candidate: candidates[0]!,
      idempotencyKey: "fixed-key",
    });
    expect(execution.accepted).toBe(true);
    expect(execution.provider.mode).toBe(SourceMode.Simulated);
  });
});
