import { Cable, Database, PlaneTakeoff, UsersRound } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

import { getAdminOverview } from "@/application/dal/admin-data";
import { SafarSetLogo } from "@/components/brand/logo";
import { formatTime } from "@/lib/format";

export default async function AdminPage() {
  await connection();
  const data = await getAdminOverview();
  return <main className="min-h-screen bg-[#F7FAFC] text-[#102A43]"><header className="border-b border-[#D9E2EC] bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8"><SafarSetLogo /><div className="flex items-center gap-4"><span className="rounded-full bg-[#102A43] px-3 py-1 font-mono text-[10px] text-white">ADMIN</span><Link className="text-sm font-medium text-[#147D92]" href="/dashboard">Customer view</Link></div></div></header><div className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><p className="font-mono text-xs uppercase tracking-[0.16em] text-[#147D92]">Private operations</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em]">Beta overview</h1><p className="mt-2 text-sm text-[#627D98]">Operational counts only. Passwords and provider tokens are never displayed.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={UsersRound} label="Customers" value={data.customerCount} /><Metric icon={PlaneTakeoff} label="Trips" value={data.tripCount} /><Metric icon={Database} label="Recovery runs" value={data.runCount} /><Metric icon={Cable} label="Connections" value={data.connectionCount} /></div><section className="mt-8 overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white"><div className="border-b border-[#E4E7EB] px-5 py-4"><h2 className="font-semibold">Recent customers</h2></div>{data.customers.length === 0 ? <p className="p-6 text-sm text-[#627D98]">No customer accounts yet.</p> : <div className="divide-y divide-[#E4E7EB]">{data.customers.map((customer) => <div className="grid gap-2 px-5 py-4 text-sm sm:grid-cols-[1fr_1fr_auto]" key={customer.id}><span className="font-medium">{customer.fullName || "Name not set"}</span><span className="text-[#627D98]">{customer.email}</span><span className="font-mono text-xs text-[#9FB3C8]">{formatTime(customer.createdAt)} UTC</span></div>)}</div>}</section></div></main>;
}

function Metric({ icon: Icon, label, value }: Readonly<{ icon: typeof UsersRound; label: string; value: number }>) {
  return <article className="rounded-xl border border-[#D9E2EC] bg-white p-5"><Icon className="size-5 text-[#147D92]" /><p className="mt-6 text-3xl font-semibold">{value}</p><p className="mt-1 text-sm text-[#627D98]">{label}</p></article>;
}
