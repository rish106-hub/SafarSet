import {
  isRecoveryEvidence,
  type RecoveryEvidence,
  type RecoveryRepository,
} from "@/persistence/contracts/recovery-repository";

export class ApiRecoveryRepository implements RecoveryRepository {
  async load(tripId: string): Promise<RecoveryEvidence | null> {
    const response = await fetch(`/api/persistence/recovery?tripId=${encodeURIComponent(tripId)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Remote persistence unavailable.");
    const value: unknown = await response.json();
    return isRecoveryEvidence(value) ? value : null;
  }

  async save(evidence: RecoveryEvidence): Promise<void> {
    const response = await fetch("/api/persistence/recovery", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(evidence),
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) throw new Error("Remote persistence unavailable.");
  }
}
