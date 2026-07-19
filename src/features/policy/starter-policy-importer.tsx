"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { applyStarterPolicyAction } from "./apply-starter-action";
import { readStarterPolicy, STARTER_POLICY_STORAGE_KEY, type StarterPolicy } from "./starter-policy";

export function StarterPolicyImporter() {
  const [draft, setDraft] = useState<StarterPolicy | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  useEffect(() => { const timer = window.setTimeout(() => setDraft(readStarterPolicy(window.localStorage.getItem(STARTER_POLICY_STORAGE_KEY))), 0); return () => window.clearTimeout(timer); }, []);
  if (!draft) return null;
  function apply() {
    startTransition(async () => {
      const result = await applyStarterPolicyAction(draft);
      if (!result.success) { setMessage(result.error ?? "The policy could not be applied."); return; }
      window.localStorage.removeItem(STARTER_POLICY_STORAGE_KEY); setDraft(null); setMessage("Starter policy applied."); router.refresh();
    });
  }
  return <div className="mb-5 rounded-2xl border border-[#B8E8EA] bg-[#E3F8F8] p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[#147D92]"><Download className="size-5" /></span><div className="flex-1"><h2 className="font-semibold">Your starter policy is ready</h2><p className="mt-1 text-sm leading-6 text-[#147D92]">{draft.requireFamilyTogether ? "Keep family together" : "Family split allowed"}, up to {draft.maxStops} stop{draft.maxStops === 1 ? "" : "s"}, {draft.minimumConnectionMinutes}-minute connections{draft.avoidOvernight ? ", avoid overnight waits" : ""}.</p></div><button type="button" onClick={apply} disabled={pending} className="button-primary">{pending ? "Applying…" : "Apply my draft"}</button></div>{message && <p className="mt-3 flex items-center gap-2 text-sm text-[#147D92]"><Check className="size-4" />{message}</p>}</div>;
}
