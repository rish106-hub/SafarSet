# Spec 05: Honesty and Hardening

## Goal

Make demo trustworthy, repeatable, responsive, and ready for public review.

## Deliverables

- API Truth Table for status, search, reissue, hotel, transfer, email, prose, and audit.
- Evaluation dashboard backed by scenario suite.
- One-click reset and complete empty, loading, and error states.
- Responsive PWA behavior down to 390px.
- Playwright hero suite and GitHub Actions checks.
- README with setup, architecture, limits, cost, and commands.

## Exit

Five consecutive browser runs pass. Truth labels remain visible. Deployed demo works without external services.

## Implementation

- API Truth lists status, search, reissue, hotel, transfer, email, prose, and audit capability boundaries.
- Evaluation runs the same 40 fixture scenarios used by the unit suite.
- Report covers expected outcomes, hard-rule compliance, eligible recovery, duplicates, conflicts, stability, and runtime.
- Reset writes a browser tombstone so stale shared Supabase evidence cannot rehydrate after a local reset.
- Reset never deletes shared remote demo evidence.
- Empty, loading, complete, and error states are explicit.
- Web manifest, scalable install icon, service worker, and offline shell form the PWA boundary.
- Playwright completes five no-key hero runs plus a 390px truth check.
- CI installs Chromium and runs the browser suite after build.
