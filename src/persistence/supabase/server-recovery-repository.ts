import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  isRecoveryEvidence,
  type RecoveryEvidence,
  type RecoveryRepository,
} from "@/persistence/contracts/recovery-repository";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Supabase persistence is not configured.");
  client ??= createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}

function assertSuccess(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export class SupabaseRecoveryRepository implements RecoveryRepository {
  async load(tripId: string): Promise<RecoveryEvidence | null> {
    const supabase = getClient();
    const { data: run, error } = await supabase
      .from("recovery_runs")
      .select("payload")
      .eq("trip_id", tripId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    assertSuccess(error);
    const payload: unknown = run?.payload;
    return isRecoveryEvidence(payload) ? payload : null;
  }

  async save(evidence: RecoveryEvidence): Promise<void> {
    const supabase = getClient();
    const { error: policyError } = await supabase.from("policies").upsert({
      id: evidence.policy.id,
      family_id: evidence.policy.familyId,
      payload: evidence.policy,
      updated_at: evidence.updatedAt,
    });
    assertSuccess(policyError);

    const { error: tripError } = await supabase.from("trips").upsert({
      id: evidence.trip.id,
      family_id: evidence.trip.familyId,
      policy_id: evidence.policy.id,
      payload: evidence.trip,
      updated_at: evidence.updatedAt,
    });
    assertSuccess(tripError);

    const decision = evidence.run.result.decision;
    const { error: runError } = await supabase.from("recovery_runs").upsert({
      id: evidence.run.id,
      trip_id: evidence.trip.id,
      policy_id: evidence.policy.id,
      decision_outcome: decision.outcome,
      selected_candidate_id: decision.selectedCandidateId,
      started_at: evidence.run.startedAt,
      completed_at: evidence.run.completedAt,
      payload: evidence,
      updated_at: evidence.updatedAt,
    });
    assertSuccess(runError);

    const rows = evidence.audit.map((event) => ({
      id: `${evidence.run.id}:${event.id}`,
      recovery_run_id: evidence.run.id,
      trip_id: evidence.trip.id,
      event_at: event.at,
      label: event.label,
      payload: event,
      updated_at: evidence.updatedAt,
    }));
    if (rows.length > 0) {
      const { error: auditError } = await supabase.from("audit_events").upsert(rows);
      assertSuccess(auditError);
    }
  }
}
