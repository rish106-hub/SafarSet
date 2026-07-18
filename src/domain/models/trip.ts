import type { CabinClass, SegmentStatus } from "../enums";
import type { ProviderMetadata } from "./common";

export type FlightSegment = Readonly<{
  id: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  estimatedDeparture: string;
  estimatedArrival: string;
  cabin: CabinClass;
  status: SegmentStatus;
  seatsAvailable: number;
  provider: ProviderMetadata;
}>;

export type Trip = Readonly<{
  id: string;
  familyId: string;
  origin: string;
  destination: string;
  segments: readonly FlightSegment[];
}>;
