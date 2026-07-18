import { DecisionOutcome, type RecoveryDecision } from "@/domain";
import type { DemoActionResult } from "@/application/services/run-demo-recovery";
import type {
  CompletedRecoveryFacts,
  RecoveryMessage,
} from "@/providers/contracts";

export type RenderedRecoveryMessage = Readonly<{
  subject: string;
  body: string;
  facts: CompletedRecoveryFacts;
}>;

export function renderRecoveryMessage(input: Readonly<{
  decision: RecoveryDecision;
  actions: readonly DemoActionResult[];
}>): RenderedRecoveryMessage {
  if (
    input.decision.outcome !== DecisionOutcome.AutoBook ||
    !input.decision.idempotencyKey ||
    !input.decision.selectedCandidateId
  ) {
    throw new Error("A completed autonomous recovery is required.");
  }

  const selected = input.decision.rankedCandidates.find(
    ({ candidate }) => candidate.id === input.decision.selectedCandidateId,
  )?.candidate;
  if (!selected || selected.segments.length === 0) {
    throw new Error("The selected recovery route is missing.");
  }

  const route = [
    selected.segments[0]!.departureAirport,
    ...selected.segments.map((segment) => segment.arrivalAirport),
  ];
  const arrivalAt = selected.segments.at(-1)!.estimatedArrival;
  const actionLabels = input.actions
    .filter((action) => action.id !== "action-notification")
    .map((action) => action.label);
  const body = [
    "Your SafarSet recovery is confirmed.",
    `Route: ${route.join(" to ")}.`,
    `Estimated arrival: ${arrivalAt}.`,
    `Completed actions: ${actionLabels.join(", ")}.`,
    "All booking actions in this demo are simulated.",
  ].join("\n");

  return {
    subject: "SafarSet recovery confirmed",
    body,
    facts: {
      recoveryRunId: input.decision.idempotencyKey,
      route,
      arrivalAt,
      actionLabels,
    },
  };
}

export function toRecoveryMessage(
  rendered: RenderedRecoveryMessage,
  recipient: string,
  body = rendered.body,
): RecoveryMessage {
  return {
    recipient,
    subject: rendered.subject,
    body,
    recoveryRunId: rendered.facts.recoveryRunId,
  };
}
