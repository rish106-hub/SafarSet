export type AgentTrip = Readonly<{ id: string; title: string; origin: string; destination: string; startsAt: string; status: string }>;
export type AgentPolicy = Readonly<{ requireFamilyTogether: boolean; forbidSelfTransfer: boolean; maxStops: number; minimumConnectionMinutes: number; avoidOvernight: boolean; autoSpendLimitMinor: number }>;

export type CommandResult = Readonly<{
  handled: boolean;
  reply: string;
  suggestedLinks?: readonly Readonly<{ label: string; href: string }>[];
}>;

export function routeDeterministicCommand(message: string, trips: readonly AgentTrip[], policy?: AgentPolicy): CommandResult {
  const text = message.trim().toLowerCase();
  if (!text) return { handled: true, reply: "Tell me what you are trying to plan or fix." };

  if (/\b(my trips?|upcoming trips?|show trips?|list trips?)\b/.test(text)) {
    if (!trips.length) return { handled: true, reply: "You do not have a saved trip yet. Import an itinerary or add one manually.", suggestedLinks: [{ label: "Add a trip", href: "/trips/new" }] };
    const lines = trips.slice(0, 5).map((trip) => `• ${trip.title}: ${trip.origin} to ${trip.destination}, ${new Date(trip.startsAt).toLocaleDateString("en-IN")}, ${trip.status.toLowerCase()}`);
    return { handled: true, reply: `Here are your saved trips:\n\n${lines.join("\n")}`, suggestedLinks: [{ label: "Open trips", href: "/trips" }] };
  }

  if (/\b(rules?|policy|constraints?|limits?)\b/.test(text)) {
    if (!policy) return { handled: true, reply: "You have not saved a travel policy yet. Start with the family-safe defaults, then change only what matters.", suggestedLinks: [{ label: "Set travel rules", href: "/settings" }] };
    return {
      handled: true,
      reply: `Your current rules ${policy.requireFamilyTogether ? "keep the family together" : "allow a split"}, ${policy.forbidSelfTransfer ? "block self-transfers" : "allow self-transfers"}, allow up to ${policy.maxStops} stop${policy.maxStops === 1 ? "" : "s"}, and require at least ${policy.minimumConnectionMinutes} minutes to connect. ${policy.avoidOvernight ? "Overnight waits are avoided." : "Overnight waits are allowed."} Suggestions up to ₹${Math.round(policy.autoSpendLimitMinor / 100).toLocaleString("en-IN")} can be shown without a budget exception.`,
      suggestedLinks: [{ label: "Edit rules", href: "/settings" }],
    };
  }

  if (/\b(status|delayed|cancelled|canceled|on time|flight check)\b/.test(text)) {
    const trip = trips.find((item) => text.includes(item.title.toLowerCase()) || text.includes(item.origin.toLowerCase()) || text.includes(item.destination.toLowerCase())) ?? trips[0];
    if (!trip) return { handled: true, reply: "Add the issued itinerary first. I need the flight number and schedule before I can check live status.", suggestedLinks: [{ label: "Add a trip", href: "/trips/new" }] };
    return { handled: true, reply: `I found ${trip.title}. Open the trip to run a live Aviationstack status check. The status provider does not supply replacement fares, so SafarSet will not invent an alternative.`, suggestedLinks: [{ label: `Check ${trip.title}`, href: `/trips/${trip.id}` }] };
  }

  if (/\b(plan|itinerary|holiday|vacation|travel to|trip to)\b/.test(text)) {
    return { handled: false, reply: "" };
  }

  return { handled: true, reply: "I can show saved trips, explain your travel rules, check which trip needs a live status check, or draft a new travel plan. Try: ‘Show my trips’ or ‘Plan a seven-day Bali trip’." };
}
