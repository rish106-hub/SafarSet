import type {
  ConstraintRule,
  DecisionOutcome,
  DisruptionType,
  ExecutionState,
  ProviderConsistency,
  RecoveryActionType,
} from "../enums";
import type { Money, ProviderMetadata } from "./common";
import type { FamilyProfile, RecoveryPolicy } from "./policy";
import type { FlightSegment, Trip } from "./trip";

export type DisruptionEvent = Readonly<{
  id: string;
  tripId: string;
  type: DisruptionType;
  affectedSegmentIds: readonly string[];
  detectedAt: string;
  reason: string;
  provider: ProviderMetadata;
}>;

export type RecoveryCandidate = Readonly<{
  id: string;
  segments: readonly FlightSegment[];
  seatsAvailable: number;
  selfTransfer: boolean;
  incrementalCost: Money;
  priceObservedAt: string;
  providerConsistency: ProviderConsistency;
  executionState: ExecutionState;
  requiresOvernight: boolean;
  approvalRequired: boolean;
  provider: ProviderMetadata;
}>;

export type ConstraintCheck = Readonly<{
  candidateId: string;
  rule: ConstraintRule;
  passed: boolean;
  reason: string;
}>;

export type CandidateEvaluation = Readonly<{
  candidate: RecoveryCandidate;
  checks: readonly ConstraintCheck[];
  passed: boolean;
}>;

export type RankingFactors = Readonly<{
  arrivalDelayMinutes: number;
  incrementalCostMinor: number;
  stops: number;
  overnightPenalty: number;
  departureWaitMinutes: number;
}>;

export type RankedCandidate = Readonly<{
  candidate: RecoveryCandidate;
  score: number;
  factors: RankingFactors;
}>;

export type RecoveryDecision = Readonly<{
  disruption: DisruptionEvent | null;
  outcome: DecisionOutcome;
  selectedCandidateId: string | null;
  reason: string;
  idempotencyKey: string | null;
  evaluations: readonly CandidateEvaluation[];
  rankedCandidates: readonly RankedCandidate[];
}>;

export type RecoveryAction = Readonly<{
  id: string;
  runId: string;
  type: RecoveryActionType;
  status: ExecutionState;
  label: string;
  provider: ProviderMetadata;
}>;

export type RecoveryRun = Readonly<{
  id: string;
  tripId: string;
  disruptionId: string;
  startedAt: string;
  completedAt: string;
  decision: RecoveryDecision;
  actions: readonly RecoveryAction[];
}>;

export type DetectDisruptionInput = Readonly<{
  trip: Trip;
  policy: RecoveryPolicy;
  eventId: string;
  observedAt: string;
}>;

export type EvaluateConstraintsInput = Readonly<{
  candidate: RecoveryCandidate;
  family: FamilyProfile;
  policy: RecoveryPolicy;
}>;

export type RankCandidatesInput = Readonly<{
  evaluations: readonly CandidateEvaluation[];
  originalArrivalTime: string;
  recoveryStartedAt: string;
}>;

export type DecideAutonomyInput = Readonly<{
  disruption: DisruptionEvent;
  evaluations: readonly CandidateEvaluation[];
  rankedCandidates: readonly RankedCandidate[];
  policy: RecoveryPolicy;
  now: string;
  usedIdempotencyKeys: ReadonlySet<string>;
}>;

export type EvaluateRecoveryInput = Readonly<{
  trip: Trip;
  family: FamilyProfile;
  policy: RecoveryPolicy;
  candidates: readonly RecoveryCandidate[];
  eventId: string;
  now: string;
  usedIdempotencyKeys: ReadonlySet<string>;
}>;
