import "server-only";

import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { requireUser } from "./auth";

export type PolicyDTO = Readonly<{
  id: string;
  name: string;
  requireFamilyTogether: boolean;
  forbidSelfTransfer: boolean;
  minimumCabin: string;
  maxStops: number;
  approvedTransitAirports: readonly string[];
  minimumConnectionMinutes: number;
  maximumArrivalDelayMinutes: number;
  autoSpendLimitMinor: number;
  approvalAboveMinor: number;
  avoidOvernight: boolean;
  notifyEmail: boolean;
  isDefault: boolean;
}>;

export type TripSummaryDTO = Readonly<{
  id: string;
  title: string;
  origin: string;
  destination: string;
  startsAt: string;
  endsAt: string;
  adults: number;
  children: number;
  source: string;
  status: string;
}>;

export type SegmentDTO = Readonly<{
  id: string;
  position: number;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  cabin: string;
}>;

export type TripDetailDTO = TripSummaryDTO & Readonly<{
  policyId: string | null;
  segments: readonly SegmentDTO[];
}>;

export type TripActivityDTO = Readonly<{
  id: string;
  type: string;
  summary: string;
  createdAt: string;
}>;

function policyDTO(row: Record<string, unknown>): PolicyDTO {
  return {
    id: String(row.id),
    name: String(row.name),
    requireFamilyTogether: Boolean(row.require_family_together),
    forbidSelfTransfer: Boolean(row.forbid_self_transfer),
    minimumCabin: String(row.minimum_cabin),
    maxStops: Number(row.max_stops),
    approvedTransitAirports: Array.isArray(row.approved_transit_airports)
      ? row.approved_transit_airports.map(String)
      : [],
    minimumConnectionMinutes: Number(row.minimum_connection_minutes),
    maximumArrivalDelayMinutes: Number(row.maximum_arrival_delay_minutes),
    autoSpendLimitMinor: Number(row.auto_spend_limit_minor),
    approvalAboveMinor: Number(row.approval_above_minor),
    avoidOvernight: Boolean(row.avoid_overnight),
    notifyEmail: Boolean(row.notify_email),
    isDefault: Boolean(row.is_default),
  };
}

function tripDTO(row: Record<string, unknown>): TripSummaryDTO {
  return {
    id: String(row.id),
    title: String(row.title),
    origin: String(row.origin),
    destination: String(row.destination),
    startsAt: String(row.starts_at),
    endsAt: String(row.ends_at),
    adults: Number(row.adults),
    children: Number(row.children),
    source: String(row.source),
    status: String(row.status),
  };
}

export async function listPolicies(): Promise<readonly PolicyDTO[]> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("policies")
    .select("id,name,require_family_together,forbid_self_transfer,minimum_cabin,max_stops,approved_transit_airports,minimum_connection_minutes,maximum_arrival_delay_minutes,auto_spend_limit_minor,approval_above_minor,avoid_overnight,notify_email,is_default")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw new Error("Policies could not be loaded.");
  return (data ?? []).map((row) => policyDTO(row));
}

export async function listTrips(): Promise<readonly TripSummaryDTO[]> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("trips")
    .select("id,title,origin,destination,starts_at,ends_at,adults,children,source,status")
    .order("starts_at", { ascending: true });
  if (error) throw new Error("Trips could not be loaded.");
  return (data ?? []).map((row) => tripDTO(row));
}

export async function getTrip(tripId: string): Promise<TripDetailDTO> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const [{ data: trip, error: tripError }, { data: segments, error: segmentError }] = await Promise.all([
    supabase.from("trips").select("id,policy_id,title,origin,destination,starts_at,ends_at,adults,children,source,status").eq("id", tripId).maybeSingle(),
    supabase.from("trip_segments").select("id,position,flight_number,departure_airport,arrival_airport,scheduled_departure,scheduled_arrival,cabin").eq("trip_id", tripId).order("position"),
  ]);
  if (tripError || segmentError) throw new Error("Trip could not be loaded.");
  if (!trip) notFound();
  return {
    ...tripDTO(trip),
    policyId: trip.policy_id ? String(trip.policy_id) : null,
    segments: (segments ?? []).map((row) => ({
      id: String(row.id),
      position: Number(row.position),
      flightNumber: String(row.flight_number),
      departureAirport: String(row.departure_airport),
      arrivalAirport: String(row.arrival_airport),
      scheduledDeparture: String(row.scheduled_departure),
      scheduledArrival: String(row.scheduled_arrival),
      cabin: String(row.cabin),
    })),
  };
}

export async function listTripActivity(tripId: string): Promise<readonly TripActivityDTO[]> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("audit_events")
    .select("id,event_type,summary,created_at")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Trip activity could not be loaded.");
  return (data ?? []).map((row) => ({
    id: String(row.id),
    type: String(row.event_type),
    summary: String(row.summary),
    createdAt: String(row.created_at),
  }));
}

export async function getProfile() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name,email,home_airport,timezone,onboarding_complete,default_adults,default_children")
    .eq("user_id", user.id)
    .single();
  if (error) throw new Error("Profile could not be loaded.");
  return {
    fullName: String(data.full_name ?? ""),
    email: String(data.email ?? user.email),
    homeAirport: data.home_airport ? String(data.home_airport) : "",
    timezone: String(data.timezone ?? "Asia/Kolkata"),
    onboardingComplete: Boolean(data.onboarding_complete),
    defaultAdults: Number(data.default_adults ?? 1),
    defaultChildren: Number(data.default_children ?? 0),
  };
}
