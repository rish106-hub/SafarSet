import { getAmadeusTravelProvider } from "@/providers/amadeus";
import type {
  AlternativeSearchInput,
  FlightStatusInput,
} from "@/providers/contracts";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 100_000;

type ProviderRequest =
  | Readonly<{ operation: "status"; input: FlightStatusInput }>
  | Readonly<{ operation: "search"; input: AlternativeSearchInput }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseProviderRequest(value: unknown): ProviderRequest | null {
  if (!isRecord(value) || !isRecord(value.input)) return null;
  const input = value.input;
  if (!isRecord(input.trip) || input.trip.id !== "trip-paris-delhi-001") return null;
  if (typeof input.observedAt !== "string" || !Number.isFinite(Date.parse(input.observedAt))) return null;
  if (value.operation === "status") return value as ProviderRequest;
  if (
    value.operation === "search" &&
    isRecord(input.disruption) &&
    isRecord(input.family) &&
    isRecord(input.policy)
  ) return value as ProviderRequest;
  return null;
}

export async function POST(request: Request): Promise<Response> {
  if (process.env.PROVIDER_MODE !== "live") {
    return Response.json({ error: "Live provider mode is disabled." }, { status: 503 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Request is too large." }, { status: 413 });
  }

  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
      return Response.json({ error: "Request is too large." }, { status: 413 });
    }
    const parsed = parseProviderRequest(JSON.parse(body) as unknown);
    if (!parsed) return Response.json({ error: "Invalid request." }, { status: 400 });

    const provider = getAmadeusTravelProvider();
    const result = parsed.operation === "status"
      ? await provider.getFlightStatus(parsed.input)
      : await provider.searchAlternatives(parsed.input);
    return Response.json(result, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Live travel data is unavailable." }, { status: 503 });
  }
}
