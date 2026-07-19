import "server-only";

import { airportByCode } from "@/data/airports";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { decryptToken, encryptToken } from "@/lib/security/token-encryption";

type JsonRecord = Record<string, unknown>;

export type GoogleTripCandidate = Readonly<{
  externalReference: string;
  title: string;
  origin: string;
  destination: string;
  startsAt: string;
  endsAt: string;
  flightNumber: string | null;
}>;

function record(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parseGoogleTripCandidate(event: JsonRecord): GoogleTripCandidate | null {
  const id = text(event.id);
  const title = text(event.summary);
  const start = record(event.start);
  const end = record(event.end);
  const startsAt = text(start?.dateTime);
  const endsAt = text(end?.dateTime);
  if (!id || !title || !startsAt || !endsAt) return null;
  const fromGmail = text(event.eventType) === "fromGmail";
  const haystack = [title, text(event.location), text(event.description)].filter(Boolean).join(" ").toUpperCase();
  const explicitRouteMatch = /\b([A-Z]{3})\s*(?:→|->| TO |–|-)\s*([A-Z]{3})\b/.exec(haystack);
  const explicitRoute = explicitRouteMatch && airportByCode(explicitRouteMatch[1]) && airportByCode(explicitRouteMatch[2])
    ? explicitRouteMatch
    : null;
  const airportCodes = [...haystack.matchAll(/\b[A-Z]{3}\b/g)]
    .map((match) => match[0])
    .filter((code, index, values) => values.indexOf(code) === index && airportByCode(code));
  const route = explicitRoute ?? (fromGmail && airportCodes.length >= 2 ? ["", airportCodes[0], airportCodes[1]] : null);
  if (!route || route[1] === route[2]) return null;
  const flight = /\b([A-Z0-9]{2})\s?([0-9]{1,4})\b/.exec(haystack);
  return {
    externalReference: id,
    title,
    origin: route[1],
    destination: route[2],
    startsAt: new Date(startsAt).toISOString(),
    endsAt: new Date(endsAt).toISOString(),
    flightNumber: flight ? `${flight[1]}${flight[2]}` : null,
  };
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Google OAuth is not configured.");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
    signal: AbortSignal.timeout(8_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Google authorization must be renewed.");
  const payload = record(await response.json());
  const accessToken = text(payload?.access_token);
  const expiresIn = Number(payload?.expires_in);
  if (!accessToken || !Number.isFinite(expiresIn)) throw new Error("Google token response is invalid.");
  return { accessToken, expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString() };
}

async function connectionForUser(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.schema("private").from("provider_connections")
    .select("id,encrypted_access_token,encrypted_refresh_token,token_expires_at,status")
    .eq("user_id", userId).eq("provider", "GOOGLE_CALENDAR").maybeSingle();
  if (error || !data || data.status !== "CONNECTED") throw new Error("Google Calendar is not connected.");
  let accessToken = data.encrypted_access_token ? decryptToken(String(data.encrypted_access_token)) : "";
  const expiresAt = data.token_expires_at ? Date.parse(String(data.token_expires_at)) : 0;
  if (!accessToken || expiresAt < Date.now() + 60_000) {
    if (!data.encrypted_refresh_token) throw new Error("Google authorization must be renewed.");
    const refreshed = await refreshAccessToken(decryptToken(String(data.encrypted_refresh_token)));
    accessToken = refreshed.accessToken;
    await supabase.schema("private").from("provider_connections").update({
      encrypted_access_token: encryptToken(accessToken),
      token_expires_at: refreshed.expiresAt,
      status: "CONNECTED",
    }).eq("id", data.id);
  }
  return accessToken;
}

export async function listGoogleTripCandidates(userId: string): Promise<readonly GoogleTripCandidate[]> {
  const accessToken = await connectionForUser(userId);
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 366 * 24 * 60 * 60_000).toISOString();
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "100",
  });
  const read = async (eventTypes?: string) => {
    const requestParams = new URLSearchParams(params);
    if (eventTypes) requestParams.append("eventTypes", eventTypes);
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${requestParams}`, { headers: { authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(8_000), cache: "no-store" });
    if (!response.ok) throw new Error("Google Calendar could not be read.");
    const payload = record(await response.json());
    return Array.isArray(payload?.items) ? payload.items : [];
  };
  const [gmailEvents, allEvents] = await Promise.all([read("fromGmail"), read()]);
  const seen = new Set<string>();
  return [...gmailEvents, ...allEvents].map(record).filter((item): item is JsonRecord => item !== null).filter((item) => { const id = text(item.id); if (!id || seen.has(id)) return false; seen.add(id); return true; }).map(parseGoogleTripCandidate).filter((item): item is GoogleTripCandidate => item !== null);
}

export async function getGoogleConnectionStatus(userId: string): Promise<"CONNECTED" | "REAUTH_REQUIRED" | "DISCONNECTED"> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.schema("private").from("provider_connections").select("status").eq("user_id", userId).eq("provider", "GOOGLE_CALENDAR").maybeSingle();
  return data?.status === "CONNECTED" || data?.status === "REAUTH_REQUIRED" ? data.status : "DISCONNECTED";
}
