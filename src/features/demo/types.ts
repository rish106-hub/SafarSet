import type { DemoAuditEvent, DemoRecoveryResult } from "@/application/services/run-demo-recovery";
import type { RecoveryPolicy, SourceMode } from "@/domain";
import type { PersistenceMode } from "@/persistence/contracts/recovery-repository";

export type DemoView = "benefit" | "policy" | "trip" | "recovery" | "audit";
export type DemoPhase =
  | "ready"
  | "disrupted"
  | "running"
  | "recovered"
  | "awaiting-approval"
  | "escalated"
  | "error";

export const MAX_RECOVERY_TIMELINE_ITEMS = 8;

export type RecoveryTimelineItem = Readonly<{
  id: string;
  label: string;
  detail: string;
  mode: SourceMode;
  status: "complete" | "active" | "pending" | "error";
}>;

export type DemoState = Readonly<{
  version: 1;
  view: DemoView;
  phase: DemoPhase;
  policy: RecoveryPolicy;
  timeline: readonly RecoveryTimelineItem[];
  result: DemoRecoveryResult | null;
  audit: readonly DemoAuditEvent[];
  usedIdempotencyKeys: readonly string[];
  activeRunId: string | null;
  error: string | null;
  persistenceMode: PersistenceMode;
}>;
