export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}>) {
  return (
    <header className="flex flex-col gap-5 border-b border-[#D9E2EC] bg-white px-5 py-7 sm:flex-row sm:items-end sm:justify-between sm:px-8 lg:px-10">
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#147D92]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#627D98]">{description}</p>
      </div>
      {action}
    </header>
  );
}
