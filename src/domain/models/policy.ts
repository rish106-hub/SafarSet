import type { CabinClass } from "../enums";
import type { Money } from "./common";

export type FamilyProfile = Readonly<{
  id: string;
  displayName: string;
  homeAirport: string;
  adults: number;
  children: number;
  travelerCount: number;
}>;

export type RecoveryPolicy = Readonly<{
  id: string;
  familyId: string;
  requireFamilyTogether: boolean;
  forbidSelfTransfer: boolean;
  maxStops: number;
  minimumCabin: CabinClass;
  approvedTransitAirports: readonly string[];
  minimumConnectionMinutes: number;
  arrivalDeadline: string;
  autoSpendLimit: Money;
  avoidOvernight: boolean;
}>;
