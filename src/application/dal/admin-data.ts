import "server-only";

import { requireAdmin } from "./auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getAdminOverview() {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const [profiles, trips, runs, connections] = await Promise.all([
    supabase.from("profiles").select("user_id,email,full_name,created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(20),
    supabase.from("trips").select("id", { count: "exact", head: true }),
    supabase.from("recovery_runs").select("id", { count: "exact", head: true }),
    supabase.schema("private").from("provider_connections").select("id", { count: "exact", head: true }),
  ]);
  if (profiles.error || trips.error || runs.error || connections.error) throw new Error("Admin metrics could not be loaded.");
  return {
    customerCount: profiles.count ?? 0,
    tripCount: trips.count ?? 0,
    runCount: runs.count ?? 0,
    connectionCount: connections.count ?? 0,
    customers: (profiles.data ?? []).map((profile) => ({
      id: String(profile.user_id),
      email: String(profile.email),
      fullName: String(profile.full_name ?? ""),
      createdAt: String(profile.created_at),
    })),
  };
}
