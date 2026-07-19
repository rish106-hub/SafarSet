import { describe, expect, it } from "vitest";

import { derivedTripTitle, primaryDestinationCode } from "@/features/trips/derive-trip";

describe("trip derivation", () => {
  it("uses final arrival for one-way trips", () => {
    const segments = [{ departureAirport: "DEL", arrivalAirport: "DPS", scheduledDeparture: "2026-07-20T09:00", scheduledArrival: "2026-07-20T18:00" }];
    expect(primaryDestinationCode(segments)).toBe("DPS");
    expect(derivedTripTitle(segments)).toBe("Bali trip");
  });

  it("uses the longest stay as round-trip destination", () => {
    const segments = [
      { departureAirport: "DEL", arrivalAirport: "DPS", scheduledDeparture: "2026-07-20T09:00", scheduledArrival: "2026-07-20T18:00" },
      { departureAirport: "DPS", arrivalAirport: "DEL", scheduledDeparture: "2026-07-27T18:00", scheduledArrival: "2026-07-28T03:00" },
    ];
    expect(primaryDestinationCode(segments)).toBe("DPS");
  });
});
