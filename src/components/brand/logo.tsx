import { cn } from "@/lib/utils";

export function SafarSetLogo({
  compact = false,
  className,
}: Readonly<{ compact?: boolean; className?: string }>) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        aria-hidden="true"
        className="h-9 w-11 shrink-0"
        viewBox="0 0 52 42"
        fill="none"
      >
        <path d="M4 8h25c5 0 5 8 0 8H18c-7 0-7 10 0 10h15c7 0 7 10 0 10H8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M8 8h9m4 8h8M15 26h9" stroke="#2CB1BC" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 4" />
        <circle cx="4" cy="8" r="3" fill="#2CB1BC" />
        <circle cx="8" cy="36" r="3" fill="#102A43" />
      </svg>
      {!compact && (
        <span className="text-xl font-semibold tracking-[-0.04em] text-[#102A43]">
          SafarSet
        </span>
      )}
    </span>
  );
}
