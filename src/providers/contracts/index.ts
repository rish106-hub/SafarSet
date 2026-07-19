import type {
  FlightSegment,
  ProviderMetadata,
  Trip,
} from "@/domain";

export type FlightStatusInput = Readonly<{
  trip: Trip;
  observedAt: string;
}>;

export type FlightStatusResult = Readonly<{
  segments: readonly FlightSegment[];
  provider: ProviderMetadata;
}>;

export interface FlightStatusProvider {
  getFlightStatus(input: FlightStatusInput): Promise<FlightStatusResult>;
}

export type StayChangeInput = Readonly<{
  tripId: string;
  checkIn: string;
  checkOut: string;
  maximumCost: import("@/domain").Money;
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

export type CompletedRecoveryFacts = Readonly<{
  recoveryRunId: string;
  route: readonly string[];
  arrivalAt: string;
  actionLabels: readonly string[];
}>;

export type ProseRequest = Readonly<{
  facts: CompletedRecoveryFacts;
  deterministicBody: string;
  observedAt: string;
}>;

export type ProseResult = Readonly<{
  accepted: boolean;
  body: string | null;
  provider: ProviderMetadata;
}>;

export interface ProseProvider {
  rewriteCompletedRecovery(input: ProseRequest): Promise<ProseResult>;
}
