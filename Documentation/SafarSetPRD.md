# SafarSet PRD

## Product Summary

SafarSet is a travel planning and trip readiness assistant designed for an Amex-style hackathon context.

The core idea is simple: travelers do not need another generic itinerary app. They need one place that turns a trip into clear actions: what to book, what to pack, what to budget, what card benefits to use, and what still needs attention before departure.

SafarSet helps users create a trip plan from basic inputs and converts it into a practical checklist, spending view, benefit suggestions, and travel readiness score.

## Problem

Trip planning is fragmented.

Users usually plan across chats, notes, booking sites, card portals, spreadsheets, maps, and screenshots. That creates missed benefits, weak budgeting, poor packing decisions, and last-minute stress.

For Amex or a premium financial services context, the bigger missed opportunity is that card-linked travel benefits are often underused. Users may have lounge access, travel insurance, hotel offers, forex advantages, dining offers, or reward-point options, but they do not know when each benefit matters.

## Target Users

- Students and young professionals planning domestic or international trips.
- Families planning multi-day vacations.
- Business travelers who need a fast pre-trip checklist.
- Cardholders who want to use travel benefits without manually reading terms.
- Travel planners who want budgeting, packing, and bookings in one workflow.

## User Pain Points

- "I do not know what I am forgetting before the trip."
- "I have offers or card benefits, but I do not know which ones apply."
- "My trip budget lives in one place and my itinerary lives somewhere else."
- "Packing lists are too generic."
- "Group trips become messy because expenses, bookings, and tasks are split."
- "Travel prep becomes urgent only at the last minute."

## Proposed Solution

SafarSet creates a trip workspace from a few inputs:

- Destination.
- Dates.
- Travel purpose.
- Budget range.
- Number of travelers.
- Existing bookings.
- Card or membership benefits.
- Preferences such as food, pace, weather tolerance, accessibility, and travel style.

The product then generates:

- A practical itinerary.
- A personalized packing list.
- A trip budget.
- A benefit and offer recommendation layer.
- A readiness checklist.
- A risk and reminder view.

## Product Goals

- Reduce trip planning time.
- Make travel benefits easier to understand and use.
- Help users avoid missed bookings, documents, packing items, and budget overruns.
- Make group travel coordination easier.
- Produce a clear demo that judges can understand in under three minutes.

## Non-Goals

- SafarSet is not a full online travel agency.
- SafarSet does not replace flight or hotel booking engines in the MVP.
- SafarSet does not provide legal, visa, medical, or financial advice.
- SafarSet does not need live Amex production APIs for the hackathon MVP. Mocked card benefits and offers are acceptable for demo.

## Core MVP Features

### 1. Trip Intake

Users enter destination, dates, travelers, budget, trip type, and preferences.

The intake must be short. The product should not feel like a long form.

### 2. Smart Itinerary Builder

SafarSet creates a day-wise plan with:

- Morning, afternoon, and evening blocks.
- Estimated cost per block.
- Travel time notes.
- Weather-aware suggestions if weather data is available.
- Free time buffers.

### 3. Personalized Packing List

Packing list should adapt to:

- Destination.
- Weather.
- Trip length.
- Activities.
- Traveler type.
- Business or leisure purpose.

The list should be editable.

### 4. Budget and Spend Planner

Users should see estimated costs across:

- Travel.
- Stay.
- Food.
- Local transport.
- Activities.
- Shopping.
- Emergency buffer.

The MVP can use manual or estimated values. It does not need bank transaction sync.

### 5. Amex Benefit Match

SafarSet suggests relevant benefits or offers based on trip context.

Examples:

- Lounge access reminder for airport travel.
- Hotel credit or upgrade reminder.
- Travel insurance reminder.
- Dining offer near destination.
- Forex markup warning or card recommendation.
- Reward points redemption suggestion.

For the MVP, this can use a mock benefits database.

### 6. Readiness Score

SafarSet gives a simple trip readiness score.

Inputs can include:

- Documents added.
- Bookings confirmed.
- Packing completed.
- Budget confirmed.
- Benefits reviewed.
- Emergency contacts added.

The score should be useful, not decorative.

### 7. Group Trip Mode

Basic group mode can include:

- Shared checklist.
- Assigned tasks.
- Shared budget estimate.
- Expense split placeholder.

This is optional for MVP if time is tight.

## User Journey

1. User creates a new trip.
2. User enters basic trip details.
3. SafarSet generates a trip workspace.
4. User reviews itinerary, packing list, budget, and benefit matches.
5. User edits the plan.
6. User marks items as done.
7. SafarSet updates the readiness score.

## Data Model

### Trip

- Trip ID.
- Destination.
- Start date.
- End date.
- Number of travelers.
- Budget range.
- Purpose.
- Preferences.

### Itinerary Item

- Day.
- Time block.
- Activity.
- Location.
- Estimated cost.
- Notes.

### Packing Item

- Name.
- Category.
- Quantity.
- Required or optional.
- Completed status.

### Budget Item

- Category.
- Estimated cost.
- Actual cost.
- Payment method.

### Benefit

- Benefit name.
- Benefit type.
- Eligibility rule.
- Recommended action.
- Source.

### Readiness Task

- Task name.
- Category.
- Due date.
- Completed status.
- Priority.

## Success Metrics

- Time to create first trip plan.
- Number of checklist items completed.
- Number of relevant benefits surfaced.
- User rating of plan usefulness.
- Budget variance between estimated and actual spend.
- Demo clarity: judge can understand the product in under three minutes.

## Risks

- Benefit recommendations can become vague if the benefits database is weak.
- Trip planning can become too broad if the MVP tries to do everything.
- AI-generated itineraries can be generic without strong constraints.
- Live integrations may burn too much hackathon time.
- If the UI looks like a landing page instead of a working tool, the demo will feel shallow.

## MVP Scope Recommendation

Build a working trip workspace first.

Priority order:

1. Trip intake.
2. Generated itinerary.
3. Packing list.
4. Budget planner.
5. Mock Amex benefit matching.
6. Readiness score.

Avoid overbuilding bookings, real payment rails, and complex group expense splitting for the first version.

## Assumptions

- The repo did not contain the referenced Amex chat or prior idea notes at the time this PRD was created.
- This document treats SafarSet as a travel readiness and benefit-matching product for an Amex-style hackathon.
- Any exact Amex challenge rules, judging criteria, or API requirements should be added once available.
