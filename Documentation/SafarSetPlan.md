# SafarSet Plan

## Build Objective

Build SafarSet as a reliable demo of autonomous family travel-disruption recovery.

The target output is a deployed Vercel app, public GitHub repo, README, API Truth Table, tests, and a short screen recording of the hero flow.

The first release must prove the deterministic recovery engine. It should not chase real ticketing, payments, visa checks, or a broad travel-planning product.

## Repository Description

Autonomous family travel recovery that rebooks flights, hotels, and transfers during disruptions.

## Locked Assumptions

- Working name: SafarSet.
- Build target: portfolio-grade hybrid MVP.
- Build team: solo unless changed later.
- Build period: one to two weeks.
- Cost target: INR 0.
- First release: one synthetic demo family.
- Notifications: in-app plus optional email.
- Deployment: responsive web PWA.
- Autonomy: automatic action only within pre-approved policy.
- CodeStreet is the source brief, not an official submission claim.
- A written eligibility exception is needed before treating this as an official final-year-only submission.

## Demo Promise

Show that a premium cardholder family can be recovered from a missed international connection without manual panic.

The demo must make this clear:

- The family stays together.
- Unsafe or policy-breaking routes are rejected.
- The selected route is explainable.
- The recovery action stays within the pre-approved limit.
- Every simulated action is visibly labelled.
- The audit trail proves what happened.

## Hero Demo

Seeded scenario:

- Family: synthetic Gurgaon family of four.
- Persona: affluent, dual-income, attention-constrained Indian parents with one or two children.
- Route: Paris to Dubai to Delhi.
- Disruption: Paris to Dubai delay makes Dubai to Delhi connection impossible.
- Policy: keep family together, no self-transfer, at most one stop, premium economy or better, approved transit airports only, 90-minute international connection buffer, Delhi before Sunday 8 PM, auto-spend up to INR 75,000.

Expected demo flow:

1. Open landing page.
2. View seeded family and recovery policy.
3. Open active trip dashboard.
4. Inject disruption.
5. Watch recovery timeline.
6. View rejected alternatives and reasons.
7. View selected route and simulated actions.
8. View audit timeline.
9. Open API Truth Table.
10. Run evaluation dashboard.

## Stage 1: Engine and Fixtures

### Scope

- Define domain types.
- Create deterministic demo data.
- Implement recovery engine.
- Create 40 scenario fixtures.
- Write hero demo script as an acceptance document.
- Encode family-specific recovery constraints, including school and work deadline examples.

### Domain Types

Create under `src/domain/`:

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

### Engine Modules

Create under `src/engine/`:

- `detector.ts`: normalize status events and identify impossible connections.
- `constraints.ts`: run every hard check and return pass or fail with reason.
- `ranking.ts`: rank only candidates that passed every hard check.
- `autonomy.ts`: decide whether to book, request approval, or escalate.
- `idempotency.ts`: prevent duplicate execution.

### Exit Criteria

- All engine tests pass.
- Hard-constraint compliance is 100%.
- Duplicate actions are zero.
- Decision completes in under two seconds without external calls.

## Stage 2: Demo Vertical Slice

### Scope

- Create the Next.js interface.
- Implement seeded policy and active trip.
- Add disruption injection.
- Add recovery timeline.
- Add confirmation views.
- Add rejected-alternative explanations.
- Add source badges.
- Store demo state in browser storage.

### Required Screens

1. Card-benefit landing page.
2. Seeded family and editable recovery policy.
3. Active-trip dashboard.
4. Live status check and reliable `Inject disruption` control.
5. Autonomous recovery timeline.
6. Confirmed itinerary, hotel, and transfer changes.
7. `Why this route?` explanation with rejected alternatives.
8. Audit timeline.
9. API Truth Table.
10. Evaluation dashboard.

### Exit Criteria

The hero scenario runs from start to finish with no API keys.

## Stage 3: Audit and Persistence

### Scope

- Add Supabase tables.
- Store each recovery run server-side.
- Read audit timeline back from Supabase.
- Keep browser-storage fallback.

### Supabase Tables

- `policies`
- `trips`
- `recovery_runs`
- `audit_events`

### Persisted Events

Store:

- Inputs.
- Candidate routes.
- Rejection reasons.
- Provider results.
- Ranking decision.
- Recovery actions.
- Notification status.

### Exit Criteria

- Audit history survives refresh when Supabase is available.
- Complete hero flow still works when Supabase is unavailable.

## Stage 4: Notifications and Prose

### Scope

- Add Resend for optional real confirmation email using synthetic data.
- Add Gemini only to convert a final structured decision into plain-language prose.
- Keep deterministic notification templates as default and fallback.

### Rules

- Gemini must not choose routes.
- Gemini must not approve spend.
- Gemini must not interpret safety policy.
- Resend failure must not block in-app confirmation.

### Exit Criteria

- One real integration test proves email delivery.
- Gemini or Resend failure does not affect recovery decision or in-app confirmation.

## Stage 5: Honesty Surface and Polish

### Scope

- Add API Truth Table.
- Add policy editor.
- Add evaluation dashboard.
- Add one-click reset.
- Polish responsive layout down to 390px.
- Add Playwright tests.
- Add GitHub Actions.

### Exit Criteria

- Five consecutive browser runs pass.
- Truth labels remain visible.
- Deployed demo works without external services.

## Stage 6: Optional Amadeus Adapter

### Scope

- Add live status and alternative search only.
- Hide live behavior behind `PROVIDER_MODE=live`.
- Label Amadeus results as live.
- Fall back to fixtures when data is missing, stale, or unavailable.
- Keep real reissue out of scope unless deeper airline or consolidator access is available.

### Exit Criteria

Live mode adds data but cannot weaken or break demo mode.

## Provider Interfaces

Create adapters under `src/providers/`.

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

Each interface needs a deterministic demo implementation first.

Optional adapters:

- Amadeus status and search.
- Resend email.
- Supabase persistence.
- Gemini prose.

## Verification Plan

### Unit and Scenario Tests

Create at least 40 fixtures covering:

- Cancellation.
- Missed connection.
- Family split.
- Insufficient seats.
- Disallowed transit airport.
- Self-transfer.
- Cabin downgrade.
- Late arrival.
- Cost over limit.
- Stale price.
- Duplicate disruption.
- Conflicting provider data.
- Provider timeout.
- Email failure.
- No valid route.
- Overnight hotel requirement.

Required assertions:

- 100% hard-constraint compliance.
- Zero duplicate execution.
- Zero autonomous action on conflicting data.
- At least 95% recovery success when a valid candidate and successful execution path exist.
- Decision completes in under two seconds without external latency.

### Browser Tests

Playwright covers:

1. Seed family.
2. Edit and save policy.
3. Inject disruption.
4. Run autonomous recovery.
5. Confirm itinerary, hotel, and transfer actions.
6. Display explanation and source badges.
7. Populate audit timeline.
8. Reset and repeat.

Mock Resend in Playwright.

Do not send real email during the browser suite.

Keep one separate, manually triggered integration test for real email delivery.

### Resilience Checks

- Disable every API key and complete the hero flow.
- Make Supabase unavailable and verify browser-storage fallback.
- Make Gemini fail and verify deterministic prose.
- Make Resend fail and verify in-app confirmation plus logged notification failure.
- Return an unknown execution state and verify escalation without a second booking attempt.
- Render at 390px and verify that all controls and truth labels remain usable.

## Deliverables

Core deliverables:

- Deployed Vercel application.
- Public GitHub repository.
- Project description.
- README with setup, architecture, limitations, costs, and test commands.
- API Truth Table.
- Short screen recording of the hero flow.

Optional deliverables:

- Eight-slide pitch deck.
- Formal evaluation report.
- Separate architecture document.
- Evaluation report with scenario results.

## Demo Video Structure

1. Family policy and pre-authorization.
2. Active Paris to Dubai to Delhi trip.
3. Injected missed connection.
4. Candidate rejection and ranking.
5. Automatic recovery.
6. Hotel, transfer, and email confirmation.
7. Audit trail and evaluation results.
8. Production integration limitations.

## Cost and Secrets

Target cost: INR 0.

Keep billing disabled and stay within free tiers.

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

Stages 1 and 2 require no secrets.

Add credentials only when their stage begins.

## Scope Guards

- One synthetic family.
- One hero itinerary.
- Deterministic engine only.
- No real ticket, hotel, transfer, or payment transaction.
- No native mobile application.
- No production authentication or multi-user account system.
- No global visa interpretation.
- No dependency may make demo mode unreliable.
- If an integration blocks progress, ship the previous stage's complete exit state.
