import type { SegmentDraft } from "./trip-form";

export type ParsedItinerary = Readonly<{ segments: readonly SegmentDraft[]; warnings: readonly string[] }>;

function localDateTime(value: string): string | null {
  const compact = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?Z?$/.exec(value.trim());
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}T${compact[4]}:${compact[5]}`;
  const slash = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})[ ,]+(\d{1,2}):(\d{2})/.exec(value.trim());
  if (slash) return `${slash[3]}-${slash[2].padStart(2, "0")}-${slash[1].padStart(2, "0")}T${slash[4].padStart(2, "0")}:${slash[5]}`;
  const iso = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(value.trim());
  return iso ? `${iso[1]}T${iso[2]}` : null;
}

function routeFrom(text: string): [string, string] | null {
  const explicit = /\b([A-Z]{3})\s*(?:→|->| TO |–|-)\s*([A-Z]{3})\b/i.exec(text);
  if (explicit && explicit[1].toUpperCase() !== explicit[2].toUpperCase()) return [explicit[1].toUpperCase(), explicit[2].toUpperCase()];
  const codes = [...text.toUpperCase().matchAll(/\b[A-Z]{3}\b/g)].map((match) => match[0]).filter((code, index, all) => all.indexOf(code) === index);
  return codes.length >= 2 ? [codes[0], codes[1]] : null;
}

function flightFrom(text: string): string {
  const match = /\b([A-Z][A-Z0-9]|[0-9][A-Z])\s?-?([0-9]{1,4})\b/i.exec(text);
  return match ? `${match[1]}${match[2]}`.toUpperCase() : "";
}

function parseIcs(text: string): SegmentDraft[] {
  return text.split("BEGIN:VEVENT").slice(1).map((block) => {
    const summary = /^SUMMARY[^:]*:(.+)$/mi.exec(block)?.[1] ?? "";
    const location = /^LOCATION[^:]*:(.+)$/mi.exec(block)?.[1] ?? "";
    const description = /^DESCRIPTION[^:]*:(.+)$/mi.exec(block)?.[1] ?? "";
    const route = routeFrom(`${summary} ${location} ${description}`);
    const departure = localDateTime(/^DTSTART[^:]*:(.+)$/mi.exec(block)?.[1] ?? "");
    const arrival = localDateTime(/^DTEND[^:]*:(.+)$/mi.exec(block)?.[1] ?? "");
    return { flightNumber: flightFrom(`${summary} ${description}`), departureAirport: route?.[0] ?? "", arrivalAirport: route?.[1] ?? "", scheduledDeparture: departure ?? "", scheduledArrival: arrival ?? "", cabin: "ECONOMY" };
  }).filter((segment) => segment.flightNumber || segment.departureAirport || segment.scheduledDeparture);
}

export function parseItineraryText(text: string): ParsedItinerary {
  const normalized = text.replaceAll("\\n", "\n").trim();
  if (!normalized) return { segments: [], warnings: ["Paste or upload an itinerary first."] };
  const icsSegments = normalized.includes("BEGIN:VEVENT") ? parseIcs(normalized) : [];
  if (icsSegments.length) return { segments: icsSegments, warnings: [] };
  const route = routeFrom(normalized);
  const datetimes = [
    ...normalized.matchAll(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/g),
    ...normalized.matchAll(/\d{1,2}[\/-]\d{1,2}[\/-]\d{4}[ ,]+\d{1,2}:\d{2}/g),
  ].map((match) => localDateTime(match[0])).filter((value): value is string => Boolean(value));
  const segment = { flightNumber: flightFrom(normalized), departureAirport: route?.[0] ?? "", arrivalAirport: route?.[1] ?? "", scheduledDeparture: datetimes[0] ?? "", scheduledArrival: datetimes[1] ?? "", cabin: "ECONOMY" };
  const warnings = [];
  if (!segment.flightNumber) warnings.push("Flight number needs confirmation.");
  if (!route) warnings.push("Departure and arrival airports need confirmation.");
  if (datetimes.length < 2) warnings.push("Departure and arrival times need confirmation.");
  return { segments: [segment], warnings };
}
