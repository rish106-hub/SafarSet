import {
  DecisionOutcome,
  type ProviderMetadata,
  type RecoveryDecision,
  type RecoveryCandidate,
  type RecoveryPolicy,
} from "@/domain";
import {
  HERO_NOW,
  createHeroInput,
  createHeroTrip,
  heroFamily,
} from "@/data";
import { evaluateRecovery } from "@/engine";
import {
  demoAccommodationProvider,
  demoNotificationProvider,
  demoTransferProvider,
  demoTravelProvider,
} from "@/providers/demo";

export type DemoActionResult = Readonly<{
  id: string;
  label: string;
  detail: string;
  confirmationCode: string | null;
  provider: ProviderMetadata;
}>;

export type DemoAuditEvent = Readonly<{
  id: string;
  at: string;
  label: string;
  detail: string;
  provider: ProviderMetadata;
}>;

export type DemoRecoveryResult = Readonly<{
  decision: RecoveryDecision;
  actions: readonly DemoActionResult[];
  audit: readonly DemoAuditEvent[];
}>;

export function getOvernightStayWindow(candidate: RecoveryCandidate): Readonly<{
  checkIn: string;
  checkOut: string;
}> | null {
  let longest: { checkIn: string; checkOut: string; duration: number } | null = null;
  for (let index = 0; index < candidate.segments.length - 1; index += 1) {
    const checkIn = candidate.segments[index]?.estimatedArrival;
    const checkOut = candidate.segments[index + 1]?.estimatedDeparture;
    if (!checkIn || !checkOut) continue;
    const duration = Date.parse(checkOut) - Date.parse(checkIn);
    if (duration > 0 && (!longest || duration > longest.duration)) {
      longest = { checkIn, checkOut, duration };
    }
  }
  return longest ? { checkIn: longest.checkIn, checkOut: longest.checkOut } : null;
}

export async function runDemoRecovery(input: {
  policy: RecoveryPolicy;
  usedIdempotencyKeys: ReadonlySet<string>;
}): Promise<DemoRecoveryResult> {
  const trip = createHeroTrip();
  const status = await demoTravelProvider.getFlightStatus({ trip });
  const detectedInput = createHeroInput();
  const preliminary = evaluateRecovery({
    ...detectedInput,
    trip: { ...trip, segments: status.segments },
    family: heroFamily,
    policy: input.policy,
    candidates: [],
    usedIdempotencyKeys: input.usedIdempotencyKeys,
  });

  if (!preliminary.disruption) {
    return { decision: preliminary, actions: [], audit: [] };
  }

  const candidates = await demoTravelProvider.searchAlternatives({
    trip,
    disruption: preliminary.disruption,
    family: heroFamily,
    policy: input.policy,
  });
  const decision = evaluateRecovery({
    ...detectedInput,
    trip: { ...trip, segments: status.segments },
    family: heroFamily,
    policy: input.policy,
    candidates,
    usedIdempotencyKeys: input.usedIdempotencyKeys,
  });
  const baseAudit: DemoAuditEvent[] = [
    {
      id: "audit-status",
      at: HERO_NOW,
      label: "Status fixture read",
      detail: "Paris delay makes Dubai connection impossible.",
      provider: status.provider,
    },
    {
      id: "audit-decision",
      at: HERO_NOW,
      label: "Recovery decision recorded",
      detail: `${decision.outcome}: ${decision.reason}`,
      provider: status.provider,
    },
  ];

  if (
    decision.outcome !== DecisionOutcome.AutoBook ||
    !decision.selectedCandidateId ||
    !decision.idempotencyKey
  ) {
    return { decision, actions: [], audit: baseAudit };
  }

  const selected = candidates.find(
    (candidate) => candidate.id === decision.selectedCandidateId,
  );
  if (!selected) {
    throw new Error("Selected recovery candidate is missing.");
  }

  const rebooking = await demoTravelProvider.executeRebooking({
    tripId: trip.id,
    candidate: selected,
    idempotencyKey: decision.idempotencyKey,
  });
  const actions: DemoActionResult[] = [
    {
      id: "action-reissue",
      label: "SIMULATED_REISSUE",
      detail: "Four seats held together in premium economy.",
      confirmationCode: rebooking.confirmationCode,
      provider: rebooking.provider,
    },
  ];

  if (selected.requiresOvernight) {
    const stayWindow = getOvernightStayWindow(selected);
    if (!stayWindow) throw new Error("Overnight recovery route has no valid stay window.");
    const stay = await demoAccommodationProvider.modifyStay({
      tripId: trip.id,
      checkIn: stayWindow.checkIn,
      checkOut: stayWindow.checkOut,
      maximumCost: { currency: "INR", amountMinor: 120_000 },
      idempotencyKey: `${decision.idempotencyKey}-stay`,
    });
    actions.push({
      id: "action-hotel",
      label: "SIMULATED_HOTEL_CHANGE",
      detail: "Airport rest room held during overnight recovery window.",
      confirmationCode: stay.confirmationCode,
      provider: stay.provider,
    });
  }

  const finalArrival = selected.segments.at(-1)?.estimatedArrival ?? HERO_NOW;
  const transfer = await demoTransferProvider.rescheduleTransfer({
    tripId: trip.id,
    pickupAt: finalArrival,
    pickupAirport: "DEL",
    idempotencyKey: `${decision.idempotencyKey}-transfer`,
  });
  actions.push({
    id: "action-transfer",
    label: "SIMULATED_TRANSFER_CHANGE",
    detail: "Delhi pickup moved to recovered arrival time.",
    confirmationCode: transfer.confirmationCode,
    provider: transfer.provider,
  });

  const notification = await demoNotificationProvider.sendRecoveryConfirmation({
    recipient: "synthetic.family@example.test",
    subject: "SafarSet recovery confirmed",
    body: "Your simulated family recovery is ready.",
    recoveryRunId: decision.idempotencyKey,
  });
  actions.push({
    id: "action-notification",
    label: "IN_APP_CONFIRMATION",
    detail: "Synthetic family confirmation recorded in app.",
    confirmationCode: notification.messageId,
    provider: notification.provider,
  });

  return {
    decision,
    actions,
    audit: [
      ...baseAudit,
      ...actions.map((action) => ({
        id: `audit-${action.id}`,
        at: HERO_NOW,
        label: action.label,
        detail: action.detail,
        provider: action.provider,
      })),
    ],
  };
}
