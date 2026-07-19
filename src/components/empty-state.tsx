import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, body, action }: Readonly<{ icon: LucideIcon; title: string; body: string; action: React.ReactNode }>) {
  return (
    <section className="rounded-2xl border border-dashed border-[#BCCCDC] bg-white px-6 py-14 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#E3F8F8] text-[#147D92]"><Icon className="size-5" /></span>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#627D98]">{body}</p>
      <div className="mt-6">{action}</div>
    </section>
  );
}
