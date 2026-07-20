import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CircleCheck,
  FileText,
  Mail,
  MessageSquareText,
  Plane,
  PlaneTakeoff,
  Radar,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SafarSetLogo } from "@/components/brand/logo";
import { PublicPolicyStarter } from "@/features/policy/public-policy-starter";

const operatingSteps = [
  { title: "Import", body: "Connect Google Calendar, paste a confirmation, upload an itinerary, or add the trip yourself." },
  { title: "Set the rules", body: "Save the limits that matter to your family: seats together, stops, connections, cabin, and spend." },
  { title: "Stay ready", body: "SafarSet checks live status, explains what changed, and prepares the next safe step for your approval." },
] as const;

const importOptions = [
  { icon: CalendarDays, title: "Connect Google", body: "Find flight reservations already added to your calendar.", label: "Easiest" },
  { icon: Mail, title: "Paste confirmation", body: "Copy the airline or travel-agent email. We extract the itinerary.", label: "Fast" },
  { icon: FileText, title: "Upload itinerary", body: "Use the issued PDF or screenshot you already have.", label: "Flexible" },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#102A43]">
      <header className="sticky top-0 z-40 border-b border-[#D9E2EC]/80 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" aria-label="SafarSet home"><SafarSetLogo /></Link>
          <nav className="hidden items-center gap-7 text-sm text-[#52606D] md:flex" aria-label="Public navigation">
            <a href="#how-it-works" className="transition hover:text-[#102A43]">How it works</a>
            <a href="#family-rules" className="transition hover:text-[#102A43]">Family rules</a>
            <a href="#safety" className="transition hover:text-[#102A43]">Safety</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link className="hidden rounded-lg px-3 py-2.5 text-sm font-medium text-[#334E68] hover:bg-[#F0F4F8] sm:block" href="/login">Sign in</Link>
            <Link className="inline-flex items-center gap-2 rounded-lg bg-[#102A43] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#243B53]" href="/signup">Protect a trip <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#D9E2EC] bg-[#F7FAFC]">
        <div className="route-map" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:min-h-[690px] lg:grid-cols-[.92fr_1.08fr] lg:px-8 lg:py-24">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B8E8EA] bg-white px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#147D92]">
              <span className="size-1.5 rounded-full bg-[#2CB1BC]" /> Private beta for Indian families
            </div>
            <h1 className="mt-7 font-serif text-[3.35rem] leading-[0.94] tracking-[-0.055em] text-[#102A43] sm:text-7xl lg:text-[5.35rem]">
              When a family trip changes, <span className="text-[#147D92]">know what happens next.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#52606D]">
              SafarSet keeps your itinerary, family rules, and live flight status together. When something changes, it prepares one clear response for you to review.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#102A43] px-5 py-3.5 font-medium text-white transition hover:bg-[#243B53]" href="/signup">Protect my next trip <ArrowRight className="size-4" /></Link>
              <a className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#BCCCDC] bg-white px-5 py-3.5 font-medium text-[#243B53] transition hover:border-[#829AB1]" href="#recovery-example"><MessageSquareText className="size-4" /> See a recovery example</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#52606D]">
              <span className="flex items-center gap-2"><CircleCheck className="size-4 text-[#2CB1BC]" /> Your rules decide</span>
              <span className="flex items-center gap-2"><CircleCheck className="size-4 text-[#2CB1BC]" /> Sources stay visible</span>
              <span className="flex items-center gap-2"><CircleCheck className="size-4 text-[#2CB1BC]" /> You approve changes</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[640px] lg:justify-self-end">
            <div className="absolute -inset-8 rounded-full bg-[#2CB1BC]/10 blur-3xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[28px] border border-[#BCCCDC] bg-white shadow-[0_30px_90px_rgba(16,42,67,.18)]">
              <div className="relative h-44 overflow-hidden sm:h-52">
                <Image src="/brand/family-travel-control-hero.png" alt="An Indian family at an airport" fill priority className="object-cover object-[center_42%]" sizes="(min-width: 1024px) 48vw, 100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102A43]/85 via-[#102A43]/10 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between text-white sm:inset-x-7">
                  <div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#B8E8EA]">Illustrative trip</p><p className="mt-1 text-xl font-semibold">Family trip to Bali</p></div>
                  <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs backdrop-blur">4 travellers</span>
                </div>
              </div>
              <div className="p-5 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div><p className="font-mono text-2xl font-semibold">DEL</p><p className="text-xs text-[#627D98]">Delhi</p></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#2CB1BC]" /><span className="h-0.5 flex-1 bg-[#2CB1BC]" /><Plane className="size-4 rotate-90 text-[#147D92]" /><span className="h-0.5 flex-1 bg-[#F6AD55]" /><span className="route-pulse size-2.5 rounded-full bg-[#F6AD55]" /></div>
                    <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[.14em] text-[#7B8794]">Singapore connection · watching</p>
                  </div>
                  <div className="text-right"><p className="font-mono text-2xl font-semibold">DPS</p><p className="text-xs text-[#627D98]">Bali</p></div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Signal label="Trip status" value="Needs attention" tone="amber" />
                  <Signal label="Family rule" value="Keep together" />
                  <Signal label="Spend limit" value="₹80,000" />
                </div>
                <div className="mt-4 rounded-xl border border-[#F6AD55]/50 bg-[#FFF8EC] p-4">
                  <div className="flex items-start gap-3"><Radar className="mt-0.5 size-5 shrink-0 text-[#B76E00]" /><div><p className="text-sm font-semibold">The connection may be missed</p><p className="mt-1 text-sm leading-6 text-[#7B6232]">SafarSet would check the saved rules and prepare eligible options. A booking still needs approval.</p></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#D9E2EC] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#147D92]">Bring the booking you already have</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">Start without typing every flight detail.</h2></div><Link className="text-sm font-medium text-[#147D92]" href="/signup">Add manually instead →</Link></div>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {importOptions.map(({ icon: Icon, title, body, label }) => <Link key={title} href="/signup" className="group flex items-start gap-4 rounded-2xl border border-[#D9E2EC] p-5 transition hover:-translate-y-0.5 hover:border-[#2CB1BC] hover:shadow-[0_14px_35px_rgba(16,42,67,.08)]"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#E3F8F8] text-[#147D92]"><Icon className="size-5" /></span><span className="min-w-0"><span className="flex items-center gap-2"><strong className="text-sm">{title}</strong><span className="font-mono text-[9px] uppercase text-[#7B8794]">{label}</span></span><span className="mt-1 block text-sm leading-6 text-[#627D98]">{body}</span></span><ArrowRight className="ml-auto mt-2 size-4 shrink-0 text-[#9FB3C8] transition group-hover:translate-x-1 group-hover:text-[#147D92]" /></Link>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#147D92]">One trip, one source of truth</p><h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Less form filling. More useful decisions.</h2></div><p className="max-w-xl text-base leading-7 text-[#627D98] lg:justify-self-end">SafarSet asks only for information it could not import. You check the result before anything is saved.</p></div>
        <div className="mt-14 grid gap-0 border-y border-[#D9E2EC] md:grid-cols-3">
          {operatingSteps.map((step, index) => <article key={step.title} className="relative border-b border-[#D9E2EC] py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"><span className="font-mono text-xs text-[#147D92]">0{index + 1}</span><h3 className="mt-8 text-xl font-semibold">{step.title}</h3><p className="mt-3 max-w-sm text-sm leading-6 text-[#627D98]">{step.body}</p></article>)}
        </div>
      </section>

      <section id="recovery-example" className="bg-[#102A43] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:px-8 lg:py-28">
          <div><p className="font-mono text-xs uppercase tracking-[.18em] text-[#67E8E8]">A response you can inspect</p><h2 className="mt-4 font-serif text-5xl leading-[.98] tracking-[-.045em]">One recommendation. Every rule explained.</h2><p className="mt-6 max-w-lg text-base leading-7 text-[#BCCCDC]">The engine filters unsafe or disallowed routes first. The agent explains the result, but it does not rewrite your policy or approve spend.</p><div className="mt-8 space-y-3 text-sm text-[#D9E2EC]"><CheckLine text="All four seats are available" /><CheckLine text="No self-transfer" /><CheckLine text="Connection exceeds 90 minutes" /><CheckLine text="Within the saved approval limit" /></div></div>
          <div className="overflow-hidden rounded-3xl border border-white/15 bg-[#0B2135] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5 sm:px-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#2CB1BC] text-[#102A43]"><Sparkles className="size-4" /></span><div><p className="text-sm font-semibold">Prepared response</p><p className="text-xs text-[#9FB3C8]">Based on saved family rules</p></div></div><span className="rounded-full bg-[#FFF3D6] px-2.5 py-1 font-mono text-[9px] text-[#8D5A00]">APPROVAL NEEDED</span></div>
            <div className="p-5 sm:p-6"><p className="text-lg font-semibold">Keep the family on the same route via Singapore</p><p className="mt-3 text-sm leading-6 text-[#BCCCDC]">This option keeps all four travellers together, avoids an overnight wait, and stays inside the additional-spend limit.</p><div className="mt-6 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-3"><Result label="Arrival" value="19:40 local" /><Result label="Added cost" value="₹46,200" /><Result label="Confidence" value="High" /></div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><button className="rounded-lg bg-[#2CB1BC] px-4 py-3 text-sm font-semibold text-[#102A43]" type="button">Review this option</button><button className="rounded-lg border border-white/15 px-4 py-3 text-sm font-medium text-white" type="button">See why others failed</button></div><p className="mt-4 font-mono text-[9px] uppercase tracking-[.12em] text-[#829AB1]">Example only · no live inventory · no booking executed</p></div>
          </div>
        </div>
      </section>

      <div id="family-rules"><PublicPolicyStarter /></div>

      <section id="safety" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><span className="grid size-12 place-items-center rounded-2xl bg-[#102A43] text-white"><BadgeCheck className="size-6" /></span><h2 className="mt-7 text-4xl font-semibold tracking-[-.05em]">Know what SafarSet can and cannot do.</h2><p className="mt-5 max-w-lg text-base leading-7 text-[#627D98]">A travel product should separate live facts, system recommendations, and actions that still belong to the traveller.</p></div><div className="grid gap-3 sm:grid-cols-2"><BoundaryCard icon={Radar} title="Live checks" body="Checks provider status when the operator has configured a live source." /><BoundaryCard icon={ShieldCheck} title="Rule decisions" body="Deterministic checks decide whether an option follows your family policy." /><BoundaryCard icon={MessageSquareText} title="Clear explanation" body="The agent translates structured results into plain language." /><BoundaryCard icon={UsersRound} title="Your approval" body="Bookings, changes, cancellations, and payments remain yours to approve." /></div></div>
      </section>

      <section className="border-t border-[#D9E2EC] bg-[#F7FAFC] px-5 py-20 lg:py-28"><div className="mx-auto max-w-5xl text-center"><PlaneTakeoff className="mx-auto size-7 text-[#147D92]" /><h2 className="mt-6 font-serif text-5xl tracking-[-.05em]">Bring the trip you already booked.</h2><p className="mx-auto mt-5 max-w-xl leading-7 text-[#627D98]">The beta is limited to a small group while live connections and recovery workflows are tested.</p><Link className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#102A43] px-5 py-3.5 font-medium text-white hover:bg-[#243B53]" href="/signup">Protect a trip <ArrowRight className="size-4" /></Link></div></section>

      <footer className="border-t border-[#D9E2EC] bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-[#627D98] sm:flex-row sm:items-center sm:justify-between lg:px-8"><SafarSetLogo /><div className="flex flex-wrap gap-5"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/brand">Brand kit</Link><Link href="/login">Sign in</Link></div></div></footer>
    </main>
  );
}

function Signal({ label, value, tone = "cyan" }: Readonly<{ label: string; value: string; tone?: "cyan" | "amber" }>) { return <div className="rounded-xl bg-[#F7FAFC] p-3"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-[#7B8794]">{label}</p><p className={`mt-1 text-xs font-semibold ${tone === "amber" ? "text-[#9C5700]" : "text-[#102A43]"}`}>{value}</p></div>; }
function CheckLine({ text }: Readonly<{ text: string }>) { return <div className="flex items-center gap-3"><Check className="size-4 text-[#67E8E8]" />{text}</div>; }
function Result({ label, value }: Readonly<{ label: string; value: string }>) { return <div className="bg-white/5 p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-[#829AB1]">{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>; }
function BoundaryCard({ icon: Icon, title, body }: Readonly<{ icon: typeof Radar; title: string; body: string }>) { return <article className="rounded-2xl border border-[#D9E2EC] bg-white p-5"><span className="grid size-10 place-items-center rounded-xl bg-[#E3F8F8] text-[#147D92]"><Icon className="size-5" /></span><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#627D98]">{body}</p></article>; }
