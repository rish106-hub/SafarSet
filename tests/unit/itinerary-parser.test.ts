import { describe, expect, it } from "vitest";

import { parseItineraryText } from "@/features/trips/itinerary-parser";

describe("itinerary parser", () => {
  it("extracts a pasted flight route and times", () => {
    const result = parseItineraryText("AI 2145 DEL → DPS 2026-07-20 09:10 2026-07-20 18:40");
    expect(result.segments[0]).toMatchObject({ flightNumber: "AI2145", departureAirport: "DEL", arrivalAirport: "DPS", scheduledDeparture: "2026-07-20T09:10", scheduledArrival: "2026-07-20T18:40" });
    expect(result.warnings).toEqual([]);
  });

  it("extracts an ICS flight event", () => {
    const result = parseItineraryText("BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:AI2145 DEL-DPS\nDTSTART:20260720T091000\nDTEND:20260720T184000\nEND:VEVENT\nEND:VCALENDAR");
    expect(result.segments[0]).toMatchObject({ flightNumber: "AI2145", departureAirport: "DEL", arrivalAirport: "DPS", scheduledDeparture: "2026-07-20T09:10", scheduledArrival: "2026-07-20T18:40" });
  });

  it("returns explicit review warnings instead of inventing missing data", () => {
    const result = parseItineraryText("Holiday booking confirmation");
    expect(result.warnings).toHaveLength(3);
    expect(result.segments[0].flightNumber).toBe("");
  });
});
