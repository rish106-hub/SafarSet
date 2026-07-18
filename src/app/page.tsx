import { createHeroInput, heroCandidates, recoveryScenarios } from "@/data";
import { evaluateRecovery } from "@/engine";

const modules = [
  ["Detector", "Finds cancellations and impossible connections."],
  ["Constraints", "Returns seven explicit safety checks per candidate."],
  ["Ranking", "Scores only routes passing every hard rule."],
  ["Autonomy", "Books, requests approval, or escalates."],
  ["Idempotency", "Blocks repeated execution for same recovery."],
] as const;

export default function Home() {
  const decision = evaluateRecovery(createHeroInput(heroCandidates));
  const passingCandidates = decision.evaluations.filter(
    (evaluation) => evaluation.passed,
  ).length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-14">
      <header className="flex flex-col gap-5 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.8)]" />
          Engine foundation
        </div>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          SafarSet recovery policy engine
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Deterministic family travel recovery. No network calls, hidden AI
          decisions, or real traveller data.
        </p>
      </header>

      <section className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Hero decision" value={decision.outcome} />
        <Metric label="Safe candidates" value={String(passingCandidates)} />
        <Metric label="Scenario fixtures" value={String(recoveryScenarios.length)} />
        <Metric label="Provider mode" value="FIXTURE" />
      </section>

      <section className="grid gap-4 border-t border-white/10 pt-8 md:grid-cols-2">
        {modules.map(([name, description]) => (
          <article
            key={name}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
          >
            <h2 className="font-mono text-sm font-semibold text-white">
              {name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {description}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 break-words font-mono text-lg font-semibold text-emerald-300">
        {value}
      </p>
    </div>
  );
}
