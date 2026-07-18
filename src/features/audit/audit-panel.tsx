import { ArrowLeft, CheckCircle2, FileClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SourceBadge } from "@/components/source-badge";
import type { DemoAuditEvent } from "@/application/services/run-demo-recovery";
import { formatTime } from "@/lib/format";

export function AuditPanel({
  events,
  onBack,
}: Readonly<{
  events: readonly DemoAuditEvent[];
  onBack: () => void;
}>) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex flex-col justify-between gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs tracking-[0.18em] text-[#8edff0]">RECOVERY RUN / AUDIT</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">What happened</h1>
          <p className="mt-2 text-sm text-slate-400">Inputs, decision, simulated actions, and source truth in order.</p>
        </div>
        <Button variant="outline" onClick={onBack} className="border-white/15 bg-transparent text-white hover:bg-white/8">
          <ArrowLeft className="size-4" />
          Back to recovery
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <ol className="border border-white/10 bg-[#0b1928]">
          {events.map((event, index) => (
            <li key={`${event.id}-${index}`} className="grid gap-3 border-b border-white/8 p-5 last:border-0 sm:grid-cols-[100px_24px_1fr]">
              <time className="font-mono text-[10px] text-slate-600">{formatTime(event.at)}</time>
              <CheckCircle2 className="size-5 text-[#67d8ef]" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-white">{event.label}</p>
                  <SourceBadge mode={event.provider.mode} />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{event.detail}</p>
                <p className="mt-2 font-mono text-[10px] text-slate-700">SOURCE {event.provider.source}</p>
              </div>
            </li>
          ))}
        </ol>

        <aside className="h-fit border border-[#67d8ef]/20 bg-[#67d8ef]/5 p-5">
          <FileClock className="size-5 text-[#8edff0]" />
          <p className="mt-4 text-sm font-medium text-white">Local audit active</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Stored in this browser only. Supabase persistence arrives in Spec 03.
          </p>
          <dl className="mt-5 space-y-3 border-t border-white/8 pt-4 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Events</dt>
              <dd className="font-mono text-white">{events.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">External calls</dt>
              <dd className="font-mono text-white">0</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Real transactions</dt>
              <dd className="font-mono text-white">0</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
