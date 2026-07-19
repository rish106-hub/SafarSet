"use client";

import { FileText, LoaderCircle, ScanText, Upload } from "lucide-react";
import { useState } from "react";

import { TripForm, type SegmentDraft } from "./trip-form";

type ParseResult = { segments: SegmentDraft[]; warnings: string[] };

export function ItineraryImport() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parse = async (file?: File) => {
    setLoading(true); setError(null);
    try {
      const form = new FormData();
      if (file) form.set("file", file); else form.set("text", text);
      const response = await fetch("/api/trips/parse-itinerary", { method: "POST", body: form });
      const payload = await response.json() as ParseResult & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Itinerary could not be read.");
      setResult(payload);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Itinerary could not be read."); } finally { setLoading(false); }
  };
  if (result?.segments.length) return <div className="space-y-5">{result.warnings.length > 0 && <div className="rounded-xl border border-[#F6AD55]/50 bg-[#FFF8EC] p-4"><p className="font-semibold text-[#7B4B00]">Check highlighted details</p><ul className="mt-2 space-y-1 text-sm text-[#7B6232]">{result.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul></div>}<TripForm initial={{ source: "ITINERARY_IMPORT", segments: result.segments }} /></div>;
  return <section className="grid gap-5 lg:grid-cols-2"><div className="rounded-3xl border border-dashed border-[#9FB3C8] bg-white p-6 sm:p-8"><span className="grid size-12 place-items-center rounded-2xl bg-[#E3F8F8] text-[#147D92]"><Upload className="size-5" /></span><h2 className="mt-8 text-xl font-semibold">Upload itinerary</h2><p className="mt-2 text-sm leading-6 text-[#627D98]">Accepts `.ics`, `.txt`, and text-based PDF up to 5 MB. File content is not stored.</p><label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#102A43] px-4 py-2.5 text-sm font-medium text-white"><FileText className="size-4" /> Choose file<input accept=".ics,.txt,.pdf,text/calendar,text/plain,application/pdf" className="sr-only" disabled={loading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void parse(file); }} type="file" /></label></div><div className="rounded-3xl border border-[#D9E2EC] bg-white p-6 sm:p-8"><span className="grid size-12 place-items-center rounded-2xl bg-[#F0F4F8] text-[#52606D]"><ScanText className="size-5" /></span><h2 className="mt-8 text-xl font-semibold">Paste booking confirmation</h2><p className="mt-2 text-sm text-[#627D98]">Copy itinerary text from airline or travel-provider email.</p><textarea className="field min-h-44 resize-y" onChange={(event) => setText(event.target.value)} placeholder="Paste flight number, route, and timing here…" value={text} /><button className="button-primary mt-4" disabled={loading || !text.trim()} onClick={() => void parse()} type="button">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <ScanText className="size-4" />} Review itinerary</button></div>{error && <p className="rounded-xl bg-[#FFF5F5] px-4 py-3 text-sm text-[#9B2C2C] lg:col-span-2" role="alert">{error}</p>}</section>;
}
