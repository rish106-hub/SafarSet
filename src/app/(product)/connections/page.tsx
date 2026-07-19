import { CalendarDays, CircleCheck, CircleOff, Mail, Plane, Plus } from "lucide-react";
import Link from "next/link";

import { requireUser } from "@/application/dal/auth";
import { PageHeader } from "@/components/layout/page-header";
import { disconnectGoogleAction } from "@/features/connections/actions";
import { GoogleImport } from "@/features/connections/google-import";
import { getGoogleConnectionStatus } from "@/providers/google-calendar";

export default async function ConnectionsPage() {
  const user = await requireUser();
  const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI && process.env.GOOGLE_TOKEN_ENCRYPTION_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
  let googleStatus: "CONNECTED" | "REAUTH_REQUIRED" | "DISCONNECTED" = "DISCONNECTED";
  if (googleConfigured) {
    try { googleStatus = await getGoogleConnectionStatus(user.id); } catch { googleStatus = "DISCONNECTED"; }
  }
  const aviationstackConfigured = Boolean(process.env.AVIATIONSTACK_API_KEY && process.env.PROVIDER_MODE === "live");
  return <div><PageHeader eyebrow="Integration order" title="Connections" description="Start with the lowest-cost reliable input. Every imported trip stops for review before saving." /><div className="mx-auto max-w-5xl space-y-5 p-5 sm:p-8 lg:p-10"><ConnectionCard rank="01" icon={Plus} title="Manual itinerary" status="AVAILABLE" body="The reliable beta path. Add the issued flight number, airports, times, cabin, and travellers yourself." action={<Link className="button-primary" href="/trips/new">Add a trip</Link>} /><ConnectionCard rank="02" icon={CalendarDays} title="Google Calendar" status={googleConfigured ? googleStatus : "NOT CONFIGURED"} body="Reads upcoming timed events with the narrow calendar-events scope. SafarSet detects explicit routes and asks you to confirm every field." action={googleStatus === "CONNECTED" ? <div className="flex flex-wrap items-center gap-3"><GoogleImport /><form action={disconnectGoogleAction} className="mt-5"><button className="rounded-lg border border-[#BCCCDC] px-4 py-2.5 text-sm font-medium" type="submit">Disconnect</button></form></div> : googleConfigured ? <a className="button-primary" href="/api/connections/google/start">Connect Google Calendar</a> : <span className="text-sm text-[#9B2C2C]">Add Google OAuth environment values.</span>} /><ConnectionCard rank="03" icon={Plane} title="Aviationstack live status" status={aviationstackConfigured ? "AVAILABLE" : "NOT CONFIGURED"} body="Checks live flight status for your saved itinerary. It does not provide rebooking offers, booking import, or ticket execution." action={<span className="text-sm text-[#627D98]">Configured by the beta operator, not each customer.</span>} /><ConnectionCard rank="NOT PLANNED" icon={Mail} title="Gmail inbox scan" status="BLOCKED FOR BETA" body="Reading message bodies uses restricted Gmail scopes and can trigger verification plus a security assessment. That cost is unjustified for three or four users." action={<span className="inline-flex items-center gap-2 text-sm text-[#9B2C2C]"><CircleOff className="size-4" /> No inbox permission requested</span>} /></div></div>;
}

function ConnectionCard({ rank, icon: Icon, title, status, body, action }: Readonly<{ rank: string; icon: typeof Plane; title: string; status: string; body: string; action: React.ReactNode }>) {
  const available = status === "AVAILABLE" || status === "CONNECTED";
  return <section className="rounded-2xl border border-[#D9E2EC] bg-white p-5 sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-start"><span className="font-mono text-[10px] font-semibold text-[#9FB3C8]">{rank}</span><span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#E3F8F8] text-[#147D92]"><Icon className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-semibold">{title}</h2><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] ${available ? "bg-[#E3F8F8] text-[#147D92]" : "bg-[#F0F4F8] text-[#627D98]"}`}>{available && <CircleCheck className="size-3" />}{status}</span></div><p className="mt-2 max-w-2xl text-sm leading-6 text-[#627D98]">{body}</p><div className="mt-4">{action}</div></div></div></section>;
}
