import { AlertTriangle, Check, Plane } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RecoveryCandidate } from "@/domain";
import type { DemoPhase } from "@/features/demo/types";

export function RouteRibbon({
  phase,
  candidate,
}: Readonly<{
  phase: DemoPhase;
  candidate?: RecoveryCandidate;
}>) {
  const recovered = phase === "recovered" && candidate;
  const airports = recovered
    ? [
        candidate.segments[0]?.departureAirport,
        ...candidate.segments.map((segment) => segment.arrivalAirport),
      ].filter(Boolean)
    : ["CDG", "DXB", "DEL"];

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-[#081522] px-5 py-6 sm:px-7">
      <div className="runway-grid absolute inset-0 opacity-35" />
      <div className="relative flex items-center">
        {airports.map((airport, index) => {
          const isBroken = !recovered && phase !== "ready" && index === 1;
          const isLast = index === airports.length - 1;
          return (
            <div
              key={`${airport}-${index}`}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "grid size-10 place-items-center rounded-full border bg-[#07101c] font-mono text-xs font-bold",
                    isBroken
                      ? "route-pulse border-[#ff7452] text-[#ff9a82]"
                      : recovered
                        ? "border-[#67d8ef] text-[#9be8f7]"
                        : "border-white/25 text-white",
                  )}
                >
                  {isBroken ? (
                    <AlertTriangle className="size-4" />
                  ) : recovered && isLast ? (
                    <Check className="size-4" />
                  ) : (
                    airport
                  )}
                </div>
                <span className="font-mono text-[11px] tracking-[0.16em] text-slate-300">
                  {airport}
                </span>
              </div>
              {!isLast && (
                <div className="relative mx-2 h-px flex-1 bg-white/15">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0",
                      recovered
                        ? "w-full bg-[#67d8ef]"
                        : phase === "ready"
                          ? "w-full bg-white/25"
                          : index === 0
                            ? "w-full border-t border-dashed border-[#ff7452] bg-transparent"
                            : "w-0",
                    )}
                  />
                  <Plane
                    className={cn(
                      "absolute -top-2 size-4",
                      recovered
                        ? "right-1 text-[#67d8ef]"
                        : "left-1/2 text-slate-500",
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="relative mt-5 flex items-center justify-between font-mono text-[10px] tracking-[0.15em] text-slate-500">
        <span>PARIS / UTC</span>
        <span>{recovered ? "RECOVERY ROUTE" : "ORIGINAL ITINERARY"}</span>
        <span>DELHI / IST</span>
      </div>
    </div>
  );
}
