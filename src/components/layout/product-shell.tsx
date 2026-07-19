import { LogOut } from "lucide-react";
import Link from "next/link";

import type { CurrentUser } from "@/application/dal/auth";
import { SafarSetLogo } from "@/components/brand/logo";
import { logoutAction } from "@/app/(product)/actions";
import { ProductNav } from "./product-nav";

export function ProductShell({ user, children }: Readonly<{ user: CurrentUser; children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#102A43] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-white/10 bg-[#102A43] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-6 lg:py-7">
          <Link href="/dashboard"><SafarSetLogo className="[&_span]:text-white" /></Link>
          <span className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10px] text-[#9FB3C8] lg:mt-5 lg:inline-block">PRIVATE BETA</span>
        </div>
        <ProductNav isAdmin={user.isAdmin} />
        <div className="hidden border-t border-white/10 p-4 lg:mt-auto lg:block">
          <p className="truncate px-2 text-sm font-medium">{user.fullName || user.email}</p>
          <p className="truncate px-2 text-xs text-[#829AB1]">{user.email}</p>
          <form action={logoutAction}><button className="mt-4 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#BCCCDC] hover:bg-white/8 hover:text-white" type="submit"><LogOut className="size-4" /> Sign out</button></form>
        </div>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
