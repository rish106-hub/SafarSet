import { SourceMode } from "@/domain";
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
  error: null,
  persistenceMode: "LOCAL",
};

const initialSnapshot = JSON.stringify(initialDemoState);
const views = new Set(["benefit", "policy", "trip", "recovery", "audit"]);
const phases = new Set(["ready", "disrupted", "running", "recovered", "error"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
    typeof policy.id === "string" &&
    Array.isArray(policy.approvedTransitAirports) &&
    isRecord(policy.autoSpendLimit) &&
    typeof policy.autoSpendLimit.amountMinor === "number" &&
    Array.isArray(value.timeline) &&
    Array.isArray(value.audit) &&
    Array.isArray(value.usedIdempotencyKeys) &&
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
