"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/application/dal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  requireFamilyTogether: z.boolean(),
  avoidOvernight: z.boolean(),
  maxStops: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  minimumConnectionMinutes: z.union([z.literal(60), z.literal(90), z.literal(120)]),
});

export async function applyStarterPolicyAction(input: unknown): Promise<{ success: boolean; error?: string }> {
  const user = await requireUser();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: "The local policy draft is invalid." };
  const supabase = await createSupabaseServerClient();
  const { data: current, error: readError } = await supabase.from("policies").select("id").eq("user_id", user.id).eq("is_default", true).maybeSingle();
  if (readError) return { success: false, error: "Your current policy could not be read." };
  const values = {
    user_id: user.id,
    name: "Family-safe travel rules",
    require_family_together: parsed.data.requireFamilyTogether,
    forbid_self_transfer: true,
    minimum_cabin: "ECONOMY",
    max_stops: parsed.data.maxStops,
    approved_transit_airports: [],
    minimum_connection_minutes: parsed.data.minimumConnectionMinutes,
    maximum_arrival_delay_minutes: 720,
    auto_spend_limit_minor: 0,
    approval_above_minor: 0,
    avoid_overnight: parsed.data.avoidOvernight,
    notify_email: true,
    is_default: true,
  };
  const { error } = current?.id
    ? await supabase.from("policies").update(values).eq("id", current.id).eq("user_id", user.id)
    : await supabase.from("policies").insert(values);
  if (error) return { success: false, error: "The starter policy could not be applied." };
  revalidatePath("/onboarding"); revalidatePath("/settings"); revalidatePath("/dashboard");
  return { success: true };
}
