import {
  getOvernightStayWindow,
  runDemoRecovery,
} from "@/application/services/run-demo-recovery";
import { DecisionOutcome, SourceMode } from "@/domain";
import { createCandidate, heroPolicy } from "@/data";
import { stepsForResult } from "@/features/demo/demo-workspace";
import { describe, expect, it } from "vitest";

describe("runDemoRecovery", () => {
  it("completes deterministic simulated recovery", async () => {
    const result = await runDemoRecovery({
      policy: heroPolicy,
      usedIdempotencyKeys: new Set(),
    });

    expect(result.decision.outcome).toBe(DecisionOutcome.AutoBook);
    expect(result.actions.map((action) => action.label)).toEqual([
      "SIMULATED_REISSUE",
      "SIMULATED_HOTEL_CHANGE",
      "SIMULATED_TRANSFER_CHANGE",
      "IN_APP_CONFIRMATION",
    ]);
    expect(
      result.actions.every(
        (action) => action.provider.mode === SourceMode.Simulated,
      ),
    ).toBe(true);
    expect(result.audit.length).toBeGreaterThanOrEqual(6);
  });

  it("requests approval without executing above spend limit", async () => {
    const result = await runDemoRecovery({
      policy: {
        ...heroPolicy,
        autoSpendLimit: { currency: "INR", amountMinor: 100_000 },
      },
      usedIdempotencyKeys: new Set(),
    });

    expect(result.decision.outcome).toBe(DecisionOutcome.RequestApproval);
    expect(result.actions).toHaveLength(0);
    const labels = stepsForResult(result).map((step) => step.label);
    expect(labels).toContain("Approval required");
    expect(labels).not.toContain("Autonomy approved");
    expect(labels).not.toContain("Recovery actions simulated");
    expect(labels).not.toContain("Family confirmation logged");
  });

  it("derives the overnight stay from the selected connection window", () => {
    const candidate = createCandidate({ requiresOvernight: true });
    expect(getOvernightStayWindow(candidate)).toEqual({
      checkIn: candidate.segments[0]?.estimatedArrival,
      checkOut: candidate.segments[1]?.estimatedDeparture,
    });
  });

  it("blocks a second execution with caller-owned key", async () => {
    const first = await runDemoRecovery({
      policy: heroPolicy,
      usedIdempotencyKeys: new Set(),
    });
    const key = first.decision.idempotencyKey;
    if (!key) throw new Error("Expected idempotency key");

    const second = await runDemoRecovery({
      policy: heroPolicy,
      usedIdempotencyKeys: new Set([key]),
    });

    expect(second.decision.outcome).toBe(DecisionOutcome.Escalate);
    expect(second.actions).toHaveLength(0);
  });
});
