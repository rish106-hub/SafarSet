export type TruthLevel = "FIXTURE" | "SIMULATED" | "OPTIONAL_LIVE" | "LOCAL_FIRST";

export type CapabilityTruth = Readonly<{
  capability: string;
  level: TruthLevel;
  source: string;
  transaction: string;
  fallback: string;
}>;

export const capabilityTruth: readonly CapabilityTruth[] = [
  {
    capability: "Flight status",
    level: "OPTIONAL_LIVE",
    source: "Amadeus when live mode is configured",
    transaction: "Read-only demo data",
    fallback: "Seeded Paris delay",
  },
  {
    capability: "Alternative search",
    level: "OPTIONAL_LIVE",
    source: "Amadeus offers when usable",
    transaction: "No airline inventory hold",
    fallback: "Three deterministic candidates",
  },
  {
    capability: "Ticket reissue",
    level: "SIMULATED",
    source: "SafarSet demo adapter",
    transaction: "No ticket changed",
    fallback: "In-app confirmation only",
  },
  {
    capability: "Hotel change",
    level: "SIMULATED",
    source: "SafarSet demo adapter",
    transaction: "No room booked",
    fallback: "Audit records simulation",
  },
  {
    capability: "Transfer change",
    level: "SIMULATED",
    source: "SafarSet demo adapter",
    transaction: "No driver dispatched",
    fallback: "Audit records simulation",
  },
  {
    capability: "Email",
    level: "OPTIONAL_LIVE",
    source: "Resend when configured",
    transaction: "Synthetic recipient only",
    fallback: "In-app confirmation remains",
  },
  {
    capability: "Message prose",
    level: "OPTIONAL_LIVE",
    source: "Gemini after decision",
    transaction: "Cannot alter recovery",
    fallback: "Deterministic message",
  },
  {
    capability: "Audit storage",
    level: "LOCAL_FIRST",
    source: "Browser, optional Supabase mirror",
    transaction: "Synthetic evidence only",
    fallback: "Browser storage",
  },
];
