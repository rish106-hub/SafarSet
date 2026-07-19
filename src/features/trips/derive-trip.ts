import { airportByCode, airportDisplayCity } from "@/data/airports";

export type ItinerarySegment = Readonly<{
  departureAirport: string;
  arrivalAirport: string;
  scheduledDeparture: string;
  scheduledArrival: string;
}>;

export function primaryDestinationCode(segments: readonly ItinerarySegment[]): string {
  const last = segments.at(-1);
  if (!last) return "";
  if (segments.length === 1) return last.arrivalAirport;
  let destination = last.arrivalAirport;
  let longestStop = -1;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const arrival = Date.parse(segments[index].scheduledArrival);
    const nextDeparture = Date.parse(segments[index + 1].scheduledDeparture);
    const stop = nextDeparture - arrival;
    if (Number.isFinite(stop) && stop > longestStop) {
      longestStop = stop;
      destination = segments[index].arrivalAirport;
    }
  }
  return destination;
}

export function derivedTripTitle(segments: readonly ItinerarySegment[]): string {
  const code = primaryDestinationCode(segments);
  const airport = airportByCode(code);
  return `${airport ? airportDisplayCity(airport) : (code || "Upcoming")} trip`;
}
