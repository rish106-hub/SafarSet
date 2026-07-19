import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { requireUser } from "@/application/dal/auth";
import { PageHeader } from "@/components/layout/page-header";
import { GoogleImport } from "@/features/connections/google-import";
import { ItineraryImport } from "@/features/trips/itinerary-import";
import { TripCaptureChooser } from "@/features/trips/trip-capture-chooser";
import { TripForm, type SegmentDraft } from "@/features/trips/trip-form";
import { toDateTimeLocal } from "@/lib/format";
import { getGoogleConnectionStatus } from "@/providers/google-calendar";

export default async function NewTripPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const query = await searchParams;
  const value = (key: string) => typeof query[key] === "string" ? query[key] as string : undefined;
  const method = value("method");
  const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI && process.env.GOOGLE_TOKEN_ENCRYPTION_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
  let googleConnected = false;
  if (googleConfigured) {
    try { googleConnected = await getGoogleConnectionStatus(user.id) === "CONNECTED"; } catch { googleConnected = false; }
  }
  let content: React.ReactNode;
  let eyebrow = "Add a trip";
  let title = "How should we add your trip?";
  let description = "Choose the source you already have. SafarSet asks only for missing details.";
  if (method === "manual") {
    eyebrow = "Manual fallback"; title = "Enter the flights on your itinerary"; description = "Five details per flight. Trip name, travel dates, household, and rules are automatic.";
    content = <TripForm />;
  } else if (method === "itinerary") {
    eyebrow = "Itinerary import"; title = "Use the confirmation you already have"; description = "Upload or paste it. SafarSet extracts the route and asks you to verify uncertain fields.";
    content = <ItineraryImport />;
  } else if (method === "calendar") {
    eyebrow = "Google Calendar"; title = googleConnected ? "Trips found in your calendar" : "Connect Google Calendar"; description = googleConnected ? "SafarSet checks Gmail-created travel events first. Nothing saves without your confirmation." : "Read-only access finds upcoming flight reservations. SafarSet cannot edit your calendar.";
    content = googleConnected ? <GoogleImport autoScan={value("scan") === "1"} /> : googleConfigured ? <div className="rounded-3xl border border-[#D9E2EC] bg-white p-6 sm:p-8"><h2 className="text-xl font-semibold">One connection, then less typing</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#627D98]">Google Calendar can expose travel reservations created from Gmail without giving SafarSet direct inbox access.</p><a className="button-primary mt-6" href="/api/connections/google/start">Connect Google Calendar</a></div> : <div className="rounded-3xl border border-[#F6AD55]/50 bg-[#FFF8EC] p-6"><h2 className="font-semibold text-[#7B4B00]">Google OAuth setup needed</h2><p className="mt-2 text-sm text-[#7B6232]">Operator must add Google client ID, client secret, redirect URI, and token-encryption key.</p></div>;
  } else if (method === "review") {
    const segment: SegmentDraft = { flightNumber: value("flightNumber")?.toUpperCase() ?? "", departureAirport: value("origin")?.toUpperCase() ?? "", arrivalAirport: value("destination")?.toUpperCase() ?? "", scheduledDeparture: value("startsAt") ? toDateTimeLocal(value("startsAt")!) : "", scheduledArrival: value("endsAt") ? toDateTimeLocal(value("endsAt")!) : "", cabin: "ECONOMY" };
    eyebrow = "Review import"; title = "Check what SafarSet found"; description = "Confirm airport and local timing against your issued itinerary.";
    content = <TripForm initial={{ source: "GOOGLE_CALENDAR", externalReference: value("externalReference"), segments: [segment] }} />;
  } else {
    content = <TripCaptureChooser googleConfigured={googleConfigured} googleConnected={googleConnected} />;
  }
  return <div><PageHeader eyebrow={eyebrow} title={title} description={description} action={method ? <Link className="inline-flex items-center gap-2 text-sm font-medium text-[#147D92]" href="/trips/new"><ArrowLeft className="size-4" /> All methods</Link> : undefined} /><div className="mx-auto max-w-6xl p-5 sm:p-8 lg:p-10">{content}</div></div>;
}
