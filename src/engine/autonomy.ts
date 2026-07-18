import {
  DecisionOutcome,
  ExecutionState,
  ProviderConsistency,
  type DecideAutonomyInput,
  type RecoveryDecision,
} from "@/domain";

import { createIdempotencyKey } from "./idempotency";
import { minutesBetween } from "./time";

const MAX_PRICE_AGE_MINUTES = 5;

function decision(
  input: DecideAutonomyInput,
  outcome: DecisionOutcome,
  reason: string,
  selectedCandidateId: string | null,
  idempotencyKey: string | null,
): RecoveryDecision {
  return {
    disruption: input.disruption,
    outcome,
    selectedCandidateId,
    reason,
    idempotencyKey,
    evaluations: input.evaluations,
    rankedCandidates: input.rankedCandidates,
  };
}

export function decideAutonomy(
  input: DecideAutonomyInput,
): RecoveryDecision {
  const selected = input.rankedCandidates[0]?.candidate;
  if (!selected) {
    return decision(
      input,
      DecisionOutcome.Escalate,
      "No candidate passes every hard constraint.",
      null,
      null,
    );
  }

  const idempotencyKey = createIdempotencyKey(
    input.disruption.tripId,
    input.disruption.id,
    selected.id,
  );

  if (input.usedIdempotencyKeys.has(idempotencyKey)) {
    return decision(
      input,
      DecisionOutcome.Escalate,
      "Recovery already executed for this disruption and itinerary.",
      selected.id,
      idempotencyKey,
    );
  }

  if (selected.providerConsistency !== ProviderConsistency.Consistent) {
    return decision(
      input,
      DecisionOutcome.Escalate,
      "Provider data is conflicting or cannot be verified.",
      selected.id,
      idempotencyKey,
    );
  }

  if (selected.executionState !== ExecutionState.Available) {
    return decision(
      input,
      DecisionOutcome.Escalate,
      "Execution availability is missing or unknown.",
      selected.id,
      idempotencyKey,
    );
  }

  const priceAgeMinutes = minutesBetween(selected.priceObservedAt, input.now);
  if (priceAgeMinutes < 0 || priceAgeMinutes > MAX_PRICE_AGE_MINUTES) {
    return decision(
      input,
      DecisionOutcome.Escalate,
      "Price is stale or has an invalid observation time.",
      selected.id,
      idempotencyKey,
    );
  }

  if (
    selected.approvalRequired ||
    selected.incrementalCost.amountMinor >
      input.policy.autoSpendLimit.amountMinor
  ) {
    return decision(
      input,
      DecisionOutcome.RequestApproval,
      selected.approvalRequired
        ? "Policy marks this route as approval-only."
        : "Incremental cost exceeds automatic spending limit.",
      selected.id,
      idempotencyKey,
    );
  }

  return decision(
    input,
    DecisionOutcome.AutoBook,
    "Every hard constraint and autonomy rule passes.",
    selected.id,
    idempotencyKey,
  );
}
