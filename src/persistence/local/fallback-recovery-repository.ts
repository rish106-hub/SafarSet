import type {
  PersistenceMode,
  RecoveryEvidence,
  RecoveryRepository,
} from "@/persistence/contracts/recovery-repository";

export class FallbackRecoveryRepository {
  constructor(
    private readonly primary: RecoveryRepository,
    private readonly fallback: RecoveryRepository,
  ) {}

  async load(tripId: string): Promise<Readonly<{ evidence: RecoveryEvidence | null; mode: PersistenceMode }>> {
    if (await this.fallback.wasCleared?.(tripId)) {
      return { evidence: null, mode: "LOCAL" };
    }
    const local = await this.fallback.load(tripId);
    try {
      const remote = await this.primary.load(tripId);
      if (remote && (!local || remote.updatedAt >= local.updatedAt)) {
        await this.fallback.save(remote);
        return { evidence: remote, mode: "SUPABASE" };
      }
      if (local) {
        await this.primary.save(local);
        return { evidence: local, mode: "SUPABASE" };
      }
    } catch {
      // A missing or failed remote must never block the demo.
    }
    return { evidence: local, mode: "LOCAL" };
  }

  async save(evidence: RecoveryEvidence): Promise<PersistenceMode> {
    await this.fallback.save(evidence);
    try {
      await this.primary.save(evidence);
      return "SUPABASE";
    } catch {
      return "LOCAL";
    }
  }

  async clear(tripId: string): Promise<void> {
    if (!this.fallback.clear) throw new Error("Local persistence cannot reset.");
    await this.fallback.clear(tripId);
  }
}
