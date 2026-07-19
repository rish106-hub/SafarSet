"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/application/dal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AccountState = Readonly<{ error?: string; success?: string }> | null;

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  homeAirport: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).or(z.literal("")),
  timezone: z.enum(["Asia/Kolkata", "Europe/London", "Europe/Paris", "Asia/Dubai", "Asia/Singapore", "America/New_York"]),
  defaultAdults: z.coerce.number().int().min(1).max(12),
  defaultChildren: z.coerce.number().int().min(0).max(12),
});

export async function saveAccountAction(_state: AccountState, formData: FormData): Promise<AccountState> {
  const user = await requireUser();
  const parsed = schema.safeParse({
    fullName: formData.get("fullName"),
    homeAirport: formData.get("homeAirport"),
    timezone: formData.get("timezone"),
    defaultAdults: formData.get("defaultAdults"),
    defaultChildren: formData.get("defaultChildren"),
  });
  if (!parsed.success || parsed.data.defaultAdults + parsed.data.defaultChildren > 12) return { error: "Check your name, home airport, timezone, and household size." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("profiles").update({
    full_name: parsed.data.fullName,
    home_airport: parsed.data.homeAirport || null,
    timezone: parsed.data.timezone,
    onboarding_complete: true,
    default_adults: parsed.data.defaultAdults,
    default_children: parsed.data.defaultChildren,
  }).eq("user_id", user.id);
  if (error) return { error: "Profile could not be saved." };
  await supabase.auth.updateUser({ data: { full_name: parsed.data.fullName } });
  revalidatePath("/account");
  revalidatePath("/dashboard", "layout");
  return { success: "Account settings saved." };
}
