import type {
  DisruptionEvent,
  FamilyProfile,
  FlightSegment,
  Money,
  ProviderMetadata,
  RecoveryCandidate,
  RecoveryPolicy,
  Trip,
} from "@/domain";

export type FlightStatusInput = Readonly<{
  trip: Trip;
}>;

export type FlightStatusResult = Readonly<{
  segments: readonly FlightSegment[];
  provider: ProviderMetadata;
}>;

export type AlternativeSearchInput = Readonly<{
  trip: Trip;
  disruption: DisruptionEvent;
  family: FamilyProfile;
  policy: RecoveryPolicy;
}>;

export type RebookingInput = Readonly<{
  tripId: string;
  candidate: RecoveryCandidate;
  idempotencyKey: string;
}>;

export type RebookingResult = Readonly<{
  accepted: boolean;
  confirmationCode: string | null;
  provider: ProviderMetadata;
}>;

export interface TravelProvider {
  getFlightStatus(input: FlightStatusInput): Promise<FlightStatusResult>;
  searchAlternatives(
    input: AlternativeSearchInput,
  ): Promise<readonly RecoveryCandidate[]>;
  executeRebooking(input: RebookingInput): Promise<RebookingResult>;
}

export type StayChangeInput = Readonly<{
  tripId: string;
  checkIn: string;
  checkOut: string;
  maximumCost: Money;
  idempotencyKey: string;
}>;

export type StayChangeResult = Readonly<{
  accepted: boolean;
  confirmationCode: string | null;
  provider: ProviderMetadata;
}>;

export interface AccommodationProvider {
  modifyStay(input: StayChangeInput): Promise<StayChangeResult>;
}

export type TransferChangeInput = Readonly<{
  tripId: string;
  pickupAt: string;
  pickupAirport: string;
  idempotencyKey: string;
}>;

export type TransferChangeResult = Readonly<{
  accepted: boolean;
  confirmationCode: string | null;
  provider: ProviderMetadata;
}>;

export interface TransferProvider {
  rescheduleTransfer(
    input: TransferChangeInput,
  ): Promise<TransferChangeResult>;
}

export type RecoveryMessage = Readonly<{
  recipient: string;
  subject: string;
  body: string;
  recoveryRunId: string;
}>;

export type NotificationResult = Readonly<{
  accepted: boolean;
  messageId: string | null;
  provider: ProviderMetadata;
}>;

export interface NotificationProvider {
  sendRecoveryConfirmation(
    input: RecoveryMessage,
  ): Promise<NotificationResult>;
}
