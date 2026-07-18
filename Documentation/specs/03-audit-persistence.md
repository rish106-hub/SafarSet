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
