"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthState = Readonly<{ error?: string; mode?: "login" | "signup" }> | null;

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
  next: z.string().optional(),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2).max(120),
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
    next: undefined,
  });
  if (!parsed.success) return { error: "Use your name, a valid email, and a stronger password.", mode: "signup" };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });
  if (error) return { error: "Account creation failed. The email may already be registered.", mode: "signup" };
  if (!data.session) return { error: "Check your email to confirm the account, then sign in.", mode: "login" };
  redirect("/dashboard");
}
