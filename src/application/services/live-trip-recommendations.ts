import "server-only";

import {
  CabinClass,
  SegmentStatus,
  SourceMode,
  type FlightSegment,
  type RecoveryPolicy,
  type Trip,
} from "@/domain";
import { detectDisruption } from "@/engine";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAviationstackFlightStatusProvider } from "@/providers/aviationstack";

function cabin(value: string): CabinClass {
  return Object.values(CabinClass).includes(value as CabinClass) ? value as CabinClass : CabinClass.Economy;
}

export async function getLiveTripStatus(userId: string, tripId: string) {
  const admin = createSupabaseAdminClient();
  const [{ data: tripRow, error: tripError }, { data: segmentRows, error: segmentError }] = await Promise.all([
    admin.from("trips").select("id,user_id,policy_id,title,origin,destination,starts_at,ends_at,adults,children,status").eq("id", tripId).eq("user_id", userId).maybeSingle(),
    admin.from("trip_segments").select("id,position,flight_number,departure_airport,arrival_airport,scheduled_departure,scheduled_arrival,cabin").eq("trip_id", tripId).eq("user_id", userId).order("position"),
  ]);
  if (tripError || segmentError || !tripRow) throw new Error("Trip could not be loaded.");
  if (!tripRow.policy_id) throw new Error("Assign a recovery policy before checking live options.");
  const { data: policyRow, error: policyError } = await admin.from("policies").select("*").eq("id", tripRow.policy_id).eq("user_id", userId).maybeSingle();
  if (policyError || !policyRow) throw new Error("Recovery policy could not be loaded.");
  if (!segmentRows?.length) throw new Error("Add at least one flight segment.");

  const now = new Date().toISOString();
  const inputMetadata = { source: "Customer itinerary", mode: SourceMode.Live, isSimulated: false, observedAt: now, confidence: 1 } as const;
  const segments: FlightSegment[] = segmentRows.map((row) => ({
    id: String(row.id),
    flightNumber: String(row.flight_number),
    departureAirport: String(row.departure_airport),
    arrivalAirport: String(row.arrival_airport),
    scheduledDeparture: String(row.scheduled_departure),
    scheduledArrival: String(row.scheduled_arrival),
    estimatedDeparture: String(row.scheduled_departure),
    estimatedArrival: String(row.scheduled_arrival),
    cabin: cabin(String(row.cabin)),
    status: SegmentStatus.Scheduled,
    seatsAvailable: Number(tripRow.adults) + Number(tripRow.children),
    provider: inputMetadata,
  }));
  const trip: Trip = { id: String(tripRow.id), familyId: userId, origin: String(tripRow.origin), destination: String(tripRow.destination), segments };
  const arrivalDeadline = new Date(Date.parse(String(tripRow.ends_at)) + Number(policyRow.maximum_arrival_delay_minutes) * 60_000).toISOString();
  const policy: RecoveryPolicy = {
    id: String(policyRow.id),
    familyId: userId,
    requireFamilyTogether: Boolean(policyRow.require_family_together),
    forbidSelfTransfer: Boolean(policyRow.forbid_self_transfer),
    maxStops: Number(policyRow.max_stops),
    minimumCabin: cabin(String(policyRow.minimum_cabin)),
    approvedTransitAirports: Array.isArray(policyRow.approved_transit_airports) ? policyRow.approved_transit_airports.map(String) : [],
    minimumConnectionMinutes: Number(policyRow.minimum_connection_minutes),
    arrivalDeadline,
    autoSpendLimit: { currency: "INR", amountMinor: Number(policyRow.auto_spend_limit_minor) },
    avoidOvernight: Boolean(policyRow.avoid_overnight),
  };
  const provider = getAviationstackFlightStatusProvider();
  const liveStatus = await provider.getFlightStatus({ trip, observedAt: now });
  const statusTrip = { ...trip, segments: liveStatus.segments };
  const disruption = detectDisruption({ trip: statusTrip, policy, eventId: crypto.randomUUID(), observedAt: now });
  await admin.from("trips").update({ status: disruption ? "DISRUPTED" : "MONITORING" }).eq("id", tripId).eq("user_id", userId);

  if (!disruption) {
    await admin.from("audit_events").insert({ user_id: userId, trip_id: tripId, event_type: "LIVE_STATUS_CHECK", summary: "Live status checked. No eligible disruption detected.", details: { provider: liveStatus.provider.source } });
    return { checkedAt: now, provider: liveStatus.provider, status: liveStatus.segments, disruption: null };
  }

  await admin.from("audit_events").insert({
    user_id: userId,
    trip_id: tripId,
    event_type: "LIVE_DISRUPTION_DETECTED",
    summary: "Live disruption detected. Aviationstack provides status only, so no alternative offer was generated.",
    details: { provider: liveStatus.provider.source, disruptionType: disruption.type },
  });
  return {
    checkedAt: now,
    provider: liveStatus.provider,
    status: liveStatus.segments,
    disruption,
    nextStep: "Contact the airline or booking provider. SafarSet has recorded the live disruption but does not fabricate replacement offers.",
  };
}
