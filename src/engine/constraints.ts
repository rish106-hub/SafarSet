import {
  CabinClass,
  ConstraintRule,
  type CandidateEvaluation,
  type ConstraintCheck,
  type EvaluateConstraintsInput,
} from "@/domain";

import { minutesBetween, timestampMs } from "./time";

const CABIN_ORDER: Record<CabinClass, number> = {
  [CabinClass.Economy]: 0,
  [CabinClass.PremiumEconomy]: 1,
  [CabinClass.Business]: 2,
  [CabinClass.First]: 3,
};

function check(
  candidateId: string,
  rule: ConstraintRule,
  passed: boolean,
  success: string,
  failure: string,
): ConstraintCheck {
  return {
    candidateId,
    rule,
    passed,
    reason: passed ? success : failure,
  };
}

export function evaluateConstraints(
  input: EvaluateConstraintsInput,
): ConstraintCheck[] {
  const { candidate, family, policy } = input;
  const stops = Math.max(0, candidate.segments.length - 1);
  const transitAirports = candidate.segments
    .slice(0, -1)
    .map((segment) => segment.arrivalAirport);
  const unapprovedAirports = transitAirports.filter(
    (airport) => !policy.approvedTransitAirports.includes(airport),
  );
  const downgradedSegments = candidate.segments.filter(
    (segment) =>
      CABIN_ORDER[segment.cabin] < CABIN_ORDER[policy.minimumCabin],
  );
  const shortConnections: string[] = [];

  for (let index = 0; index < candidate.segments.length - 1; index += 1) {
    const inbound = candidate.segments[index];
    const outbound = candidate.segments[index + 1];
    const connectionMinutes = minutesBetween(
      inbound.estimatedArrival,
      outbound.estimatedDeparture,
    );

    if (connectionMinutes < policy.minimumConnectionMinutes) {
      shortConnections.push(
        `${inbound.arrivalAirport} ${connectionMinutes}m`,
      );
    }
  }

  const finalSegment = candidate.segments.at(-1);
  const arrivalPasses = Boolean(
    finalSegment &&
      timestampMs(finalSegment.estimatedArrival) <=
        timestampMs(policy.arrivalDeadline),
  );

  const checks: ConstraintCheck[] = [
    check(
      candidate.id,
      ConstraintRule.FamilyTogether,
      candidate.seatsAvailable >= family.travelerCount,
      `All ${family.travelerCount} travellers have seats.`,
      `Only ${candidate.seatsAvailable} seats for ${family.travelerCount} travellers.`,
    ),
    check(
      candidate.id,
      ConstraintRule.NoSelfTransfer,
      !candidate.selfTransfer,
      "No self-transfer required.",
      "Route requires a self-transfer.",
    ),
    check(
      candidate.id,
      ConstraintRule.StopLimit,
      stops <= policy.maxStops,
      `${stops} stops is within limit ${policy.maxStops}.`,
      `${stops} stops exceeds limit ${policy.maxStops}.`,
    ),
    check(
      candidate.id,
      ConstraintRule.MinimumCabin,
      downgradedSegments.length === 0,
      `Every segment meets ${policy.minimumCabin} minimum.`,
      `Cabin downgrade on ${downgradedSegments.map((segment) => segment.flightNumber).join(", ")}.`,
    ),
    check(
      candidate.id,
      ConstraintRule.ApprovedTransit,
      unapprovedAirports.length === 0,
      "Every transit airport is approved.",
      `Unapproved transit airport: ${unapprovedAirports.join(", ")}.`,
    ),
    check(
      candidate.id,
      ConstraintRule.ConnectionBuffer,
      shortConnections.length === 0,
      `Every connection meets ${policy.minimumConnectionMinutes} minute buffer.`,
      `Connection below buffer: ${shortConnections.join(", ")}.`,
    ),
    check(
      candidate.id,
      ConstraintRule.ArrivalDeadline,
      arrivalPasses,
      "Arrival is before hard deadline.",
      "Arrival misses hard deadline.",
    ),
  ];

  return checks;
}

export function evaluateCandidate(
  input: EvaluateConstraintsInput,
): CandidateEvaluation {
  const checks = evaluateConstraints(input);
  return {
    candidate: input.candidate,
    checks,
    passed: checks.every((item) => item.passed),
  };
}
