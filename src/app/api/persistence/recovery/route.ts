import { NextResponse } from "next/server";

import {
  HERO_TRIP_ID,
  isRecoveryEvidence,
} from "@/persistence/contracts/recovery-repository";
import { SupabaseRecoveryRepository } from "@/persistence/supabase/server-recovery-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const repository = new SupabaseRecoveryRepository();

export async function GET(request: Request) {
  const tripId = new URL(request.url).searchParams.get("tripId");
  if (tripId !== HERO_TRIP_ID) return NextResponse.json({ error: "Not found." }, { status: 404 });
  try {
    const evidence = await repository.load(tripId);
    return evidence
      ? NextResponse.json(evidence)
      : NextResponse.json({ error: "Not found." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Remote persistence unavailable." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 250_000) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 250_000) {
      return NextResponse.json({ error: "Payload too large." }, { status: 413 });
    }
    const value: unknown = JSON.parse(raw);
    if (!isRecoveryEvidence(value)) {
      return NextResponse.json({ error: "Invalid demo evidence." }, { status: 400 });
    }
    await repository.save(value);
    return NextResponse.json({ stored: true });
  } catch {
    return NextResponse.json({ error: "Remote persistence unavailable." }, { status: 503 });
  }
}
