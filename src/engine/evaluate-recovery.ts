import {
  DecisionOutcome,
  type EvaluateRecoveryInput,
  type RecoveryDecision,
} from "@/domain";

import { decideAutonomy } from "./autonomy";
import { evaluateCandidate } from "./constraints";
import { detectDisruption } from "./detector";
import { rankCandidates } from "./ranking";

export function evaluateRecovery(
  input: EvaluateRecoveryInput,
): RecoveryDecision {
  const disruption = detectDisruption({
    trip: input.trip,
    policy: input.policy,
    eventId: input.eventId,
    observedAt: input.now,
  });

  if (!disruption) {
    return {
      disruption: null,
      outcome: DecisionOutcome.Escalate,
      selectedCandidateId: null,
      reason: "No eligible disruption detected.",
      idempotencyKey: null,
      evaluations: [],
      rankedCandidates: [],
    };
  }

  const evaluations = input.candidates.map((candidate) =>
    evaluateCandidate({
      candidate,
      family: input.family,
      policy: input.policy,
    }),
  );
  const originalArrivalTime = input.trip.segments.at(-1)?.scheduledArrival;
  if (!originalArrivalTime) {
    return {
      disruption,
      outcome: DecisionOutcome.Escalate,
      selectedCandidateId: null,
      reason: "Original itinerary has no arrival segment.",
      idempotencyKey: null,
      evaluations,
      rankedCandidates: [],
    };
  }

  const rankedCandidates = rankCandidates({
    evaluations,
    originalArrivalTime,
    recoveryStartedAt: input.now,
  });

  return decideAutonomy({
    disruption,
    evaluations,
    rankedCandidates,
    policy: input.policy,
    now: input.now,
    usedIdempotencyKeys: input.usedIdempotencyKeys,
  });
}
