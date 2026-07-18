import { Badge } from "@/components/ui/badge";
import { SourceMode } from "@/domain";
import { cn } from "@/lib/utils";

const tone: Record<SourceMode, string> = {
  [SourceMode.Live]: "border-sky-400/35 bg-sky-400/10 text-sky-200",
  [SourceMode.Fixture]: "border-blue-400/35 bg-blue-400/10 text-blue-200",
  [SourceMode.Simulated]: "border-amber-400/35 bg-amber-400/10 text-amber-200",
  [SourceMode.Unavailable]: "border-rose-400/35 bg-rose-400/10 text-rose-200",
};

export function SourceBadge({ mode }: Readonly<{ mode: SourceMode }>) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-sm px-1.5 font-mono text-[10px] tracking-[0.14em]",
        tone[mode],
      )}
    >
      {mode}
    </Badge>
  );
}
