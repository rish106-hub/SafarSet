# Spec 02: Demo Vertical Slice

## Goal

Turn deterministic engine into complete browser demo requiring no API keys.

## Deliverables

- shadcn/ui and Lucide-based operations interface.
- Card-benefit entry, family policy, active trip, disruption injection, recovery timeline, confirmation, route explanation, and local audit views.
- Deterministic travel, hotel, transfer, and notification adapters.
- Application orchestration around pure engine.
- Browser-storage demo state and reset-safe seed loading.
- Visible fixture and simulation labels on every provider result and action.

## Exit

Hero scenario runs from seeded trip to simulated confirmation without network access or secrets.

## Implementation Record

- One browser workspace presents benefit, policy, trip, recovery, and audit views.
- Browser state uses versioned local storage and resets to deterministic seed.
- Demo adapters implement travel, accommodation, transfer, and notification contracts.
- Recovery service coordinates provider fixtures around pure engine.
- Timeline stages one deliberate sequence and respects reduced motion.
- Route explanations show all seven checks and exact rejection reasons.
- Fixture and simulation badges remain next to user-visible results.

## Verified

- Desktop hero flow reaches `AUTO_BOOK` and four simulated confirmations.
- Family-split and self-transfer routes show exact failed rules.
- Audit state survives browser reload.
- Mobile navigation and reset work at 390px without horizontal overflow.
- Browser console contains no errors during complete flow.
