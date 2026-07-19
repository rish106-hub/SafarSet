"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/application/dal/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function disconnectGoogleAction() {
  const user = await requireUser();
  const supabase = createSupabaseAdminClient();
  await supabase.schema("private").from("provider_connections").delete().eq("user_id", user.id).eq("provider", "GOOGLE_CALENDAR");
  revalidatePath("/connections");
}
