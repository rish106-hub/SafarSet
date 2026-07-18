import { AlertTriangle, ArrowRight, BriefcaseBusiness, Clock3, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SourceBadge } from "@/components/source-badge";
import { SourceMode } from "@/domain";
import { heroFamily, heroTrip } from "@/data";
import type { DemoPhase } from "@/features/demo/types";
import { RouteRibbon } from "@/features/recovery/route-ribbon";
import { formatTime } from "@/lib/format";

export function TripPanel({
  phase,
  onInject,
  onOpenRecovery,
}: Readonly<{
  phase: DemoPhase;
  onInject: () => void;
  onOpenRecovery: () => void;
}>) {
  const disrupted = phase !== "ready";

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-10 lg:py-10">
      <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <SourceBadge mode={SourceMode.Fixture} />
            <span className="font-mono text-xs text-slate-500">TRIP 001 / ACTIVE</span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Paris to Delhi
          </h1>
          <p className="mt-2 text-sm text-slate-400">Two-segment return journey · Friday 14 August</p>
        </div>
        <div
          className={`flex items-center gap-2 border px-3 py-2 font-mono text-xs ${
            disrupted
              ? "border-[#ff7452]/40 bg-[#ff7452]/8 text-[#ff9a82]"
              : "border-[#67d8ef]/30 bg-[#67d8ef]/8 text-[#9be8f7]"
          }`}
        >
          {disrupted ? <AlertTriangle className="size-4" /> : <Clock3 className="size-4" />}
          {disrupted ? "CONNECTION IMPOSSIBLE" : "MONITORING"}
        </div>
      </header>

      <RouteRibbon phase={phase} />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="border border-white/10 bg-[#0b1928]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Flight segments</h2>
            <span className="font-mono text-[10px] tracking-wider text-slate-500">UTC TIMES</span>
          </div>
          {heroTrip.segments.map((segment, index) => (
            <div
              key={segment.id}
              className="grid gap-4 border-b border-white/8 px-5 py-5 last:border-0 sm:grid-cols-[90px_1fr_auto] sm:items-center"
            >
              <div>
                <p className="font-mono text-sm font-semibold text-white">{segment.flightNumber}</p>
                <p className="mt-1 text-xs text-slate-500">Segment {index + 1}</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-mono text-lg text-white">{segment.departureAirport}</p>
                  <p className="text-xs text-slate-500">{formatTime(segment.estimatedDeparture)}</p>
                </div>
                <ArrowRight className="size-4 text-slate-600" />
                <div>
                  <p className="font-mono text-lg text-white">{segment.arrivalAirport}</p>
                  <p className="text-xs text-slate-500">{formatTime(segment.estimatedArrival)}</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-slate-500">PREMIUM ECONOMY</span>
            </div>
          ))}
        </section>

        <aside className="space-y-5">
          <div className="border border-white/10 bg-[#0b1928] p-5">
            <div className="flex items-center gap-2 text-white">
              <Users className="size-4 text-[#8edff0]" />
              <h2 className="text-sm font-semibold">{heroFamily.displayName}</h2>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Adults</dt>
                <dd className="mt-1 font-mono text-white">{heroFamily.adults}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Children</dt>
                <dd className="mt-1 font-mono text-white">{heroFamily.children}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Home</dt>
                <dd className="mt-1 font-mono text-white">{heroFamily.homeAirport}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Priority</dt>
                <dd className="mt-1 text-white">Stay together</dd>
              </div>
            </dl>
          </div>

          <div className="border border-[#f5a524]/30 bg-[#f5a524]/6 p-5">
            <div className="flex items-center gap-2 text-[#ffd284]">
              <BriefcaseBusiness className="size-4" />
              <h2 className="text-sm font-semibold">Demo control</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Inject fixed Paris delay. No live airline call or real booking.
            </p>
            {disrupted ? (
              <Button
                onClick={onOpenRecovery}
                className="mt-4 w-full bg-[#ff7452] text-white hover:bg-[#ff8a6e]"
              >
                Open recovery control
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                onClick={onInject}
                className="mt-4 w-full bg-[#f5a524] text-slate-950 hover:bg-[#ffc35a]"
              >
                Inject disruption
                <AlertTriangle className="size-4" />
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
