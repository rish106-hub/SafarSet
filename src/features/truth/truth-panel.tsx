import { ArrowRight, CircleCheck, Database, RadioTower } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PersistenceMode } from "@/persistence/contracts/recovery-repository";
import { capabilityTruth, type TruthLevel } from "./truth-data";

const levelTone: Record<TruthLevel, string> = {
  FIXTURE: "border-blue-400/35 bg-blue-400/10 text-blue-200",
  SIMULATED: "border-amber-400/35 bg-amber-400/10 text-amber-200",
  OPTIONAL_LIVE: "border-cyan-400/35 bg-cyan-400/10 text-cyan-200",
  LOCAL_FIRST: "border-violet-400/35 bg-violet-400/10 text-violet-200",
};

export function TruthPanel({
  persistenceMode,
  onOpenEvaluation,
}: Readonly<{
  persistenceMode: PersistenceMode;
  onOpenEvaluation: () => void;
}>) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-5 sm:py-8 lg:px-10 lg:py-10">
      <header className="mb-7 grid gap-5 border-b border-white/10 pb-7 lg:grid-cols-[1fr_300px] lg:items-end">
        <div>
          <p className="font-mono text-xs tracking-[0.18em] text-[#8edff0]">
            CAPABILITY RECORD / PUBLIC CLAIMS
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            What is real here
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Every capability states its source, transaction boundary, and failure path. No hidden live-booking claim.
          </p>
        </div>
        <div className="border border-[#67d8ef]/25 bg-[#67d8ef]/5 p-4">
          <div className="flex items-center gap-2 text-[#a8ebf8]">
            <Database className="size-4" />
            <span className="font-mono text-xs">CURRENT AUDIT MODE</span>
          </div>
          <p className="mt-3 text-lg font-semibold text-white">
            {persistenceMode === "SUPABASE" ? "Supabase + browser" : "Browser storage"}
          </p>
        </div>
      </header>

      <section aria-label="API Truth Table" className="border border-white/10 bg-[#0b1928]">
        <div className="hidden grid-cols-[1.1fr_150px_1.2fr_1.2fr_1.2fr] gap-4 border-b border-white/10 px-5 py-3 font-mono text-[10px] tracking-[0.14em] text-slate-600 md:grid">
          <span>CAPABILITY</span>
          <span>REALITY</span>
          <span>SOURCE</span>
          <span>TRANSACTION</span>
          <span>IF IT FAILS</span>
        </div>
        <ol data-testid="truth-table">
          {capabilityTruth.map((item, index) => (
            <li
              key={item.capability}
              className="relative grid gap-4 border-b border-white/8 p-5 last:border-0 md:grid-cols-[1.1fr_150px_1.2fr_1.2fr_1.2fr] md:items-center"
            >
              <span className="absolute bottom-0 left-0 top-0 w-0.5 bg-white/5" />
              <div className="flex items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center border border-white/10 font-mono text-[10px] text-slate-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-white">{item.capability}</span>
              </div>
              <Badge variant="outline" className={`w-fit rounded-sm font-mono text-[10px] ${levelTone[item.level]}`}>
                {item.level}
              </Badge>
              <Fact label="Source" value={item.source} />
              <Fact label="Transaction" value={item.transaction} />
              <Fact label="If it fails" value={item.fallback} safe />
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 flex flex-col gap-4 border border-white/10 bg-[#091522] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <RadioTower className="mt-0.5 size-5 text-[#f5a524]" />
          <div>
            <p className="text-sm font-medium text-white">Claims need measured evidence.</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Run all 40 deterministic scenarios in this browser.</p>
          </div>
        </div>
        <Button onClick={onOpenEvaluation} className="bg-[#f5a524] text-slate-950 hover:bg-[#ffc35a]">
          Open evaluation
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function Fact({ label, value, safe = false }: Readonly<{ label: string; value: string; safe?: boolean }>) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[9px] tracking-wider text-slate-600 md:hidden">{label.toUpperCase()}</p>
      <p className={`mt-1 text-xs leading-5 md:mt-0 ${safe ? "text-[#9be8f7]" : "text-slate-400"}`}>
        {safe && <CircleCheck className="mr-1.5 inline size-3.5" />}
        {value}
      </p>
    </div>
  );
}
