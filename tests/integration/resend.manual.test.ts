import { describe, expect, it } from "vitest";

import { HERO_NOW } from "@/data";
import { ResendNotificationProvider } from "@/providers/resend";

const enabled = process.env.RUN_RESEND_INTEGRATION === "1";

describe.skipIf(!enabled)("Resend manual delivery", () => {
  it("delivers one synthetic recovery email", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    const recipient = process.env.RESEND_TO_EMAIL;
    if (!apiKey || !from || !recipient) {
      throw new Error("Set RESEND_API_KEY, RESEND_FROM_EMAIL, and RESEND_TO_EMAIL.");
    }
    const provider = new ResendNotificationProvider(apiKey, from, HERO_NOW);
    const result = await provider.sendRecoveryConfirmation({
      recipient,
      subject: "SafarSet manual integration test",
      body: "Synthetic recovery delivery test. No real booking was changed.",
      recoveryRunId: `manual-${Date.now()}`,
    });
    expect(result.accepted).toBe(true);
    expect(result.messageId).toBeTruthy();
  });
});
