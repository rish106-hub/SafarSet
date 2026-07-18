# SafarSet

[![PR Hygiene](https://github.com/rish106-hub/SafarSet/actions/workflows/pr-hygiene.yml/badge.svg)](https://github.com/rish106-hub/SafarSet/actions/workflows/pr-hygiene.yml)
[![Repo Labels](https://github.com/rish106-hub/SafarSet/actions/workflows/repo-labels.yml/badge.svg)](https://github.com/rish106-hub/SafarSet/actions/workflows/repo-labels.yml)

SafarSet is a deterministic family travel-disruption recovery concierge for premium cardholders.

It detects cancellations or missed connections, evaluates recovery options against a family-approved policy, rejects unsafe routes, ranks valid choices, and executes a clearly labelled simulated recovery within a pre-approved spending limit.

## Product Promise

> Your family's trip is recovered before you need to manage it.

## Source Documents

Start here:

- [SafarSet PRD](./Documentation/SafarSetPRD.md): product definition, ICP, buyer, north star, problem, MVP, recovery policy, success metrics, and risks.
- [SafarSet Plan](./Documentation/SafarSetPlan.md): build stages, demo flow, provider interfaces, verification plan, deliverables, cost guardrails, and scope limits.
- [SafarSet GStack Review](./Documentation/SafarSetGStack%20Review.md): technical stack review, architecture choices, provider strategy, testing approach, and what not to build.
- [Build Plan](./PLAN.md): consolidated engine-first build plan.

Supporting docs:

- [Architecture](./Documentation/ARCHITECTURE.md)
- [Hero Demo Acceptance](./Documentation/HeroDemoAcceptance.md)
- [Stage Specs](./Documentation/specs/)
- [Contribution Guidelines](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)
- [Main Branch Ruleset](./.github/rulesets/README.md)

## Main Branch Scope

`main` is the approved documentation and repository-governance branch.

It contains product direction, planning docs, contribution rules, safety policy, issue templates, PR templates, labels, and repo automation.

Implementation code stays on scoped branches until explicitly approved.

`main` is intended to be protected by the [main branch ruleset](./.github/rulesets/main-branch-protection.json).

Current implementation branch:

- `codex/spec1`

## Core Direction

SafarSet is not a generic itinerary planner.

The product is a pre-authorized recovery engine that restores the whole family journey during disruption without breaking hard safety constraints.

Hard constraints include:

- Keep all travellers together.
- Never use self-transfer.
- Preserve premium economy or better.
- Use only approved transit airports.
- Maintain at least 90 minutes for international connections.
- Arrive before the hard deadline.
- Stay within the automatic spend limit unless approval is required.

## Operating Modes

- `DEMO`: deterministic fixtures and simulated transactions. No external credentials.
- `LIVE`: optional provider-backed status and search, with simulated execution and fallback to demo data.

The demo must work without API keys.

## Safety Rules

- Use synthetic travellers only.
- Do not collect or commit real passport, payment-card, PNR, child, or booking data.
- Do not claim real ticket, hotel, transfer, or payment execution until commercial provider access exists.
- Label simulated actions visibly, such as `SIMULATED_REISSUE`.
- LLMs may write prose only. They must not choose routes, approve spend, or interpret safety rules.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

Short version:

- Work from a scoped branch.
- Do not push implementation code directly to `main`.
- Keep demo mode working without API keys.
- Use the pull request template.
- Explain safety impact.
- Keep secrets and real traveller data out of the repo.
