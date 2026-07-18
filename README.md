# SafarSet

[![CI](https://github.com/rish106-hub/SafarSet/actions/workflows/ci.yml/badge.svg)](https://github.com/rish106-hub/SafarSet/actions/workflows/ci.yml)
[![PR Hygiene](https://github.com/rish106-hub/SafarSet/actions/workflows/pr-hygiene.yml/badge.svg)](https://github.com/rish106-hub/SafarSet/actions/workflows/pr-hygiene.yml)
[![Repo Labels](https://github.com/rish106-hub/SafarSet/actions/workflows/repo-labels.yml/badge.svg)](https://github.com/rish106-hub/SafarSet/actions/workflows/repo-labels.yml)

SafarSet is a deterministic family travel-disruption recovery concierge. Current branch implements engine foundation only.

## Requirements

- Node.js 20.9 or newer
- npm

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

## Current Scope

- Explicit domain model.
- Cancellation and missed-connection detection.
- Seven hard recovery constraints.
- Explainable weighted ranking.
- Autonomous, approval, and escalation decisions.
- Caller-owned duplicate-execution protection.
- Forty deterministic scenario fixtures.
- No external services or credentials.

See [PLAN.md](./PLAN.md), [architecture](./Documentation/ARCHITECTURE.md), and [branch specs](./Documentation/specs/).

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

Main requirements:

- Work from a scoped branch, not directly on `main`.
- Keep demo mode working without API keys.
- Run lint, typecheck, tests, and build before review.
- Keep real traveller data and secrets out of the repo.
- Use the pull request template and explain safety impact.

## Safety

All travellers and bookings are synthetic. Current code does not collect passport, payment-card, PNR, or real child data. Ticket, hotel, and transfer execution remains out of scope for this branch.
