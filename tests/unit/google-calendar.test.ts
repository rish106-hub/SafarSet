import { describe, expect, it } from "vitest";

import { parseGoogleTripCandidate } from "@/providers/google-calendar";

describe("Google Calendar trip detection", () => {
  it("detects an explicit route and flight number", () => {
    const result = parseGoogleTripCandidate({
      id: "event-1",
      summary: "AI202 DEL → SIN",
      start: { dateTime: "2026-10-10T10:00:00+05:30" },
      end: { dateTime: "2026-10-10T16:00:00+08:00" },
    });
    expect(result).toMatchObject({ origin: "DEL", destination: "SIN", flightNumber: "AI202" });
  });

  it("ignores vague calendar events", () => {
    expect(parseGoogleTripCandidate({ id: "event-2", summary: "Holiday", start: { dateTime: "2026-10-10T10:00:00Z" }, end: { dateTime: "2026-10-10T12:00:00Z" } })).toBeNull();
  });

  it("does not mistake ordinary three-letter words for airports", () => {
    expect(parseGoogleTripCandidate({
      id: "event-words",
      summary: "Get the bag for our trip",
      start: { dateTime: "2026-10-10T10:00:00Z" },
      end: { dateTime: "2026-10-10T12:00:00Z" },
    })).toBeNull();
  });

  it("detects airport codes in a Gmail-generated travel event", () => {
    const result = parseGoogleTripCandidate({
      id: "event-3",
      eventType: "fromGmail",
      summary: "Flight to Denpasar AI 2145",
      location: "DEL DPS",
      start: { dateTime: "2026-07-20T09:10:00+05:30" },
      end: { dateTime: "2026-07-20T18:40:00+08:00" },
    });
    expect(result).toMatchObject({ origin: "DEL", destination: "DPS", flightNumber: "AI2145" });
  });
});
