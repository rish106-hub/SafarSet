import type { Metadata } from "next";
import Link from "next/link";
import { SafarSetLogo } from "@/components/brand/logo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AuthForm } from "../login/auth-form";

export const metadata: Metadata = { title: "Join the beta" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const hasStarter = from === "starter";
  return <main className="grid min-h-screen bg-[#F7FAFC] lg:grid-cols-[.9fr_1.1fr]"><section className="flex flex-col justify-between bg-[#102A43] p-7 text-white sm:p-10 lg:p-14"><Link href="/"><SafarSetLogo className="[&_span]:text-white" /></Link><div className="my-16 max-w-lg"><p className="font-mono text-xs uppercase tracking-[.18em] text-[#67E8E8]">Invite-only beta</p><h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-[-.05em]">Set up your family travel system.</h1><p className="mt-6 text-base leading-7 text-[#BCCCDC]">Create the account, confirm family defaults, then import the first trip. No public demo data is mixed into your workspace.</p>{hasStarter && <div className="mt-8 rounded-xl border border-[#2CB1BC]/30 bg-[#2CB1BC]/10 p-4"><div className="flex items-center justify-between text-xs"><span className="font-medium text-[#67E8E8]">Starter policy ready</span><span className="font-mono text-[#67E8E8]">1 OF 4</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-1/4 rounded-full bg-[#2CB1BC]" /></div><p className="mt-3 text-sm leading-6 text-[#BCCCDC]">Your local draft comes with you. After signup, you decide whether to apply it.</p></div>}</div><p className="text-xs text-[#829AB1]">Already approved? Google sign-in is the fastest route back.</p></section><section className="flex items-center justify-center px-5 py-12"><div className="w-full max-w-md rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-[0_24px_70px_rgba(16,42,67,.08)] sm:p-8"><h2 className="text-2xl font-semibold tracking-[-.035em]">Join SafarSet</h2><p className="mt-2 text-sm leading-6 text-[#627D98]">You need an invite code for a new account.</p><div className="mt-7"><AuthForm configured={isSupabaseConfigured()} initialMode="signup" /></div></div></section></main>;
}
