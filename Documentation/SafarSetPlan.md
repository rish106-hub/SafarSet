# SafarSet Plan

## Build Objective

Create a hackathon-ready MVP for SafarSet: a travel readiness assistant that converts trip details into an itinerary, packing list, budget plan, benefit suggestions, and readiness score.

The product should feel like a working tool on the first screen. Avoid a marketing-style landing page.

## Demo Narrative

The demo should answer one question fast:

"How does SafarSet help an Amex traveler prepare better for a trip?"

Recommended demo flow:

1. Create a trip to a known destination.
2. Generate the workspace.
3. Show itinerary, packing list, budget, and Amex benefit matches.
4. Mark a few checklist items complete.
5. Show the readiness score improving.
6. End with the value: fewer missed tasks, clearer budget, better benefit usage.

## MVP Feature Plan

### Phase 1: Foundation

- Set up the app structure.
- Create routes or views for:
  - Trip intake.
  - Trip dashboard.
  - Itinerary.
  - Packing.
  - Budget.
  - Benefits.
- Add local mock data.
- Add responsive layout.

### Phase 2: Trip Workspace

- Build short trip intake form.
- Store trip state locally.
- Generate a trip dashboard from user inputs.
- Show destination, dates, travelers, budget, and readiness score.

### Phase 3: Itinerary

- Generate day-wise itinerary blocks.
- Include activity name, time, cost, and notes.
- Allow basic edit or regenerate actions.
- Keep output structured so it looks credible.

### Phase 4: Packing List

- Generate packing items by category.
- Add complete/incomplete state.
- Add optional and required labels.
- Include weather or activity-based items when possible.

### Phase 5: Budget Planner

- Show budget categories.
- Show estimated spend.
- Show total trip estimate.
- Add emergency buffer.
- Allow manual cost edits if time permits.

### Phase 6: Amex Benefit Layer

- Create mock benefit data.
- Match benefits to trip context.
- Show why each benefit is relevant.
- Add a recommended next action.

Example benefit categories:

- Airport lounge.
- Hotel upgrade or credit.
- Dining offer.
- Travel insurance.
- Forex or international payment.
- Reward points redemption.

### Phase 7: Polish and Demo Hardening

- Add empty states.
- Add loading states if generation is simulated.
- Add error states for missing trip inputs.
- Make mobile layout usable.
- Prepare one strong demo trip.
- Test the full demo path repeatedly.

## Suggested Tech Plan

Recommended simple stack for speed:

- Frontend: React or Next.js.
- Styling: Tailwind CSS or existing design system.
- State: local state first.
- Data: static JSON mock data first.
- AI: optional. Use structured prompts or deterministic templates if API setup is slow.
- Persistence: localStorage or Supabase if team already knows it.

Do not start with complex backend work unless the hackathon requires it.

## Data Needed

### Mock Trip Data

- Destination.
- Dates.
- Travelers.
- Budget.
- Trip purpose.
- Preferences.

### Mock Benefit Data

- Benefit name.
- Category.
- Eligibility conditions.
- Recommended action.
- Short explanation.

### Mock Activity Data

- Destination.
- Activity type.
- Time of day.
- Cost range.
- Duration.

### Mock Packing Rules

- Weather.
- Trip length.
- Business or leisure.
- Beach, city, mountain, international, domestic.

## Team Roles

### Product

- Own user journey.
- Keep scope tight.
- Prepare demo script.

### Frontend

- Build trip intake and dashboard.
- Build itinerary, packing, budget, and benefits views.
- Make the UI stable and responsive.

### Backend or Data

- Create mock data structure.
- Add generation logic.
- Add persistence if needed.

### Pitch

- Define problem.
- Explain Amex fit.
- Prepare three-minute walkthrough.
- Show business value clearly.

## Timeline

### First 2 Hours

- Freeze MVP scope.
- Choose stack.
- Create basic app.
- Define mock data.
- Sketch demo flow.

### Hours 3 to 6

- Build intake.
- Build dashboard.
- Build itinerary and packing list.

### Hours 7 to 10

- Build budget planner.
- Build benefit matching.
- Add readiness score.

### Hours 11 to 14

- Improve UI.
- Add demo data.
- Fix rough edges.
- Test mobile and desktop.

### Final Stretch

- Rehearse demo.
- Remove broken features.
- Keep only what works.
- Prepare final pitch.

## Product Decisions

- Prefer fewer features that work over many half-working screens.
- Use mocked benefits if real Amex data is unavailable.
- Keep the core screen action-oriented.
- Do not make users read long explanations inside the product.
- Make every generated recommendation explain its reason in one short line.

## Demo Trip Recommendation

Use one concrete trip for the demo:

- Destination: Singapore or Tokyo.
- Duration: 5 days.
- Traveler: young professional.
- Budget: mid-range.
- Purpose: leisure with some premium travel behavior.

This makes Amex benefit matching easier to show: lounge, hotel, dining, forex, insurance, and rewards.

## Validation Checklist

- User can create a trip.
- Dashboard appears after intake.
- Itinerary has useful structure.
- Packing list can be checked off.
- Budget total is visible.
- Benefits are tied to trip context.
- Readiness score changes after task completion.
- Demo works without live external dependencies.

## Scope Cuts If Time Is Short

Cut in this order:

1. Real login.
2. Real APIs.
3. Group trip mode.
4. Expense splitting.
5. Advanced AI regeneration.
6. Map integration.

Keep:

- Trip intake.
- Dashboard.
- Itinerary.
- Packing list.
- Budget.
- Benefit matching.
- Readiness score.

## Open Questions

- Is the hackathon specifically tied to Amex APIs, or only the Amex travel and cardholder context?
- Does the judging rubric prioritize technical integrations, business value, or user experience?
- Should SafarSet target Indian travelers, US travelers, or a global cardholder audience?
- Is the intended user a premium cardholder, student traveler, business traveler, or broad consumer?
- Should the final MVP include AI generation, or can deterministic rules be enough for the demo?
