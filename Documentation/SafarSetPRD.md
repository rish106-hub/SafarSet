# SafarSet PRD

## Product Summary

SafarSet is a family travel-disruption recovery concierge.

It detects a cancellation or missed connection, searches for alternative routes, rejects unsafe or policy-breaking options, ranks valid choices, and executes a simulated recovery within a pre-approved spending limit.

The deterministic recovery engine is the product. External services can improve the experience, but the core demo must work without them.

Product promise:

> Your family's trip is recovered before you need to manage it.

## Product Context

SafarSet is a personal, portfolio-grade build inspired by the CodeStreet brief.

It should not be presented as:

- An eligible CodeStreet submission unless the team confirms eligibility.
- A production ticketing platform.
- A real travel agency.
- A real payment, reissue, or visa-compliance system.

The correct framing is:

- Premium card travel benefit.
- Safe autonomous recovery.
- Deterministic policy enforcement.
- Transparent simulation and auditability.

## Primary User

An affluent, dual-income Indian family travelling internationally with children.

## Buyer

A premium credit-card issuer offering SafarSet as a card benefit.

## North Star Metric

Trusted Autonomous Recovery Rate.

Definition:

The percentage of eligible disruptions recovered within five minutes without human help, hard-policy violations, duplicate actions, or later reversal.

## Problem

International family travel breaks under disruption.

When a cancellation or missed connection happens, the family needs fast recovery across flights, hotel, transfers, and notifications. Current options are slow and stressful:

- Airline counters are crowded.
- Apps show options but do not enforce family policies.
- Families risk split itineraries, unsafe transfers, cabin downgrades, or bad layovers.
- Premium card issuers often provide travel benefits, but not real-time recovery help.
- Human support can be expensive, delayed, and hard to audit.

The user does not need another itinerary planner. The user needs a trusted recovery system that acts only inside clear rules.

## Product Principles

1. Deterministic decisions: an LLM never chooses a flight, approves spending, or interprets safety rules.
2. Visible honesty: every provider response and action shows whether it is live, fixture-backed, or simulated.
3. Demo first: the complete hero flow works with no API keys.
4. Safe autonomy: hard constraints are never traded away.
5. Graceful degradation: failure of Amadeus, Supabase, Resend, or Gemini cannot break the core demo.

## Hero Scenario

A synthetic Gurgaon family of four is returning from Paris through Dubai to Delhi.

The Paris to Dubai flight is delayed enough to make the Dubai to Delhi connection impossible.

SafarSet must:

1. Detect the missed connection.
2. Search alternative routes for all four travellers.
3. Reject routes that split the family, use self-transfer, downgrade the cabin, use an unapproved transit airport, miss the arrival deadline, or violate the connection buffer.
4. Rank valid routes using an explainable score.
5. Select the highest-ranked route within the pre-approved spending limit.
6. Execute a clearly labelled simulated ticket reissue.
7. Simulate an airport-hotel booking and transfer reschedule when needed.
8. Produce an in-app confirmation and optional real email.
9. Store inputs, rejected choices, decision, actions, and notification in an audit trail.

## Family Recovery Policy

The seeded family can edit these rules:

- Keep all travellers together.
- Never use self-transfer.
- Allow at most one stop.
- Preserve premium economy or better.
- Use only explicitly approved transit airports.
- Require at least 90 minutes for international connections.
- Avoid overnight waits as a soft preference.
- Arrive in Delhi before Sunday at 8 PM.
- Automatically spend up to INR 75,000.

Transit safety uses a user-approved airport allow-list.

SafarSet must not claim to maintain a global visa-rules database.

## Core Product Flow

1. User opens the card-benefit landing page.
2. User reviews seeded family profile and recovery policy.
3. User enters or views active trip details.
4. User triggers a live status check or injects the demo disruption.
5. SafarSet detects the disruption.
6. SafarSet evaluates recovery candidates.
7. SafarSet rejects invalid options with clear reasons.
8. SafarSet ranks valid options.
9. SafarSet decides whether to book, request approval, or escalate.
10. SafarSet executes simulated recovery actions.
11. User sees confirmed itinerary, hotel, transfer, explanation, and audit trail.

## MVP Features

### 1. Card-Benefit Landing Page

The first screen should explain the premium-card recovery benefit in plain language and lead directly into the working demo.

Avoid a generic travel marketing page.

### 2. Seeded Family and Editable Policy

Show the synthetic family, trip, and recovery policy.

Users can edit policy rules such as spending limit, approved transit airports, cabin minimum, connection buffer, and arrival deadline.

### 3. Active-Trip Dashboard

Show:

- Current trip.
- Flight segments.
- Family profile.
- Recovery policy summary.
- Current status.
- Source labels.

### 4. Disruption Detection

The app must include a reliable `Inject disruption` control for the hero scenario.

It should also support optional provider-backed status checks later.

### 5. Recovery Timeline

Show each step:

- Disruption detected.
- Alternatives searched.
- Hard constraints checked.
- Invalid candidates rejected.
- Valid candidates ranked.
- Decision made.
- Simulated actions executed.
- Confirmation sent or logged.

### 6. Confirmed Recovery View

Show:

- New itinerary.
- Hotel change if needed.
- Transfer reschedule if needed.
- Cost impact.
- Simulation labels such as `SIMULATED_REISSUE`.

### 7. Why This Route?

Show the selected route and rejected alternatives.

Each rejected option must include the exact failed rule.

### 8. Audit Timeline

Persist and display:

- Inputs.
- Provider responses.
- Constraint results.
- Ranking decision.
- Recovery actions.
- Notification status.

### 9. API Truth Table

Show whether each capability is:

- Live.
- Fixture-backed.
- Simulated.
- Unavailable.

This is part of the product surface, not a hidden disclaimer.

### 10. Evaluation Dashboard

Run fixture scenarios and show:

- Hard-constraint compliance.
- Duplicate execution count.
- Recovery success when valid candidates exist.
- Decision latency.
- Failure handling.

## Recovery Engine Requirements

Keep `src/engine/` pure.

No network access. No database access. No provider calls.

Required modules:

- `detector.ts`
- `constraints.ts`
- `ranking.ts`
- `autonomy.ts`
- `idempotency.ts`

### Hard Constraints

SafarSet must never autonomously select a route unless:

- Entire family has seats on one itinerary.
- No self-transfer is required.
- Route has no more than one stop.
- Cabin is premium economy or better.
- Every transit airport is on the approved list.
- Every international connection is at least 90 minutes.
- Arrival is before the hard deadline.

### Ranking Weights

Rank only candidates that pass every hard constraint.

- Arrival delay: 40%
- Incremental cost: 25%
- Number of stops: 15%
- Overnight inconvenience: 10%
- Departure wait: 10%

Soft preferences affect ranking only.

### Autonomy Rules

Automatically book when:

- Every hard constraint passes.
- Incremental cost is at or below INR 75,000.
- The selected price is no more than five minutes old.
- Provider data is consistent.
- The execution adapter reports availability.

Request approval when:

- Cost exceeds the automatic spending limit.
- A policy rule explicitly requires approval.
- User previously marked a choice as approval-only.

Escalate without acting when:

- No valid route exists.
- Provider data conflicts.
- Price or availability cannot be verified.
- Execution returns an unknown result.

### Idempotency

The idempotency key is a stable hash of:

- Trip ID.
- Disruption ID.
- Selected itinerary ID.

The same disruption and itinerary must not execute twice.

## Data and Privacy

Use only synthetic travellers.

Never collect:

- Real passport data.
- Real payment-card data.
- Real PNR data.
- Real child data.

## Operating Modes

### DEMO

- Deterministic fixtures.
- Simulated transactions.
- No external credentials.
- Complete hero flow works offline from external APIs.

### LIVE

- Best-effort Amadeus status and alternative search.
- Simulated execution remains.
- Automatic fallback to demo data when live data is missing, stale, or unavailable.

## Success Metrics

- Hero recovery completes in under five minutes from disruption.
- Engine decision completes in under two seconds without external calls.
- 100% hard-constraint compliance across fixtures.
- Zero duplicate executions.
- Zero autonomous action on conflicting provider data.
- At least 95% recovery success when a valid candidate and successful execution path exist.
- Five consecutive browser hero runs pass.

## Non-Goals

- Real ticket reissue.
- Real hotel booking.
- Real transfer booking.
- Real payment processing.
- Native mobile apps.
- Production authentication.
- Multi-user account system.
- Global visa interpretation.
- LLM-based decision authority.

## Key Risks

### Over-Scoping

Travel products expand fast.

Mitigation:

- One synthetic family.
- One hero itinerary.
- Deterministic recovery engine first.
- Optional integrations only after demo mode works.

### Unsafe Autonomy

Autonomy is only acceptable if the system is conservative.

Mitigation:

- Hard constraints are non-negotiable.
- Conflicts trigger escalation.
- Unknown execution states do not retry booking.

### Weak Honesty Surface

If simulation is hidden, the product looks fake.

Mitigation:

- Put live, fixture-backed, and simulated labels directly in the UI.
- Add an API Truth Table.

### Demo Fragility

External APIs can fail.

Mitigation:

- Demo mode must not require secrets.
- Fixture-backed flow must remain complete.
- Live mode cannot weaken demo mode.
