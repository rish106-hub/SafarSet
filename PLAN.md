# SafarSet Build Plan

## Product

SafarSet is a family travel-disruption recovery concierge. It detects a cancellation or missed connection, searches for alternatives, rejects unsafe or policy-breaking options, ranks the valid choices, and autonomously executes a recovery within a pre-approved spending limit.

The deterministic recovery engine is the product. External services improve the experience, but the core flow must keep working without them.

**Product promise:** Your family's trip is recovered before you need to manage it.

**Primary user:** An affluent, dual-income Indian family travelling internationally with children.

**Buyer:** A premium credit-card issuer offering SafarSet as a card benefit.

**North Star:** Trusted Autonomous Recovery Rate, defined as the percentage of eligible disruptions recovered within five minutes without human help, hard-policy violations, duplicate actions, or later reversal.

This is a personal, portfolio-grade build inspired by the CodeStreet brief. It is not presented as an eligible CodeStreet submission or a production ticketing platform.

## Product Principles

1. **Deterministic decisions:** An LLM never chooses a flight, approves spending, or interprets safety rules.
2. **Visible honesty:** Every provider response and action shows whether it is live, fixture-backed, or simulated.
3. **Demo first:** The complete hero flow works with no API keys before optional integrations are added.
4. **Safe autonomy:** Hard constraints are never traded away. Uncertain or conflicting data causes escalation.
5. **Graceful degradation:** Failure of Amadeus, Supabase, Resend, or Gemini cannot break the core demo.

## Hero Scenario

A synthetic Gurgaon family of four is returning from Paris through Dubai to Delhi. The Paris to Dubai flight is delayed enough to make the Dubai to Delhi connection impossible.

SafarSet:

1. Detects the missed connection.
2. Searches alternative routes for all four travellers.
3. Rejects routes that split the family, use self-transfer, downgrade the cabin, use an unapproved transit airport, miss the arrival deadline, or violate the connection buffer.
4. Ranks the valid routes using an explainable score.
5. Selects the highest-ranked route within the pre-approved spending limit.
6. Executes a clearly labelled simulated ticket reissue.
7. Simulates an airport-hotel booking and transfer reschedule when needed.
8. Produces an in-app confirmation and optional real email.
9. Stores the inputs, rejected choices, decision, actions, and notification in an audit trail.

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

Transit safety uses a user-approved airport allow-list. SafarSet will not claim to maintain a global visa-rules database.

## Architecture

### Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS, shadcn/ui, and Lucide
- Vitest for recovery-engine tests
- Playwright for browser tests
- Supabase Free for optional persistence
- Resend Free for optional email
- Gemini Free Tier for prose only
- Amadeus Self-Service for optional status and search data
- Vercel Hobby for deployment
- GitHub Actions for test and build checks

Do not add LangChain, AutoGen, Redis, native mobile apps, WhatsApp, payment processing, a visa-rules API, or real ticket reissue to the first release.

### Domain Types

Create these types under `src/domain/`:

- `RecoveryPolicy`
- `FamilyProfile`
- `Trip`
- `FlightSegment`
- `DisruptionEvent`
- `RecoveryCandidate`
- `ConstraintCheck`
- `RecoveryDecision`
- `RecoveryAction`
- `RecoveryRun`

Every provider response includes:

```ts
type ProviderMetadata = {
  source: string;
  isSimulated: boolean;
  observedAt: string;
  confidence: number;
};
```

### Provider Interfaces

Create adapters under `src/providers/`:

```ts
interface TravelProvider {
  getFlightStatus(input: FlightStatusInput): Promise<FlightStatusResult>;
  searchAlternatives(input: AlternativeSearchInput): Promise<RecoveryCandidate[]>;
  executeRebooking(input: RebookingInput): Promise<RebookingResult>;
}

interface AccommodationProvider {
  modifyStay(input: StayChangeInput): Promise<StayChangeResult>;
}

interface TransferProvider {
  rescheduleTransfer(input: TransferChangeInput): Promise<TransferChangeResult>;
}

interface NotificationProvider {
  sendRecoveryConfirmation(input: RecoveryMessage): Promise<NotificationResult>;
}
```

Each interface has a deterministic demo implementation. Amadeus and Resend implementations are optional adapters added only after the demo flow works.

### Recovery Engine

Keep `src/engine/` pure and free of network or database access.

- `detector.ts`: Normalize status events. A connection is impossible when estimated arrival plus the required connection time is later than the next departure.
- `constraints.ts`: Run every hard check and return a pass or fail result with a human-readable reason.
- `ranking.ts`: Rank only candidates that passed every hard check.
- `autonomy.ts`: Decide whether to book, request approval, or escalate.
- `idempotency.ts`: Prevent the same disruption and itinerary from executing twice.

Hard constraints:

- Entire family has seats on one itinerary.
- No self-transfer.
- No more than one stop.
- Cabin is premium economy or better.
- Every transit airport is on the approved list.
- Every international connection is at least 90 minutes.
- Arrival is before the hard deadline.

Ranking weights:

- Arrival delay: 40%
- Incremental cost: 25%
- Number of stops: 15%
- Overnight inconvenience: 10%
- Departure wait: 10%

Soft preferences affect ranking only. Failing a soft preference does not require approval.

Automatically book when:

- Every hard constraint passes.
- Incremental cost is at or below INR 75,000.
- The selected price is no more than five minutes old.
- Provider data is consistent.
- The execution adapter reports availability.

Request approval only when:

- Cost exceeds the automatic spending limit.
- A policy rule explicitly requires approval.
- The user previously marked a choice as approval-only.

Escalate without acting when:

- No valid route exists.
- Provider data conflicts.
- Price or availability cannot be verified.
- Execution returns an unknown result.

The idempotency key is a stable hash of the trip ID, disruption ID, and selected itinerary ID.

## User Experience

Build a responsive PWA with these screens:

1. Card-benefit landing page.
2. Seeded family and editable recovery policy.
3. Active-trip dashboard.
4. Live status check and reliable `Inject disruption` control.
5. Autonomous recovery timeline.
6. Confirmed itinerary, hotel, and transfer changes.
7. `Why this route?` explanation with rejected alternatives.
8. Audit timeline.
9. API Truth Table showing live, fixture-backed, and simulated capabilities.
10. Evaluation dashboard that runs the fixture suite.

Every restricted transaction displays labels such as `SIMULATED_REISSUE`. Simulation is part of the interface, not a disclaimer hidden in documentation.

## Persistence and Fallbacks

The application supports two operating modes:

- `DEMO`: Deterministic fixtures and simulated transactions. Requires no external credentials.
- `LIVE`: Best-effort Amadeus status and search, with simulated execution and automatic fallback to demo data.

Use Supabase tables for:

- `policies`
- `trips`
- `recovery_runs`
- `audit_events`

The browser also stores the seeded demo state and latest demo run in local storage. If Supabase is unavailable, the complete hero flow continues using fixtures and browser storage. Do not rely on server memory for fallback persistence because Vercel functions are stateless.

Use only synthetic travellers. Never collect real passport, payment-card, PNR, or child data.

## Build Stages

### Stage 1: Engine and Fixtures

- Define domain types and demo data.
- Implement detector, constraint checks, ranking, autonomy, and idempotency.
- Create 40 scenarios covering valid recoveries and failure states.
- Write the hero demo script as an acceptance document.

**Exit:** All engine tests pass, hard-constraint compliance is 100%, duplicate actions are zero, and a decision completes in under two seconds without external calls.

### Stage 2: Demo Vertical Slice

- Create the Next.js interface.
- Implement the seeded policy and active trip.
- Add disruption injection, recovery timeline, confirmation, explanations, and source badges.
- Store demo state in browser storage.

**Exit:** The hero scenario runs from start to finish with no API keys.

### Stage 3: Audit and Persistence

- Add Supabase tables and server-side persistence.
- Store every input, candidate, rejection reason, decision, provider result, action, and notification.
- Read the audit timeline back from Supabase.
- Verify browser-storage fallback when Supabase is unavailable.

**Exit:** Audit history survives refresh when Supabase is available, and the demo remains complete when it is not.

### Stage 4: Notifications and Prose

- Add Resend for a real confirmation email using synthetic data.
- Add Gemini only to convert a final structured decision into plain-language prose.
- Keep a deterministic notification template as the default and fallback.

**Exit:** One real integration test proves email delivery. Gemini or Resend failure does not affect the recovery decision or in-app confirmation.

### Stage 5: Honesty Surface and Polish

- Add the API Truth Table.
- Add the policy editor and evaluation dashboard.
- Add one-click reset.
- Polish the responsive layout down to 390px.
- Add Playwright tests and GitHub Actions.

**Exit:** Five consecutive browser runs pass, the truth labels remain visible, and the deployed demo works without external services.

### Stage 6: Optional Amadeus Adapter

- Add live status and alternative search only.
- Hide it behind `PROVIDER_MODE=live`.
- Label every Amadeus result as live.
- Fall back to fixtures when test data is missing, stale, or unavailable.

**Exit:** Live mode adds data but cannot weaken or break demo mode.

## Verification

### Unit and Scenario Tests

Create at least 40 fixtures covering:

- Cancellation
- Missed connection
- Family split
- Insufficient seats
- Disallowed transit airport
- Self-transfer
- Cabin downgrade
- Late arrival
- Cost over limit
- Stale price
- Duplicate disruption
- Conflicting provider data
- Provider timeout
- Email failure
- No valid route
- Overnight hotel requirement

Required assertions:

- 100% hard-constraint compliance
- Zero duplicate execution
- Zero autonomous action on conflicting data
- At least 95% recovery success when a valid candidate and successful execution path exist
- Decision completes in under two seconds without external latency

### Browser Tests

Playwright covers:

1. Seed family.
2. Edit and save policy.
3. Inject disruption.
4. Run autonomous recovery.
5. Confirm itinerary, hotel, and transfer actions.
6. Display the explanation and source badges.
7. Populate the audit timeline.
8. Reset and repeat.

Mock Resend in Playwright. Do not send real email during the browser suite. Keep one separate, manually triggered integration test for real email delivery.

Run the hero flow five consecutive times. All runs must pass.

### Resilience Checks

- Disable every API key and complete the hero flow.
- Make Supabase unavailable and verify browser-storage fallback.
- Make Gemini fail and verify deterministic prose.
- Make Resend fail and verify in-app confirmation plus a logged notification failure.
- Return an unknown execution state and verify escalation without a second booking attempt.
- Render at 390px and verify that all controls and truth labels remain usable.

## Deliverables

Core deliverables:

- Deployed Vercel application
- Public GitHub repository
- README with setup, architecture, limitations, costs, and test commands
- API Truth Table
- Short screen recording of the hero flow

Optional deliverables:

- Eight-slide pitch deck
- Formal evaluation report
- Separate architecture document

## Cost and Secrets

Target cost is INR 0. Keep billing disabled and stay within free tiers.

Server-side environment variables:

```text
AMADEUS_CLIENT_ID
AMADEUS_CLIENT_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
GEMINI_API_KEY
APP_BASE_URL
PROVIDER_MODE
```

Stages 1 and 2 require no secrets. Add credentials only when their stage begins.

## Scope Guards

- One synthetic family and one hero itinerary.
- Deterministic engine only.
- No real ticket, hotel, transfer, or payment transaction.
- No native mobile application.
- No production authentication or multi-user account system.
- No global visa interpretation.
- No dependency may make demo mode unreliable.
- If an integration blocks progress, ship the previous stage's complete exit state.
