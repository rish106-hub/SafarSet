import {
  ExecutionState,
  SourceMode,
  type ProviderMetadata,
} from "@/domain";
import { HERO_NOW, createHeroTrip, heroCandidates } from "@/data";
import type {
  AccommodationProvider,
  NotificationProvider,
  TransferProvider,
  TravelProvider,
} from "@/providers/contracts";

export const demoProviderMetadata: ProviderMetadata = {
  source: "SafarSet demo adapter",
  mode: SourceMode.Simulated,
  isSimulated: true,
  observedAt: HERO_NOW,
  confidence: 1,
};

export const demoTravelProvider: TravelProvider = {
  async getFlightStatus() {
    return {
      segments: createHeroTrip().segments,
      provider: {
        ...demoProviderMetadata,
        mode: SourceMode.Fixture,
        source: "SafarSet status fixture",
      },
    };
  },
  async searchAlternatives() {
    return heroCandidates;
  },
  async executeRebooking(input) {
    return {
      accepted: true,
      confirmationCode: `SIM-${input.candidate.id.toUpperCase()}`,
      provider: demoProviderMetadata,
    };
  },
};

export const demoAccommodationProvider: AccommodationProvider = {
  async modifyStay(input) {
    return {
      accepted: true,
      confirmationCode: `SIM-HOTEL-${input.tripId.slice(-3).toUpperCase()}`,
      provider: demoProviderMetadata,
    };
  },
};

export const demoTransferProvider: TransferProvider = {
  async rescheduleTransfer(input) {
    return {
      accepted: true,
      confirmationCode: `SIM-RIDE-${input.pickupAirport}`,
      provider: demoProviderMetadata,
    };
  },
};

export const demoNotificationProvider: NotificationProvider = {
  async sendRecoveryConfirmation(input) {
    return {
      accepted: true,
      messageId: `SIM-MSG-${input.recoveryRunId.slice(-3).toUpperCase()}`,
      provider: demoProviderMetadata,
    };
  },
};

export const demoExecutionState = ExecutionState.Available;
