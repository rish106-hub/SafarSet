# SafarSet GStack Review

## Review Summary

SafarSet should be built around a deterministic recovery engine, not an AI travel planner.

The technical bar is not "can we call APIs." The technical bar is whether the product can safely decide what it is allowed to do, reject unsafe choices, explain the decision, avoid duplicate execution, and keep working when optional services fail.

The stack should protect the demo from fragile integrations.

## Recommended Stack

### Application

Use:

- Next.js App Router.
- React.
- TypeScript.

Reason:

- Strong fit for a responsive PWA.
- Easy routing for the required screens.
- Good deployment path through Vercel.
- TypeScript helps keep domain and engine logic explicit.

### UI

Use:

- Tailwind CSS.
- shadcn/ui.
- Lucide icons.

Reason:

- Fast dashboard development.
- Good components for forms, tables, timelines, tabs, dialogs, and badges.
- Easy responsive polish down to 390px.

Avoid a heavy custom design system in the first release.

### Testing

Use:

- Vitest for recovery-engine tests.
- Playwright for browser tests.
- GitHub Actions for test and build checks.

Reason:

- The core product claim depends on testable policy behavior.
- Unit tests prove hard constraints and idempotency.
- Browser tests prove the hero flow actually works.

### Persistence

Use:

- Browser localStorage for demo fallback.
- Supabase Free for optional server-side persistence.

Reason:

- Demo mode must work without Supabase.
- Supabase is useful for audit history, but it cannot be a hard dependency.
- Vercel server functions are stateless, so do not rely on server memory for fallback persistence.

### Notifications

Use:

- Deterministic in-app confirmation first.
- Resend Free for optional real email.

Reason:

- Email is useful for demo credibility.
- Email failure must not block recovery.
- Playwright should mock Resend.

### AI

Use:

- Gemini Free Tier for prose only.

Gemini may:

- Convert structured recovery decisions into plain-language explanations.
- Rewrite confirmations.

Gemini must not:

- Choose a flight.
- Approve spending.
- Interpret safety rules.
- Override constraints.
- Create hidden policy logic.

### Travel Data

Use:

- Deterministic fixtures first.
- Amadeus Self-Service only as an optional adapter for status and search.

Reason:

- The hero flow needs stable data.
- Live data can be stale, unavailable, or unsuitable for synthetic trips.
- Live mode should enrich the demo, not control it.

Technical reality:

- Public hackathon-grade travel APIs can support status checks, search, pricing, and sometimes order creation.
- They usually do not support reissuing an already ticketed flight through a simple public self-service flow.
- Real post-ticketing changes normally require deeper airline, GDS, OTA, or consolidator access.
- Therefore, SafarSet should simulate reissue execution and make that label visible.

The honest MVP is stronger than a fake one. Search and status can be live later; execution stays simulated until real commercial access exists.

### Deployment

Use:

- Vercel Hobby.

Reason:

- Fits Next.js.
- Simple preview and production deployment.
- Free-tier friendly.

## Things Not To Add In First Release

Do not add:

- LangChain.
- AutoGen.
- Redis.
- Native mobile apps.
- WhatsApp.
- Payment processing.
- Visa-rules API.
- Real ticket reissue.

These create complexity without improving the core proof.

## Architecture Review

Recommended architecture:

```text
Next.js App
  -> UI screens
  -> Demo state and local storage
  -> Recovery orchestration
       -> TravelProvider
       -> AccommodationProvider
       -> TransferProvider
       -> NotificationProvider
  -> Pure Recovery Engine
       -> detector
       -> constraints
       -> ranking
       -> autonomy
       -> idempotency
  -> Optional Services
       -> Supabase
       -> Resend
       -> Gemini
       -> Amadeus
```

Critical rule:

`src/engine/` must be pure. No network calls, database calls, randomness, or hidden provider dependency.

## Domain Model Review

Create explicit domain types under `src/domain/`:

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

Every provider result should include:

```ts
type ProviderMetadata = {
  source: string;
  isSimulated: boolean;
  observedAt: string;
  confidence: number;
};
```

This metadata is not optional. It powers the honesty surface.

## Provider Adapter Review

Use interfaces for external actions:

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

Build deterministic demo adapters before live adapters.

Every restricted transaction must show labels such as:

- `SIMULATED_REISSUE`
- `SIMULATED_HOTEL_CHANGE`
- `SIMULATED_TRANSFER_CHANGE`

Simulation is part of the interface.

## Recovery Engine Review

### Detector

Connection is impossible when:

Estimated arrival plus required connection time is later than the next departure.

### Constraints

Hard constraints:

- Entire family has seats on one itinerary.
- No self-transfer.
- No more than one stop.
- Cabin is premium economy or better.
- Every transit airport is approved.
- Every international connection is at least 90 minutes.
- Arrival is before the hard deadline.

The engine must return a pass or fail result with a human-readable reason for each check.

### Ranking

Rank only candidates that passed every hard check.

Weights:

- Arrival delay: 40%
- Incremental cost: 25%
- Number of stops: 15%
- Overnight inconvenience: 10%
- Departure wait: 10%

### Autonomy

Automatically book only when:

- Every hard constraint passes.
- Incremental cost is within INR 75,000.
- Selected price is no more than five minutes old.
- Provider data is consistent.
- Execution adapter reports availability.

Request approval when:

- Cost exceeds automatic limit.
- A policy rule requires approval.
- User marked a choice as approval-only.

Escalate without acting when:

- No valid route exists.
- Provider data conflicts.
- Price or availability cannot be verified.
- Execution returns unknown result.

### Idempotency

Use a stable hash of:

- Trip ID.
- Disruption ID.
- Selected itinerary ID.

No duplicate execution should be possible for the same disruption and itinerary.

## UI Review

The app should feel like an operations cockpit for a premium card travel benefit.

The user is a tech-comfortable but time-poor parent. The UI should not behave like a chatbot that asks them to think during an airport crisis. It should show what happened, what SafarSet did, why unsafe choices were rejected, and whether the action was live, fixture-backed, or simulated.

Recommended screens:

1. Card-benefit landing page.
2. Seeded family and editable policy.
3. Active-trip dashboard.
4. Status check and disruption injection.
5. Autonomous recovery timeline.
6. Confirmed itinerary, hotel, and transfer changes.
7. Route explanation and rejected alternatives.
8. Audit timeline.
9. API Truth Table.
10. Evaluation dashboard.

UI standards:

- Source badges must be visible.
- Simulated actions must be labelled in the main flow.
- Buttons must be stable at mobile width.
- Tables must remain readable at 390px.
- Avoid generic travel imagery and bloated landing-page sections.

## API Truth Table

The API Truth Table should show each capability:

- Flight status.
- Alternative search.
- Ticket reissue.
- Hotel modification.
- Transfer reschedule.
- Email notification.
- Plain-language explanation.
- Audit persistence.

Each row should show:

- Provider.
- Current mode.
- Live, fixture-backed, simulated, or unavailable.
- Failure fallback.
- User-visible label.

This is a trust feature.

## Mode Review

### DEMO Mode

Must require no secrets.

Uses:

- Deterministic fixtures.
- Simulated transactions.
- Browser storage.
- Optional local generated output.

### LIVE Mode

Hidden behind:

```text
PROVIDER_MODE=live
```

Uses:

- Best-effort Amadeus status and search.
- Simulated execution.
- Fallback to fixtures.

Live mode must never weaken demo mode.

## Cost Review

Target cost is INR 0.

Free-tier services:

- Vercel Hobby.
- Supabase Free.
- Resend Free.
- Gemini Free Tier.
- Amadeus Self-Service.

Stages 1 and 2 should need no secrets.

Environment variables:

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

## Testing Review

Minimum scenario suite:

- 40 fixtures.
- 100% hard-constraint compliance.
- Zero duplicate execution.
- Zero autonomous action on conflicting data.
- At least 95% recovery success when a valid candidate and successful execution path exist.
- Under two-second engine decision without external latency.

Browser suite:

- Seed family.
- Edit and save policy.
- Inject disruption.
- Run recovery.
- Confirm simulated actions.
- Display explanations and badges.
- Populate audit timeline.
- Reset and repeat.

Resilience suite:

- No API keys.
- Supabase unavailable.
- Gemini failure.
- Resend failure.
- Unknown execution state.
- 390px mobile layout.

## Final Verdict

The right GStack is:

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Lucide.
- Vitest.
- Playwright.
- localStorage.
- Optional Supabase.
- Optional Resend.
- Gemini for prose only.
- Optional Amadeus status and search.
- Vercel deployment.

The wrong build is an AI itinerary planner with a few travel cards.

SafarSet wins if the deterministic recovery engine is strict, visible, tested, and boring in the right places.

The defensible product claim is not "AI finds flights." It is "a pre-authorized policy engine restores the whole family journey without breaking safety rules."
