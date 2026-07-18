import {
  DecisionOutcome,
  ExecutionState,
  ProviderConsistency,
  type RecoveryDecision,
} from "@/domain";
import { recoveryScenarios, type RecoveryScenario } from "@/data";
import { evaluateRecovery } from "@/engine";

export type EvaluationCategory = Readonly<{
  name: string;
  total: number;
  passed: number;
}>;

export type EvaluationReport = Readonly<{
  total: number;
  passed: number;
  hardConstraintComplianceRate: number;
  recoverySuccessRate: number;
  duplicateAutonomousActions: number;
  conflictingAutonomousActions: number;
  stableAcrossRuns: boolean;
  durationMs: number;
  underTimeLimit: boolean;
  categories: readonly EvaluationCategory[];
  allPassed: boolean;
}>;

function selectedDecisionPassesHardRules(decision: RecoveryDecision): boolean {
  if (decision.outcome !== DecisionOutcome.AutoBook) return true;
  const selected = decision.evaluations.find(
    ({ candidate }) => candidate.id === decision.selectedCandidateId,
  );
  return Boolean(selected?.checks.every((check) => check.passed));
}

function isAutonomousEligible(scenario: RecoveryScenario): boolean {
  const candidate = scenario.input.candidates[0];
  return Boolean(
    candidate &&
      candidate.executionState === ExecutionState.Available &&
      candidate.providerConsistency === ProviderConsistency.Consistent &&
      !candidate.approvalRequired &&
      candidate.incrementalCost.amountMinor <=
        scenario.input.policy.autoSpendLimit.amountMinor &&
      scenario.expectedOutcome === DecisionOutcome.AutoBook,
  );
}

export function evaluateScenarioSuite(
  scenarios: readonly RecoveryScenario[] = recoveryScenarios,
  now: () => number = () => performance.now(),
): EvaluationReport {
  const startedAt = now();
  const decisions = scenarios.map((scenario) => evaluateRecovery(scenario.input));
  const repeated = scenarios.map((scenario) => evaluateRecovery(scenario.input));
  const durationMs = now() - startedAt;
  const passed = scenarios.filter(
    (scenario, index) => decisions[index]?.outcome === scenario.expectedOutcome,
  ).length;
  const autonomous = decisions.filter(
    (decision) => decision.outcome === DecisionOutcome.AutoBook,
  );
  const compliant = autonomous.filter(selectedDecisionPassesHardRules).length;
  const eligibleIndexes = scenarios
    .map((scenario, index) => (isAutonomousEligible(scenario) ? index : -1))
    .filter((index) => index >= 0);
  const recovered = eligibleIndexes.filter(
    (index) => decisions[index]?.outcome === DecisionOutcome.AutoBook,
  ).length;
  const duplicateAutonomousActions = scenarios.filter((scenario, index) => {
    const decision = decisions[index];
    return (
      decision?.outcome === DecisionOutcome.AutoBook &&
      scenario.input.usedIdempotencyKeys.has(decision.idempotencyKey ?? "")
    );
  }).length;
  const conflictingAutonomousActions = scenarios.filter((scenario, index) => {
    const decision = decisions[index];
    const selected = scenario.input.candidates.find(
      (candidate) => candidate.id === decision?.selectedCandidateId,
    );
    return (
      decision?.outcome === DecisionOutcome.AutoBook &&
      selected?.providerConsistency !== ProviderConsistency.Consistent
    );
  }).length;
  const categoryMap = new Map<string, { total: number; passed: number }>();
  scenarios.forEach((scenario, index) => {
    const current = categoryMap.get(scenario.category) ?? { total: 0, passed: 0 };
    current.total += 1;
    if (decisions[index]?.outcome === scenario.expectedOutcome) current.passed += 1;
    categoryMap.set(scenario.category, current);
  });
  const hardConstraintComplianceRate = autonomous.length
    ? compliant / autonomous.length
    : 1;
  const recoverySuccessRate = eligibleIndexes.length
    ? recovered / eligibleIndexes.length
    : 1;
  const stableAcrossRuns = JSON.stringify(decisions) === JSON.stringify(repeated);
  const underTimeLimit = durationMs < 2_000;
  const allPassed =
    passed === scenarios.length &&
    hardConstraintComplianceRate === 1 &&
    recoverySuccessRate >= 0.95 &&
    duplicateAutonomousActions === 0 &&
    conflictingAutonomousActions === 0 &&
    stableAcrossRuns &&
    underTimeLimit;

  return {
    total: scenarios.length,
    passed,
    hardConstraintComplianceRate,
    recoverySuccessRate,
    duplicateAutonomousActions,
    conflictingAutonomousActions,
    stableAcrossRuns,
    durationMs,
    underTimeLimit,
    categories: [...categoryMap].map(([name, result]) => ({ name, ...result })),
    allPassed,
  };
}
