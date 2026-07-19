import Link from "next/link";
import { SafarSetLogo } from "@/components/brand/logo";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return <main className="min-h-screen bg-[#F7FAFC]"><header className="border-b bg-white"><div className="mx-auto max-w-4xl px-5 py-5"><Link href="/"><SafarSetLogo /></Link></div></header><article className="mx-auto max-w-3xl px-5 py-16"><p className="font-mono text-xs uppercase tracking-[.16em] text-[#147D92]">Private beta</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.05em]">Beta terms</h1><div className="mt-8 space-y-6 text-base leading-7 text-[#52606D]"><p>SafarSet provides planning, monitoring, and recovery guidance. It is not an airline, travel agency, insurer, or payment provider.</p><p>Flight status and imported itinerary data can be incomplete or delayed. Check critical information with the airline or booking provider.</p><p>No booking, cancellation, ticket change, payment, loyalty enrolment, or financial product application is completed without a separate user confirmation and a capable provider.</p><p>Beta access may change or stop. Do not use SafarSet as the only source for safety, visa, immigration, medical, or time-critical travel decisions.</p><p>These terms need legal review before a public launch.</p></div><Link className="mt-10 inline-flex text-sm font-medium text-[#147D92]" href="/">← Back home</Link></article></main>;
}
