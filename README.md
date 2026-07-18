# SafarSet

[![PR Hygiene](https://github.com/rish106-hub/SafarSet/actions/workflows/pr-hygiene.yml/badge.svg)](https://github.com/rish106-hub/SafarSet/actions/workflows/pr-hygiene.yml)
[![Repo Labels](https://github.com/rish106-hub/SafarSet/actions/workflows/repo-labels.yml/badge.svg)](https://github.com/rish106-hub/SafarSet/actions/workflows/repo-labels.yml)

SafarSet is a deterministic family travel-disruption recovery concierge.

The product promise is simple:

> Your family's trip is recovered before you need to manage it.

## Main Branch Scope

`main` is the approved documentation and project-control branch.

It contains:

- Product plan.
- PRD.
- Build plan.
- Architecture notes.
- Stage specs.
- Contribution rules.
- Security policy.
- GitHub issue and PR templates.
- Repository automation for labeling and PR hygiene.

Implementation code stays on scoped branches until explicitly approved.

Current implementation branch:

- `codex/spec1`

## Product Direction

SafarSet detects a cancellation or missed connection, searches alternatives, rejects unsafe or policy-breaking choices, ranks valid routes, and executes a clearly labelled simulated recovery inside a pre-approved spending limit.

The deterministic recovery engine is the product. External integrations improve the experience, but the demo must keep working without them.

## Documentation

- [Build Plan](./PLAN.md)
- [PRD](./Documentation/SafarSetPRD.md)
- [Implementation Plan](./Documentation/SafarSetPlan.md)
- [GStack Review](./Documentation/SafarSetGStack%20Review.md)
- [Architecture](./Documentation/ARCHITECTURE.md)
- [Hero Demo Acceptance](./Documentation/HeroDemoAcceptance.md)
- [Stage Specs](./Documentation/specs/)
- [Contribution Guidelines](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)

## Contribution Flow

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

Short version:

- Work from a scoped branch.
- Do not push implementation code directly to `main`.
- Keep real traveller data and secrets out of the repo.
- Use the PR template.
- Explain safety impact.
- Keep simulated actions visibly labelled.

## Safety

All travellers and bookings are synthetic.

SafarSet must not collect or commit real passport, payment-card, PNR, child, or booking data.
