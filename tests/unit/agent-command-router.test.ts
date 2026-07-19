import { describe, expect, it } from "vitest";
import { routeDeterministicCommand } from "@/features/agent/command-router";

const trips = [{ id: "trip-1", title: "Bali family trip", origin: "DEL", destination: "DPS", startsAt: "2026-10-10T00:00:00.000Z", status: "UPCOMING" }];
const policy = { requireFamilyTogether: true, forbidSelfTransfer: true, maxStops: 1, minimumConnectionMinutes: 90, avoidOvernight: true, autoSpendLimitMinor: 2500000 };

describe("agent deterministic command router", () => {
  it("lists only supplied trips", () => { const result = routeDeterministicCommand("show my trips", trips, policy); expect(result.handled).toBe(true); expect(result.reply).toContain("Bali family trip"); });
  it("explains saved hard rules", () => { const result = routeDeterministicCommand("what are my constraints", trips, policy); expect(result.reply).toContain("block self-transfers"); expect(result.reply).toContain("90 minutes"); });
  it("routes planning to the model layer", () => { expect(routeDeterministicCommand("plan a Bali trip", trips, policy).handled).toBe(false); });
  it("does not pretend to find replacement offers", () => { const result = routeDeterministicCommand("is my Bali flight delayed", trips, policy); expect(result.reply).toContain("does not supply replacement fares"); });
});
