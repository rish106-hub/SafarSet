import { CalendarDays, CircleCheck, CircleOff } from "lucide-react";

import { requireUser } from "@/application/dal/auth";
import { getProfile, listPolicies } from "@/application/dal/customer-data";
import { PageHeader } from "@/components/layout/page-header";
import { AccountForm } from "@/features/account/account-form";
import { disconnectGoogleAction } from "@/features/connections/actions";
import { ProductionPolicyForm } from "@/features/policy/policy-form";
import { getGoogleConnectionStatus } from "@/providers/google-calendar";

export default async function SettingsPage() {
  const user = await requireUser();
  const [profile, policies] = await Promise.all([getProfile(), listPolicies()]);
  const selected = policies.find((policy) => policy.isDefault) ?? policies[0];
  const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI && process.env.GOOGLE_TOKEN_ENCRYPTION_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
  let googleStatus: "CONNECTED" | "REAUTH_REQUIRED" | "DISCONNECTED" = "DISCONNECTED";
  if (googleConfigured) { try { googleStatus = await getGoogleConnectionStatus(user.id); } catch { googleStatus = "DISCONNECTED"; } }
  return <div><PageHeader eyebrow="Your defaults" title="Settings" description="Set household and travel rules once. SafarSet applies them to every new trip." /><div className="mx-auto max-w-5xl space-y-8 p-5 sm:p-8 lg:p-10"><AccountForm profile={profile} /><ProductionPolicyForm policy={selected} /><section className="rounded-2xl border border-[#D9E2EC] bg-white p-5 sm:p-7"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#E3F8F8] text-[#147D92]"><CalendarDays className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-semibold">Google Calendar</h2><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] ${googleStatus === "CONNECTED" ? "bg-[#E3F8F8] text-[#147D92]" : "bg-[#F0F4F8] text-[#627D98]"}`}>{googleStatus === "CONNECTED" ? <CircleCheck className="size-3" /> : <CircleOff className="size-3" />}{googleStatus}</span></div><p className="mt-2 text-sm leading-6 text-[#627D98]">Read-only access finds upcoming flight reservations created from Gmail. SafarSet cannot change your calendar.</p><div className="mt-4">{googleStatus === "CONNECTED" ? <form action={disconnectGoogleAction}><button className="rounded-lg border border-[#BCCCDC] px-4 py-2.5 text-sm font-medium" type="submit">Disconnect Calendar</button></form> : googleConfigured ? <a className="button-primary" href="/api/connections/google/start">Connect Calendar</a> : <p className="text-sm text-[#9B2C2C]">Google OAuth is not configured by operator yet.</p>}</div></div></div></section></div></div>;
}
