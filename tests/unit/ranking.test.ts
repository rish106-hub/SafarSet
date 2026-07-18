import { createCandidate, heroFamily, heroPolicy, HERO_NOW } from "@/data";
import { evaluateCandidate, rankCandidates } from "@/engine";
import { describe, expect, it } from "vitest";

function rank(...candidates: ReturnType<typeof createCandidate>[]) {
  return rankCandidates({
    evaluations: candidates.map((candidate) =>
      evaluateCandidate({ candidate, family: heroFamily, policy: heroPolicy }),
    ),
    originalArrivalTime: "2026-08-14T22:00:00.000Z",
    recoveryStartedAt: HERO_NOW,
  });
}

describe("rankCandidates", () => {
  it("removes candidates that fail hard constraints", () => {
    const ranked = rank(
      createCandidate({ id: "safe" }),
      createCandidate({ id: "unsafe", selfTransfer: true }),
    );

    expect(ranked.map((item) => item.candidate.id)).toEqual(["safe"]);
  });

  it("uses weighted lower-is-better factors", () => {
    const ranked = rank(
      createCandidate({
        id: "slow-expensive",
        incrementalCostMinor: 7_000_000,
        departureOffsetMinutes: 300,
        requiresOvernight: true,
      }),
      createCandidate({
        id: "fast-cheap",
        incrementalCostMinor: 4_000_000,
        departureOffsetMinutes: 120,
      }),
    );

    expect(ranked[0].candidate.id).toBe("fast-cheap");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("breaks exact ties with lexical candidate id", () => {
    const ranked = rank(
      createCandidate({ id: "route-b" }),
      createCandidate({ id: "route-a" }),
    );

    expect(ranked.map((item) => item.candidate.id)).toEqual([
      "route-a",
      "route-b",
    ]);
  });
});
