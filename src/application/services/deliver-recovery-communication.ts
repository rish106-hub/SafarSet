import { SourceMode, type ProviderMetadata, type RecoveryDecision } from "@/domain";
import type { DemoActionResult } from "@/application/services/run-demo-recovery";
import type {
  NotificationProvider,
  ProseProvider,
} from "@/providers/contracts";
import {
  renderRecoveryMessage,
  toRecoveryMessage,
} from "./render-recovery-message";

export type CommunicationStatus = "DELIVERED" | "FALLBACK" | "UNAVAILABLE";

export type CommunicationReport = Readonly<{
  subject: string;
  body: string;
  proseStatus: CommunicationStatus;
  emailStatus: CommunicationStatus;
  emailMessageId: string | null;
  proseProvider: ProviderMetadata;
  emailProvider: ProviderMetadata;
}>;

function unavailableProvider(source: string, observedAt: string): ProviderMetadata {
  return {
    source,
    mode: SourceMode.Unavailable,
    isSimulated: false,
    observedAt,
    confidence: 0,
  };
}

function preservesCompletedFacts(
  body: string,
  rendered: ReturnType<typeof renderRecoveryMessage>,
): boolean {
  return (
    body.length <= 1_500 &&
    rendered.facts.route.every((airport) => body.includes(airport)) &&
    body.includes(rendered.facts.arrivalAt) &&
    rendered.facts.actionLabels.every((label) => body.includes(label))
  );
}

export async function deliverRecoveryCommunication(input: Readonly<{
  decision: RecoveryDecision;
  actions: readonly DemoActionResult[];
  recipient: string | null;
  observedAt: string;
  proseProvider: ProseProvider | null;
  notificationProvider: NotificationProvider | null;
}>): Promise<CommunicationReport> {
  const rendered = renderRecoveryMessage(input);
  let body = rendered.body;
  let proseStatus: CommunicationStatus = "UNAVAILABLE";
  let proseProvider = unavailableProvider("Gemini not configured", input.observedAt);

  if (input.proseProvider) {
    try {
      const prose = await input.proseProvider.rewriteCompletedRecovery({
        facts: rendered.facts,
        deterministicBody: rendered.body,
        observedAt: input.observedAt,
      });
      proseProvider = prose.provider;
      if (
        prose.accepted &&
        prose.body?.trim() &&
        preservesCompletedFacts(prose.body, rendered)
      ) {
        body = prose.body.trim();
        proseStatus = "DELIVERED";
      } else {
        proseStatus = "FALLBACK";
      }
    } catch {
      proseStatus = "FALLBACK";
      proseProvider = unavailableProvider("Gemini prose fallback", input.observedAt);
    }
  }

  let emailStatus: CommunicationStatus = "UNAVAILABLE";
  let emailMessageId: string | null = null;
  let emailProvider = unavailableProvider("Resend not configured", input.observedAt);
  if (input.notificationProvider && input.recipient) {
    try {
      const email = await input.notificationProvider.sendRecoveryConfirmation(
        toRecoveryMessage(rendered, input.recipient, body),
      );
      emailProvider = email.provider;
      emailMessageId = email.messageId;
      emailStatus = email.accepted ? "DELIVERED" : "FALLBACK";
    } catch {
      emailStatus = "FALLBACK";
      emailProvider = unavailableProvider("Resend email fallback", input.observedAt);
    }
  }

  return {
    subject: rendered.subject,
    body,
    proseStatus,
    emailStatus,
    emailMessageId,
    proseProvider,
    emailProvider,
  };
}
