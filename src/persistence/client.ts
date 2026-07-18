import { ApiRecoveryRepository } from "@/persistence/supabase/api-recovery-repository";
import { FallbackRecoveryRepository } from "@/persistence/local/fallback-recovery-repository";
import { LocalRecoveryRepository } from "@/persistence/local/local-recovery-repository";

let repository: FallbackRecoveryRepository | null = null;

export function getRecoveryRepository(): FallbackRecoveryRepository {
  if (typeof window === "undefined") throw new Error("Browser persistence requires window.");
  repository ??= new FallbackRecoveryRepository(
    new ApiRecoveryRepository(),
    new LocalRecoveryRepository(window.localStorage),
  );
  return repository;
}
