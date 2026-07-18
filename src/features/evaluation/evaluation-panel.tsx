"use client";

import { useState } from "react";
import { Activity, CheckCircle2, CircleAlert, Gauge, LoaderCircle, Play, RotateCcw } from "lucide-react";

import {
  evaluateScenarioSuite,
  type EvaluationReport,
} from "@/application/services/evaluate-scenario-suite";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type RunState =
  | Readonly<{ status: "idle" | "running"; report: null; error: null }>
  | Readonly<{ status: "complete"; report: EvaluationReport; error: null }>
  | Readonly<{ status: "error"; report: null; error: string }>;

export function EvaluationPanel() {
  const [state, setState] = useState<RunState>({ status: "idle", report: null, error: null });

  const run = () => {
    setState({ status: "running", report: null, error: null });
    window.setTimeout(() => {
      try {
        setState({ status: "complete", report: evaluateScenarioSuite(), error: null });
      } catch (error) {
        setState({
          status: "error",
          report: null,
          error: error instanceof Error ? error.message : "Evaluation failed.",
        });
      }
    }, 180);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-5 sm:py-8 lg:px-10 lg:py-10">
      <header className="mb-7 flex flex-col justify-between gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs tracking-[0.18em] text-[#ffd284]">FIXTURE LAB / 40 SCENARIOS</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Recovery evaluation</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Same engine, same fixtures, measured locally. No provider call enters this run.
          </p>
        </div>
        <Button
          onClick={run}
          disabled={state.status === "running"}
          className="bg-[#f5a524] text-slate-950 hover:bg-[#ffc35a]"
        >
          {state.status === "running" ? <LoaderCircle className="size-4 animate-spin" /> : state.status === "complete" ? <RotateCcw className="size-4" /> : <Play className="size-4" />}
          {state.status === "complete" ? "Run again" : "Run 40 scenarios"}
        </Button>
      </header>

      {state.status === "idle" && <EmptyState onRun={run} />}
      {state.status === "running" && <LoadingState />}
      {state.status === "error" && <ErrorState message={state.error} onRetry={run} />}
      {state.status === "complete" && <Report report={state.report} />}
    </div>
  );
}

function EmptyState({ onRun }: Readonly<{ onRun: () => void }>) {
  return (
    <section className="grid min-h-80 place-items-center border border-dashed border-white/15 bg-[#0b1928]/60 p-8 text-center">
      <div>
        <Activity className="mx-auto size-7 text-[#8edff0]" />
        <h2 className="mt-4 text-lg font-semibold text-white">No evaluation run yet</h2>
        <p className="mt-2 text-sm text-slate-500">Expected outcomes, hard rules, duplicates, conflicts, stability, and timing will be checked.</p>
        <Button variant="outline" onClick={onRun} className="mt-5 border-white/15 bg-transparent text-white hover:bg-white/8">Start evaluation</Button>
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <section aria-live="polite" className="border border-white/10 bg-[#0b1928] p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3"><LoaderCircle className="size-5 animate-spin text-[#f5a524]" /><span className="text-sm text-white">Running deterministic suite</span></div>
        <span className="font-mono text-xs text-slate-500">40 FIXTURES</span>
      </div>
      <Progress value={72} className="mt-5 [&_[data-slot=progress-indicator]]:bg-[#f5a524] [&_[data-slot=progress-track]]:bg-white/8" />
    </section>
  );
}

function ErrorState({ message, onRetry }: Readonly<{ message: string; onRetry: () => void }>) {
  return (
    <section role="alert" className="border border-[#ff7452]/30 bg-[#ff7452]/8 p-6">
      <CircleAlert className="size-6 text-[#ff9a82]" />
      <h2 className="mt-4 text-lg font-semibold text-white">Evaluation stopped</h2>
      <p className="mt-2 text-sm text-[#ffb09d]">{message}</p>
      <Button variant="outline" onClick={onRetry} className="mt-5 border-[#ff7452]/30 bg-transparent text-white">Retry</Button>
    </section>
  );
}

function Report({ report }: Readonly<{ report: EvaluationReport }>) {
  const metrics = [
    ["Outcome accuracy", `${report.passed}/${report.total}`, report.passed === report.total],
    ["Hard-rule compliance", `${Math.round(report.hardConstraintComplianceRate * 100)}%`, report.hardConstraintComplianceRate === 1],
    ["Eligible recovery", `${Math.round(report.recoverySuccessRate * 100)}%`, report.recoverySuccessRate >= 0.95],
    ["Duplicate actions", String(report.duplicateAutonomousActions), report.duplicateAutonomousActions === 0],
    ["Conflict actions", String(report.conflictingAutonomousActions), report.conflictingAutonomousActions === 0],
    ["Stable ordering", report.stableAcrossRuns ? "PASS" : "FAIL", report.stableAcrossRuns],
  ] as const;
  return (
    <div data-testid="evaluation-report" className="space-y-6">
      <section className={`grid gap-5 border p-5 sm:grid-cols-[1fr_auto] sm:items-center ${report.allPassed ? "border-[#67d8ef]/30 bg-[#67d8ef]/5" : "border-[#ff7452]/30 bg-[#ff7452]/8"}`}>
        <div className="flex items-start gap-3">
          {report.allPassed ? <CheckCircle2 className="mt-0.5 size-6 text-[#67d8ef]" /> : <CircleAlert className="mt-0.5 size-6 text-[#ff7452]" />}
          <div><p className="text-lg font-semibold text-white">{report.allPassed ? "All safety gates passed" : "Evaluation needs review"}</p><p className="mt-1 text-xs leading-5 text-slate-400">Two complete deterministic passes in {report.durationMs.toFixed(2)} ms.</p></div>
        </div>
        <div className="font-mono text-sm text-white">{report.total} / {report.total}</div>
      </section>

      <section className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, value, passed]) => (
          <article key={label} className="bg-[#0b1928] p-5">
            <div className="flex items-center justify-between gap-3"><p className="text-xs text-slate-500">{label}</p>{passed && <CheckCircle2 className="size-4 text-[#67d8ef]" />}</div>
            <p className="mt-4 font-mono text-2xl text-white">{value}</p>
          </article>
        ))}
      </section>

      <section className="border border-white/10 bg-[#0b1928]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><h2 className="text-sm font-semibold text-white">Category evidence</h2><Gauge className="size-4 text-[#8edff0]" /></div>
        <ol>
          {report.categories.map((category) => (
            <li key={category.name} className="grid gap-3 border-b border-white/8 px-5 py-4 last:border-0 sm:grid-cols-[1fr_100px_160px] sm:items-center">
              <span className="text-sm capitalize text-white">{category.name.replaceAll("-", " ")}</span>
              <span className="font-mono text-xs text-slate-400">{category.passed}/{category.total} pass</span>
              <Progress value={(category.passed / category.total) * 100} className="[&_[data-slot=progress-indicator]]:bg-[#67d8ef] [&_[data-slot=progress-track]]:bg-white/8" />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
