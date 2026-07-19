import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?error=callback", url));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL("/login?error=callback", url));
  if (data.user.app_metadata.role === "admin") return NextResponse.redirect(new URL("/admin", url));
  const { data: profile } = await supabase.from("profiles").select("beta_access_granted_at,onboarding_complete").eq("user_id", data.user.id).maybeSingle();
  if (!profile?.beta_access_granted_at) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?error=invite_required", url));
  }
  return NextResponse.redirect(new URL(profile.onboarding_complete ? "/dashboard" : "/onboarding", url));
}
