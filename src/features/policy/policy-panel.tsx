import { ArrowRight, LockKeyhole, PlaneTakeoff, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CabinClass, type RecoveryPolicy } from "@/domain";
import { formatMoney, toDateTimeLocal } from "@/lib/format";
import { cn } from "@/lib/utils";

const airportOptions = ["DXB", "DOH", "IST", "AUH", "FRA"] as const;

export function PolicyPanel({
  policy,
  onChange,
  onContinue,
}: Readonly<{
  policy: RecoveryPolicy;
  onChange: (policy: RecoveryPolicy) => void;
  onContinue: () => void;
}>) {
  const update = (values: Partial<RecoveryPolicy>) =>
    onChange({ ...policy, ...values });

  const toggleAirport = (airport: string) => {
    const selected = policy.approvedTransitAirports.includes(airport);
    update({
      approvedTransitAirports: selected
        ? policy.approvedTransitAirports.filter((item) => item !== airport)
        : [...policy.approvedTransitAirports, airport],
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex flex-col justify-between gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs tracking-[0.18em] text-[#ffd284]">
            PRE-AUTHORIZATION / FAMILY 001
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Recovery policy
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            SafarSet may act only inside these limits. Hard safety rules cannot
            be traded for speed or price.
          </p>
        </div>
        <div className="font-mono text-xs text-slate-500">
          AUTO LIMIT <span className="ml-2 text-white">{formatMoney(policy.autoSpendLimit)}</span>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/10 bg-[#0b1928] text-white shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PlaneTakeoff className="size-5 text-[#8edff0]" />
              Editable operating limits
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <Field label="Automatic spend limit" hint="INR">
              <Input
                type="number"
                min={0}
                value={policy.autoSpendLimit.amountMinor / 100}
                onChange={(event) =>
                  update({
                    autoSpendLimit: {
                      currency: "INR",
                      amountMinor: Math.max(0, Number(event.target.value) * 100),
                    },
                  })
                }
              />
            </Field>
            <Field label="Minimum connection" hint="minutes">
              <Input
                type="number"
                min={60}
                step={15}
                value={policy.minimumConnectionMinutes}
                onChange={(event) =>
                  update({
                    minimumConnectionMinutes: Math.max(
                      60,
                      Number(event.target.value),
                    ),
                  })
                }
              />
            </Field>
            <Field label="Maximum stops" hint="per recovery">
              <Input
                type="number"
                min={0}
                max={2}
                value={policy.maxStops}
                onChange={(event) =>
                  update({ maxStops: Math.max(0, Number(event.target.value)) })
                }
              />
            </Field>
            <Field label="Minimum cabin" hint="never downgrade below">
              <select
                value={policy.minimumCabin}
                onChange={(event) =>
                  update({ minimumCabin: event.target.value as CabinClass })
                }
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-white outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option className="bg-slate-950" value={CabinClass.PremiumEconomy}>
                  Premium economy
                </option>
                <option className="bg-slate-950" value={CabinClass.Business}>
                  Business
                </option>
                <option className="bg-slate-950" value={CabinClass.First}>
                  First
                </option>
              </select>
            </Field>
            <Field label="Home arrival deadline" hint="UTC">
              <Input
                type="datetime-local"
                value={toDateTimeLocal(policy.arrivalDeadline)}
                onChange={(event) => {
                  if (event.target.value) {
                    update({
                      arrivalDeadline: new Date(
                        `${event.target.value}:00.000Z`,
                      ).toISOString(),
                    });
                  }
                }}
              />
            </Field>
            <div className="sm:col-span-2">
              <Label className="text-sm text-slate-200">Approved transit airports</Label>
              <p className="mt-1 text-xs text-slate-500">
                User allow-list. Not a visa-rules claim.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {airportOptions.map((airport) => {
                  const selected = policy.approvedTransitAirports.includes(airport);
                  return (
                    <button
                      key={airport}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleAirport(airport)}
                      className={cn(
                        "border px-3 py-2 font-mono text-xs transition-colors",
                        selected
                          ? "border-[#67d8ef]/50 bg-[#67d8ef]/10 text-[#a8ebf8]"
                          : "border-white/10 text-slate-500 hover:border-white/25 hover:text-white",
                      )}
                    >
                      {airport}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b1928] text-white shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="size-5 text-[#f5a524]" />
              Locked safety rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              ["Keep all four travellers together", "One itinerary only"],
              ["Never use self-transfer", "Baggage stays protected"],
              ["Escalate conflicting provider data", "No action on uncertainty"],
              ["Block duplicate execution", "One recovery per disruption"],
            ].map(([label, detail]) => (
              <div
                key={label}
                className="flex items-center gap-3 border-b border-white/8 py-4 last:border-0"
              >
                <Switch checked disabled aria-label={`${label}, locked`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white">{label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
                </div>
                <LockKeyhole className="size-3.5 text-slate-600" />
              </div>
            ))}
            <Button
              onClick={onContinue}
              className="mt-6 w-full bg-[#f5a524] text-slate-950 hover:bg-[#ffc35a]"
            >
              Save and view active trip
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: Readonly<{
  label: string;
  hint: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm text-slate-200">{label}</Label>
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
          {hint}
        </span>
      </div>
      {children}
    </div>
  );
}
