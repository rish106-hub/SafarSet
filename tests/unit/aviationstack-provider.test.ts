import { describe, expect, it, vi } from "vitest";

import { SegmentStatus, SourceMode } from "@/domain";
import { createHeroTrip, HERO_NOW } from "@/data";
import { AviationstackFlightStatusProvider } from "@/providers/aviationstack";

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("AviationstackFlightStatusProvider", () => {
  it("maps matching live flight data and never exposes the key", async () => {
    const request = vi.fn(async (rawUrl: string | URL | Request) => {
      const url = new URL(String(rawUrl));
      expect(url.origin + url.pathname).toBe("https://api.aviationstack.com/v1/flights");
      expect(url.searchParams.get("access_key")).toBe("key");
      expect(url.searchParams.has("flight_date")).toBe(false);
      const first = url.searchParams.get("flight_iata") === "SS101";
      return json({ data: [{
        flight_date: "2026-08-14",
        flight_status: "scheduled",
        departure: { iata: first ? "CDG" : "DXB", scheduled: first ? "2026-08-14T08:00:00+00:00" : "2026-08-14T18:00:00+00:00", estimated: first ? "2026-08-14T10:30:00+00:00" : "2026-08-14T18:30:00+00:00", delay: 30 },
        arrival: { iata: first ? "DXB" : "DEL", scheduled: first ? "2026-08-14T16:00:00+00:00" : "2026-08-14T22:00:00+00:00", estimated: first ? "2026-08-14T19:00:00+00:00" : "2026-08-14T23:00:00+00:00", delay: 60 },
        flight: { iata: url.searchParams.get("flight_iata") },
      }] });
    });
    const provider = new AviationstackFlightStatusProvider({ apiKey: "key", request });

    const result = await provider.getFlightStatus({ trip: createHeroTrip(), observedAt: HERO_NOW });

    expect(result.provider.mode).toBe(SourceMode.Live);
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0]?.estimatedArrival).toBe("2026-08-14T19:00:00.000Z");
    expect(result.segments[0]?.status).toBe(SegmentStatus.Delayed);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("maps provider cancellation", async () => {
    const trip = createHeroTrip();
    const segment = trip.segments[0]!;
    const request = vi.fn(async () => json({ data: [{
      flight_date: segment.scheduledDeparture.slice(0, 10),
      flight_status: "cancelled",
      departure: { iata: segment.departureAirport, scheduled: segment.scheduledDeparture },
      arrival: { iata: segment.arrivalAirport, scheduled: segment.scheduledArrival },
      flight: { iata: segment.flightNumber },
    }] }));
    const provider = new AviationstackFlightStatusProvider({ apiKey: "key", request });

    const result = await provider.getFlightStatus({ trip: { ...trip, segments: [segment] }, observedAt: HERO_NOW });

    expect(result.segments[0]?.status).toBe(SegmentStatus.Cancelled);
  });

  it("fails closed when returned data does not match saved itinerary", async () => {
    const provider = new AviationstackFlightStatusProvider({
      apiKey: "key",
      request: vi.fn(async () => json({ data: [] })),
    });

    await expect(provider.getFlightStatus({ trip: createHeroTrip(), observedAt: HERO_NOW }))
      .rejects.toThrow("no matching live status");
  });
});
