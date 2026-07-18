import {
  isRecoveryEvidence,
  type RecoveryEvidence,
  type RecoveryRepository,
} from "@/persistence/contracts/recovery-repository";

export const RECOVERY_STORAGE_KEY = "safarset.recovery-evidence.v1";
export const RECOVERY_RESET_KEY = "safarset.recovery-reset.v1";

export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class LocalRecoveryRepository implements RecoveryRepository {
  constructor(private readonly storage: StoragePort) {}

  async load(tripId: string): Promise<RecoveryEvidence | null> {
    if (await this.wasCleared(tripId)) return null;
    const raw = this.storage.getItem(RECOVERY_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      return isRecoveryEvidence(parsed) && parsed.trip.id === tripId ? parsed : null;
    } catch {
      return null;
    }
  }

  async save(evidence: RecoveryEvidence): Promise<void> {
    this.storage.removeItem(RECOVERY_RESET_KEY);
    this.storage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(evidence));
  }

  async clear(tripId: string): Promise<void> {
    this.storage.removeItem(RECOVERY_STORAGE_KEY);
    this.storage.setItem(RECOVERY_RESET_KEY, tripId);
  }

  async wasCleared(tripId: string): Promise<boolean> {
    return this.storage.getItem(RECOVERY_RESET_KEY) === tripId;
  }
}
