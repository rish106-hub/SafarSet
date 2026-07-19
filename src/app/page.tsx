import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CircleCheck,
  CreditCard,
  Headphones,
  MapPinned,
  MessageSquareText,
  PlaneTakeoff,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SafarSetLogo } from "@/components/brand/logo";
import { PublicPolicyStarter } from "@/features/policy/public-policy-starter";

const operatingSteps = [
  { icon: MapPinned, number: "01", title: "Plan", body: "Tell the agent where your family wants to go. It turns the brief into a reviewable plan." },
  { icon: CalendarCheck, number: "02", title: "Prepare", body: "Import confirmed trips and keep the itinerary, travellers, and important details together." },
  { icon: ShieldCheck, number: "03", title: "Protect", body: "Set cabin, connection, transit, family, timing, and spend limits once." },
  { icon: Headphones, number: "04", title: "Act", body: "Get live status checks and a clear next step when travel changes. You approve irreversible actions." },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#102A43]">
      <header className="sticky top-0 z-40 border-b border-[#D9E2EC]/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
          <SafarSetLogo />
          <nav className="hidden items-center gap-7 text-sm text-[#52606D] md:flex" aria-label="Public navigation">
            <a href="#how-it-works" className="hover:text-[#102A43]">How it works</a>
            <a href="#safety" className="hover:text-[#102A43]">Safety</a>
            <a href="#next" className="hover:text-[#102A43]">What is next</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link className="hidden rounded-lg px-3 py-2.5 text-sm font-medium text-[#334E68] hover:bg-[#F0F4F8] sm:block" href="/login">Sign in</Link>
            <Link className="inline-flex items-center gap-2 rounded-lg bg-[#102A43] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#243B53]" href="/signup">Request beta access <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#D9E2EC] bg-[#F7FAFC]">
        <div className="mx-auto grid max-w-7xl lg:min-h-[680px] lg:grid-cols-[1.02fr_.98fr]">
          <div className="relative z-10 flex items-center px-5 py-20 lg:px-8 lg:py-28">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B8E8EA] bg-[#E3F8F8] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#147D92]">
                <span className="size-1.5 rounded-full bg-[#2CB1BC]" /> Private beta for Indian families
              </div>
              <h1 className="mt-7 text-5xl font-semibold leading-[.98] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                Your family travel agent, <span className="text-[#147D92]">before and after take-off.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#52606D]">
                Plan a trip, keep every booking in one place, set your family rules, and get a clear recovery path when plans change.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#102A43] px-5 py-3.5 font-medium text-white hover:bg-[#243B53]" href="#starter-policy">Build my travel rules <ArrowRight className="size-4" /></a>
                <a className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#BCCCDC] bg-white px-5 py-3.5 font-medium text-[#243B53] hover:border-[#829AB1]" href="#agent-preview"><MessageSquareText className="size-4" /> See the agent</a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#52606D]">
                <span className="flex items-center gap-2"><CircleCheck className="size-4 text-[#2CB1BC]" /> Google sign-in</span>
                <span className="flex items-center gap-2"><CircleCheck className="size-4 text-[#2CB1BC]" /> Your rules decide</span>
                <span className="flex items-center gap-2"><CircleCheck className="size-4 text-[#2CB1BC]" /> No booking without approval</span>
              </div>
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden lg:min-h-full">
            <Image src="/brand/family-travel-control-hero.png" alt="An Indian family preparing together in an airport terminal" fill priority className="object-cover object-center" sizes="(min-width: 1024px) 49vw, 100vw" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F7FAFC] via-transparent to-transparent lg:block hidden" />
            <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-white/70 bg-white/92 p-4 shadow-xl backdrop-blur sm:left-auto sm:right-8 sm:w-80">
              <div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.14em] text-[#147D92]">Travel watch</span><span className="size-2 rounded-full bg-[#2CB1BC] shadow-[0_0_0_5px_rgba(44,177,188,.15)]" /></div>
              <p className="mt-3 font-semibold">AI 202 · Delhi to Singapore</p>
              <p className="mt-1 text-sm text-[#627D98]">On time. Family policy attached.</p>
            </div>
          </div>
        </div>
      </section>

      <PublicPolicyStarter />

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#147D92]">One operating system for the whole trip</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><h2 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Less form filling. More useful decisions.</h2><p className="max-w-2xl text-base leading-7 text-[#627D98] lg:justify-self-end">Start with a sentence, a calendar import, or an itinerary. SafarSet asks only for missing details and never hides what still needs checking.</p></div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[#D9E2EC] bg-[#D9E2EC] md:grid-cols-2 lg:grid-cols-4">
          {operatingSteps.map(({ icon: Icon, number, title, body }) => <article key={title} className="bg-white p-6 sm:p-7"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[#E3F8F8] text-[#147D92]"><Icon className="size-5" /></span><span className="font-mono text-xs text-[#9FB3C8]">{number}</span></div><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#627D98]">{body}</p></article>)}
        </div>
      </section>

      <section id="agent-preview" className="bg-[#102A43] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.82fr_1.18fr] lg:items-center lg:px-8 lg:py-28">
          <div><p className="font-mono text-xs uppercase tracking-[.18em] text-[#67E8E8]">SafarSet agent</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Start with what you know.</h2><p className="mt-6 max-w-lg text-base leading-7 text-[#BCCCDC]">Type or speak naturally. The agent reads your saved trips and rules, then drafts the next useful step. It cannot silently spend money or change a booking.</p><div className="mt-8 space-y-3 text-sm text-[#D9E2EC]"><CheckLine text="Understands a travel brief" /><CheckLine text="Finds your saved trip and rules" /><CheckLine text="Checks live flight status when available" /><CheckLine text="Stops before booking or payment" /></div></div>
          <div className="rounded-3xl border border-white/15 bg-white/7 p-4 shadow-2xl backdrop-blur sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#2CB1BC] text-[#102A43]"><Sparkles className="size-4" /></span><div><p className="text-sm font-semibold">Travel agent</p><p className="text-xs text-[#9FB3C8]">Reads your saved context</p></div></div><span className="rounded-full bg-[#2CB1BC]/15 px-2.5 py-1 font-mono text-[10px] text-[#67E8E8]">REVIEW FIRST</span></div>
            <div className="space-y-4 py-6"><div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#2CB1BC] px-4 py-3 text-sm leading-6 text-[#102A43]">Plan a calm 7-day Bali trip for us in October. Two adults, two children. Avoid overnight flights.</div><div className="max-w-[90%] rounded-2xl rounded-bl-md bg-white px-4 py-4 text-sm leading-6 text-[#334E68]"><p>I have your family rule: stay together and avoid overnight travel.</p><p className="mt-3">I need two details before I draft the route:</p><ol className="mt-2 list-decimal space-y-1 pl-5"><li>Your departure city</li><li>Your total trip budget</li></ol></div></div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0B2135] p-3 text-sm text-[#829AB1]"><span className="flex-1">Ask about a trip or plan one…</span><span className="grid size-9 place-items-center rounded-lg bg-white/10"><MessageSquareText className="size-4" /></span></div>
          </div>
        </div>
      </section>

      <section id="safety" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="grid gap-10 rounded-3xl bg-[#F0F4F8] p-6 sm:p-10 lg:grid-cols-[.9fr_1.1fr] lg:p-14"><div><span className="grid size-12 place-items-center rounded-2xl bg-[#102A43] text-white"><BadgeCheck className="size-6" /></span><h2 className="mt-7 text-4xl font-semibold tracking-[-.05em]">Agency without hidden risk.</h2><p className="mt-5 text-base leading-7 text-[#627D98]">Travel software should say what it knows, what it inferred, and what it cannot do.</p></div><div className="grid gap-3 sm:grid-cols-2"><SafetyCard title="Rules beat prose" body="Your hard constraints are checked by deterministic code, not an AI opinion." /><SafetyCard title="Sources stay visible" body="Live, imported, and user-entered data are labelled. Provider failures remain visible." /><SafetyCard title="Approval is mandatory" body="A final confirmation is required before any booking, change, cancellation, or payment." /><SafetyCard title="Audio is temporary" body="Voice recordings are deleted after transcription. Only the text can be saved to the conversation." /></div></div></section>

      <section id="next" className="border-y border-[#D9E2EC] bg-[#F7FAFC]"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><p className="font-mono text-xs uppercase tracking-[.18em] text-[#147D92]">Planned, not yet available</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.05em]">The useful layer around every trip.</h2><div className="mt-10 grid gap-4 md:grid-cols-2"><FutureCard icon={CreditCard} title="Travel Wallet" body="See which cards you already hold, which benefits apply, and where a different card may fit your real travel pattern." /><FutureCard icon={UsersRound} title="Loyalty Compass" body="Compare airline and hotel programmes before opening an account. SafarSet will recommend, never enrol on your behalf." /></div></div></section>

      <section className="px-5 py-20 lg:py-28"><div className="mx-auto max-w-5xl rounded-3xl bg-[#102A43] px-6 py-14 text-center text-white sm:px-12"><PlaneTakeoff className="mx-auto size-7 text-[#67E8E8]" /><h2 className="mt-6 text-4xl font-semibold tracking-[-.05em]">Bring your next family trip.</h2><p className="mx-auto mt-4 max-w-xl text-[#BCCCDC]">The beta is invite-only while we test with a small group of families.</p><Link className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#2CB1BC] px-5 py-3.5 font-medium text-[#102A43] hover:bg-[#67E8E8]" href="/signup">Request access <ArrowRight className="size-4" /></Link></div></section>

      <footer className="border-t border-[#D9E2EC] bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-[#627D98] sm:flex-row sm:items-center sm:justify-between lg:px-8"><SafarSetLogo /><div className="flex gap-5"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/brand">Brand kit</Link><Link href="/login">Sign in</Link></div></div></footer>
    </main>
  );
}

function CheckLine({ text }: Readonly<{ text: string }>) { return <div className="flex items-center gap-3"><CircleCheck className="size-4 text-[#67E8E8]" />{text}</div>; }
function SafetyCard({ title, body }: Readonly<{ title: string; body: string }>) { return <article className="rounded-2xl border border-[#D9E2EC] bg-white p-5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#627D98]">{body}</p></article>; }
function FutureCard({ icon: Icon, title, body }: Readonly<{ icon: typeof CreditCard; title: string; body: string }>) { return <article className="rounded-2xl border border-[#D9E2EC] bg-white p-6"><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-[#E3F8F8] text-[#147D92]"><Icon className="size-5" /></span><span className="rounded-full bg-[#FFF3D6] px-2.5 py-1 font-mono text-[10px] text-[#8D5A00]">PLANNED</span></div><h3 className="mt-6 text-xl font-semibold">{title}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-[#627D98]">{body}</p></article>; }
