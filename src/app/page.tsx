import { ArrowRight, CalendarSync, CircleCheck, Radar, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import { SafarSetLogo } from "@/components/brand/logo";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function Home() {
  const configured = isSupabaseConfigured();
  return (
    <main className="min-h-screen bg-[#F7FAFC] text-[#102A43]">
      <header className="border-b border-[#D9E2EC] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <SafarSetLogo />
          <nav className="flex items-center gap-3 text-sm">
            <Link className="hidden text-[#52606D] hover:text-[#102A43] sm:block" href="/brand">Brand system</Link>
            <Link className="rounded-lg bg-[#102A43] px-4 py-2.5 font-medium text-white hover:bg-[#243B53]" href="/login">
              {configured ? "Sign in" : "Configure beta"}
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#D9E2EC]">
        <div className="route-map" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#147D92]">
              Family travel recovery control
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#102A43] sm:text-6xl lg:text-7xl">
              Set the rules before the trip goes wrong.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#52606D]">
              Add real trips, connect a calendar, monitor live flight status, and review recovery options against your own family constraints.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#102A43] px-5 py-3.5 font-medium text-white hover:bg-[#243B53]" href="/login">
                Open the private beta <ArrowRight className="size-4" />
              </Link>
              <a className="inline-flex items-center justify-center rounded-lg border border-[#BCCCDC] bg-white px-5 py-3.5 font-medium text-[#243B53] hover:border-[#829AB1]" href="#how-it-works">
                See how it works
              </a>
            </div>
            <p className="mt-4 text-xs text-[#7B8794]">Built for a small private beta. No real booking is claimed.</p>
          </div>

          <div className="relative rounded-2xl border border-[#BCCCDC] bg-white p-5 shadow-[0_24px_70px_rgba(16,42,67,0.12)] sm:p-7">
            <div className="flex items-center justify-between border-b border-[#E4E7EB] pb-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#7B8794]">Recovery policy</p>
                <p className="mt-1 text-lg font-semibold">The system follows your limits</p>
              </div>
              <span className="rounded-full bg-[#E3F8F8] px-3 py-1 font-mono text-xs text-[#147D92]">YOU CONTROL</span>
            </div>
            <div className="mt-5 space-y-3">
              {["Keep everyone on the same itinerary", "Block self-transfer routes", "Set cabin, stop, transit, and spend limits", "Require approval above your chosen amount"].map((item) => (
                <div className="flex items-start gap-3 rounded-xl bg-[#F0F4F8] p-4" key={item}>
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-[#2CB1BC]" />
                  <span className="text-sm leading-6 text-[#334E68]">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#F6AD55]/50 bg-[#FFF8EC] p-4">
              <span className="grid size-9 place-items-center rounded-full bg-[#F6AD55] text-[#102A43]">!</span>
              <div><p className="text-sm font-semibold">Live data is evidence, not authority.</p><p className="mt-0.5 text-xs text-[#7B6232]">Bad or missing provider data is shown clearly.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#147D92]">A practical beta workflow</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em]">Real inputs. Explicit limits. Reviewable output.</h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[#D9E2EC] bg-[#D9E2EC] md:grid-cols-3">
          <Feature icon={CalendarSync} title="Bring in a trip" body="Add it manually or connect Google Calendar. Imported details always require confirmation." />
          <Feature icon={SlidersHorizontal} title="Set recovery controls" body="Choose family, transfer, cabin, connection, transit, timing, and spend rules." />
          <Feature icon={Radar} title="Check live options" body="Fetch live status and alternatives when credentials exist. Never hide provider failure." />
        </div>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, body }: Readonly<{ icon: typeof Radar; title: string; body: string }>) {
  return <article className="bg-white p-7 sm:p-8"><Icon className="size-6 text-[#147D92]" /><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-[#627D98]">{body}</p></article>;
}
