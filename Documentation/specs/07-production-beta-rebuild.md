# Spec 07: Production Beta Rebuild

## Goal

Replace the hackathon runtime with a customer-ready private beta for three to four users.

## Delivered scope

- New SafarSet brand system and production UI.
- Supabase SSR authentication.
- Customer and admin authorization.
- RLS-backed customer data.
- Manual multi-segment trip entry.
- Customer recovery-policy controls.
- Google Calendar read-only OAuth and reviewed import.
- Credential-gated Aviationstack live status checks and deterministic disruption detection.
- Admin operations overview.
- Removal of demo routes, localStorage runtime, and fixture fallback from production.

## Non-goals

- Real ticket, hotel, or transfer execution.
- Payments.
- Gmail inbox access.
- Universal booking import.
- High-scale infrastructure.

## Exit criteria

- No production route imports fixtures.
- Unauthenticated customers cannot read or write trip data.
- One customer cannot link or mutate another customer’s rows.
- Admin access comes from protected role metadata.
- Missing external credentials produce explicit unavailable states.
- Live status checks cannot execute a booking or manufacture alternatives.
- Public, mobile, database, unit, type, lint, build, and browser checks pass.
