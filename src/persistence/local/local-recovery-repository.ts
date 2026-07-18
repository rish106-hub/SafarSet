import {
  isRecoveryEvidence,
  type RecoveryEvidence,
  type RecoveryRepository,
} from "@/persistence/contracts/recovery-repository";

export const RECOVERY_STORAGE_KEY = "safarset.recovery-evidence.v1";

export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class LocalRecoveryRepository implements RecoveryRepository {
  constructor(private readonly storage: StoragePort) {}

  async load(tripId: string): Promise<RecoveryEvidence | null> {
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
    this.storage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(evidence));
  }
}
