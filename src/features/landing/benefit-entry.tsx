import { ArrowRight, Clock3, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SourceBadge } from "@/components/source-badge";
import { SourceMode } from "@/domain";

export function BenefitEntry({ onOpen }: Readonly<{ onOpen: () => void }>) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
      <section>
        <div className="mb-7 flex items-center gap-3">
          <span className="h-px w-10 bg-[#f5a524]" />
          <span className="font-mono text-xs tracking-[0.18em] text-[#ffd284]">
            PLATINUM TRAVEL CARE / CONCEPT BENEFIT
          </span>
        </div>
        <h1 className="max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-7xl">
          Your family trip breaks.
          <span className="block text-[#8edff0]">SafarSet acts inside your rules.</span>
        </h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
          One seeded family. One missed connection. Every unsafe recovery rejected
          before simulated action.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={onOpen}
            className="bg-[#f5a524] text-slate-950 hover:bg-[#ffc35a]"
          >
            Review protected trip
            <ArrowRight className="size-4" />
          </Button>
          <div className="flex items-center gap-2 border border-white/10 px-3 py-2 text-xs text-slate-400">
            <SourceBadge mode={SourceMode.Fixture} />
            No API keys
          </div>
        </div>
      </section>

      <section className="relative border border-white/15 bg-[#0b1a2a] p-1 shadow-2xl shadow-black/30">
        <div className="border border-white/8 p-6 sm:p-8">
          <div className="flex items-start justify-between border-b border-white/10 pb-6">
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-slate-500">
                PROTECTED JOURNEY
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">Mehra family</p>
              <p className="mt-1 text-sm text-slate-400">Paris → Dubai → Delhi</p>
            </div>
            <div className="font-mono text-right text-xs text-[#ffd284]">
              <p>FAMILY / 04</p>
              <p className="mt-1 text-slate-500">TRIP 001</p>
            </div>
          </div>
          <div className="grid gap-px bg-white/10 sm:grid-cols-3">
            {[
              [Users, "Together", "No split routes"],
              [ShieldCheck, "Pre-approved", "Hard rules locked"],
              [Clock3, "Fast", "Under 5 minutes"],
            ].map(([Icon, label, detail]) => {
              const ItemIcon = Icon as typeof Users;
              return (
                <div key={String(label)} className="bg-[#0b1a2a] px-4 py-5">
                  <ItemIcon className="size-4 text-[#8edff0]" />
                  <p className="mt-3 text-sm font-medium text-white">{String(label)}</p>
                  <p className="mt-1 text-xs text-slate-500">{String(detail)}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-xs leading-5 text-slate-500">
            Portfolio demonstration. All travellers, providers, bookings, and
            actions are synthetic.
          </p>
        </div>
      </section>
    </div>
  );
}
