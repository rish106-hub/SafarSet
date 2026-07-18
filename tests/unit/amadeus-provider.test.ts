import { describe, expect, it, vi } from "vitest";

import { CabinClass, SourceMode } from "@/domain";
import { HERO_NOW, createHeroInput, createHeroTrip, heroFamily, heroPolicy } from "@/data";
import { detectDisruption } from "@/engine";
import { AmadeusTravelProvider } from "@/providers/amadeus";

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function disruption() {
  const input = createHeroInput();
  const event = detectDisruption({
    trip: input.trip,
    policy: input.policy,
    eventId: input.eventId,
    observedAt: input.now,
  });
  if (!event) throw new Error("Hero disruption missing.");
  return event;
}

describe("AmadeusTravelProvider", () => {
  it("authenticates once and maps live schedule status", async () => {
    const request = vi.fn(async (rawUrl: string | URL | Request, init?: RequestInit) => {
      const url = String(rawUrl);
      if (url.endsWith("/v1/security/oauth2/token")) {
        expect(String(init?.body)).toContain("grant_type=client_credentials");
        expect(String(init?.body)).toContain("client_id=key");
        expect(String(init?.body)).toContain("client_secret=secret");
        return json({ access_token: "token", expires_in: 1800 });
      }
      expect(init?.headers).toEqual({ authorization: "Bearer token" });
      const first = url.includes("flightNumber=101");
      return json({
        data: [{
          flightPoints: [
            { departure: { timings: [{ qualifier: "ETD", value: first ? "2026-08-14T10:30:00Z" : "2026-08-14T18:00:00Z" }] } },
            { arrival: { timings: [{ qualifier: "ETA", value: first ? "2026-08-14T19:00:00Z" : "2026-08-14T22:00:00Z" }] } },
          ],
        }],
      });
    });
    const provider = new AmadeusTravelProvider({ apiKey: "key", apiSecret: "secret", request });

    const result = await provider.getFlightStatus({ trip: createHeroTrip(), observedAt: HERO_NOW });

    expect(result.provider.mode).toBe(SourceMode.Live);
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0]?.estimatedArrival).toBe("2026-08-14T19:00:00.000Z");
    expect(request).toHaveBeenCalledTimes(3);
  });

  it("maps a live offer and treats total price as conservative spend", async () => {
    const request = vi.fn(async (rawUrl: string | URL | Request) => {
      const url = String(rawUrl);
      if (url.endsWith("/v1/security/oauth2/token")) {
        return json({ access_token: "token", expires_in: 1800 });
      }
      expect(url).toContain("/v2/shopping/flight-offers?");
      expect(url).toContain("currencyCode=INR");
      return json({
        data: [{
          id: "42",
          source: "GDS",
          numberOfBookableSeats: 4,
          price: { total: "65000.25" },
          itineraries: [{ segments: [
            { id: "1", carrierCode: "QR", number: "40", departure: { iataCode: "CDG", at: "2026-08-14T21:00:00Z" }, arrival: { iataCode: "DOH", at: "2026-08-15T03:00:00Z" } },
            { id: "2", carrierCode: "QR", number: "578", departure: { iataCode: "DOH", at: "2026-08-15T05:00:00Z" }, arrival: { iataCode: "DEL", at: "2026-08-15T09:00:00Z" } },
          ] }],
          travelerPricings: [{ fareDetailsBySegment: [
            { segmentId: "1", cabin: "PREMIUM_ECONOMY" },
            { segmentId: "2", cabin: "PREMIUM_ECONOMY" },
          ] }],
        }],
      });
    });
    const provider = new AmadeusTravelProvider({ apiKey: "key", apiSecret: "secret", request });

    const candidates = await provider.searchAlternatives({
      trip: createHeroTrip(),
      disruption: disruption(),
      family: heroFamily,
      policy: heroPolicy,
      observedAt: HERO_NOW,
    });

    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.incrementalCost.amountMinor).toBe(6_500_025);
    expect(candidates[0]?.segments[0]?.cabin).toBe(CabinClass.PremiumEconomy);
    expect(candidates[0]?.provider.mode).toBe(SourceMode.Live);
    expect(candidates[0]?.selfTransfer).toBe(false);
  });

  it("never performs live ticket execution", async () => {
    const provider = new AmadeusTravelProvider({
      apiKey: "key",
      apiSecret: "secret",
      request: vi.fn(),
      now: () => Date.parse(HERO_NOW),
    });
    const result = await provider.executeRebooking({
      tripId: "trip-paris-delhi-001",
      candidate: createHeroInput().candidates[0]!,
      idempotencyKey: "fixed-key",
    });
    expect(result.accepted).toBe(false);
    expect(result.provider.mode).toBe(SourceMode.Unavailable);
  });
});
