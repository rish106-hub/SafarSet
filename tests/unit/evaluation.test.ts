import { describe, expect, it } from "vitest";

import { evaluateScenarioSuite } from "@/application/services/evaluate-scenario-suite";

describe("scenario evaluation report", () => {
  it("reports every safety gate from the 40 fixtures", () => {
    const ticks = [100, 110];
    const report = evaluateScenarioSuite(undefined, () => ticks.shift() ?? 110);

    expect(report.total).toBe(40);
    expect(report.passed).toBe(40);
    expect(report.hardConstraintComplianceRate).toBe(1);
    expect(report.recoverySuccessRate).toBeGreaterThanOrEqual(0.95);
    expect(report.duplicateAutonomousActions).toBe(0);
    expect(report.conflictingAutonomousActions).toBe(0);
    expect(report.stableAcrossRuns).toBe(true);
    expect(report.durationMs).toBe(10);
    expect(report.allPassed).toBe(true);
  });
});
