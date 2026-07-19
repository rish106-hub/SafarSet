import { Activity, CheckCircle2 } from "lucide-react";

import { getTrip, listTripActivity } from "@/application/dal/customer-data";
import { PageHeader } from "@/components/layout/page-header";
import { StatusPill } from "@/components/status-pill";
import { TripTabs } from "@/features/trips/trip-tabs";

export default async function TripActivityPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const [trip, events] = await Promise.all([getTrip(tripId), listTripActivity(tripId)]);
  return <div><PageHeader eyebrow="Trip record" title={`${trip.title} activity`} description="A dated record of itinerary changes and live status checks." action={<StatusPill status={trip.status} />} /><TripTabs tripId={trip.id} /><div className="mx-auto max-w-4xl p-5 sm:p-8 lg:p-10">{events.length === 0 ? <section className="rounded-2xl border border-dashed border-[#BCCCDC] bg-white p-8 text-center"><Activity className="mx-auto size-6 text-[#147D92]" /><h2 className="mt-4 font-semibold">No activity yet</h2><p className="mt-2 text-sm text-[#627D98]">Changes and live status checks will appear here.</p></section> : <ol className="space-y-3">{events.map((event) => <li className="grid gap-4 rounded-2xl border border-[#D9E2EC] bg-white p-5 sm:grid-cols-[auto_1fr_auto] sm:items-start" key={event.id}><span className="grid size-9 place-items-center rounded-full bg-[#E3F8F8]"><CheckCircle2 className="size-4 text-[#147D92]" /></span><div><p className="font-medium">{event.summary}</p><p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#829AB1]">{event.type.replaceAll("_", " ")}</p></div><time className="text-xs text-[#627D98]" dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString("en-IN")}</time></li>)}</ol>}</div></div>;
}
