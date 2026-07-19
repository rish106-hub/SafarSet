"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createHash } from "node:crypto";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthState = Readonly<{ error?: string; mode?: "login" | "signup" }> | null;

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
  next: z.string().optional(),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2).max(120),
  inviteCode: z.string().trim().min(8).max(80),
  interestTravelWallet: z.boolean(),
  interestLoyaltyCompass: z.boolean(),
});

function safeNext(value: string | undefined): string | null {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured.", mode: "login" };
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) return { error: "Enter a valid email and a password of at least 8 characters.", mode: "login" };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) return { error: "Email or password is incorrect.", mode: "login" };
  if (data.user.app_metadata.role !== "admin") {
    const { data: profile } = await supabase.from("profiles").select("beta_access_granted_at,onboarding_complete").eq("user_id", data.user.id).maybeSingle();
    if (!profile?.beta_access_granted_at) { await supabase.auth.signOut(); return { error: "This account does not have beta access yet.", mode: "login" }; }
  }
  const destination = data.user.app_metadata.role === "admin"
    ? "/admin"
    : safeNext(parsed.data.next) ?? "/dashboard";
  redirect(destination);
}

export async function signupAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured.", mode: "signup" };
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    inviteCode: formData.get("inviteCode"),
    interestTravelWallet: formData.get("interestTravelWallet") === "on",
    interestLoyaltyCompass: formData.get("interestLoyaltyCompass") === "on",
    next: undefined,
  });
  if (!parsed.success) return { error: "Use your name, a valid email, and a stronger password.", mode: "signup" };
  const admin = createSupabaseAdminClient();
  const inviteHash = createHash("sha256").update(parsed.data.inviteCode).digest("hex");
  const { data: invite, error: inviteError } = await admin
    .schema("private")
    .from("beta_invites")
    .select("id,allowed_email,expires_at,redeemed_at")
    .eq("code_hash", inviteHash)
    .maybeSingle();
  if (inviteError || !invite || invite.redeemed_at || Date.parse(String(invite.expires_at)) <= Date.now() || String(invite.allowed_email) !== parsed.data.email) {
    return { error: "This invite is invalid, expired, or belongs to another email.", mode: "signup" };
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });
  if (error) return { error: "Account creation failed. The email may already be registered.", mode: "signup" };
  if (!data.user) return { error: "Account creation failed.", mode: "signup" };
  const now = new Date().toISOString();
  const [{ error: profileError }, { error: redeemError }] = await Promise.all([
    admin.from("profiles").update({ beta_access_granted_at: now, interest_travel_wallet: parsed.data.interestTravelWallet, interest_loyalty_compass: parsed.data.interestLoyaltyCompass }).eq("user_id", data.user.id),
    admin.schema("private").from("beta_invites").update({ redeemed_at: now, redeemed_by: data.user.id }).eq("id", invite.id).is("redeemed_at", null),
  ]);
  if (profileError || redeemError) return { error: "Account created, but beta access could not be granted. Contact the operator.", mode: "login" };
  if (!data.session) return { error: "Check your email to confirm the account, then sign in.", mode: "login" };
  redirect("/onboarding");
}

export async function googleLoginAction() {
  if (!isSupabaseConfigured()) redirect("/login?error=configuration");
  const supabase = await createSupabaseServerClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback`, scopes: "openid email profile" },
  });
  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}
