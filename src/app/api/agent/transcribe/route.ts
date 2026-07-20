import { transcribe } from "ai";
import { requireUser } from "@/application/dal/auth";

export const maxDuration = 30;

export async function POST(request: Request) {
  await requireUser();
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) return Response.json({ error: "Voice transcription needs the AI Gateway key." }, { status: 503 });
  const form = await request.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File) || audio.size === 0 || audio.size > 10 * 1024 * 1024) return Response.json({ error: "Record up to 10 MB of audio." }, { status: 400 });
  try {
    const result = await transcribe({ model: process.env.AI_TRANSCRIPTION_MODEL ?? "openai/gpt-4o-mini-transcribe", audio: new Uint8Array(await audio.arrayBuffer()) });
    return Response.json({ text: result.text });
  } catch {
    return Response.json({ error: "The recording could not be transcribed." }, { status: 502 });
  }
}
