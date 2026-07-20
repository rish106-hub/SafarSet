"use client";

import { useActionState } from "react";
import { createBetaInviteAction } from "./invite-actions";

export function InviteForm() {
  const [state, action, pending] = useActionState(createBetaInviteAction, null);
  return <form action={action} className="rounded-2xl border border-[#D9E2EC] bg-white p-5"><h2 className="font-semibold">Create beta invite</h2><p className="mt-1 text-sm text-[#627D98]">Codes are tied to one email and shown once.</p><div className="mt-5 grid gap-4 sm:grid-cols-[1fr_120px_auto]"><label className="text-sm font-medium">Customer email<input className="field" name="email" type="email" required /></label><label className="text-sm font-medium">Valid days<input className="field" defaultValue="7" min="1" max="30" name="days" type="number" required /></label><button className="button-primary self-end py-3" disabled={pending} type="submit">{pending ? "Creating…" : "Create invite"}</button></div>{state?.error && <p className="mt-4 rounded-lg bg-[#FFF5F5] px-3 py-2 text-sm text-[#9B2C2C]">{state.error}</p>}{state?.code && <div className="mt-4 rounded-xl border border-[#F6AD55]/50 bg-[#FFF8EC] p-4"><p className="text-xs text-[#7B6232]">Send this once to {state.email}. It will not be shown again.</p><code className="mt-2 block break-all text-sm font-semibold text-[#102A43]">{state.code}</code></div>}</form>;
}
