import { getCurrentUser } from "@/application/dal/auth";
import { getLiveTripStatus } from "@/application/services/live-trip-recommendations";

export async function POST(_request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  if (process.env.PROVIDER_MODE !== "live") {
    return Response.json({ error: "Aviationstack live mode is not configured." }, { status: 503 });
  }
  const { tripId } = await params;
  try {
    const result = await getLiveTripStatus(user.id, tripId);
    return Response.json(result, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Live flight status is unavailable." }, { status: 503 });
  }
}
