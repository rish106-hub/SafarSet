import { isStepCount, tool, ToolLoopAgent } from "ai";
import { z } from "zod";

import { requireUser } from "@/application/dal/auth";
import { listPolicies, listTrips } from "@/application/dal/customer-data";
import { routeDeterministicCommand } from "@/features/agent/command-router";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const requestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  conversationId: z.uuid().optional(),
  source: z.enum(["TEXT", "VOICE_TRANSCRIPT"]).default("TEXT"),
});

function aiConfigured() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

export async function POST(request: Request) {
  const user = await requireUser();
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a shorter travel request." }, { status: 400 });
  const [trips, policies] = await Promise.all([listTrips(), listPolicies()]);
  const policy = policies.find((item) => item.isDefault) ?? policies[0];
  const deterministic = routeDeterministicCommand(parsed.data.message, trips, policy);
  let reply = deterministic.reply;
  let mode: "DETERMINISTIC" | "AI_DRAFT" = "DETERMINISTIC";

  if (!deterministic.handled) {
    if (!aiConfigured()) {
      reply = "Planning needs the AI Gateway key on this local environment. I can still show saved trips, explain rules, and route you to live status checks. No itinerary has been invented.";
    } else {
      const agent = new ToolLoopAgent({
        model: process.env.AI_AGENT_MODEL ?? "google/gemini-2.5-flash",
        stopWhen: isStepCount(4),
        instructions: "You are SafarSet, a family travel planning assistant for affluent Indian families. Draft practical plans, ask for missing dates, origin, family size, pace, and total budget. Never claim live price, availability, visa eligibility, booking, or payment. Label all plans as drafts to verify. Never mutate data. Keep the answer concise.",
        tools: {
          readFamilyRules: tool({ description: "Read the customer's saved family travel rules.", inputSchema: z.object({}), execute: async () => policy ?? { message: "No saved policy" } }),
          readSavedTrips: tool({ description: "Read the customer's saved trips.", inputSchema: z.object({}), execute: async () => trips.slice(0, 10) }),
          proposeProviderLinks: tool({ description: "Return provider search links for user verification. These are not live offers.", inputSchema: z.object({ origin: z.string().max(80), destination: z.string().max(80) }), execute: async ({ origin, destination }) => ({ flightSearch: `https://www.google.com/travel/flights?q=Flights%20from%20${encodeURIComponent(origin)}%20to%20${encodeURIComponent(destination)}`, hotelSearch: `https://www.google.com/travel/hotels/${encodeURIComponent(destination)}`, warning: "Search links do not prove price or availability." }) }),
        },
      });
      try {
        const result = await agent.generate({ prompt: parsed.data.message, timeout: { totalMs: 20_000 } });
        reply = result.text || "I could not draft a useful plan. Add dates, origin, family size, and budget, then try again.";
        mode = "AI_DRAFT";
      } catch {
        reply = "The planning model is unavailable right now. Your saved data was not changed. Try again, or ask me to show trips and rules.";
      }
    }
  }

  const supabase = await createSupabaseServerClient();
  let conversationId = parsed.data.conversationId;
  if (!conversationId) {
    const { data } = await supabase.from("agent_conversations").insert({ user_id: user.id, title: parsed.data.message.slice(0, 80) }).select("id").single();
    conversationId = data?.id ? String(data.id) : undefined;
  }
  if (conversationId) {
    await supabase.from("agent_messages").insert([
      { conversation_id: conversationId, user_id: user.id, role: "USER", content: parsed.data.message, source: parsed.data.source },
      { conversation_id: conversationId, user_id: user.id, role: "ASSISTANT", content: reply, source: "TEXT" },
    ]);
    await supabase.from("agent_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId).eq("user_id", user.id);
  }
  return Response.json({ reply, conversationId, mode, links: deterministic.suggestedLinks ?? [] });
}
