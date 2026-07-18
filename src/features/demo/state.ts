import { CabinClass, DecisionOutcome, SourceMode } from "@/domain";
import { heroPolicy } from "@/data";

import type { DemoState } from "./types";

export const DEMO_STORAGE_KEY = "safarset.demo.v1";
const DEMO_EVENT = "safarset-demo-change";

export const initialDemoState: DemoState = {
  version: 1,
  view: "benefit",
  phase: "ready",
  policy: heroPolicy,
  timeline: [],
  result: null,
  audit: [],
  usedIdempotencyKeys: [],
  activeRunId: null,
  error: null,
  persistenceMode: "LOCAL",
};

const initialSnapshot = JSON.stringify(initialDemoState);
const views = new Set(["benefit", "policy", "trip", "recovery", "audit"]);
const phases = new Set([
  "ready",
  "disrupted",
  "running",
  "recovered",
  "awaiting-approval",
  "escalated",
  "error",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isProvider(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.source === "string" &&
    Object.values(SourceMode).includes(value.mode as SourceMode) &&
    typeof value.isSimulated === "boolean" &&
    isIsoDate(value.observedAt) &&
    typeof value.confidence === "number" &&
    value.confidence >= 0 &&
    value.confidence <= 1
  );
}

function isAuditEvent(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    isIsoDate(value.at) &&
    typeof value.label === "string" &&
    typeof value.detail === "string" &&
    isProvider(value.provider)
  );
}

function isTimelineItem(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.detail === "string" &&
    Object.values(SourceMode).includes(value.mode as SourceMode) &&
    ["complete", "active", "pending", "error"].includes(String(value.status))
  );
}

function isPolicy(value: Record<string, unknown>): boolean {
  const money = value.autoSpendLimit;
  return (
    typeof value.id === "string" &&
    typeof value.familyId === "string" &&
    value.requireFamilyTogether === true &&
    value.forbidSelfTransfer === true &&
    Number.isInteger(value.maxStops) &&
    (value.maxStops as number) >= 0 &&
    (value.maxStops as number) <= 2 &&
    Object.values(CabinClass).includes(value.minimumCabin as CabinClass) &&
    Array.isArray(value.approvedTransitAirports) &&
    value.approvedTransitAirports.every(
      (airport) => typeof airport === "string" && /^[A-Z]{3}$/.test(airport),
    ) &&
    Number.isInteger(value.minimumConnectionMinutes) &&
    (value.minimumConnectionMinutes as number) >= 60 &&
    isIsoDate(value.arrivalDeadline) &&
    isRecord(money) &&
    money.currency === "INR" &&
    Number.isInteger(money.amountMinor) &&
    (money.amountMinor as number) >= 0 &&
    typeof value.avoidOvernight === "boolean"
  );
}

function isDemoResult(value: unknown): boolean {
  if (value === null) return true;
  if (!isRecord(value) || !isRecord(value.decision)) return false;
  const decision = value.decision;
  return (
    Object.values(DecisionOutcome).includes(decision.outcome as DecisionOutcome) &&
    (decision.selectedCandidateId === null || typeof decision.selectedCandidateId === "string") &&
    typeof decision.reason === "string" &&
    (decision.idempotencyKey === null || typeof decision.idempotencyKey === "string") &&
    Array.isArray(decision.evaluations) &&
    Array.isArray(decision.rankedCandidates) &&
    Array.isArray(value.actions) &&
    value.actions.every(
      (action) =>
        isRecord(action) &&
        typeof action.id === "string" &&
        typeof action.label === "string" &&
        typeof action.detail === "string" &&
        isProvider(action.provider),
    ) &&
    Array.isArray(value.audit) &&
    value.audit.every(isAuditEvent)
  );
}

function isDemoState(value: unknown): value is DemoState {
  if (!isRecord(value) || !isRecord(value.policy)) return false;
  const policy = value.policy;
  return (
    value.version === 1 &&
    typeof value.view === "string" &&
    views.has(value.view) &&
    typeof value.phase === "string" &&
    phases.has(value.phase) &&
    isPolicy(policy) &&
    Array.isArray(value.timeline) &&
    value.timeline.every(isTimelineItem) &&
    isDemoResult(value.result) &&
    Array.isArray(value.audit) &&
    value.audit.every(isAuditEvent) &&
    Array.isArray(value.usedIdempotencyKeys) &&
    value.usedIdempotencyKeys.every((key) => typeof key === "string") &&
    (value.activeRunId === null || typeof value.activeRunId === "string") &&
    (value.error === null || typeof value.error === "string") &&
    (value.persistenceMode === "LOCAL" || value.persistenceMode === "SUPABASE")
  );
}

export function parseDemoState(value: string | null): DemoState {
  if (!value) return initialDemoState;
  try {
    const parsed: unknown = JSON.parse(value);
    return isDemoState(parsed) ? parsed : initialDemoState;
  } catch {
    return initialDemoState;
  }
}

export function getDemoSnapshot(): string {
  if (typeof window === "undefined") return initialSnapshot;
  return window.localStorage.getItem(DEMO_STORAGE_KEY) ?? initialSnapshot;
}

export function getServerDemoSnapshot(): string {
  return initialSnapshot;
}

export function subscribeDemoState(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const listener = () => onStoreChange();
  window.addEventListener(DEMO_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(DEMO_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function writeDemoState(state: DemoState): void {
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(DEMO_EVENT));
}

export function updateDemoState(
  update: (current: DemoState) => DemoState,
): void {
  writeDemoState(update(parseDemoState(getDemoSnapshot())));
}

export function resetDemoState(): void {
  writeDemoState(initialDemoState);
}

export function disruptionTimelineItem() {
  return {
    id: "timeline-disruption",
    label: "Connection lost",
    detail: "CDG delay leaves -60 minutes for Dubai transfer.",
    mode: SourceMode.Fixture,
    status: "complete" as const,
  };
}
