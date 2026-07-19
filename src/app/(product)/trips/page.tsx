import { ArrowRight, CalendarPlus, PlaneTakeoff } from "lucide-react";
import Link from "next/link";

import { listTrips } from "@/application/dal/customer-data";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { StatusPill } from "@/components/status-pill";
import { formatTime } from "@/lib/format";

export default async function TripsPage() {
  const trips = await listTrips();
  return <div><PageHeader eyebrow="Itinerary source of truth" title="Trips" description="Only trips saved by you or confirmed from a connection appear here." action={<Link className="button-primary" href="/trips/new"><CalendarPlus className="size-4" /> Add trip</Link>} /><div className="p-5 sm:p-8 lg:p-10">{trips.length === 0 ? <EmptyState icon={PlaneTakeoff} title="No saved trips" body="Manual entry is available now. Connected imports always stop for your confirmation before saving." action={<Link className="button-primary" href="/trips/new">Add trip <ArrowRight className="size-4" /></Link>} /> : <div className="space-y-3">{trips.map((trip) => <Link className="group grid gap-5 rounded-xl border border-[#D9E2EC] bg-white p-5 transition hover:border-[#2CB1BC] sm:grid-cols-[1fr_auto] sm:items-center" href={`/trips/${trip.id}`} key={trip.id}><div className="flex items-start gap-5"><div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#E3F8F8] font-mono text-xs text-[#147D92]">{trip.origin}</div><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-semibold">{trip.title}</h2><StatusPill status={trip.status} /></div><p className="mt-2 text-sm text-[#627D98]">{trip.origin} to {trip.destination} · {formatTime(trip.startsAt)} UTC · {trip.adults + trip.children} travellers</p><p className="mt-1 font-mono text-[10px] text-[#9FB3C8]">SOURCE: {trip.source.replaceAll("_", " ")}</p></div></div><ArrowRight className="size-5 text-[#9FB3C8] transition group-hover:translate-x-1 group-hover:text-[#147D92]" /></Link>)}</div>}</div></div>;
}
