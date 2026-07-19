"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/application/dal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { derivedTripTitle, primaryDestinationCode } from "./derive-trip";

export type TripFormState = Readonly<{ error?: string }> | null;

const iata = z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/);
const segmentSchema = z.object({
  flightNumber: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2}[0-9]{1,4}$/),
  departureAirport: iata,
  arrivalAirport: iata,
  scheduledDeparture: z.iso.datetime({ local: true }),
  scheduledArrival: z.iso.datetime({ local: true }),
  cabin: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]),
});

const tripSchema = z.object({
  source: z.enum(["MANUAL", "GOOGLE_CALENDAR", "ITINERARY_IMPORT"]),
  externalReference: z.string().max(240).optional(),
  segments: z.array(segmentSchema).min(1).max(8),
});

export async function createTripAction(_state: TripFormState, formData: FormData): Promise<TripFormState> {
  const user = await requireUser();
  let segments: unknown;
  try {
    segments = JSON.parse(String(formData.get("segments") ?? "[]"));
  } catch {
    return { error: "Flight segments are invalid." };
  }
  const parsed = tripSchema.safeParse({
    source: formData.get("source") ?? "MANUAL",
    externalReference: formData.get("externalReference") || undefined,
    segments,
  });
  if (!parsed.success) return { error: "Check each flight number, airport, and time." };
  const value = parsed.data;
  const continuous = value.segments.every((segment, index) => {
    const next = value.segments[index + 1];
    return segment.arrivalAirport !== segment.departureAirport &&
      segment.scheduledArrival > segment.scheduledDeparture &&
      (!next || (segment.arrivalAirport === next.departureAirport && next.scheduledDeparture > segment.scheduledArrival));
  });
  if (!continuous) return { error: "Flights must connect in travel order. Check airports and local times." };

  const supabase = await createSupabaseServerClient();
  const [{ data: profile }, { data: defaultPolicy }] = await Promise.all([
    supabase.from("profiles").select("default_adults,default_children").eq("user_id", user.id).single(),
    supabase.from("policies").select("id").eq("is_default", true).maybeSingle(),
  ]);
  let policyId = defaultPolicy?.id ?? null;
  if (!policyId) {
    const { data: createdPolicy } = await supabase.from("policies").insert({ user_id: user.id, name: "Family-safe travel rules", is_default: true }).select("id").single();
    policyId = createdPolicy?.id ?? null;
  }
  const first = value.segments[0];
  const last = value.segments.at(-1);
  if (!first || !last) return { error: "Add at least one flight." };
  const destinationCode = primaryDestinationCode(value.segments);
  const tripTitle = derivedTripTitle(value.segments);
  const { data: trip, error: tripError } = await supabase.from("trips").insert({
    user_id: user.id,
    policy_id: policyId,
    title: tripTitle,
    origin: first.departureAirport,
    destination: destinationCode,
    starts_at: new Date(first.scheduledDeparture).toISOString(),
    ends_at: new Date(last.scheduledArrival).toISOString(),
    adults: Number(profile?.default_adults ?? 1),
    children: Number(profile?.default_children ?? 0),
    source: value.source,
    external_reference: value.externalReference ?? null,
    status: "UPCOMING",
  }).select("id").single();
  if (tripError || !trip) return { error: "Trip could not be saved." };

  const { error: segmentError } = await supabase.from("trip_segments").insert(
    value.segments.map((segment, position) => ({
      trip_id: trip.id,
      user_id: user.id,
      position,
      flight_number: segment.flightNumber,
      departure_airport: segment.departureAirport,
      arrival_airport: segment.arrivalAirport,
      scheduled_departure: new Date(segment.scheduledDeparture).toISOString(),
      scheduled_arrival: new Date(segment.scheduledArrival).toISOString(),
      cabin: segment.cabin,
    })),
  );
  if (segmentError) {
    await supabase.from("trips").delete().eq("id", trip.id);
    return { error: "Flight segments could not be saved." };
  }
  revalidatePath("/dashboard");
  revalidatePath("/trips");
  redirect(`/trips/${trip.id}`);
}

export async function updateTripAction(tripId: string, _state: TripFormState, formData: FormData): Promise<TripFormState> {
  await requireUser();
  let segments: unknown;
  try {
    segments = JSON.parse(String(formData.get("segments") ?? "[]"));
  } catch {
    return { error: "Flight details are invalid." };
  }
  const parsed = tripSchema.pick({ segments: true }).safeParse({ segments });
  if (!parsed.success) return { error: "Check each flight number, airport, and time." };
  const continuous = parsed.data.segments.every((segment, index) => {
    const next = parsed.data.segments[index + 1];
    return segment.arrivalAirport !== segment.departureAirport &&
      segment.scheduledArrival > segment.scheduledDeparture &&
      (!next || (segment.arrivalAirport === next.departureAirport && next.scheduledDeparture > segment.scheduledArrival));
  });
  if (!continuous) return { error: "Flights must connect in travel order. Check airports and local times." };
  const first = parsed.data.segments[0];
  const last = parsed.data.segments.at(-1);
  if (!first || !last) return { error: "Add at least one flight." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("update_trip_itinerary", {
    p_trip_id: tripId,
    p_title: derivedTripTitle(parsed.data.segments),
    p_origin: first.departureAirport,
    p_destination: primaryDestinationCode(parsed.data.segments),
    p_starts_at: new Date(first.scheduledDeparture).toISOString(),
    p_ends_at: new Date(last.scheduledArrival).toISOString(),
    p_segments: parsed.data.segments.map((segment) => ({
      flight_number: segment.flightNumber,
      departure_airport: segment.departureAirport,
      arrival_airport: segment.arrivalAirport,
      scheduled_departure: new Date(segment.scheduledDeparture).toISOString(),
      scheduled_arrival: new Date(segment.scheduledArrival).toISOString(),
      cabin: segment.cabin,
    })),
  });
  if (error) return { error: "Trip changes could not be saved." };
  revalidatePath("/dashboard");
  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

export async function deleteTripAction(tripId: string) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("trips").delete().eq("id", tripId).eq("user_id", user.id);
  if (error) throw new Error("Trip could not be deleted.");
  revalidatePath("/dashboard");
  revalidatePath("/trips");
  redirect("/trips");
}
