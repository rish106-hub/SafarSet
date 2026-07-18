# Spec 01: Engine Foundation

## Goal

Prove SafarSet can detect a disruption, reject unsafe recovery options, rank valid options, choose an autonomy outcome, and block duplicate execution without external calls.

## Deliverables

- Next.js, TypeScript, Tailwind, ESLint, and Vitest scaffold.
- Domain models and provider contracts.
- Pure detector, constraints, ranking, autonomy, idempotency, and evaluation modules.
- Synthetic Gurgaon family and Paris to Dubai to Delhi hero data.
- Forty numbered scenario fixtures.
- Unit and scenario tests.
- Architecture and hero acceptance documents.

## Required Decisions

- Every hard rule returns a pass or fail plus human-readable reason.
- Ranking receives only hard-rule-compliant candidates.
- Stale, conflicting, unknown, unavailable, or duplicate execution states escalate.
- Cost above INR 75,000 and explicit approval-only routes request approval.
- Idempotency key is stable 64-bit non-security hash of trip, disruption, and itinerary IDs.

## Exit

- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass.
- Forty fixtures complete under two seconds.
- Hard-constraint compliance is 100%.
- Duplicate autonomous actions are zero.
- Conflicting provider data causes zero autonomous actions.
