"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/application/dal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PolicyFormState = Readonly<{ error?: string; success?: string }> | null;

const schema = z.object({
  id: z.uuid().or(z.literal("")),
  name: z.string().trim().min(2).max(100),
  minimumCabin: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]),
  maxStops: z.coerce.number().int().min(0).max(3),
  minimumConnectionMinutes: z.coerce.number().int().min(30).max(480),
  maximumArrivalDelayMinutes: z.coerce.number().int().min(60).max(4320),
  autoSpendLimit: z.coerce.number().min(0).max(10_000_000),
  approvalAbove: z.coerce.number().min(0).max(10_000_000),
  transit: z.string().max(160),
});

export async function savePolicyAction(_state: PolicyFormState, formData: FormData): Promise<PolicyFormState> {
  const user = await requireUser();
  const parsed = schema.safeParse({
    id: formData.get("id") ?? "",
    name: formData.get("name"),
    minimumCabin: formData.get("minimumCabin"),
    maxStops: formData.get("maxStops"),
    minimumConnectionMinutes: formData.get("minimumConnectionMinutes"),
    maximumArrivalDelayMinutes: formData.get("maximumArrivalDelayMinutes"),
    autoSpendLimit: formData.get("autoSpendLimit"),
    approvalAbove: formData.get("approvalAbove"),
    transit: formData.get("transit") ?? "",
  });
  if (!parsed.success) return { error: "Check the policy limits and try again." };
  const value = parsed.data;
  if (value.approvalAbove < value.autoSpendLimit) {
    return { error: "Approval threshold cannot be below the automatic spend limit." };
  }
  const airports = [...new Set(value.transit.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean))];
  if (airports.some((airport) => !/^[A-Z]{3}$/.test(airport))) {
    return { error: "Transit airports must be three-letter IATA codes separated by commas." };
  }
  const supabase = await createSupabaseServerClient();
  const setDefault = formData.get("isDefault") === "on";
  if (setDefault) {
    const { error } = await supabase.from("policies").update({ is_default: false }).eq("user_id", user.id);
    if (error) return { error: "The default policy could not be changed." };
  }
  const row = {
    user_id: user.id,
    name: value.name,
    require_family_together: formData.get("requireFamilyTogether") === "on",
    forbid_self_transfer: formData.get("forbidSelfTransfer") === "on",
    minimum_cabin: value.minimumCabin,
    max_stops: value.maxStops,
    approved_transit_airports: airports,
    minimum_connection_minutes: value.minimumConnectionMinutes,
    maximum_arrival_delay_minutes: value.maximumArrivalDelayMinutes,
    auto_spend_limit_minor: Math.round(value.autoSpendLimit * 100),
    approval_above_minor: Math.round(value.approvalAbove * 100),
    avoid_overnight: formData.get("avoidOvernight") === "on",
    notify_email: formData.get("notifyEmail") === "on",
    is_default: setDefault,
  };
  const query = value.id
    ? supabase.from("policies").update(row).eq("id", value.id)
    : supabase.from("policies").insert(row);
  const { error } = await query;
  if (error) return { error: "Policy could not be saved." };
  revalidatePath("/policy");
  revalidatePath("/trips/new");
  return { success: "Recovery rules saved." };
}
