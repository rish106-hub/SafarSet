"use client";

import { ArrowRight, CircleCheck, Plane, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { AirportCombobox } from "@/components/airport-combobox";
import { airportLabel } from "@/data/airports";

import { createTripAction, updateTripAction } from "./actions";
import { derivedTripTitle } from "./derive-trip";

export type SegmentDraft = {
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  cabin: string;
};

const emptySegment = (): SegmentDraft => ({
  flightNumber: "",
  departureAirport: "",
  arrivalAirport: "",
  scheduledDeparture: "",
  scheduledArrival: "",
  cabin: "ECONOMY",
});

export type TripInitial = Readonly<{
  source?: "MANUAL" | "GOOGLE_CALENDAR" | "ITINERARY_IMPORT";
  externalReference?: string;
  segments?: readonly SegmentDraft[];
}>;

export function TripForm({ initial = {}, tripId }: Readonly<{ initial?: TripInitial; tripId?: string }>) {
  const submitAction = tripId ? updateTripAction.bind(null, tripId) : createTripAction;
  const [state, action, pending] = useActionState(submitAction, null);
  const [segments, setSegments] = useState<SegmentDraft[]>(initial.segments?.length ? initial.segments.map((segment) => ({ ...segment })) : [emptySegment()]);
  const serialized = useMemo(() => JSON.stringify(segments), [segments]);
  const title = derivedTripTitle(segments);
  const update = (index: number, field: keyof SegmentDraft, value: string) => {
    setSegments((current) => current.map((segment, itemIndex) => itemIndex === index ? { ...segment, [field]: field === "flightNumber" ? value.toUpperCase().replaceAll(" ", "") : value } : segment));
  };

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      <input name="segments" type="hidden" value={serialized} />
      <input name="source" type="hidden" value={initial.source ?? "MANUAL"} />
      <input name="externalReference" type="hidden" value={initial.externalReference ?? ""} />
      <div className="space-y-5">
        <section className="rounded-2xl border border-[#D9E2EC] bg-white p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#147D92]">Flight details</p><h2 className="mt-2 text-xl font-semibold">What is on your itinerary?</h2><p className="mt-2 text-sm leading-6 text-[#627D98]">Search by city. Airport codes stay visible for confirmation.</p></div><span className="rounded-full bg-[#E3F8F8] px-3 py-1 font-mono text-[10px] text-[#147D92]">{segments.length} {segments.length === 1 ? "FLIGHT" : "FLIGHTS"}</span></div>
          <div className="mt-6 space-y-5">
            {segments.map((segment, index) => (
              <div className="rounded-2xl border border-[#E4E7EB] bg-[#FAFCFE] p-4 sm:p-5" key={index}>
                <div className="mb-5 flex items-center justify-between"><p className="text-sm font-semibold">Flight {index + 1}</p>{segments.length > 1 && <button aria-label={`Remove flight ${index + 1}`} className="rounded-lg p-2 text-[#9B2C2C] hover:bg-[#FFF5F5]" onClick={() => setSegments((current) => current.filter((_, itemIndex) => itemIndex !== index))} type="button"><Trash2 className="size-4" /></button>}</div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-[#334E68] sm:col-span-2">Flight number<input className="field font-mono uppercase" onChange={(event) => update(index, "flightNumber", event.target.value)} placeholder="AI 2145" required value={segment.flightNumber} /></label>
                  <AirportCombobox label="Flying from" onChange={(airport) => update(index, "departureAirport", airport.code)} value={segment.departureAirport} />
                  <AirportCombobox label="Flying to" onChange={(airport) => update(index, "arrivalAirport", airport.code)} value={segment.arrivalAirport} />
                  <label className="block text-sm font-medium text-[#334E68]">Departs<input className="field" onChange={(event) => update(index, "scheduledDeparture", event.target.value)} required type="datetime-local" value={segment.scheduledDeparture} /></label>
                  <label className="block text-sm font-medium text-[#334E68]">Arrives<input className="field" onChange={(event) => update(index, "scheduledArrival", event.target.value)} required type="datetime-local" value={segment.scheduledArrival} /></label>
                  <details className="sm:col-span-2"><summary className="cursor-pointer text-sm font-medium text-[#147D92]">Cabin and advanced details</summary><label className="mt-4 block text-sm font-medium text-[#334E68]">Cabin<select className="field" onChange={(event) => update(index, "cabin", event.target.value)} value={segment.cabin}><option value="ECONOMY">Economy</option><option value="PREMIUM_ECONOMY">Premium economy</option><option value="BUSINESS">Business</option><option value="FIRST">First</option></select></label></details>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#BCCCDC] px-4 py-2.5 text-sm font-medium text-[#334E68] hover:border-[#2CB1BC]" onClick={() => setSegments((current) => [...current, { ...emptySegment(), departureAirport: current.at(-1)?.arrivalAirport ?? "" }])} type="button"><Plus className="size-4" /> Add another flight</button>
        </section>
        {state?.error && <p className="rounded-xl border border-[#D64545]/30 bg-[#FFF5F5] px-4 py-3 text-sm text-[#9B2C2C]" role="alert">{state.error}</p>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><Link className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-[#52606D]" href={tripId ? `/trips/${tripId}` : "/trips/new"}>{tripId ? "Cancel" : "Choose another import method"}</Link><button className="button-primary px-5 py-3" disabled={pending} type="submit">{pending ? tripId ? "Saving changes…" : "Starting monitoring…" : tripId ? <>Save trip changes <ArrowRight className="size-4" /></> : <>Start monitoring <ArrowRight className="size-4" /></>}</button></div>
      </div>
      <aside className="overflow-hidden rounded-2xl bg-[#102A43] text-white xl:sticky xl:top-6">
        <div className="border-b border-white/10 px-5 py-4"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#67E8E8]">Trip preview</p></div>
        <div className="p-5 sm:p-6"><h2 className="font-serif text-3xl leading-tight">{title}</h2><p className="mt-2 text-sm text-[#9FB3C8]">Name and dates are created automatically.</p><div className="mt-7 space-y-5">{segments.map((segment, index) => <div className="relative pl-7" key={index}><span className="absolute left-0 top-1 grid size-5 place-items-center rounded-full border border-[#2CB1BC] bg-[#102A43]"><Plane className="size-2.5 rotate-90 text-[#67E8E8]" /></span>{index < segments.length - 1 && <span className="absolute bottom-[-22px] left-[9px] top-6 w-px bg-white/15" />}<p className="font-mono text-xs text-[#67E8E8]">{segment.flightNumber || "FLIGHT NUMBER"}</p><p className="mt-1 text-sm font-medium">{segment.departureAirport ? airportLabel(segment.departureAirport) : "Departure city"} → {segment.arrivalAirport ? airportLabel(segment.arrivalAirport) : "Arrival city"}</p><p className="mt-1 text-xs text-[#9FB3C8]">{segment.scheduledDeparture ? new Date(segment.scheduledDeparture).toLocaleString() : "Departure time needed"}</p></div>)}</div><div className="mt-8 flex items-start gap-3 rounded-xl bg-white/8 p-4"><CircleCheck className="mt-0.5 size-4 shrink-0 text-[#67E8E8]" /><p className="text-xs leading-5 text-[#BCCCDC]">Your saved household and default travel rules apply automatically.</p></div></div>
      </aside>
    </form>
  );
}
