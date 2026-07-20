"use client";

import { Check, ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { familySafeStarterPolicy, readStarterPolicy, STARTER_POLICY_STORAGE_KEY, type StarterPolicy } from "./starter-policy";

export function PublicPolicyStarter() {
  const [policy, setPolicy] = useState<StarterPolicy>(familySafeStarterPolicy);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = readStarterPolicy(window.localStorage.getItem(STARTER_POLICY_STORAGE_KEY));
      if (stored) { setPolicy(stored); setSaved(true); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function update(next: StarterPolicy) {
    setPolicy(next);
    window.localStorage.setItem(STARTER_POLICY_STORAGE_KEY, JSON.stringify(next));
    setSaved(true);
  }

  return <section id="starter-policy" className="border-y border-[#D9E2EC] bg-[#F7FAFC]"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[.72fr_1.28fr] lg:items-start lg:px-8 lg:py-28"><div className="lg:sticky lg:top-28"><p className="font-mono text-xs font-semibold uppercase tracking-[.18em] text-[#147D92]">Try it before signup</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Build your starter travel policy.</h2><p className="mt-5 max-w-lg text-base leading-7 text-[#627D98]">Four choices. No account needed. We start with conservative family defaults, and you change only what is wrong.</p><div className="mt-7 flex items-start gap-3 rounded-xl border border-[#B8E8EA] bg-[#E3F8F8] p-4 text-sm leading-6 text-[#147D92]"><ShieldCheck className="mt-0.5 size-5 shrink-0" /><p>The draft stays in this browser. Nothing is uploaded until you create an account and choose to apply it.</p></div></div><div className="overflow-hidden rounded-3xl border border-[#BCCCDC] bg-white shadow-[0_20px_60px_rgba(16,42,67,.08)]"><div className="border-b border-[#E4E7EB] px-5 py-5 sm:px-7"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Family-safe starter</p><p className="mt-1 text-xs text-[#7B8794]">Smart defaults, editable now</p></div><span className="rounded-full bg-[#E3F8F8] px-2.5 py-1 font-mono text-[10px] text-[#147D92]">LOCAL DRAFT</span></div></div><div className="grid gap-px bg-[#E4E7EB] sm:grid-cols-2"><Choice title="Travel together" description="Reject options that split the family." active={policy.requireFamilyTogether} onClick={() => update({ ...policy, requireFamilyTogether: !policy.requireFamilyTogether })} /><Choice title="Avoid overnight waits" description="Prefer daytime connections." active={policy.avoidOvernight} onClick={() => update({ ...policy, avoidOvernight: !policy.avoidOvernight })} /><SelectChoice label="Maximum stops" value={policy.maxStops} options={[0, 1, 2]} onChange={(value) => update({ ...policy, maxStops: value as StarterPolicy["maxStops"] })} suffix="" /><SelectChoice label="Minimum connection" value={policy.minimumConnectionMinutes} options={[60, 90, 120]} onChange={(value) => update({ ...policy, minimumConnectionMinutes: value as StarterPolicy["minimumConnectionMinutes"] })} suffix=" min" /></div><div className="bg-[#102A43] p-5 text-white sm:p-7"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#67E8E8]">Your policy summary</p><p className="mt-3 text-lg leading-8">{policy.requireFamilyTogether ? "Keep everyone together" : "Family split allowed"}. Up to {policy.maxStops} stop{policy.maxStops === 1 ? "" : "s"}, at least {policy.minimumConnectionMinutes} minutes to connect{policy.avoidOvernight ? ", and avoid overnight waits" : ""}.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"><Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2CB1BC] px-5 py-3 font-medium text-[#102A43] hover:bg-[#67E8E8]" href="/signup?from=starter">Save this to SafarSet <ChevronRight className="size-4" /></Link><p className="text-xs text-[#9FB3C8]">{saved ? "Draft saved on this device." : "Change one choice to save the draft."}</p></div></div></div></div></section>;
}

function Choice({ title, description, active, onClick }: Readonly<{ title: string; description: string; active: boolean; onClick: () => void }>) {
  return <button type="button" aria-pressed={active} onClick={onClick} className="flex min-h-32 items-start gap-4 bg-white p-5 text-left hover:bg-[#F7FAFC] sm:p-7"><span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border ${active ? "border-[#2CB1BC] bg-[#2CB1BC] text-[#102A43]" : "border-[#BCCCDC] text-transparent"}`}><Check className="size-3.5" /></span><span><span className="block font-semibold text-[#102A43]">{title}</span><span className="mt-2 block text-sm leading-6 text-[#627D98]">{description}</span></span></button>;
}

function SelectChoice({ label, value, options, onChange, suffix }: Readonly<{ label: string; value: number; options: readonly number[]; onChange: (value: number) => void; suffix: string }>) {
  return <div className="min-h-32 bg-white p-5 sm:p-7"><label className="text-sm font-semibold text-[#102A43]">{label}<select className="field mt-3" value={value} onChange={(event) => onChange(Number(event.target.value))}>{options.map((option) => <option key={option} value={option}>{option}{suffix}</option>)}</select></label></div>;
}
