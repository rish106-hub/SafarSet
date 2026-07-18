"use client";

import { useState } from "react";
import {
  Activity,
  ClipboardCheck,
  FileClock,
  FlaskConical,
  House,
  Menu,
  RotateCcw,
  Route,
  ShieldCheck,
  TableProperties,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { DemoPhase, DemoView } from "@/features/demo/types";

const items: readonly {
  id: DemoView;
  label: string;
  icon: typeof House;
}[] = [
  { id: "benefit", label: "Benefit", icon: House },
  { id: "policy", label: "Policy", icon: ShieldCheck },
  { id: "trip", label: "Active trip", icon: Route },
  { id: "recovery", label: "Recovery", icon: Activity },
  { id: "audit", label: "Audit", icon: FileClock },
  { id: "truth", label: "API truth", icon: TableProperties },
  { id: "evaluation", label: "Evaluation", icon: FlaskConical },
];

type WorkspaceNavProps = Readonly<{
  view: DemoView;
  phase: DemoPhase;
  onNavigate: (view: DemoView) => void;
  onReset: () => void;
}>;

function NavItems({ view, phase, onNavigate, onReset }: WorkspaceNavProps) {
  return (
    <>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const disabled =
            (item.id === "recovery" && phase === "ready") ||
            (item.id === "audit" &&
              !["recovered", "awaiting-approval", "escalated"].includes(phase));
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                view === item.id
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:bg-white/6 hover:text-white",
                disabled && "cursor-not-allowed opacity-35",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </div>
      <Button
        variant="ghost"
        onClick={onReset}
        className="mt-auto justify-start text-slate-400 hover:bg-white/6 hover:text-white"
      >
        <RotateCcw className="size-4" />
        Reset demo
      </Button>
    </>
  );
}

export function WorkspaceNav(props: WorkspaceNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileProps: WorkspaceNavProps = {
    ...props,
    onNavigate: (view) => {
      props.onNavigate(view);
      setMobileOpen(false);
    },
    onReset: () => {
      props.onReset();
      setMobileOpen(false);
    },
  };

  return (
    <>
      <aside className="hidden min-h-screen w-60 shrink-0 border-r border-white/10 bg-[#07101c]/95 p-4 lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-3 px-2 pt-2">
          <div className="grid size-9 place-items-center rounded-md bg-[#f5a524] text-slate-950">
            <ClipboardCheck className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-white">SafarSet</p>
            <p className="font-mono text-[10px] tracking-[0.16em] text-slate-500">
              RECOVERY CONTROL
            </p>
          </div>
        </div>
        <NavItems {...props} />
      </aside>

      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[#07101c]/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-md bg-[#f5a524] text-slate-950">
            <ClipboardCheck className="size-4" />
          </div>
          <span className="font-semibold text-white">SafarSet</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Open navigation" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="border-white/10 bg-[#07101c] p-5 text-white">
            <SheetHeader className="px-0">
              <SheetTitle className="text-white">Recovery control</SheetTitle>
              <SheetDescription className="text-slate-400">
                Seeded family demo. No real bookings.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 flex h-[calc(100%-6rem)] flex-col overflow-y-auto">
              <NavItems {...mobileProps} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
