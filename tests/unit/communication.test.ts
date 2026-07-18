import { describe, expect, it, vi } from "vitest";

import { deliverRecoveryCommunication } from "@/application/services/deliver-recovery-communication";
import { renderRecoveryMessage } from "@/application/services/render-recovery-message";
import { runDemoRecovery } from "@/application/services/run-demo-recovery";
import { SourceMode } from "@/domain";
import { HERO_NOW, heroPolicy } from "@/data";
import type { NotificationProvider, ProseProvider } from "@/providers/contracts";

async function completedRecovery() {
  return runDemoRecovery({ policy: heroPolicy, usedIdempotencyKeys: new Set() });
}

const liveMetadata = {
  source: "test provider",
  mode: SourceMode.Live,
  isSimulated: false,
  observedAt: HERO_NOW,
  confidence: 1,
} as const;

describe("recovery communication", () => {
  it("renders stable completed facts without an LLM", async () => {
    const result = await completedRecovery();
    const first = renderRecoveryMessage(result);
    const second = renderRecoveryMessage(result);
    expect(first).toEqual(second);
    expect(first.body).toContain("CDG to DOH to DEL");
    expect(first.body).toContain("simulated");
  });

  it("falls back when Gemini fails and still sends deterministic email", async () => {
    const result = await completedRecovery();
    const proseProvider: ProseProvider = {
      rewriteCompletedRecovery: vi.fn().mockRejectedValue(new Error("Gemini offline")),
    };
    const notificationProvider: NotificationProvider = {
      sendRecoveryConfirmation: vi.fn(async () => ({
        accepted: true,
        messageId: "email-1",
        provider: liveMetadata,
      })),
    };
    const report = await deliverRecoveryCommunication({
      ...result,
      recipient: "synthetic.family@example.test",
      observedAt: HERO_NOW,
      proseProvider,
      notificationProvider,
    });
    expect(report.proseStatus).toBe("FALLBACK");
    expect(report.emailStatus).toBe("DELIVERED");
    expect(report.body).toContain("CDG to DOH to DEL");
  });

  it("reports email failure without throwing or losing in-app confirmation", async () => {
    const result = await completedRecovery();
    const notificationProvider: NotificationProvider = {
      sendRecoveryConfirmation: vi.fn().mockRejectedValue(new Error("Resend offline")),
    };
    const report = await deliverRecoveryCommunication({
      ...result,
      recipient: "synthetic.family@example.test",
      observedAt: HERO_NOW,
      proseProvider: null,
      notificationProvider,
    });
    expect(report.emailStatus).toBe("FALLBACK");
    expect(result.actions.some((action) => action.label === "IN_APP_CONFIRMATION")).toBe(true);
  });

  it("rejects prose that drops completed recovery facts", async () => {
    const result = await completedRecovery();
    const proseProvider: ProseProvider = {
      async rewriteCompletedRecovery() {
        return { accepted: true, body: "Your trip changed.", provider: liveMetadata };
      },
    };
    const report = await deliverRecoveryCommunication({
      ...result,
      recipient: null,
      observedAt: HERO_NOW,
      proseProvider,
      notificationProvider: null,
    });
    expect(report.proseStatus).toBe("FALLBACK");
    expect(report.body).toContain("CDG to DOH to DEL");
  });
});
