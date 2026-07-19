import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !publishableKey || !serviceRoleKey) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SERVICE_ROLE_KEY.",
  );
}

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};
const admin = createClient(url, serviceRoleKey, clientOptions);
const suffix = randomUUID().slice(0, 8);
const password = `Beta-${randomUUID()}!9a`;
const emails = [`rls-a-${suffix}@example.test`, `rls-b-${suffix}@example.test`];
const createdUserIds = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function createVerifiedUser(email) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  createdUserIds.push(data.user.id);

  const client = createClient(url, publishableKey, clientOptions);
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  return { client, userId: data.user.id };
}

try {
  const owner = await createVerifiedUser(emails[0]);
  const stranger = await createVerifiedUser(emails[1]);

  const { data: policy, error: policyError } = await owner.client
    .from("policies")
    .insert({ user_id: owner.userId, name: "RLS verification policy", is_default: true })
    .select("id")
    .single();
  if (policyError) throw policyError;

  const { data: trip, error: tripError } = await owner.client
    .from("trips")
    .insert({
      user_id: owner.userId,
      policy_id: policy.id,
      title: "RLS verification trip",
      origin: "DEL",
      destination: "SIN",
      starts_at: "2030-01-01T04:00:00.000Z",
      ends_at: "2030-01-01T10:00:00.000Z",
      adults: 1,
      children: 0,
    })
    .select("id")
    .single();
  if (tripError) throw tripError;

  const { data: leakedTrips, error: selectError } = await stranger.client
    .from("trips")
    .select("id")
    .eq("id", trip.id);
  if (selectError) throw selectError;
  assert(leakedTrips.length === 0, "RLS leaked another customer's trip.");

  const { error: segmentError } = await stranger.client.from("trip_segments").insert({
    trip_id: trip.id,
    user_id: stranger.userId,
    position: 0,
    flight_number: "AI302",
    departure_airport: "DEL",
    arrival_airport: "SIN",
    scheduled_departure: "2030-01-01T04:00:00.000Z",
    scheduled_arrival: "2030-01-01T10:00:00.000Z",
  });
  assert(Boolean(segmentError), "RLS allowed a segment on another customer's trip.");

  const { error: foreignPolicyError } = await stranger.client.from("trips").insert({
    user_id: stranger.userId,
    policy_id: policy.id,
    title: "Foreign policy attempt",
    origin: "BOM",
    destination: "DXB",
    starts_at: "2030-02-01T04:00:00.000Z",
    ends_at: "2030-02-01T08:00:00.000Z",
  });
  assert(Boolean(foreignPolicyError), "RLS allowed another customer's policy on a trip.");

  process.stdout.write("Database RLS verification passed for two isolated customers.\n");
} finally {
  for (const userId of createdUserIds) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) process.stderr.write(`Could not remove temporary user ${userId}: ${error.message}\n`);
  }
}
