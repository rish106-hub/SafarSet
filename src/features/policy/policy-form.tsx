"use client";

import { useActionState } from "react";

import type { PolicyDTO } from "@/application/dal/customer-data";

import { savePolicyAction } from "./actions";

export function ProductionPolicyForm({ policy }: Readonly<{ policy?: PolicyDTO }>) {
  const [state, action, pending] = useActionState(savePolicyAction, null);
  return (
    <form action={action} className="space-y-7">
      <input name="id" type="hidden" value={policy?.id ?? ""} />
      <input name="name" type="hidden" value={policy?.name ?? "Family-safe travel rules"} />
      <input name="isDefault" type="hidden" value="on" />

      <section className="rounded-2xl border border-[#D9E2EC] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold">Travel rules</h2>
        <p className="mt-1 text-sm text-[#627D98]">Set once. Applied automatically to every new trip.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Toggle name="requireFamilyTogether" label="Keep the family together" description="Reject routes without enough seats for everyone." checked={policy?.requireFamilyTogether ?? true} />
          <Toggle name="forbidSelfTransfer" label="Avoid separate tickets" description="Block routes that require baggage collection and recheck." checked={policy?.forbidSelfTransfer ?? true} />
          <Toggle name="avoidOvernight" label="Avoid overnight waits" description="Treat long overnight connections as undesirable." checked={policy?.avoidOvernight ?? true} />
          <Toggle name="notifyEmail" label="Email updates" description="Send recovery updates when email is configured." checked={policy?.notifyEmail ?? true} />
        </div>
      </section>

      <details className="rounded-2xl border border-[#D9E2EC] bg-white p-5 sm:p-7">
        <summary className="cursor-pointer text-lg font-semibold">Advanced route limits</summary>
        <p className="mt-2 text-sm text-[#627D98]">Conservative defaults work for most families. Change only when needed.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Select label="Do not downgrade below" name="minimumCabin" defaultValue={policy?.minimumCabin ?? "ECONOMY"}><option value="ECONOMY">Economy</option><option value="PREMIUM_ECONOMY">Premium economy</option><option value="BUSINESS">Business</option><option value="FIRST">First</option></Select>
          <Input label="Maximum stops" name="maxStops" type="number" min={0} max={3} defaultValue={policy?.maxStops ?? 1} />
          <Input label="Minimum connection, minutes" name="minimumConnectionMinutes" type="number" min={30} max={480} defaultValue={policy?.minimumConnectionMinutes ?? 90} />
          <Input label="Maximum arrival delay, minutes" name="maximumArrivalDelayMinutes" type="number" min={60} max={4320} defaultValue={policy?.maximumArrivalDelayMinutes ?? 720} />
          <Input className="sm:col-span-2" label="Approved connection airport codes" name="transit" placeholder="DOH, DXB, SIN" defaultValue={policy?.approvedTransitAirports.join(", ") ?? ""} />
        </div>
      </details>

      <section className="rounded-2xl border border-[#D9E2EC] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold">When should SafarSet ask?</h2>
        <p className="mt-1 text-sm text-[#627D98]">Amounts are in INR. SafarSet does not charge or book tickets in current beta.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Input label="Suggest without asking, up to" name="autoSpendLimit" type="number" min={0} step={1} defaultValue={(policy?.autoSpendLimitMinor ?? 0) / 100} />
          <Input label="Always ask above" name="approvalAbove" type="number" min={0} step={1} defaultValue={(policy?.approvalAboveMinor ?? 0) / 100} />
        </div>
      </section>
      {state?.error && <p className="rounded-lg border border-[#D64545]/30 bg-[#FFF5F5] px-4 py-3 text-sm text-[#9B2C2C]" role="alert">{state.error}</p>}
      {state?.success && <p className="rounded-lg border border-[#2CB1BC]/30 bg-[#E3F8F8] px-4 py-3 text-sm text-[#147D92]" role="status">{state.success}</p>}
      <div className="flex justify-end"><button className="rounded-lg bg-[#102A43] px-5 py-3 font-medium text-white disabled:opacity-50" disabled={pending} type="submit">{pending ? "Saving…" : "Save travel rules"}</button></div>
    </form>
  );
}

function Toggle({ name, label, description, checked }: Readonly<{ name: string; label: string; description: string; checked: boolean }>) {
  return <label className="flex gap-3 rounded-xl bg-[#F0F4F8] p-4"><input className="mt-1 size-4" defaultChecked={checked} name={name} type="checkbox" /><span><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs leading-5 text-[#627D98]">{description}</span></span></label>;
}

function Input({ label, className, ...props }: Readonly<React.InputHTMLAttributes<HTMLInputElement> & { label: string }>) {
  return <label className={`block text-sm font-medium text-[#334E68] ${className ?? ""}`}>{label}<input className="field" {...props} required /></label>;
}

function Select({ label, children, ...props }: Readonly<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }>) {
  return <label className="block text-sm font-medium text-[#334E68]">{label}<select className="field" {...props}>{children}</select></label>;
}
