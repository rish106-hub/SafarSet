export function StatusPill({ status }: Readonly<{ status: string }>) {
  const tone = status === "DISRUPTED"
    ? "bg-[#FFF3E0] text-[#9C5700]"
    : status === "COMPLETED"
      ? "bg-[#E4E7EB] text-[#52606D]"
      : "bg-[#E3F8F8] text-[#147D92]";
  return <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold ${tone}`}>{status.replaceAll("_", " ")}</span>;
}
