import { CabinClass, ConstraintRule } from "@/domain";
import { createCandidate, heroFamily, heroPolicy } from "@/data";
import { evaluateCandidate, evaluateConstraints } from "@/engine";
import { describe, expect, it } from "vitest";

describe("evaluateConstraints", () => {
  it("returns one result for every hard rule", () => {
    const checks = evaluateConstraints({
      candidate: createCandidate(),
      family: heroFamily,
      policy: heroPolicy,
    });

    expect(checks).toHaveLength(7);
    expect(checks.every((check) => check.passed)).toBe(true);
    expect(new Set(checks.map((check) => check.rule)).size).toBe(7);
  });

  it.each([
    [ConstraintRule.FamilyTogether, { seatsAvailable: 3 }],
    [ConstraintRule.NoSelfTransfer, { selfTransfer: true }],
    [ConstraintRule.StopLimit, { stops: 2 as const }],
    [ConstraintRule.MinimumCabin, { cabin: CabinClass.Economy }],
    [ConstraintRule.ApprovedTransit, { transitAirport: "KWI" }],
    [ConstraintRule.ConnectionBuffer, { shortConnection: true }],
    [ConstraintRule.ArrivalDeadline, { lateArrival: true }],
  ])("rejects %s", (rule, options) => {
    const evaluation = evaluateCandidate({
      candidate: createCandidate(options),
      family: heroFamily,
      policy: heroPolicy,
    });

    expect(evaluation.passed).toBe(false);
    expect(evaluation.checks.find((check) => check.rule === rule)?.passed).toBe(
      false,
    );
  });
});
