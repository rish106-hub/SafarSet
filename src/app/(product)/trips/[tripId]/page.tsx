import { ArrowRight, Clock3, Plane } from "lucide-react";
import Link from "next/link";

import { getTrip } from "@/application/dal/customer-data";
import { PageHeader } from "@/components/layout/page-header";
import { StatusPill } from "@/components/status-pill";
import { airportLabel } from "@/data/airports";
import { LiveFlightStatus } from "@/features/recovery/live-recommendations";
import { TripTabs } from "@/features/trips/trip-tabs";
import { formatTime } from "@/lib/format";

export default async function TripPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const trip = await getTrip(tripId);
  const liveConfigured = Boolean(process.env.PROVIDER_MODE === "live" && process.env.AVIATIONSTACK_API_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const today = new Date().toISOString().slice(0, 10);
  const availableToday = trip.segments.some((segment) => segment.scheduledDeparture.slice(0, 10) === today);
  const nextStatusDate = trip.segments.map((segment) => segment.scheduledDeparture).filter((date) => date.slice(0, 10) >= today).sort()[0] ?? null;
  return <div><PageHeader eyebrow="Monitored trip" title={trip.title} description={`${airportLabel(trip.origin)} to ${airportLabel(trip.destination)} · ${trip.adults + trip.children} travellers`} action={<StatusPill status={trip.status} />} /><TripTabs tripId={trip.id} /><div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-8 lg:p-10"><section className="overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white"><div className="flex items-center justify-between border-b border-[#E4E7EB] px-5 py-4"><h2 className="font-semibold">Flights in this trip</h2><span className="font-mono text-[10px] text-[#9FB3C8]">ISSUED ITINERARY</span></div>{trip.segments.map((segment, index) => <div className="grid gap-4 border-b border-[#E4E7EB] px-5 py-5 last:border-0 sm:grid-cols-[100px_1fr_auto] sm:items-center" key={segment.id}><div><p className="font-mono font-semibold">{segment.flightNumber}</p><p className="mt-1 text-xs text-[#7B8794]">Flight {index + 1}</p></div><div className="flex items-center gap-4"><div><p className="font-mono text-lg font-semibold">{segment.departureAirport}</p><p className="text-xs text-[#627D98]">{formatTime(segment.scheduledDeparture)}</p></div><div className="h-px flex-1 bg-[#BCCCDC]"><Plane className="mx-auto -mt-2 size-4 rotate-90 bg-white text-[#2CB1BC]" /></div><div className="text-right"><p className="font-mono text-lg font-semibold">{segment.arrivalAirport}</p><p className="text-xs text-[#627D98]">{formatTime(segment.scheduledArrival)}</p></div></div><span className="font-mono text-[10px] text-[#7B8794]">{segment.cabin.replaceAll("_", " ")}</span></div>)}</section>{!trip.policyId && <section className="flex items-start gap-3 rounded-xl border border-[#F6AD55]/50 bg-[#FFF8EC] p-5"><Clock3 className="mt-0.5 size-5 text-[#D97706]" /><div><p className="font-semibold">Travel rules needed</p><p className="mt-1 text-sm text-[#7B6232]">Live status needs rules to decide when a change matters.</p><Link className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#9C5700]" href="/settings">Set travel rules <ArrowRight className="size-4" /></Link></div></section>}<LiveFlightStatus availableToday={availableToday} configured={liveConfigured && Boolean(trip.policyId)} nextStatusDate={nextStatusDate} tripId={trip.id} /></div></div>;
}
