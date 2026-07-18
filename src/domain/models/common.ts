import type { SourceMode } from "../enums";

export type Money = Readonly<{
  currency: "INR";
  amountMinor: number;
}>;

export type ProviderMetadata = Readonly<{
  source: string;
  mode: SourceMode;
  isSimulated: boolean;
  observedAt: string;
  confidence: number;
}>;
