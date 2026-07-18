import {
  CabinClass,
  DecisionOutcome,
  ExecutionState,
  ProviderConsistency,
  type EvaluateRecoveryInput,
} from "@/domain";
import { createIdempotencyKey } from "@/engine";
import {
  HERO_NOW,
  createCandidate,
  createHeroInput,
  type CandidateOptions,
} from "@/data/hero";

export type RecoveryScenario = Readonly<{
  id: string;
  category: string;
  expectedOutcome: DecisionOutcome;
  input: EvaluateRecoveryInput;
}>;

type ScenarioOptions = Readonly<{
  candidateOptions?: CandidateOptions;
  candidates?: readonly CandidateOptions[];
  cancelled?: boolean;
  duplicate?: boolean;
}>;

function makeScenario(
  sequence: number,
  category: string,
  expectedOutcome: DecisionOutcome,
  options: ScenarioOptions = {},
): RecoveryScenario {
  const id = `scenario-${String(sequence).padStart(2, "0")}`;
  const candidateOptions = options.candidates ?? [options.candidateOptions ?? {}];
  const candidates = candidateOptions.map((candidate, index) =>
    createCandidate({
      ...candidate,
      id: candidate.id ?? `${id}-candidate-${index + 1}`,
    }),
  );
  const used = new Set<string>();
  if (options.duplicate && candidates[0]) {
    used.add(
      createIdempotencyKey(
        "trip-paris-delhi-001",
        "disruption-hero-001",
        candidates[0].id,
      ),
    );
  }

  return {
    id,
    category,
    expectedOutcome,
    input: createHeroInput(candidates, options.cancelled, used),
  };
}

const AUTO = DecisionOutcome.AutoBook;
const APPROVAL = DecisionOutcome.RequestApproval;
const ESCALATE = DecisionOutcome.Escalate;

export const recoveryScenarios: readonly RecoveryScenario[] = [
  makeScenario(1, "valid", AUTO),
  makeScenario(2, "valid", AUTO, { candidateOptions: { incrementalCostMinor: 5_000_000 } }),
  makeScenario(3, "valid", AUTO, { candidateOptions: { transitAirport: "DXB" } }),
  makeScenario(4, "valid", AUTO, { candidateOptions: { transitAirport: "IST" } }),
  makeScenario(5, "valid", AUTO, { candidateOptions: { cabin: CabinClass.Business } }),
  makeScenario(6, "valid", AUTO, { candidateOptions: { cabin: CabinClass.First } }),
  makeScenario(7, "valid", AUTO, { candidateOptions: { departureOffsetMinutes: 240 } }),
  makeScenario(8, "valid", AUTO, { candidateOptions: { incrementalCostMinor: 7_500_000 } }),

  makeScenario(9, "cancellation", AUTO, { cancelled: true }),
  makeScenario(10, "cancellation", AUTO, { cancelled: true, candidateOptions: { transitAirport: "DXB" } }),
  makeScenario(11, "cancellation", AUTO, { cancelled: true, candidateOptions: { cabin: CabinClass.Business } }),

  makeScenario(12, "missed-connection", AUTO),
  makeScenario(13, "missed-connection", AUTO, { candidateOptions: { incrementalCostMinor: 4_000_000 } }),
  makeScenario(14, "missed-connection", AUTO, { candidateOptions: { transitAirport: "IST" } }),

  makeScenario(15, "family-capacity", ESCALATE, { candidateOptions: { seatsAvailable: 3 } }),
  makeScenario(16, "family-capacity", ESCALATE, { candidateOptions: { seatsAvailable: 2 } }),
  makeScenario(17, "family-capacity", ESCALATE, { candidateOptions: { seatsAvailable: 0 } }),

  makeScenario(18, "transfer-safety", ESCALATE, { candidateOptions: { selfTransfer: true } }),
  makeScenario(19, "transfer-safety", ESCALATE, { candidateOptions: { transitAirport: "KWI" } }),
  makeScenario(20, "transfer-safety", ESCALATE, { candidateOptions: { transitAirport: "BAH" } }),

  makeScenario(21, "cabin-and-stops", ESCALATE, { candidateOptions: { cabin: CabinClass.Economy } }),
  makeScenario(22, "cabin-and-stops", ESCALATE, { candidateOptions: { stops: 2 } }),
  makeScenario(23, "cabin-and-stops", ESCALATE, { candidateOptions: { stops: 2, cabin: CabinClass.Economy } }),

  makeScenario(24, "time-safety", ESCALATE, { candidateOptions: { shortConnection: true } }),
  makeScenario(25, "time-safety", ESCALATE, { candidateOptions: { lateArrival: true } }),
  makeScenario(26, "time-safety", ESCALATE, { candidateOptions: { shortConnection: true, lateArrival: true } }),

  makeScenario(27, "approval-and-price", APPROVAL, { candidateOptions: { incrementalCostMinor: 9_000_000 } }),
  makeScenario(28, "approval-and-price", ESCALATE, { candidateOptions: { priceObservedAt: "2026-08-14T17:50:00.000Z" } }),
  makeScenario(29, "approval-and-price", APPROVAL, { candidateOptions: { approvalRequired: true } }),

  makeScenario(30, "idempotency-and-data", ESCALATE, { duplicate: true }),
  makeScenario(31, "idempotency-and-data", ESCALATE, { candidateOptions: { providerConsistency: ProviderConsistency.Conflicting } }),
  makeScenario(32, "idempotency-and-data", ESCALATE, { candidateOptions: { providerConsistency: ProviderConsistency.Unknown } }),

  makeScenario(33, "execution-state", ESCALATE, { candidateOptions: { executionState: ExecutionState.Unknown } }),
  makeScenario(34, "execution-state", ESCALATE, { candidateOptions: { executionState: ExecutionState.Unavailable } }),
  makeScenario(35, "execution-state", ESCALATE, { candidateOptions: { executionState: ExecutionState.Unknown, providerConsistency: ProviderConsistency.Unknown } }),

  makeScenario(36, "no-valid-route", ESCALATE, { candidates: [] }),
  makeScenario(37, "no-valid-route", ESCALATE, { candidates: [{ seatsAvailable: 3 }, { selfTransfer: true }] }),
  makeScenario(38, "no-valid-route", ESCALATE, { candidates: [{ lateArrival: true }, { transitAirport: "KWI" }] }),

  makeScenario(39, "overnight-preference", AUTO, { candidateOptions: { requiresOvernight: true } }),
  makeScenario(40, "overnight-preference", AUTO, {
    candidates: [
      { id: "overnight-route", requiresOvernight: true },
      { id: "day-route", requiresOvernight: false },
    ],
  }),
];

export const scenarioGeneratedAt = HERO_NOW;
