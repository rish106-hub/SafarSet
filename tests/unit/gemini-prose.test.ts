import { describe, expect, it, vi } from "vitest";

import { HERO_NOW } from "@/data";
import { GeminiProseProvider } from "@/providers/gemini";

describe("Gemini prose adapter", () => {
  it("sends completed facts without persistence or tools", async () => {
    const request = vi.fn<typeof fetch>();
    request.mockResolvedValue(
      new Response(JSON.stringify({
        status: "completed",
        steps: [{ type: "model_output", content: [{ type: "text", text: "Safe copy" }] }],
      }), { status: 200 }),
    );
    const provider = new GeminiProseProvider("test-key", request as typeof fetch);
    const result = await provider.rewriteCompletedRecovery({
      facts: {
        recoveryRunId: "run-1",
        route: ["CDG", "DXB", "DEL"],
        arrivalAt: HERO_NOW,
        actionLabels: ["SIMULATED_REISSUE"],
      },
      deterministicBody: "Deterministic facts",
      observedAt: HERO_NOW,
    });
    const init = request.mock.calls[0]?.[1];
    const body = JSON.parse(String(init?.body));
    expect(body.store).toBe(false);
    expect(body.tools).toBeUndefined();
    expect(result.body).toBe("Safe copy");
  });
});
