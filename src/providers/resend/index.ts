import { Resend } from "resend";

import { SourceMode } from "@/domain";
import type { NotificationProvider } from "@/providers/contracts";

export class ResendNotificationProvider implements NotificationProvider {
  private client: Resend | null = null;

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly observedAt: string,
  ) {}

  private getClient(): Resend {
    this.client ??= new Resend(this.apiKey);
    return this.client;
  }

  async sendRecoveryConfirmation(input: Parameters<NotificationProvider["sendRecoveryConfirmation"]>[0]) {
    const { data, error } = await this.getClient().emails.send(
      {
        from: this.from,
        to: [input.recipient],
        subject: input.subject,
        text: input.body,
      },
      { idempotencyKey: `recovery-confirmation/${input.recoveryRunId}` },
    );
    if (error) throw new Error(error.message);
    return {
      accepted: Boolean(data?.id),
      messageId: data?.id ?? null,
      provider: {
        source: "Resend email",
        mode: SourceMode.Live,
        isSimulated: false,
        observedAt: this.observedAt,
        confidence: data?.id ? 1 : 0,
      },
    };
  }
}

export function getResendNotificationProvider(
  observedAt: string,
): ResendNotificationProvider | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  return apiKey && from
    ? new ResendNotificationProvider(apiKey, from, observedAt)
    : null;
}
