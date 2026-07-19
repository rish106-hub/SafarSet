export const STARTER_POLICY_STORAGE_KEY = "safarset-starter-policy-v1";

export type StarterPolicy = Readonly<{
  requireFamilyTogether: boolean;
  avoidOvernight: boolean;
  maxStops: 0 | 1 | 2;
  minimumConnectionMinutes: 60 | 90 | 120;
}>;

export const familySafeStarterPolicy: StarterPolicy = {
  requireFamilyTogether: true,
  avoidOvernight: true,
  maxStops: 1,
  minimumConnectionMinutes: 90,
};

export function readStarterPolicy(value: string | null): StarterPolicy | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<StarterPolicy>;
    if (
      typeof parsed.requireFamilyTogether !== "boolean" ||
      typeof parsed.avoidOvernight !== "boolean" ||
      ![0, 1, 2].includes(Number(parsed.maxStops)) ||
      ![60, 90, 120].includes(Number(parsed.minimumConnectionMinutes))
    ) return null;
    return parsed as StarterPolicy;
  } catch {
    return null;
  }
}
