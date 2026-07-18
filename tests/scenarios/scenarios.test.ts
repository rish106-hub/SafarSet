import {
  DecisionOutcome,
  ExecutionState,
  ProviderConsistency,
} from "@/domain";
import { recoveryScenarios } from "@/data";
import { evaluateRecovery } from "@/engine";
import { describe, expect, it } from "vitest";

describe("40-scenario recovery suite", () => {
  it("contains exactly 40 numbered fixtures", () => {
    expect(recoveryScenarios).toHaveLength(40);
    expect(recoveryScenarios.map((scenario) => scenario.id)).toEqual(
      Array.from({ length: 40 }, (_, index) =>
        `scenario-${String(index + 1).padStart(2, "0")}`,
      ),
    );
  });

  it.each(recoveryScenarios)("$id returns $expectedOutcome", (scenario) => {
    expect(evaluateRecovery(scenario.input).outcome).toBe(
      scenario.expectedOutcome,
    );
  });

  it("never auto-books a hard-constraint failure", () => {
    const autonomous = recoveryScenarios
      .map((scenario) => evaluateRecovery(scenario.input))
      .filter((decision) => decision.outcome === DecisionOutcome.AutoBook);

    expect(autonomous.length).toBeGreaterThan(0);
    for (const decision of autonomous) {
      const selected = decision.evaluations.find(
        (evaluation) =>
          evaluation.candidate.id === decision.selectedCandidateId,
      );
      expect(selected?.checks.every((check) => check.passed)).toBe(true);
    }
  });

  it("never auto-books conflicting data or duplicate execution", () => {
    for (const scenario of recoveryScenarios) {
      const decision = evaluateRecovery(scenario.input);
      const selected = scenario.input.candidates.find(
        (candidate) => candidate.id === decision.selectedCandidateId,
      );
      if (
        scenario.input.usedIdempotencyKeys.has(decision.idempotencyKey ?? "") ||
        selected?.providerConsistency !== ProviderConsistency.Consistent
      ) {
        expect(decision.outcome).not.toBe(DecisionOutcome.AutoBook);
      }
    }
  });

  it("recovers at least 95% of autonomous-eligible fixtures", () => {
    const eligible = recoveryScenarios.filter((scenario) => {
      const candidate = scenario.input.candidates[0];
      return (
        candidate &&
        candidate.executionState === ExecutionState.Available &&
        candidate.providerConsistency === ProviderConsistency.Consistent &&
        !candidate.approvalRequired &&
        candidate.incrementalCost.amountMinor <=
          scenario.input.policy.autoSpendLimit.amountMinor &&
        scenario.expectedOutcome === DecisionOutcome.AutoBook
      );
    });
    const recovered = eligible.filter(
      (scenario) =>
        evaluateRecovery(scenario.input).outcome === DecisionOutcome.AutoBook,
    );

    expect(recovered.length / eligible.length).toBeGreaterThanOrEqual(0.95);
  });

  it("is stable and completes under two seconds", () => {
    const startedAt = performance.now();
    const first = recoveryScenarios.map((scenario) =>
      evaluateRecovery(scenario.input),
    );
    const second = recoveryScenarios.map((scenario) =>
      evaluateRecovery(scenario.input),
    );
    const elapsed = performance.now() - startedAt;

    expect(second).toEqual(first);
    expect(elapsed).toBeLessThan(2_000);
  });
});
