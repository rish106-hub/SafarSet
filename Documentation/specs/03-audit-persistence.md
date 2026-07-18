# Spec 03: Audit and Persistence

## Goal

Persist complete recovery evidence without making Supabase required for demo.

## Deliverables

- Repository contract for policies, trips, recovery runs, and audit events.
- Supabase migrations and server-only adapter.
- Browser-storage adapter with same contract.
- Fallback selector that returns to local storage on Supabase failure.
- Audit read model covering inputs, candidates, checks, decisions, actions, and notification state.

## Exit

Audit survives refresh with Supabase. Full hero flow survives Supabase outage using local storage.

## Implementation Record

- Added one recovery repository contract for policy, trip, run, action, decision, candidate checks, notification state, and audit evidence.
- Added a browser local-storage adapter and an API-backed adapter with newest-copy reconciliation.
- Local storage is written first. Missing credentials, failed requests, and Supabase outages return `LOCAL` without blocking recovery.
- Added a lazy server-only Supabase client. `SUPABASE_SERVICE_ROLE_KEY` never enters a client module.
- Added bounded `GET` and `PUT` routes restricted to the synthetic hero trip and policy IDs.
- Added timestamped CLI migration for `policies`, `trips`, `recovery_runs`, and `audit_events`.
- Enabled and forced RLS on all four tables. Removed `anon` and `authenticated` privileges. Added indexes for every foreign key read path.
- Added persistence mode to the audit view so the demo states whether Supabase or local fallback stored the run.

## Configuration

The demo needs no credentials. To enable remote persistence, copy `.env.example` to `.env.local` and set server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

Apply the migration with the Supabase CLI after linking a project:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Never prefix the service role key with `NEXT_PUBLIC_`.
