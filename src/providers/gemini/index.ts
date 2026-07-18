import { SourceMode } from "@/domain";
import type { ProseProvider, ProseRequest } from "@/providers/contracts";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

type InteractionResponse = Readonly<{
  status?: string;
  steps?: readonly Readonly<{
    type?: string;
    content?: readonly Readonly<{ type?: string; text?: string }>[];
  }>[];
}>;

function outputText(value: InteractionResponse): string | null {
  for (const step of value.steps ?? []) {
    if (step.type !== "model_output") continue;
    for (const item of step.content ?? []) {
      if (item.type === "text" && item.text?.trim()) return item.text.trim();
    }
  }
  return null;
}

export class GeminiProseProvider implements ProseProvider {
  constructor(
    private readonly apiKey: string,
    private readonly request: typeof fetch = fetch,
  ) {}

  async rewriteCompletedRecovery(input: ProseRequest) {
    const response = await this.request(GEMINI_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify({
        model: "gemini-3.5-flash",
        input: JSON.stringify({
          completedFacts: input.facts,
          deterministicMessage: input.deterministicBody,
        }),
        system_instruction:
          "Rewrite the completed recovery message in calm, concise prose. Do not add, remove, infer, or change routes, times, actions, costs, policy, safety facts, or execution status. Return message text only.",
        store: false,
        generation_config: {
          thinking_level: "low",
          max_output_tokens: 300,
          temperature: 0.2,
        },
      }),
      signal: AbortSignal.timeout(4_000),
    });
    if (!response.ok) throw new Error(`Gemini failed with ${response.status}.`);
    const body = outputText((await response.json()) as InteractionResponse);
    return {
      accepted: Boolean(body),
      body,
      provider: {
        source: "Gemini 3.5 Flash prose",
        mode: SourceMode.Live,
        isSimulated: false,
        observedAt: input.observedAt,
        confidence: body ? 1 : 0,
      },
    };
  }
}

export function getGeminiProseProvider(): GeminiProseProvider | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  return apiKey ? new GeminiProseProvider(apiKey) : null;
}
