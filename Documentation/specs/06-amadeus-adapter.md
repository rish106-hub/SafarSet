# Spec 06: Optional Amadeus Adapter

## Goal

Enrich status and alternative search with live data without weakening deterministic demo.

## Deliverables

- Amadeus authentication, flight-status, and alternative-search adapter.
- Lazy server-side client initialization.
- `PROVIDER_MODE=live` gate.
- Live source metadata and freshness checks.
- Fixture fallback for missing, stale, conflicting, timed-out, or failed responses.
- Simulated reissue, hotel, and transfer actions remain explicit.

## Exit

Live mode adds data only. Removing credentials or breaking Amadeus still leaves full demo flow operational.

## Implementation

- `PROVIDER_MODE=demo` is the safe default and never calls the live route.
- `PROVIDER_MODE=live` attempts server-side Amadeus status and offer search.
- OAuth credentials remain server-only and the adapter initializes lazily.
- Live responses must be fresh, complete, route-consistent, seat-available, and marked live.
- Failed validation, missing data, timeouts, and provider errors fall back to deterministic fixtures.
- Usable live offers are added beside fixture offers. They never remove the known-valid demo route.
- Offer total is treated as a conservative spend ceiling because it is not a verified ticket-change fare delta.
- Ticket reissue, hotel change, and transfer change remain visibly simulated.
