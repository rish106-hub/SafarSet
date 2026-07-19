# SafarSet Production Beta Architecture

## Runtime boundary

Production routes never import fixture data or demo providers.

```text
src/app
  -> src/application/dal
  -> Supabase client with the signed-in session
  -> Postgres RLS

src/app/api
  -> verified Supabase user
  -> server-only provider service
  -> Aviationstack or Google

src/application/services
  -> provider contracts
  -> deterministic engine
  -> domain
```

The engine still imports only domain and engine modules. It has no network, storage, environment, React, Next.js, clock, or randomness dependency.

## Authentication

- Supabase Auth owns password hashing and sessions.
- `@supabase/ssr` stores sessions in cookies.
- `src/proxy.ts` refreshes sessions and provides navigation redirects.
- Every page, action, and route handler rechecks authentication.
- Admin authorization reads `app_metadata.role`. User-editable metadata is never used for authorization.
- Service-role keys are server-only.

## Database ownership

Exposed tables:

- `profiles`
- `policies`
- `trips`
- `trip_segments`
- `recovery_runs`
- `audit_events`

Every table has RLS. Customer writes require `auth.uid() = user_id`. Segment writes also require ownership of the parent trip. Trip writes also require ownership of the linked policy.

Provider tokens live in `private.provider_connections`. The private schema is not exposed to customer roles.

## Provider boundary

Google Calendar:

- OAuth state is stored in an HTTP-only cookie.
- Access and refresh tokens use AES-256-GCM at rest.
- Read-only calendar-event scope.
- Imported event data is treated as a candidate, not a saved trip.

Aviationstack:

- API key stays server-only.
- One live-status request is made for each saved flight segment.
- Status is fetched before disruption detection.
- The API does not supply alternate offers. SafarSet escalates rather than inventing one.
- Ticket execution is absent.
- Provider errors return an unavailable response. Production does not silently substitute fixtures.

## Disruption semantics

Live timing passes through deterministic cancellation and missed-connection detection. A disruption returns current timing evidence and an escalation instruction. No external offer, cost, seat, or booking claim is created without a provider that can supply it.

## Test fixtures

`src/data` contains synthetic fixtures for unit and scenario tests only. Production route modules do not import it. This separation keeps hard-rule regression coverage without putting synthetic customer data into the product.
