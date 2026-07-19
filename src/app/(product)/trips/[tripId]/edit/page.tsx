import { getTrip } from "@/application/dal/customer-data";
import { PageHeader } from "@/components/layout/page-header";
import { StatusPill } from "@/components/status-pill";
import { DeleteTripButton } from "@/features/trips/delete-trip-button";
import { TripForm } from "@/features/trips/trip-form";
import { TripTabs } from "@/features/trips/trip-tabs";
import { toDateTimeLocal } from "@/lib/format";

export default async function EditTripPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const trip = await getTrip(tripId);
  return <div><PageHeader eyebrow="Trip controls" title={`Edit ${trip.title}`} description="Correct the issued itinerary. SafarSet recalculates the trip route and dates automatically." action={<StatusPill status={trip.status} />} /><TripTabs tripId={trip.id} /><div className="mx-auto max-w-6xl space-y-8 p-5 sm:p-8 lg:p-10"><TripForm initial={{ source: trip.source === "GOOGLE_CALENDAR" ? "GOOGLE_CALENDAR" : trip.source === "ITINERARY_IMPORT" ? "ITINERARY_IMPORT" : "MANUAL", segments: trip.segments.map((segment) => ({ flightNumber: segment.flightNumber, departureAirport: segment.departureAirport, arrivalAirport: segment.arrivalAirport, scheduledDeparture: toDateTimeLocal(segment.scheduledDeparture), scheduledArrival: toDateTimeLocal(segment.scheduledArrival), cabin: segment.cabin })) }} tripId={trip.id} /><section className="flex flex-col gap-5 rounded-2xl border border-[#D64545]/25 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><h2 className="font-semibold text-[#7B1E1E]">Delete this trip</h2><p className="mt-1 text-sm leading-6 text-[#7B8794]">Use only for duplicates or cancelled plans. This cannot be undone.</p></div><DeleteTripButton tripId={trip.id} tripTitle={trip.title} /></section></div></div>;
}
