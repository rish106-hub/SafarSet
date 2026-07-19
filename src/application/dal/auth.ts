import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentUser = Readonly<{
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
}>;

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const fullName = typeof data.user.user_metadata.full_name === "string"
    ? data.user.user_metadata.full_name
    : "";
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    fullName,
    isAdmin: data.user.app_metadata.role === "admin",
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.isAdmin) redirect("/dashboard");
  return user;
}
