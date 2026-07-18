import type { DemoAuditEvent, DemoRecoveryResult } from "@/application/services/run-demo-recovery";
import type { RecoveryPolicy, SourceMode } from "@/domain";

export type DemoView = "benefit" | "policy" | "trip" | "recovery" | "audit";
export type DemoPhase = "ready" | "disrupted" | "running" | "recovered" | "error";

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
  error: string | null;
}>;
