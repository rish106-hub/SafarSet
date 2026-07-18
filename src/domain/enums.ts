export enum CabinClass {
  Economy = "ECONOMY",
  PremiumEconomy = "PREMIUM_ECONOMY",
  Business = "BUSINESS",
  First = "FIRST",
}

export enum SegmentStatus {
  Scheduled = "SCHEDULED",
  Delayed = "DELAYED",
  Cancelled = "CANCELLED",
}

export enum DisruptionType {
  Cancellation = "CANCELLATION",
  MissedConnection = "MISSED_CONNECTION",
}

export enum ConstraintRule {
  FamilyTogether = "FAMILY_TOGETHER",
  NoSelfTransfer = "NO_SELF_TRANSFER",
  StopLimit = "STOP_LIMIT",
  MinimumCabin = "MINIMUM_CABIN",
  ApprovedTransit = "APPROVED_TRANSIT",
  ConnectionBuffer = "CONNECTION_BUFFER",
  ArrivalDeadline = "ARRIVAL_DEADLINE",
}

export enum DecisionOutcome {
  AutoBook = "AUTO_BOOK",
  RequestApproval = "REQUEST_APPROVAL",
  Escalate = "ESCALATE",
}

export enum RecoveryActionType {
  TicketReissue = "TICKET_REISSUE",
  HotelChange = "HOTEL_CHANGE",
  TransferChange = "TRANSFER_CHANGE",
  Notification = "NOTIFICATION",
}

export enum ExecutionState {
  Available = "AVAILABLE",
  Unavailable = "UNAVAILABLE",
  Unknown = "UNKNOWN",
}

export enum ProviderConsistency {
  Consistent = "CONSISTENT",
  Conflicting = "CONFLICTING",
  Unknown = "UNKNOWN",
}

export enum SourceMode {
  Live = "LIVE",
  Fixture = "FIXTURE",
  Simulated = "SIMULATED",
  Unavailable = "UNAVAILABLE",
}
