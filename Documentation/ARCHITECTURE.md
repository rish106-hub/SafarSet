# SafarSet Architecture

## Core Rule

`src/engine` is deterministic policy code. It may import only `src/domain` and other engine modules. It cannot import React, Next.js, providers, persistence, browser APIs, environment variables, network clients, clocks, random values, or mutable module state.

Current time, provider consistency, execution availability, and used idempotency keys enter through function inputs.

## Dependency Direction

```text
app and features
  -> application services
  -> provider and persistence contracts
  -> engine
  -> domain

demo, Supabase, Resend, Gemini, and Amadeus adapters
  -> their contract
  -> domain
```

Adapters never change engine rules. Application services coordinate I/O around a completed deterministic decision.

The Amadeus adapter is server-only. A client fallback wrapper rejects stale, incomplete, conflicting, unavailable, or discontinuous live data before it reaches the engine. Valid live offers are added beside deterministic fixtures, never substituted for the fixture floor. Live status and search can enrich the flow. Execution always uses the demo adapter.

## Planned Tree

```text
Documentation/specs/              Branch contracts
src/app/                           Next.js routes and layouts
src/components/ui/                 Shared UI primitives
src/components/layout/             Navigation and shells
src/features/policy/               Policy presentation and editing
src/features/trip/                 Active trip presentation
src/features/recovery/             Recovery flow and explanations
src/features/audit/                Audit presentation
src/features/truth/                API Truth Table
src/features/evaluation/           Fixture evaluation dashboard
src/domain/models/                 Stable business data contracts
src/engine/                        Pure recovery policy engine
src/application/ports/             Persistence and orchestration ports
src/application/services/          Recovery workflow coordination
src/providers/contracts/           External service interfaces
src/providers/demo/                Deterministic fixture adapters
src/providers/amadeus/             Optional status and search adapter
src/providers/resend/              Optional email adapter
src/providers/gemini/              Optional prose adapter
src/persistence/contracts/         Audit repository interface
src/persistence/local/             Browser fallback
src/persistence/supabase/          Optional server persistence
src/data/                           Synthetic family, trip, and scenarios
src/lib/                            Environment, formatting, validation
tests/unit/                         Module-level engine tests
tests/scenarios/                    Deterministic fixture suite
tests/integration/                  Manually enabled service tests
tests/e2e/                          Playwright hero flow
supabase/migrations/                Database schema
```

Only directories with working files should exist. Later branches add their modules when implementation starts.

## Data Rules

- IDs are opaque strings.
- Times are ISO-8601 UTC strings.
- Airports are uppercase IATA codes.
- Money uses integer minor units and explicit `INR` currency.
- Every provider result includes source, mode, simulation status, observation time, and confidence.
- Only synthetic travellers are allowed.
- Passport, card, PNR, and real child data are forbidden.

## Ranking

Only candidates passing every hard constraint enter ranking. Numeric factors use lower-is-better min-max normalization across eligible candidates.

- Arrival delay: 40%
- Incremental cost: 25%
- Stops: 15%
- Overnight inconvenience: 10%
- Departure wait: 10%

Ties resolve by lower cost, earlier arrival, then lexical candidate ID.

## Runtime Modes

- `DEMO`: fixtures, simulated actions, browser storage, no secrets.
- `LIVE`: best-effort live status and search, simulated execution, automatic demo fallback.

No optional adapter may make `DEMO` mode less reliable.
