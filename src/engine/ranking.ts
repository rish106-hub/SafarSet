import type {
  RankCandidatesInput,
  RankedCandidate,
  RankingFactors,
  RecoveryCandidate,
} from "@/domain";

import { minutesBetween, timestampMs } from "./time";

const WEIGHTS = {
  arrivalDelayMinutes: 0.4,
  incrementalCostMinor: 0.25,
  stops: 0.15,
  overnightPenalty: 0.1,
  departureWaitMinutes: 0.1,
} as const;

type FactorKey = keyof RankingFactors;

function factorsFor(
  candidate: RecoveryCandidate,
  originalArrivalTime: string,
  recoveryStartedAt: string,
): RankingFactors {
  const firstSegment = candidate.segments[0];
  const finalSegment = candidate.segments.at(-1);

  return {
    arrivalDelayMinutes: finalSegment
      ? Math.max(
          0,
          minutesBetween(originalArrivalTime, finalSegment.estimatedArrival),
        )
      : Number.MAX_SAFE_INTEGER,
    incrementalCostMinor: candidate.incrementalCost.amountMinor,
    stops: Math.max(0, candidate.segments.length - 1),
    overnightPenalty: candidate.requiresOvernight ? 1 : 0,
    departureWaitMinutes: firstSegment
      ? Math.max(
          0,
          minutesBetween(recoveryStartedAt, firstSegment.estimatedDeparture),
        )
      : Number.MAX_SAFE_INTEGER,
  };
}

function normalize(value: number, values: readonly number[]): number {
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  return maximum === minimum ? 0 : (value - minimum) / (maximum - minimum);
}

function tieBreak(a: RankedCandidate, b: RankedCandidate): number {
  if (a.score !== b.score) return b.score - a.score;
  if (
    a.candidate.incrementalCost.amountMinor !==
    b.candidate.incrementalCost.amountMinor
  ) {
    return (
      a.candidate.incrementalCost.amountMinor -
      b.candidate.incrementalCost.amountMinor
    );
  }

  const arrivalDifference =
    timestampMs(a.candidate.segments.at(-1)?.estimatedArrival ?? "9999-12-31") -
    timestampMs(b.candidate.segments.at(-1)?.estimatedArrival ?? "9999-12-31");
  if (arrivalDifference !== 0) return arrivalDifference;
  return a.candidate.id.localeCompare(b.candidate.id);
}

export function rankCandidates(
  input: RankCandidatesInput,
): RankedCandidate[] {
  const eligible = input.evaluations.filter((evaluation) => evaluation.passed);
  if (eligible.length === 0) return [];

  const factorRows = eligible.map((evaluation) => ({
    candidate: evaluation.candidate,
    factors: factorsFor(
      evaluation.candidate,
      input.originalArrivalTime,
      input.recoveryStartedAt,
    ),
  }));
  const keys = Object.keys(WEIGHTS) as FactorKey[];

  return factorRows
    .map(({ candidate, factors }) => {
      const penalty = keys.reduce((total, key) => {
        const values = factorRows.map((row) => row.factors[key]);
        return total + normalize(factors[key], values) * WEIGHTS[key];
      }, 0);

      return {
        candidate,
        factors,
        score: Math.round((1 - penalty) * 10_000) / 100,
      };
    })
    .sort(tieBreak);
}
