import { DisruptionType, SegmentStatus } from "@/domain";
import { createHeroTrip, heroPolicy, HERO_NOW } from "@/data";
import { detectDisruption } from "@/engine";
import { describe, expect, it } from "vitest";

describe("detectDisruption", () => {
  it("detects impossible connection", () => {
    const event = detectDisruption({
      trip: createHeroTrip(),
      policy: heroPolicy,
      eventId: "event-1",
      observedAt: HERO_NOW,
    });

    expect(event?.type).toBe(DisruptionType.MissedConnection);
    expect(event?.affectedSegmentIds).toHaveLength(2);
  });

  it("prioritizes cancellation", () => {
    const event = detectDisruption({
      trip: createHeroTrip(true),
      policy: heroPolicy,
      eventId: "event-2",
      observedAt: HERO_NOW,
    });

    expect(event?.type).toBe(DisruptionType.Cancellation);
  });

  it("returns null for healthy connection", () => {
    const trip = createHeroTrip();
    const healthyTrip = {
      ...trip,
      segments: trip.segments.map((segment, index) =>
        index === 0
          ? {
              ...segment,
              estimatedArrival: "2026-08-14T16:00:00.000Z",
              status: SegmentStatus.Scheduled,
            }
          : segment,
      ),
    };

    expect(
      detectDisruption({
        trip: healthyTrip,
        policy: heroPolicy,
        eventId: "event-3",
        observedAt: HERO_NOW,
      }),
    ).toBeNull();
  });
});
