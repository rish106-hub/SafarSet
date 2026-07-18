# SafarSet

[![PR Hygiene](https://github.com/rish106-hub/SafarSet/actions/workflows/pr-hygiene.yml/badge.svg)](https://github.com/rish106-hub/SafarSet/actions/workflows/pr-hygiene.yml)
[![Repo Labels](https://github.com/rish106-hub/SafarSet/actions/workflows/repo-labels.yml/badge.svg)](https://github.com/rish106-hub/SafarSet/actions/workflows/repo-labels.yml)

SafarSet is a family travel-disruption recovery concierge for premium cardholders.

It helps a travelling family recover from a cancellation or missed connection before they have to manage the crisis themselves.

## Product Promise

> Your family's trip is recovered before you need to manage it.

## The Problem

Flight disruption recovery is still too manual.

When a family misses an international connection, the traveller has to compare flights, protect hotel bookings, coordinate airport transfer changes, call support, understand policy limits, and avoid bad choices while alternative seats disappear.

That is not a normal planning problem. It is a time-sensitive recovery problem.

## Target User

SafarSet starts with a narrow ICP:

- Affluent, dual-income Indian family.
- Based in a metro area such as Gurgaon or Delhi NCR.
- Travels internationally with one or two children.
- Uses premium cards, forex products, and online travel tools.
- Values control, but does not want to handle logistics during airport disruption.

The user is not helpless. They are busy, informed, and willing to pre-authorize rules if the system acts safely.

## Buyer

SafarSet is a B2B2C product.

- Buyer: premium credit-card issuer, travel insurer, airline, or OTA.
- User: card member and travelling family.
- Beneficiaries: spouse, children, and other travellers on the booking.

For the buyer, SafarSet is a premium retention benefit. It can reduce support load and create a card benefit that feels tangible during a stressful moment.

## Core Insight

Generic rebooking tools show options.

SafarSet is different because it uses a pre-approved Family Recovery Policy before disruption happens.

That policy defines what the system can and cannot do:

- Keep the family together.
- Never use self-transfer.
- Preserve premium economy or better.
- Use only approved transit airports.
- Maintain safe international connection buffers.
- Arrive before a hard school or work deadline.
- Spend automatically only within a pre-approved limit.

The product is not "AI finds flights." The product is "a policy-safe recovery engine restores the whole family journey."

## Hero Scenario

A synthetic Gurgaon family of four is returning from Paris through Dubai to Delhi.

The Paris to Dubai flight is delayed enough to make the Dubai to Delhi connection impossible.

SafarSet:

1. Detects the missed connection.
2. Searches alternative routes for all four travellers.
3. Rejects unsafe or policy-breaking options.
4. Ranks valid routes with an explainable score.
5. Selects the best route within the automatic spend limit.
6. Executes a visibly simulated reissue.
7. Simulates hotel and transfer changes when needed.
8. Shows confirmation and audit trail.

## North Star

Trusted Autonomous Recovery Rate.

Definition:

The percentage of eligible disruptions recovered within five minutes without human help, hard-policy violations, duplicate actions, or later reversal.

Supporting metrics:

- Detection time.
- Hard-constraint violation rate.
- Duplicate execution rate.
- Human escalation rate.
- Recovery success rate when a valid option exists.
- Median time to confirmed recovery.
- User clarity of notification.

## MVP Scope

The first version proves the recovery engine and demo flow.

In scope:

- Family recovery policy.
- Active trip dashboard.
- Deterministic disruption injection.
- Candidate rejection and ranking.
- Simulated flight reissue.
- Simulated hotel and transfer recovery.
- Audit trail.
- API truth labels.
- Evaluation dashboard.

Out of scope:

- Real ticket reissue.
- Real hotel or transfer booking.
- Real payment processing.
- Production auth.
- Global visa-rule interpretation.
- LLM-based route selection or spend approval.

## Operating Principle

Demo mode must work without external services.

External services can improve the product, but they must not control the core recovery decision. If Amadeus, Supabase, Resend, or Gemini fails, the demo should still complete through deterministic fixtures and browser storage.

## Source Documents

Start here:

- [SafarSet PRD](./Documentation/SafarSetPRD.md)
- [SafarSet Plan](./Documentation/SafarSetPlan.md)
- [SafarSet GStack Review](./Documentation/SafarSetGStack%20Review.md)
- [Build Plan](./PLAN.md)

Supporting docs:

- [Architecture](./Documentation/ARCHITECTURE.md)
- [Hero Demo Acceptance](./Documentation/HeroDemoAcceptance.md)
- [Stage Specs](./Documentation/specs/)
- [Contribution Guidelines](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)
- [Main Branch Ruleset](./.github/rulesets/README.md)

## Branch Policy

`main` is the approved documentation and repository-governance branch.

Implementation work stays on scoped branches until explicitly approved.

Current implementation branch:

- `codex/spec3-persistence`

## Demo Notes

Current implementation branches may include a local demo.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No external credentials are required.

Expected demo flow:

1. Review protected trip benefit.
2. Edit or accept family recovery policy.
3. Open active Paris to Dubai to Delhi trip.
4. Inject deterministic disruption.
5. Run safe recovery.
6. Review confirmations, rejected alternatives, and audit trail.
7. Reset and repeat.

## Optional Supabase Persistence

Spec 3 mirrors complete recovery evidence to Supabase when server credentials exist. Local storage is written first, so a missing or failed Supabase connection does not block recovery.

```bash
cp .env.example .env.local
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. The service role key is server-only. Never add `NEXT_PUBLIC_` to it.

## Safety Rules

- Use synthetic travellers only.
- Do not collect or commit real passport, payment-card, PNR, child, or booking data.
- Do not claim real ticket, hotel, transfer, or payment execution until commercial provider access exists.
- Label simulated actions visibly, such as `SIMULATED_REISSUE`.
- LLMs may write prose only. They must not choose routes, approve spend, or interpret safety rules.
