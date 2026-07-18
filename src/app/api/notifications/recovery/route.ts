import "server-only";

import { NextResponse } from "next/server";

import { deliverRecoveryCommunication } from "@/application/services/deliver-recovery-communication";
import { DecisionOutcome } from "@/domain";
import { createIdempotencyKey } from "@/engine";
import {
  HERO_TRIP_ID,
  isRecoveryEvidence,
} from "@/persistence/contracts/recovery-repository";
import { getGeminiProseProvider } from "@/providers/gemini";
import { getResendNotificationProvider } from "@/providers/resend";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 96_000;

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  }

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!isRecoveryEvidence(value) || value.trip.id !== HERO_TRIP_ID) {
    return NextResponse.json({ error: "Invalid recovery evidence." }, { status: 400 });
  }

  const decision = value.run.result.decision;
  const selectedCandidateId = decision.selectedCandidateId;
  const disruptionId = decision.disruption?.id;
  const expectedRunId =
    selectedCandidateId && disruptionId
      ? createIdempotencyKey(value.trip.id, disruptionId, selectedCandidateId)
      : null;
  if (
    decision.outcome !== DecisionOutcome.AutoBook ||
    !expectedRunId ||
    decision.idempotencyKey !== expectedRunId ||
    value.run.id !== expectedRunId
  ) {
    return NextResponse.json(
      { error: "Recovery is not a verified completed run." },
      { status: 409 },
    );
  }

  const observedAt = new Date().toISOString();
  const report = await deliverRecoveryCommunication({
    decision,
    actions: value.run.result.actions,
    recipient: process.env.RESEND_TO_EMAIL?.trim() || null,
    observedAt,
    proseProvider: getGeminiProseProvider(),
    notificationProvider: getResendNotificationProvider(observedAt),
  });
  return NextResponse.json(report);
}
