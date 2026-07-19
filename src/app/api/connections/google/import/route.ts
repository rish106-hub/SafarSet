import { getCurrentUser } from "@/application/dal/auth";
import { listGoogleTripCandidates } from "@/providers/google-calendar";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  try {
    const candidates = await listGoogleTripCandidates(user.id);
    return Response.json({ candidates }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Google Calendar could not be read." }, { status: 503 });
  }
}
