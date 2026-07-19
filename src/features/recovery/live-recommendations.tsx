"use client";

import { CircleAlert, CircleCheck, LoaderCircle, Radar } from "lucide-react";
import { useState } from "react";

type Result = {
  checkedAt: string;
  provider: { source: string; mode: string; observedAt: string };
  disruption: { reason: string } | null;
  status: { flightNumber: string; departureAirport: string; arrivalAirport: string; estimatedDeparture: string; estimatedArrival: string; status: string }[];
  nextStep?: string;
};

export function LiveFlightStatus({
  tripId,
  configured,
  availableToday,
  nextStatusDate,
}: Readonly<{
  tripId: string;
  configured: boolean;
  availableToday: boolean;
  nextStatusDate: string | null;
}>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const check = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/trips/${tripId}/status`, { method: "POST" });
      const payload = await response.json() as Result & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Live status check failed.");
      setResult(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Live status check failed.");
    } finally {
      setLoading(false);
    }
  };
  return <section className="rounded-2xl border border-[#D9E2EC] bg-white p-5 sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><Radar className="size-5 text-[#147D92]" /><h2 className="text-lg font-semibold">Live flight status</h2></div><p className="mt-2 max-w-2xl text-sm leading-6 text-[#627D98]">Aviationstack checks current flight timing. SafarSet detects disruption against your saved rules. It does not invent replacement offers or execute a booking.</p></div><button className="button-primary shrink-0" disabled={loading || !configured || !availableToday} onClick={check} type="button">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <Radar className="size-4" />}{loading ? "Checking…" : "Check live status"}</button></div>{!configured && <p className="mt-5 rounded-lg bg-[#FFF8EC] px-4 py-3 text-sm text-[#7B4B00]">The operator must add `AVIATIONSTACK_API_KEY` before live status checks work.</p>}{configured && !availableToday && <p className="mt-5 rounded-lg bg-[#F0F4F8] px-4 py-3 text-sm text-[#52606D]">Your current Aviationstack plan supports live status only. This trip becomes checkable on {nextStatusDate ? new Date(nextStatusDate).toLocaleDateString() : "its departure day"}.</p>}{error && <p className="mt-5 rounded-lg bg-[#FFF5F5] px-4 py-3 text-sm text-[#9B2C2C]" role="alert">{error}</p>}{result && <div className="mt-6 border-t border-[#E4E7EB] pt-6"><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-[#E3F8F8] px-2.5 py-1 font-mono text-[10px] text-[#147D92]">LIVE · {result.provider.source}</span><span className="text-xs text-[#7B8794]">Checked {new Date(result.checkedAt).toLocaleString()}</span></div><div className="mt-5 space-y-2">{result.status.map((segment) => <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F0F4F8] px-4 py-3 text-sm" key={`${segment.flightNumber}-${segment.estimatedDeparture}`}><span className="font-mono font-semibold">{segment.flightNumber} · {segment.departureAirport} → {segment.arrivalAirport}</span><span className="text-[#52606D]">{new Date(segment.estimatedDeparture).toLocaleString()} → {new Date(segment.estimatedArrival).toLocaleString()}</span><span className={`font-mono text-[10px] ${segment.status === "CANCELLED" ? "text-[#C53030]" : segment.status === "DELAYED" ? "text-[#9C5700]" : "text-[#147D92]"}`}>{segment.status}</span></div>)}</div>{!result.disruption ? <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#E3F8F8] p-4"><CircleCheck className="mt-0.5 size-5 text-[#147D92]" /><div><p className="font-semibold">No eligible disruption detected</p><p className="mt-1 text-sm text-[#3E7C87]">Live timings currently satisfy your minimum connection rule.</p></div></div> : <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#FFF3E0] p-4"><CircleAlert className="mt-0.5 size-5 text-[#D97706]" /><div><p className="font-semibold">Disruption detected</p><p className="mt-1 text-sm text-[#7B6232]">{result.disruption.reason}</p>{result.nextStep && <p className="mt-2 text-sm text-[#7B6232]">{result.nextStep}</p>}</div></div>}<p className="mt-4 text-xs leading-5 text-[#7B8794]">Date-specific future and historical lookup depends on your Aviationstack plan.</p></div>}</section>;
}
