import type {
  ProviderMetadata,
  RecoveryDecision,
  RecoveryPolicy,
  SourceMode,
  Trip,
} from "@/domain";

export const HERO_TRIP_ID = "trip-paris-delhi-001";
export const PERSISTENCE_VERSION = 1;

export type PersistedAction = Readonly<{
  id: string;
  label: string;
  detail: string;
  confirmationCode: string | null;
  provider: ProviderMetadata;
}>;

export type PersistedAuditEvent = Readonly<{
  id: string;
  at: string;
  label: string;
  detail: string;
  provider: ProviderMetadata;
}>;

export type PersistedRecoveryResult = Readonly<{
  decision: RecoveryDecision;
  actions: readonly PersistedAction[];
  audit: readonly PersistedAuditEvent[];
}>;

export type PersistedUiState = Readonly<{
  version: 1;
  view: "benefit" | "policy" | "trip" | "recovery" | "audit";
  phase:
    | "ready"
    | "disrupted"
    | "running"
    | "recovered"
    | "awaiting-approval"
    | "escalated"
    | "error";
  policy: RecoveryPolicy;
  timeline: readonly Readonly<{
    id: string;
    label: string;
    detail: string;
    mode: SourceMode;
    status: "complete" | "active" | "pending" | "error";
  }>[];
  result: PersistedRecoveryResult | null;
  audit: readonly PersistedAuditEvent[];
  usedIdempotencyKeys: readonly string[];
  activeRunId: string | null;
  error: string | null;
  persistenceMode: PersistenceMode;
}>;

export type RecoveryEvidence = Readonly<{
  version: 1;
  policy: RecoveryPolicy;
  trip: Trip;
  run: Readonly<{
    id: string;
    startedAt: string;
    completedAt: string;
    result: PersistedRecoveryResult;
  }>;
  audit: readonly PersistedAuditEvent[];
  uiState: PersistedUiState;
  updatedAt: string;
}>;

export type PersistenceMode = "SUPABASE" | "LOCAL";

export interface RecoveryRepository {
  load(tripId: string): Promise<RecoveryEvidence | null>;
  save(evidence: RecoveryEvidence): Promise<void>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isRecoveryEvidence(value: unknown): value is RecoveryEvidence {
  if (!isRecord(value) || value.version !== PERSISTENCE_VERSION) return false;
  if (!isRecord(value.policy) || !isRecord(value.trip) || !isRecord(value.run)) return false;
  if (!isRecord(value.uiState) || !Array.isArray(value.audit)) return false;
  if (value.policy.id !== "policy-family-001" || value.trip.id !== HERO_TRIP_ID) return false;
  if (typeof value.run.id !== "string" || value.run.id.length > 160) return false;
  if (!isRecord(value.run.result) || typeof value.updatedAt !== "string") return false;
  return value.uiState.version === 1 && value.audit.length <= 32;
}
