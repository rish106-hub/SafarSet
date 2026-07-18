import {
  DecisionOutcome,
  ProviderConsistency,
  type RecoveryCandidate,
} from "@/domain";
import {
  HERO_NOW,
  createCandidate,
  createHeroTrip,
  heroFamily,
  heroPolicy,
} from "@/data";
import {
  createIdempotencyKey,
  decideAutonomy,
  detectDisruption,
  evaluateCandidate,
  rankCandidates,
} from "@/engine";
import { describe, expect, it } from "vitest";

function decide(
  candidate: RecoveryCandidate,
  usedIdempotencyKeys: ReadonlySet<string> = new Set(),
) {
  const disruption = detectDisruption({
    trip: createHeroTrip(),
    policy: heroPolicy,
    eventId: "disruption-hero-001",
    observedAt: HERO_NOW,
  });
  if (!disruption) throw new Error("Expected hero disruption");
  const evaluations = [
    evaluateCandidate({ candidate, family: heroFamily, policy: heroPolicy }),
  ];
  const rankedCandidates = rankCandidates({
    evaluations,
    originalArrivalTime: "2026-08-14T22:00:00.000Z",
    recoveryStartedAt: HERO_NOW,
  });

  return decideAutonomy({
    disruption,
    evaluations,
    rankedCandidates,
    policy: heroPolicy,
    now: HERO_NOW,
    usedIdempotencyKeys,
  });
}

describe("decideAutonomy", () => {
  it("auto-books a safe fresh route", () => {
    expect(decide(createCandidate()).outcome).toBe(DecisionOutcome.AutoBook);
  });

  it("requests approval above spending limit", () => {
    expect(
      decide(createCandidate({ incrementalCostMinor: 8_000_000 })).outcome,
    ).toBe(DecisionOutcome.RequestApproval);
  });

  it("escalates conflicting provider data", () => {
    expect(
      decide(
        createCandidate({
          providerConsistency: ProviderConsistency.Conflicting,
        }),
      ).outcome,
    ).toBe(DecisionOutcome.Escalate);
  });

  it("blocks duplicate execution", () => {
    const candidate = createCandidate();
    const key = createIdempotencyKey(
      "trip-paris-delhi-001",
      "disruption-hero-001",
      candidate.id,
    );

    expect(decide(candidate, new Set([key])).outcome).toBe(
      DecisionOutcome.Escalate,
    );
  });
});
