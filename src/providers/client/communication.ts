import type { CommunicationReport } from "@/application/services/deliver-recovery-communication";
import type { RecoveryEvidence } from "@/persistence/contracts/recovery-repository";

export async function requestRecoveryCommunication(
  evidence: RecoveryEvidence,
): Promise<CommunicationReport> {
  const response = await fetch("/api/notifications/recovery", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(evidence),
  });
  if (!response.ok) throw new Error(`Communication request failed with ${response.status}.`);
  return (await response.json()) as CommunicationReport;
}
