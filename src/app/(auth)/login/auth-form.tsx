"use client";

import { useActionState, useState } from "react";

import { loginAction, signupAction } from "./actions";

export function AuthForm({ next, configured }: Readonly<{ next?: string; configured: boolean }>) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, null);
  const [signupState, signupFormAction, signupPending] = useActionState(signupAction, null);
  const state = mode === "login" ? loginState : signupState;
  const pending = loginPending || signupPending;
  const action = mode === "login" ? loginFormAction : signupFormAction;

  return (
    <div>
      <div className="grid grid-cols-2 rounded-lg bg-[#E4E7EB] p-1 text-sm">
        {(["login", "signup"] as const).map((item) => (
          <button className={`rounded-md px-3 py-2.5 font-medium ${mode === item ? "bg-white text-[#102A43] shadow-sm" : "text-[#627D98]"}`} key={item} onClick={() => setMode(item)} type="button">
            {item === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      <form action={action} className="mt-7 space-y-5">
        <input name="next" type="hidden" value={next ?? ""} />
        {mode === "signup" && <Field label="Full name" name="fullName" autoComplete="name" />}
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} />
        {state?.error && <p className="rounded-lg border border-[#F6AD55]/60 bg-[#FFF8EC] px-4 py-3 text-sm text-[#7B4B00]" role="status">{state.error}</p>}
        {!configured && <p className="rounded-lg border border-[#D64545]/30 bg-[#FFF5F5] px-4 py-3 text-sm text-[#9B2C2C]">Set the Supabase environment values before using accounts.</p>}
        <button className="w-full rounded-lg bg-[#102A43] px-4 py-3.5 font-medium text-white hover:bg-[#243B53] disabled:cursor-not-allowed disabled:opacity-50" disabled={pending || !configured} type="submit">
          {pending ? "Working…" : mode === "login" ? "Sign in" : "Create beta account"}
        </button>
      </form>
      <p className="mt-5 text-xs leading-5 text-[#7B8794]">Private beta accounts use Supabase Auth. Passwords are never stored by SafarSet.</p>
    </div>
  );
}

function Field({ label, name, type = "text", autoComplete }: Readonly<{ label: string; name: string; type?: string; autoComplete: string }>) {
  return <label className="block text-sm font-medium text-[#334E68]">{label}<input className="mt-2 w-full rounded-lg border border-[#BCCCDC] bg-white px-3.5 py-3 text-[#102A43] outline-none transition focus:border-[#2CB1BC] focus:ring-3 focus:ring-[#2CB1BC]/15" name={name} type={type} autoComplete={autoComplete} required /></label>;
}
