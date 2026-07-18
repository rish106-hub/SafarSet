import { describe, expect, it } from "vitest";

import { runDemoRecovery } from "@/application/services/run-demo-recovery";
import { HERO_NOW, createHeroTrip, heroPolicy } from "@/data";
import { initialDemoState } from "@/features/demo/state";
import {
  HERO_TRIP_ID,
  PERSISTENCE_VERSION,
  type RecoveryEvidence,
  type RecoveryRepository,
} from "@/persistence/contracts/recovery-repository";
import { FallbackRecoveryRepository } from "@/persistence/local/fallback-recovery-repository";
import {
  LocalRecoveryRepository,
  type StoragePort,
} from "@/persistence/local/local-recovery-repository";

class MemoryStorage implements StoragePort {
  private readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

class FakeRepository implements RecoveryRepository {
  saved: RecoveryEvidence | null = null;
  constructor(
    private readonly stored: RecoveryEvidence | null = null,
    private readonly fails = false,
  ) {}
  async load() {
    if (this.fails) throw new Error("offline");
    return this.saved ?? this.stored;
  }
  async save(evidence: RecoveryEvidence) {
    if (this.fails) throw new Error("offline");
    this.saved = evidence;
  }
}

async function createEvidence(updatedAt = HERO_NOW): Promise<RecoveryEvidence> {
  const result = await runDemoRecovery({ policy: heroPolicy, usedIdempotencyKeys: new Set() });
  if (!result.decision.idempotencyKey) throw new Error("fixture must auto-book");
  const uiState = {
    ...initialDemoState,
    phase: "recovered" as const,
    result,
    audit: result.audit,
    usedIdempotencyKeys: [result.decision.idempotencyKey],
  };
  return {
    version: PERSISTENCE_VERSION,
    policy: heroPolicy,
    trip: createHeroTrip(),
    run: {
      id: result.decision.idempotencyKey,
      startedAt: HERO_NOW,
      completedAt: updatedAt,
      result,
    },
    audit: result.audit,
    uiState,
    updatedAt,
  };
}

describe("recovery persistence", () => {
  it("round-trips complete recovery evidence through browser storage", async () => {
    const repository = new LocalRecoveryRepository(new MemoryStorage());
    const evidence = await createEvidence();
    await repository.save(evidence);
    await expect(repository.load(HERO_TRIP_ID)).resolves.toEqual(evidence);
  });

  it("returns null for corrupt browser data", async () => {
    const storage = new MemoryStorage();
    storage.setItem("safarset.recovery-evidence.v1", "not-json");
    await expect(new LocalRecoveryRepository(storage).load(HERO_TRIP_ID)).resolves.toBeNull();
  });

  it("saves locally before a failed Supabase write and reports fallback", async () => {
    const local = new FakeRepository();
    const repository = new FallbackRecoveryRepository(new FakeRepository(null, true), local);
    const evidence = await createEvidence();
    await expect(repository.save(evidence)).resolves.toBe("LOCAL");
    expect(local.saved).toEqual(evidence);
  });

  it("loads local evidence when Supabase is unavailable", async () => {
    const evidence = await createEvidence();
    const repository = new FallbackRecoveryRepository(
      new FakeRepository(null, true),
      new FakeRepository(evidence),
    );
    await expect(repository.load(HERO_TRIP_ID)).resolves.toEqual({ evidence, mode: "LOCAL" });
  });

  it("repairs stale Supabase data from the newer local copy", async () => {
    const remoteOld = await createEvidence("2026-08-14T18:00:00.000Z");
    const localNew = await createEvidence("2026-08-14T19:00:00.000Z");
    const remote = new FakeRepository(remoteOld);
    const repository = new FallbackRecoveryRepository(remote, new FakeRepository(localNew));
    await expect(repository.load(HERO_TRIP_ID)).resolves.toEqual({ evidence: localNew, mode: "SUPABASE" });
    expect(remote.saved).toEqual(localNew);
  });
});
