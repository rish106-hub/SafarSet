"use client";

import { Activity, FilePenLine, Map } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function TripTabs({ tripId }: Readonly<{ tripId: string }>) {
  const pathname = usePathname();
  const items = [
    { href: `/trips/${tripId}`, label: "Overview", icon: Map },
    { href: `/trips/${tripId}/edit`, label: "Edit trip", icon: FilePenLine },
    { href: `/trips/${tripId}/activity`, label: "Activity", icon: Activity },
  ];
  return <nav aria-label="Trip sections" className="overflow-x-auto border-b border-[#D9E2EC] bg-white px-5 sm:px-8 lg:px-10"><div className="flex min-w-max gap-7">{items.map(({ href, label, icon: Icon }) => { const active = pathname === href; return <Link aria-current={active ? "page" : undefined} className={`relative flex items-center gap-2 py-4 text-sm font-medium transition ${active ? "text-[#102A43]" : "text-[#627D98] hover:text-[#147D92]"}`} href={href} key={href}><Icon className="size-4" />{label}{active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#2CB1BC]" />}</Link>; })}</div></nav>;
}
