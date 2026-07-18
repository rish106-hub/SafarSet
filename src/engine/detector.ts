import {
  DisruptionType,
  SegmentStatus,
  type DetectDisruptionInput,
  type DisruptionEvent,
  type FlightSegment,
} from "@/domain";

import { minutesBetween } from "./time";

function eventFromSegment(
  input: DetectDisruptionInput,
  type: DisruptionType,
  segments: readonly FlightSegment[],
  reason: string,
): DisruptionEvent {
  const provider = segments[0].provider;

  return {
    id: input.eventId,
    tripId: input.trip.id,
    type,
    affectedSegmentIds: segments.map((segment) => segment.id),
    detectedAt: input.observedAt,
    reason,
    provider: {
      ...provider,
      observedAt: input.observedAt,
    },
  };
}

export function detectDisruption(
  input: DetectDisruptionInput,
): DisruptionEvent | null {
  const cancelled = input.trip.segments.find(
    (segment) => segment.status === SegmentStatus.Cancelled,
  );

  if (cancelled) {
    return eventFromSegment(
      input,
      DisruptionType.Cancellation,
      [cancelled],
      `${cancelled.flightNumber} is cancelled.`,
    );
  }

  for (let index = 0; index < input.trip.segments.length - 1; index += 1) {
    const inbound = input.trip.segments[index];
    const outbound = input.trip.segments[index + 1];
    const connectionMinutes = minutesBetween(
      inbound.estimatedArrival,
      outbound.estimatedDeparture,
    );

    if (connectionMinutes < input.policy.minimumConnectionMinutes) {
      return eventFromSegment(
        input,
        DisruptionType.MissedConnection,
        [inbound, outbound],
        `${connectionMinutes} minute connection is below required ${input.policy.minimumConnectionMinutes} minutes.`,
      );
    }
  }

  return null;
}
