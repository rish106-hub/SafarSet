import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/application/dal/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_TOKEN_ENCRYPTION_KEY) {
    return NextResponse.redirect(new URL("/connections?error=google_configuration", request.url));
  }
  const state = randomBytes(32).toString("base64url");
  const authorization = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorization.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events.readonly",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  }).toString();
  const response = NextResponse.redirect(authorization);
  response.cookies.set("safarset_google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/api/connections/google/callback",
  });
  return response;
}
