import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SafarSetLogo } from "@/components/brand/logo";

export const metadata: Metadata = { title: "Brand system" };

export default function BrandPage() {
  return (
    <main className="min-h-screen bg-[#F7FAFC] px-5 py-10 text-[#102A43] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <SafarSetLogo />
          <Link className="text-sm font-medium text-[#147D92]" href="/">Back home</Link>
        </div>
        <header className="my-12 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#147D92]">Brand kit / beta 01</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em]">Calm control when plans break.</h1>
          <p className="mt-5 text-lg leading-8 text-[#52606D]">The route line becomes an S. Cyan means movement. Amber is reserved for disruption and action.</p>
        </header>
        <Image className="h-auto w-full rounded-2xl border border-[#D9E2EC] shadow-[0_20px_60px_rgba(16,42,67,0.1)]" src="/brand/safarset-brand-kit.png" width={1672} height={941} priority alt="SafarSet brand kit showing logo, colors, typography, route graphics, and application language" />
      </div>
    </main>
  );
}
