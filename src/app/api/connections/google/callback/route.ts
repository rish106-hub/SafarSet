import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/application/dal/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { encryptToken } from "@/lib/security/token-encryption";

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", url));
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("safarset_google_oauth_state")?.value;
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/connections?error=google_state", url));
  }
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return NextResponse.redirect(new URL("/connections?error=google_configuration", url));
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!tokenResponse.ok) throw new Error("Token exchange failed.");
    const token = record(await tokenResponse.json());
    const accessToken = typeof token?.access_token === "string" ? token.access_token : null;
    const refreshToken = typeof token?.refresh_token === "string" ? token.refresh_token : null;
    const expiresIn = Number(token?.expires_in);
    if (!accessToken || !refreshToken || !Number.isFinite(expiresIn)) throw new Error("Google did not return reusable access.");
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.schema("private").from("provider_connections").upsert({
      user_id: user.id,
      provider: "GOOGLE_CALENDAR",
      encrypted_access_token: encryptToken(accessToken),
      encrypted_refresh_token: encryptToken(refreshToken),
      token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      status: "CONNECTED",
      metadata: { scope: "calendar.events.readonly" },
    }, { onConflict: "user_id,provider" });
    if (error) throw error;
    const response = NextResponse.redirect(new URL("/trips/new?method=calendar&scan=1", url));
    response.cookies.delete("safarset_google_oauth_state");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/connections?error=google_callback", url));
  }
}
