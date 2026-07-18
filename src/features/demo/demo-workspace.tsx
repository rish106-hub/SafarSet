"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import { runDemoRecovery } from "@/application/services/run-demo-recovery";
import { WorkspaceNav } from "@/components/layout/workspace-nav";
import { SourceMode, type RecoveryPolicy } from "@/domain";
import { createHeroTrip, fixtureMetadata, HERO_NOW } from "@/data";
import { AuditPanel } from "@/features/audit/audit-panel";
import { BenefitEntry } from "@/features/landing/benefit-entry";
import { PolicyPanel } from "@/features/policy/policy-panel";
import { RecoveryPanel } from "@/features/recovery/recovery-panel";
import { TripPanel } from "@/features/trip/trip-panel";
import { getRecoveryRepository } from "@/persistence/client";
import {
  HERO_TRIP_ID,
  PERSISTENCE_VERSION,
  type RecoveryEvidence,
} from "@/persistence/contracts/recovery-repository";

import {
  disruptionTimelineItem,
  getDemoSnapshot,
  getServerDemoSnapshot,
  parseDemoState,
  resetDemoState,
  subscribeDemoState,
  updateDemoState,
  writeDemoState,
} from "./state";
import type { DemoState, DemoView, RecoveryTimelineItem } from "./types";

const recoverySteps: readonly Omit<RecoveryTimelineItem, "status">[] = [
  {
    id: "timeline-search",
    label: "Alternatives searched",
    detail: "Three deterministic routes loaded for all four travellers.",
    mode: SourceMode.Fixture,
  },
  {
    id: "timeline-constraints",
    label: "Hard constraints checked",
    detail: "Seven safety rules evaluated for every route.",
    mode: SourceMode.Fixture,
  },
  {
    id: "timeline-rejections",
    label: "Unsafe routes rejected",
    detail: "Family split and self-transfer alternatives removed.",
    mode: SourceMode.Fixture,
  },
  {
    id: "timeline-ranking",
    label: "Valid route ranked",
    detail: "Arrival, cost, stops, overnight wait, and departure wait scored.",
    mode: SourceMode.Fixture,
  },
  {
    id: "timeline-decision",
    label: "Autonomy approved",
    detail: "Selected route stays inside every hard rule and spend limit.",
    mode: SourceMode.Fixture,
  },
  {
    id: "timeline-actions",
    label: "Recovery actions simulated",
    detail: "Reissue, airport room, and Delhi transfer confirmed.",
    mode: SourceMode.Simulated,
  },
  {
    id: "timeline-confirmation",
    label: "Family confirmation logged",
    detail: "In-app confirmation and full audit record created.",
    mode: SourceMode.Simulated,
  },
];

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export function DemoWorkspace() {
  const snapshot = useSyncExternalStore(
    subscribeDemoState,
    getDemoSnapshot,
    getServerDemoSnapshot,
  );
  const state = useMemo(() => parseDemoState(snapshot), [snapshot]);
  const runningRef = useRef(false);

  useEffect(() => {
    let active = true;
    void getRecoveryRepository().load(HERO_TRIP_ID).then(({ evidence, mode }) => {
      if (!active) return;
      if (evidence) {
        writeDemoState({ ...evidence.uiState, persistenceMode: mode });
      } else {
        updateDemoState((current) => ({ ...current, persistenceMode: mode }));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const navigate = (view: DemoView) =>
    updateDemoState((current) => ({ ...current, view }));

  const updatePolicy = (policy: RecoveryPolicy) =>
    updateDemoState((current) => ({ ...current, policy }));

  const injectDisruption = () => {
    updateDemoState((current) => ({
      ...current,
      phase: "disrupted",
      view: "recovery",
      result: null,
      error: null,
      timeline: [disruptionTimelineItem()],
      audit: [
        {
          id: "audit-injection",
          at: HERO_NOW,
          label: "Demo disruption injected",
          detail: "Fixture delay applied to Paris to Dubai segment.",
          provider: fixtureMetadata,
        },
      ],
    }));
  };

  const runRecovery = async () => {
    if (runningRef.current || state.phase !== "disrupted") return;
    runningRef.current = true;
    updateDemoState((current) => ({
      ...current,
      phase: "running",
      error: null,
    }));

    try {
      const result = await runDemoRecovery({
        policy: state.policy,
        usedIdempotencyKeys: new Set(state.usedIdempotencyKeys),
      });
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      for (const step of recoverySteps) {
        updateDemoState((current) => ({
          ...current,
          timeline: [
            ...current.timeline.map((item) =>
              item.status === "active"
                ? { ...item, status: "complete" as const }
                : item,
            ),
            { ...step, status: "active" as const },
          ],
        }));
        await delay(reducedMotion ? 20 : 260);
        updateDemoState((current) => ({
          ...current,
          timeline: current.timeline.map((item) =>
            item.id === step.id
              ? { ...item, status: "complete" as const }
              : item,
          ),
        }));
      }

      updateDemoState((current) => {
        const completedState: DemoState = {
          ...current,
          phase: "recovered",
          result,
          audit: [...current.audit, ...result.audit],
          usedIdempotencyKeys: result.decision.idempotencyKey
            ? [...current.usedIdempotencyKeys, result.decision.idempotencyKey]
            : current.usedIdempotencyKeys,
        };
        return completedState;
      });
      const completedState = parseDemoState(getDemoSnapshot());
      if (result.decision.idempotencyKey) {
        const now = new Date().toISOString();
        const evidence: RecoveryEvidence = {
          version: PERSISTENCE_VERSION,
          policy: completedState.policy,
          trip: createHeroTrip(),
          run: {
            id: result.decision.idempotencyKey,
            startedAt: HERO_NOW,
            completedAt: HERO_NOW,
            result,
          },
          audit: completedState.audit,
          uiState: completedState,
          updatedAt: now,
        };
        const mode = await getRecoveryRepository().save(evidence);
        updateDemoState((current) => ({ ...current, persistenceMode: mode }));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown recovery error.";
      updateDemoState((current) => ({
        ...current,
        phase: "error",
        error: message,
        timeline: [
          ...current.timeline.map((item) =>
            item.status === "active"
              ? { ...item, status: "error" as const }
              : item,
          ),
        ],
      }));
    } finally {
      runningRef.current = false;
    }
  };

  if (state.view === "benefit") {
    return <BenefitEntry onOpen={() => navigate("policy")} />;
  }

  return (
    <div className="min-h-screen bg-[#06101c] text-slate-100 lg:flex">
      <WorkspaceNav
        view={state.view}
        phase={state.phase}
        onNavigate={navigate}
        onReset={resetDemoState}
      />
      <main className="min-w-0 flex-1 pt-16 lg:pt-0">
        <View
          state={state}
          onNavigate={navigate}
          onPolicyChange={updatePolicy}
          onInject={injectDisruption}
          onRun={runRecovery}
        />
      </main>
    </div>
  );
}

function View({
  state,
  onNavigate,
  onPolicyChange,
  onInject,
  onRun,
}: Readonly<{
  state: DemoState;
  onNavigate: (view: DemoView) => void;
  onPolicyChange: (policy: RecoveryPolicy) => void;
  onInject: () => void;
  onRun: () => void;
}>) {
  switch (state.view) {
    case "policy":
      return (
        <PolicyPanel
          policy={state.policy}
          onChange={onPolicyChange}
          onContinue={() => onNavigate("trip")}
        />
      );
    case "trip":
      return (
        <TripPanel
          phase={state.phase}
          onInject={onInject}
          onOpenRecovery={() => onNavigate("recovery")}
        />
      );
    case "recovery":
      return (
        <RecoveryPanel
          state={state}
          onRun={onRun}
          onOpenAudit={() => onNavigate("audit")}
        />
      );
    case "audit":
      return (
        <AuditPanel
          events={state.audit}
          persistenceMode={state.persistenceMode}
          onBack={() => onNavigate("recovery")}
        />
      );
    default:
      return null;
  }
}
