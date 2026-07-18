import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  CircleX,
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SourceBadge } from "@/components/source-badge";
import { DecisionOutcome, type CandidateEvaluation } from "@/domain";
import {
  MAX_RECOVERY_TIMELINE_ITEMS,
  type DemoState,
} from "@/features/demo/types";
import { formatMoney, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import { RouteRibbon } from "./route-ribbon";

export function RecoveryPanel({
  state,
  onRun,
  onOpenAudit,
}: Readonly<{
  state: DemoState;
  onRun: () => void;
  onOpenAudit: () => void;
}>) {
  const decision = state.result?.decision;
  const selected = decision?.rankedCandidates.find(
    (item) => item.candidate.id === decision.selectedCandidateId,
  )?.candidate;
  const decisionComplete = ["recovered", "awaiting-approval", "escalated"].includes(
    state.phase,
  );
  const progress =
    decisionComplete
      ? 100
      : state.phase === "running"
        ? Math.min(
            95,
            Math.round(
              (state.timeline.length / MAX_RECOVERY_TIMELINE_ITEMS) * 100,
            ),
          )
        : state.phase === "disrupted"
          ? 8
          : 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-10 lg:py-10">
      <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs tracking-[0.18em] text-[#ff9a82]">
            ACTIVE RECOVERY / DISRUPTION 001
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Connection recovery
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Fixture-backed search. Deterministic decision. Simulated execution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {state.phase === "recovered" ? (
            <Badge className="rounded-sm bg-[#67d8ef] text-slate-950">
              RECOVERY COMPLETE
            </Badge>
          ) : state.phase === "awaiting-approval" ? (
            <Badge className="rounded-sm bg-[#f5a524] text-slate-950">
              APPROVAL REQUIRED
            </Badge>
          ) : state.phase === "escalated" ? (
            <Badge className="rounded-sm bg-[#ff7452] text-white">
              ESCALATED
            </Badge>
          ) : (
            <Badge className="rounded-sm bg-[#ff7452] text-white">
              ACTION REQUIRED
            </Badge>
          )}
        </div>
      </header>

      <RouteRibbon phase={state.phase} candidate={selected} />

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 border border-white/10 bg-[#0b1928]">
          <div className="border-b border-white/10 px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Recovery timeline</h2>
                <p className="mt-1 text-xs text-slate-500">Every decision step remains visible.</p>
              </div>
              <span className="font-mono text-xs text-[#8edff0]">{progress}%</span>
            </div>
            <Progress value={progress} className="mt-4 [&_[data-slot=progress-indicator]]:bg-[#67d8ef] [&_[data-slot=progress-track]]:bg-white/8" />
          </div>

          <div className="p-5">
            {state.timeline.length === 0 ? (
              <div className="border border-dashed border-white/15 p-7 text-center">
                <AlertTriangle className="mx-auto size-6 text-[#ff7452]" />
                <p className="mt-3 text-sm text-white">Disruption not injected</p>
              </div>
            ) : (
              <ol className="space-y-0">
                {state.timeline.map((item, index) => (
                  <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {index < state.timeline.length - 1 && (
                      <span className="absolute left-[11px] top-6 h-[calc(100%-1rem)] w-px bg-white/10" />
                    )}
                    <TimelineIcon status={item.status} />
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <SourceBadge mode={item.mode} />
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {state.phase === "disrupted" && (
            <div className="border-t border-white/10 bg-[#f5a524]/5 p-5">
              <Button
                onClick={onRun}
                className="w-full bg-[#f5a524] text-slate-950 hover:bg-[#ffc35a] sm:w-auto"
              >
                Run safe recovery
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}

          {state.phase === "error" && (
            <div className="border-t border-[#ff7452]/30 bg-[#ff7452]/8 p-5 text-sm text-[#ffb09d]">
              {state.error ?? "Recovery failed. Reset demo and try again."}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="border border-white/10 bg-[#0b1928] p-5">
            <p className="font-mono text-[10px] tracking-[0.16em] text-slate-500">
              AUTONOMY DECISION
            </p>
            {decision ? (
              <>
                <div className="mt-4 flex items-center gap-3">
                  {decision.outcome === DecisionOutcome.AutoBook ? (
                    <CheckCircle2 className="size-6 text-[#67d8ef]" />
                  ) : (
                    <ShieldAlert className="size-6 text-[#f5a524]" />
                  )}
                  <p className="font-mono text-lg font-semibold text-white">
                    {decision.outcome}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{decision.reason}</p>
                {decision.idempotencyKey && (
                  <p className="mt-4 break-all border-t border-white/8 pt-4 font-mono text-[10px] text-slate-600">
                    KEY {decision.idempotencyKey}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Decision appears after every hard constraint runs.
              </p>
            )}
          </div>

          {selected && (
            <div className="border border-[#67d8ef]/25 bg-[#67d8ef]/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] tracking-[0.16em] text-[#8edff0]">
                  SELECTED ROUTE
                </p>
                <SourceBadge mode={selected.provider.mode} />
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-xl text-white">
                    {selected.segments.map((segment) => segment.departureAirport)[0]} → {selected.segments.at(-1)?.arrivalAirport}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    via {selected.segments[0]?.arrivalAirport}
                  </p>
                </div>
                <p className="font-mono text-sm text-[#ffd284]">
                  {formatMoney(selected.incrementalCost)}
                </p>
              </div>
              <p className="mt-4 border-t border-white/8 pt-4 text-xs text-slate-400">
                Arrives {formatTime(selected.segments.at(-1)?.estimatedArrival ?? "")}
              </p>
            </div>
          )}
        </aside>
      </div>

      {decisionComplete && state.result && (
        <div className="mt-6 space-y-6">
          {state.result.actions.length > 0 && <section>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-slate-500">CONFIRMED ACTIONS</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Recovery package</h2>
              </div>
              <SourceBadge mode={state.result.actions[0]?.provider.mode} />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {state.result.actions.map((action) => (
                <article key={action.id} className="border border-white/10 bg-[#0b1928] p-4">
                  <Check className="size-4 text-[#67d8ef]" />
                  <p className="mt-3 break-words font-mono text-xs text-white">{action.label}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{action.detail}</p>
                  <p className="mt-4 break-all border-t border-white/8 pt-3 font-mono text-[10px] text-[#ffd284]">
                    {action.confirmationCode}
                  </p>
                </article>
              ))}
            </div>
          </section>}

          <section className="border border-white/10 bg-[#0b1928] p-5 sm:p-6">
            <Tabs defaultValue="selected">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.16em] text-slate-500">DECISION EXPLANATION</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Why this route?</h2>
                </div>
                <TabsList variant="line" className="text-slate-400">
                  <TabsTrigger value="selected">Selected</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected alternatives</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="selected" className="mt-6">
                {decision?.evaluations
                  .filter((evaluation) => evaluation.passed)
                  .map((evaluation) => (
                    <CandidateChecks key={evaluation.candidate.id} evaluation={evaluation} />
                  ))}
              </TabsContent>
              <TabsContent value="rejected" className="mt-6 space-y-3">
                {decision?.evaluations
                  .filter((evaluation) => !evaluation.passed)
                  .map((evaluation) => (
                    <CandidateChecks key={evaluation.candidate.id} evaluation={evaluation} />
                  ))}
              </TabsContent>
            </Tabs>
          </section>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onOpenAudit} className="border-white/15 bg-transparent text-white hover:bg-white/8">
              Open audit trail
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineIcon({ status }: Readonly<{ status: DemoState["timeline"][number]["status"] }>) {
  if (status === "active") {
    return <LoaderCircle className="relative z-10 size-6 animate-spin rounded-full bg-[#0b1928] p-1 text-[#f5a524]" />;
  }
  if (status === "error") {
    return <CircleX className="relative z-10 size-6 rounded-full bg-[#0b1928] p-0.5 text-[#ff7452]" />;
  }
  if (status === "complete") {
    return <CheckCircle2 className="relative z-10 size-6 rounded-full bg-[#0b1928] p-0.5 text-[#67d8ef]" />;
  }
  return <Circle className="relative z-10 size-6 rounded-full bg-[#0b1928] p-1 text-slate-700" />;
}

function CandidateChecks({ evaluation }: Readonly<{ evaluation: CandidateEvaluation }>) {
  const route = [
    evaluation.candidate.segments[0]?.departureAirport,
    ...evaluation.candidate.segments.map((segment) => segment.arrivalAirport),
  ].join(" → ");

  return (
    <article className="border border-white/10 bg-[#081522] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-white">{route}</p>
          <p className="mt-1 font-mono text-[10px] text-slate-600">{evaluation.candidate.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <SourceBadge mode={evaluation.candidate.provider.mode} />
          <Badge
            variant="outline"
            className={cn(
              "rounded-sm",
              evaluation.passed
                ? "border-[#67d8ef]/35 text-[#9be8f7]"
                : "border-[#ff7452]/35 text-[#ff9a82]",
            )}
          >
            {evaluation.passed ? "ELIGIBLE" : "REJECTED"}
          </Badge>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {evaluation.checks.map((check) => (
          <div key={check.rule} className="flex items-start gap-2 text-xs leading-5">
            {check.passed ? (
              <Check className="mt-0.5 size-3.5 shrink-0 text-[#67d8ef]" />
            ) : (
              <CircleX className="mt-0.5 size-3.5 shrink-0 text-[#ff7452]" />
            )}
            <span className={check.passed ? "text-slate-400" : "text-[#ffb09d]"}>{check.reason}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
