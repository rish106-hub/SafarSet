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
