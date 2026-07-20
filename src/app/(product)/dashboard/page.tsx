import {
  ArrowRight,
  CalendarPlus,
  Check,
  CircleAlert,
  Clock3,
  Database,
  MessageSquareText,
  Plane,
  PlaneTakeoff,
  Settings2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { getProfile, listPolicies, listTrips } from "@/application/dal/customer-data";
import { EmptyState } from "@/components/empty-state";
import { StatusPill } from "@/components/status-pill";
import { airportLabel } from "@/data/airports";
import { formatTime } from "@/lib/format";

export default async function DashboardPage() {
  const [trips, policies, profile] = await Promise.all([listTrips(), listPolicies(), getProfile()]);
  const upcoming = trips.filter((trip) => trip.status === "UPCOMING" || trip.status === "MONITORING");
  const nextTrip = upcoming[0];
  const defaultPolicy = policies.find((policy) => policy.isDefault) ?? policies[0];
  const firstName = profile.fullName?.split(" ")[0];

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#D9E2EC] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <div><p className="font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-[#147D92]">Family travel control</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">{firstName ? `Good to see you, ${firstName}` : "Your travel watch"}</h1></div>
          <div className="flex gap-2"><Link className="inline-flex items-center gap-2 rounded-lg border border-[#BCCCDC] bg-white px-4 py-2.5 text-sm font-medium text-[#334E68] hover:border-[#829AB1]" href="/agent"><MessageSquareText className="size-4" /> Ask SafarSet</Link><Link className="button-primary" href="/trips/new"><CalendarPlus className="size-4" /> Add trip</Link></div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] p-5 sm:p-8 lg:p-10">
        {(!profile.onboardingComplete || !defaultPolicy) && <Link href="/onboarding" className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#B8E8EA] bg-[#E3F8F8] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Finish your family setup</p><p className="mt-1 text-sm text-[#147D92]">Review your defaults and attach rules to the first real trip.</p></div><span className="text-sm font-semibold text-[#147D92]">Continue setup →</span></Link>}

        {nextTrip ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <section className="overflow-hidden rounded-[26px] border border-[#BCCCDC] bg-white shadow-[0_18px_60px_rgba(16,42,67,.08)]">
                <div className="flex flex-col gap-4 border-b border-[#E4E7EB] p-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div><div className="flex flex-wrap items-center gap-3"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#147D92]">Next trip</p><StatusPill status={nextTrip.status} /></div><h2 className="mt-3 text-3xl font-semibold tracking-[-.045em]">{nextTrip.title}</h2></div>
                  <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#147D92]" href={`/trips/${nextTrip.id}`}>Open trip <ArrowRight className="size-4" /></Link>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr_auto]">
                    <Airport code={nextTrip.origin} align="left" />
                    <div className="min-w-0"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#2CB1BC]" /><span className="h-0.5 flex-1 bg-[#2CB1BC]" /><Plane className="size-5 rotate-90 text-[#147D92]" /><span className="h-0.5 flex-1 bg-[#2CB1BC]" /><span className="size-2.5 rounded-full bg-[#2CB1BC]" /></div><p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[.14em] text-[#7B8794]">{formatTime(nextTrip.startsAt)} · {nextTrip.adults + nextTrip.children} travellers</p></div>
                    <Airport code={nextTrip.destination} align="right" />
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <Metric icon={ShieldCheck} label="Protection" value={defaultPolicy ? "Rules attached" : "Rules needed"} tone={defaultPolicy ? "good" : "warn"} />
                    <Metric icon={UsersRound} label="Travellers" value={`${nextTrip.adults} adult${nextTrip.adults === 1 ? "" : "s"}${nextTrip.children ? `, ${nextTrip.children} child${nextTrip.children === 1 ? "" : "ren"}` : ""}`} />
                    <Metric icon={Database} label="Trip source" value={friendlySource(nextTrip.source)} />
                  </div>
                </div>

                <div className="border-t border-[#E4E7EB] bg-[#F7FAFC] p-5 sm:px-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#E3F8F8] text-[#147D92]"><Check className="size-4" /></span><div><p className="text-sm font-semibold">No action required</p><p className="mt-1 text-sm text-[#627D98]">Open the trip to check its issued itinerary and live-status window.</p></div></div><Link className="text-sm font-semibold text-[#147D92]" href={`/trips/${nextTrip.id}`}>Review status →</Link></div>
                </div>
              </section>

              <section>
                <div className="flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#7B8794]">Your queue</p><h2 className="mt-2 text-xl font-semibold">What needs attention</h2></div><Link className="text-sm text-[#147D92]" href="/trips">All trips →</Link></div>
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white">
                  <QueueRow icon={Clock3} title="Live monitoring window" body="Same-day status checks become useful close to departure." action="View trip" href={`/trips/${nextTrip.id}`} />
                  {!defaultPolicy && <QueueRow icon={CircleAlert} title="Travel rules are missing" body="Set connection, cabin, family, and spend limits before departure." action="Set rules" href="/policy" warning />}
                  <QueueRow icon={Settings2} title="Check your saved defaults" body="A quick review avoids unnecessary questions during a disruption." action="Review" href="/policy" />
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="rounded-2xl border border-[#D9E2EC] bg-white p-5">
                <div className="flex items-center justify-between"><h2 className="font-semibold">Family rules</h2><Link className="text-xs font-semibold text-[#147D92]" href="/policy">Edit</Link></div>
                {defaultPolicy ? <div className="mt-5 space-y-4"><Rule label="Travel together" value={defaultPolicy.requireFamilyTogether ? "Required" : "Flexible"} /><Rule label="Self-transfer" value={defaultPolicy.forbidSelfTransfer ? "Not allowed" : "Allowed"} /><Rule label="Maximum stops" value={String(defaultPolicy.maxStops)} /><Rule label="Minimum connection" value={`${defaultPolicy.minimumConnectionMinutes} min`} /><Rule label="Approval above" value={formatInr(defaultPolicy.approvalAboveMinor)} /></div> : <p className="mt-4 text-sm leading-6 text-[#627D98]">No policy is saved yet. Family-safe defaults are ready to review.</p>}
              </section>

              <section className="rounded-2xl bg-[#102A43] p-5 text-white">
                <div className="flex items-center justify-between"><h2 className="font-semibold">Data sources</h2><Database className="size-4 text-[#67E8E8]" /></div>
                <div className="mt-5 space-y-4"><Source name="Saved itinerary" detail={friendlySource(nextTrip.source)} active /><Source name="Aviationstack" detail="Same-day status" active={process.env.PROVIDER_MODE === "live"} /><Source name="Google Calendar" detail="Optional import" active={false} /></div>
                <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#67E8E8]" href="/connections">Manage connections <ArrowRight className="size-4" /></Link>
              </section>

              <Link href="/agent" className="block rounded-2xl border border-[#B8E8EA] bg-[#E3F8F8] p-5"><MessageSquareText className="size-5 text-[#147D92]" /><p className="mt-4 font-semibold">Ask about this trip</p><p className="mt-2 text-sm leading-6 text-[#147D92]">Use normal language. SafarSet reads your saved trips and rules.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#147D92]">Open agent <ArrowRight className="size-4" /></span></Link>
            </aside>
          </div>
        ) : (
          <EmptyState icon={PlaneTakeoff} title="No trip is being watched" body="Import an issued itinerary. SafarSet will show when live monitoring begins and which family rules apply." action={<Link className="button-primary" href="/trips/new">Import your first trip <ArrowRight className="size-4" /></Link>} />
        )}
      </div>
    </div>
  );
}

function Airport({ code, align }: Readonly<{ code: string; align: "left" | "right" }>) { return <div className={align === "right" ? "text-right" : "text-left"}><p className="font-mono text-3xl font-semibold">{code}</p><p className="mt-1 max-w-36 text-xs text-[#627D98]">{airportLabel(code)}</p></div>; }
function Metric({ icon: Icon, label, value, tone }: Readonly<{ icon: typeof ShieldCheck; label: string; value: string; tone?: "good" | "warn" }>) { return <div className="rounded-xl bg-[#F7FAFC] p-4"><div className="flex items-center gap-2"><Icon className={`size-4 ${tone === "warn" ? "text-[#B76E00]" : "text-[#147D92]"}`} /><p className="font-mono text-[9px] uppercase tracking-[.12em] text-[#7B8794]">{label}</p></div><p className="mt-2 text-sm font-semibold">{value}</p></div>; }
function QueueRow({ icon: Icon, title, body, action, href, warning = false }: Readonly<{ icon: typeof Clock3; title: string; body: string; action: string; href: string; warning?: boolean }>) { return <div className="flex flex-col gap-4 border-b border-[#E4E7EB] p-5 last:border-0 sm:flex-row sm:items-center"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${warning ? "bg-[#FFF3D6] text-[#9C5700]" : "bg-[#F0F4F8] text-[#52606D]"}`}><Icon className="size-5" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-sm text-[#627D98]">{body}</p></div><Link className="text-sm font-semibold text-[#147D92]" href={href}>{action} →</Link></div>; }
function Rule({ label, value }: Readonly<{ label: string; value: string }>) { return <div className="flex items-center justify-between gap-4 border-b border-[#E4E7EB] pb-3 text-sm last:border-0 last:pb-0"><span className="text-[#627D98]">{label}</span><strong className="text-right text-xs">{value}</strong></div>; }
function Source({ name, detail, active }: Readonly<{ name: string; detail: string; active: boolean }>) { return <div className="flex items-center gap-3"><span className={`size-2 rounded-full ${active ? "bg-[#2CB1BC] shadow-[0_0_0_4px_rgba(44,177,188,.12)]" : "bg-[#52606D]"}`} /><div className="min-w-0"><p className="text-sm font-medium">{name}</p><p className="text-xs text-[#9FB3C8]">{active ? detail : `${detail} · not connected`}</p></div></div>; }
function friendlySource(source: string) { return source.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase()); }
function formatInr(amountMinor: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amountMinor / 100); }
