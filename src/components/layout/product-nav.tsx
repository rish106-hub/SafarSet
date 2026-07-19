"use client";

import { CalendarPlus, Home, PlaneTakeoff, Settings2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Home", icon: Home, match: (path: string) => path === "/dashboard" },
  { href: "/trips", label: "Trips", icon: PlaneTakeoff, match: (path: string) => path === "/trips" || path.startsWith("/trips/") && path !== "/trips/new" },
  { href: "/trips/new", label: "Add trip", icon: CalendarPlus, match: (path: string) => path === "/trips/new" },
  { href: "/settings", label: "Settings", icon: Settings2, match: (path: string) => path === "/settings" || path === "/account" || path === "/policy" || path === "/connections" },
] as const;

export function ProductNav({ isAdmin }: Readonly<{ isAdmin: boolean }>) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:px-4 lg:pb-0">
      {links.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return <Link aria-current={active ? "page" : undefined} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-white/10 text-white" : "text-[#BCCCDC] hover:bg-white/8 hover:text-white"}`} href={href} key={href}><Icon className="size-4" /> {label}</Link>;
      })}
      {isAdmin && <Link className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#67E8E8] hover:bg-white/8" href="/admin"><ShieldCheck className="size-4" /> Admin</Link>}
    </nav>
  );
}
