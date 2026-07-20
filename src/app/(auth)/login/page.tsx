import type { Metadata } from "next";
import Link from "next/link";

import { SafarSetLogo } from "@/components/brand/logo";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { AuthForm } from "./auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const errorMessage = error === "invite_required" ? "This Google account has not been approved for the private beta." : error === "google" || error === "callback" ? "Google sign-in could not be completed." : null;
  return (
    <main className="grid min-h-screen bg-[#F7FAFC] lg:grid-cols-[.9fr_1.1fr]">
      <section className="flex flex-col justify-between bg-[#102A43] p-7 text-white sm:p-10 lg:p-14">
        <Link href="/"><SafarSetLogo className="[&_span]:text-white" /></Link>
        <div className="my-16 max-w-lg">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#67E8E8]">Private beta</p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-[-0.05em]">Your trips. Your recovery rules.</h1>
          <p className="mt-6 text-base leading-7 text-[#BCCCDC]">No shared demo account. Every trip and policy belongs to the signed-in customer.</p>
        </div>
        <p className="text-xs text-[#829AB1]">Admin access is role-based and not linked from the customer interface.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-[0_24px_70px_rgba(16,42,67,0.08)] sm:p-8">
          <h2 className="text-2xl font-semibold tracking-[-0.035em] text-[#102A43]">Access SafarSet</h2>
          <p className="mt-2 text-sm leading-6 text-[#627D98]">Use Google or your beta account.</p>
          {errorMessage && <p className="mt-5 rounded-lg border border-[#F6AD55]/60 bg-[#FFF8EC] px-4 py-3 text-sm text-[#7B4B00]" role="alert">{errorMessage}</p>}
          <div className="mt-7"><AuthForm configured={isSupabaseConfigured()} next={next} /></div>
        </div>
      </section>
    </main>
  );
}
