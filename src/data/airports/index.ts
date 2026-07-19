import airportRows from "./airports.json";

export type Airport = Readonly<{
  code: string;
  name: string;
  city: string;
  country: string;
  type: "large_airport" | "medium_airport" | "small_airport";
  keywords: string;
}>;

export const airports = airportRows as readonly Airport[];

const byCode = new Map(airports.map((airport) => [airport.code, airport]));

export function airportByCode(code: string): Airport | null {
  return byCode.get(code.trim().toUpperCase()) ?? null;
}

export function airportLabel(code: string): string {
  const airport = airportByCode(code);
  return airport ? `${airportDisplayCity(airport)} (${airport.code})` : code;
}

export function airportDisplayCity(airport: Airport): string {
  const familiarName = /\(([^)]+)\)/.exec(airport.name)?.[1]?.trim();
  if (familiarName && familiarName.length <= 32) return familiarName;
  if (airport.city.includes(",")) {
    const alias = airport.keywords.split(",").map((value) => value.trim()).find((value) => value.length >= 4 && value.length <= 24 && !/airport|station|airfield/i.test(value) && !/^[A-Z0-9]{3,4}$/.test(value));
    if (alias) return alias;
  }
  return airport.city;
}
