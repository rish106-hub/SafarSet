"use client";

import { ArrowRight, CalendarSearch, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Candidate = {
  externalReference: string;
  title: string;
  origin: string;
  destination: string;
  startsAt: string;
  endsAt: string;
  flightNumber: string | null;
};

export function GoogleImport({ autoScan = false }: Readonly<{ autoScan?: boolean }>) {
  const [loading, setLoading] = useState(autoScan);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<readonly Candidate[] | null>(null);
  const scan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/connections/google/import", { cache: "no-store" });
      const payload = await response.json() as { candidates?: Candidate[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Calendar scan failed.");
      setCandidates(payload.candidates ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Calendar scan failed.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!autoScan) return;
    let active = true;
    fetch("/api/connections/google/import", { cache: "no-store" }).then(async (response) => {
      const payload = await response.json() as { candidates?: Candidate[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Calendar scan failed.");
      if (active) setCandidates(payload.candidates ?? []);
    }).catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "Calendar scan failed."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [autoScan]);
  return <div><button className="button-primary" disabled={loading} onClick={scan} type="button">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <CalendarSearch className="size-4" />} {loading ? "Finding trips…" : "Find upcoming trips"}</button>{error && <p className="mt-4 rounded-lg bg-[#FFF5F5] px-4 py-3 text-sm text-[#9B2C2C]">{error}</p>}{candidates && <div className="mt-5 space-y-3">{candidates.length === 0 ? <p className="rounded-xl bg-[#F0F4F8] p-5 text-sm leading-6 text-[#627D98]">No recognisable flight reservation was found. Upload the itinerary or use manual entry.</p> : candidates.map((candidate) => { const params = new URLSearchParams({ method: "review", origin: candidate.origin, destination: candidate.destination, startsAt: candidate.startsAt, endsAt: candidate.endsAt, externalReference: candidate.externalReference, ...(candidate.flightNumber ? { flightNumber: candidate.flightNumber } : {}) }); return <Link className="flex items-center justify-between rounded-2xl border border-[#D9E2EC] bg-white p-5 transition hover:border-[#2CB1BC]" href={`/trips/new?${params}`} key={candidate.externalReference}><div><p className="font-medium">{candidate.title}</p><p className="mt-1 text-sm text-[#627D98]">{candidate.origin} → {candidate.destination}{candidate.flightNumber ? ` · ${candidate.flightNumber}` : " · flight number needs review"}</p></div><ArrowRight className="size-4 text-[#147D92]" /></Link>; })}</div>}</div>;
}
