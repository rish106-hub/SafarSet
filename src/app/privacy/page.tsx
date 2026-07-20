import Link from "next/link";
import { SafarSetLogo } from "@/components/brand/logo";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return <main className="min-h-screen bg-[#F7FAFC]"><header className="border-b bg-white"><div className="mx-auto max-w-4xl px-5 py-5"><Link href="/"><SafarSetLogo /></Link></div></header><article className="mx-auto max-w-3xl px-5 py-16"><p className="font-mono text-xs uppercase tracking-[.16em] text-[#147D92]">Private beta</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.05em]">Privacy summary</h1><div className="mt-8 space-y-6 text-base leading-7 text-[#52606D]"><p>SafarSet stores the account, family preferences, trips, policy rules, and agent transcripts you choose to save. Supabase provides authentication and database storage.</p><p>Google sign-in is used only for account access. Google Calendar needs a separate, read-only consent. Calendar tokens are encrypted before storage.</p><p>Voice audio is processed for transcription and is not saved. The resulting text can be stored in your agent conversation.</p><p>SafarSet does not sell personal data. During beta, contact the operator to request access, correction, export, or deletion.</p><p>This is a beta summary, not a substitute for a reviewed production privacy policy.</p></div><Link className="mt-10 inline-flex text-sm font-medium text-[#147D92]" href="/">← Back home</Link></article></main>;
}
