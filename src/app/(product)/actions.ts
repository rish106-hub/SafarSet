"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/application/dal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function logoutAction() {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
