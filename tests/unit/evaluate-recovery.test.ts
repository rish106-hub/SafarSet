import { DecisionOutcome, SegmentStatus } from "@/domain";
import { createCandidate, createHeroInput } from "@/data";
import { evaluateRecovery } from "@/engine";
import { describe, expect, it } from "vitest";

describe("evaluateRecovery", () => {
  it("runs full deterministic decision pipeline", () => {
    const result = evaluateRecovery(createHeroInput([createCandidate()]));

    expect(result.outcome).toBe(DecisionOutcome.AutoBook);
    expect(result.disruption).not.toBeNull();
    expect(result.evaluations).toHaveLength(1);
    expect(result.rankedCandidates).toHaveLength(1);
    expect(result.idempotencyKey).toMatch(/^[0-9a-f]{16}$/);
  });

  it("does not act without disruption", () => {
    const input = createHeroInput();
    const result = evaluateRecovery({
      ...input,
      trip: {
        ...input.trip,
        segments: input.trip.segments.map((segment, index) =>
          index === 0
            ? {
                ...segment,
                estimatedArrival: "2026-08-14T16:00:00.000Z",
                status: SegmentStatus.Scheduled,
              }
            : segment,
        ),
      },
    });

    expect(result.outcome).toBe(DecisionOutcome.Escalate);
    expect(result.disruption).toBeNull();
  });
});
