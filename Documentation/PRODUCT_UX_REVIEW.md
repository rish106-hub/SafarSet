# SafarSet Product and UX Review

## Decision

SafarSet should not ask customers to construct an airline itinerary record.

Primary job:

> Import my family trip once, watch it against my rules, and tell me when I need to act.

Current beta can truthfully promise monitoring and decision support. It cannot promise live rebooking or autonomous ticket recovery because Aviationstack supplies flight status, not inventory, fares, ticket authority, or booking execution.

## Current Experience Review

### Core failure

The add-trip form exposes the database model. A traveller sees duplicated, technical fields before receiving value.

Current single-flight trip asks for:

- trip name
- origin and destination airport codes
- trip start and end
- adult and child counts
- recovery policy
- flight number
- segment origin and destination
- segment departure and arrival
- cabin

This is at least fourteen inputs or selections before saving. Origin, destination, dates, and name are derived from flight data and should not be typed twice.

### Language problems

| Current label | Problem | Replacement |
| --- | --- | --- |
| Trip starts / Trip ends | Could mean holiday dates or flight times | Remove. Derive from first departure and final arrival. |
| Flight segments | Airline and data-model language | Flights in this trip |
| Origin airport | Assumes customer knows IATA code | Flying from, searchable by city or airport |
| Destination airport | Same problem | Flying to, searchable by city or airport |
| Recovery policy | Internal product concept | Your travel rules |
| Minimum connection | Most travellers cannot choose a safe number | SafarSet default under Advanced rules |
| Allowed transit airports | Requires airport expertise and codes | Airports to avoid or prefer, with search |

### Structural problems

1. Manual entry is presented as safest first path even though it creates maximum work and error risk.
2. Google Calendar import is buried under Connections.
3. Calendar scan requires another click after connection.
4. Calendar parser expects explicit airport-code route text instead of prioritising `fromGmail` travel events.
5. Household size is captured per trip instead of saved once.
6. Policy choice is exposed on every trip instead of applying a clear default.
7. Technical readiness cards describe architecture, not customer value.
8. Connections is organised around provider implementation rather than customer intent.
9. Status monitoring appears only after a trip is manually constructed.
10. Product navigation has more concepts than the small beta needs.

## New Information Architecture

Use three customer areas:

1. **Home**: next trip, monitoring state, alerts, and one primary action.
2. **Trips**: upcoming and past trips, with Add trip.
3. **Settings**: household, travel rules, imports, notifications, and account.

Admin remains hidden and role-gated.

## New Add-Trip Experience

### Entry screen

Title: **How should we add your trip?**

Options, in this order:

1. **Import from Google Calendar**
   - Recommended.
   - Connect once.
   - Scan automatically after OAuth callback.
   - Prioritise Google Calendar events with `eventType=fromGmail`.
   - Show detected trips, not raw calendar events.

2. **Upload or paste itinerary**
   - Accept `.ics`, text-based PDF, or pasted booking confirmation.
   - Extract locally or on SafarSet's backend.
   - Do not send itinerary data to an LLM by default.
   - Mark uncertain fields for review.

3. **Enter flight manually**
   - Fallback only.
   - Ask for flight number and departure date first.
   - If future schedule lookup is unavailable, ask only for missing route and time fields.
   - Use city and airport search. Never require memorised IATA codes.

### Review screen

Show a readable itinerary:

```text
Bali trip
20 Jul to 27 Jul

Delhi → Denpasar, Bali
AI 2145 · 20 Jul · 09:10

Returning
Denpasar, Bali → Delhi
AI 2146 · 27 Jul · 18:40
```

Primary button: **Start monitoring**

Secondary link: **Edit flight details**

Collapsed row: **Using Family-safe travel rules · Change**

Derived automatically:

- trip name
- trip start and end
- trip origin and final destination
- flight count
- route continuity
- default policy
- saved household

### Click budget

| Journey | Current | Target |
| --- | ---: | ---: |
| First Calendar import | 6 or more clicks plus review typing | 3 clicks, no typing when data is complete |
| Returning Calendar import | 4 or more clicks | 1 confirmation click |
| Manual one-way flight | 14 fields or selections | 2 primary fields, then only unresolved details |
| Apply travel rules | Policy selected every trip | Automatic default, zero clicks |

## Autofill Strategy

### 1. Airport and city search

Use OurAirports open data. Store a curated searchable airport index in Supabase and refresh it on a schedule.

Search should match:

- city: `Bali`
- airport: `Indira Gandhi`
- IATA code: `DEL`
- country: `Indonesia`

Result label:

```text
Denpasar, Bali
Ngurah Rai International Airport · DPS · Indonesia
```

Rank commercial airports above heliports, closed airports, and small private fields. Keep IATA code visible but never make it required knowledge.

### 2. Google Calendar

Keep Calendar as primary beta integration. Google exposes travel events generated from Gmail through the Calendar API as `fromGmail` events. This avoids direct Gmail body access.

New sync behaviour:

1. Connect Google Calendar.
2. Redirect to Add trip.
3. Scan `fromGmail` events first, then other timed events.
4. Group outbound and return flights into one trip using traveller, route, and date continuity.
5. Show detected trip cards.
6. Ask only for fields missing or conflicting.

### 3. Itinerary files and text

Support inputs in this order:

1. `.ics` calendar file
2. pasted booking confirmation text
3. text-based PDF
4. image or scanned PDF later, when OCR cost and privacy handling are defined

Use a provider-adapter parser registry. Shared output uses one canonical itinerary schema. Vendor-specific parsing stays isolated and tested with redacted fixtures.

### 4. Aviationstack

Use Aviationstack only for same-day live status and disruption updates on the current plan.

Do not use it for:

- booking import
- future schedule autofill on the free plan
- passenger or seat data
- alternative flight inventory
- ticket execution

## Travel Rules Redesign

Ask normal-language decisions once during onboarding:

1. **Keep everyone together?** Always / If possible
2. **Can SafarSet suggest self-transfer flights?** Never / Ask me
3. **How late is acceptable?** Same day / Next morning / Custom
4. **How much extra spend can be suggested without approval?** INR amount

Derive or hide under Advanced:

- minimum connection minutes
- maximum stops
- airport codes
- cabin ranking
- provider-specific constraints

Household belongs in Settings:

- saved travellers
- adults and children
- accessibility needs
- seating needs
- notification contacts

Trip creation then asks **Who is travelling?** using saved traveller chips. Default to the last-used household group.

## Home Screen Redesign

Empty state:

> Add your itinerary. SafarSet will watch the flight and check changes against your family rules.

Primary action: **Import a trip**

Do not show Supabase, RLS, provider mode, or implementation status to customers.

For an upcoming trip show:

- route and local dates
- who is travelling
- monitoring begins date
- data source and last checked time
- any missing setup in one checklist

For a disruption show:

- what changed
- why it matters for this family
- which rule is affected
- exact next action
- source and confidence

## Delivery Plan

### UX 1: Remove avoidable work

- Replace manual form with import-method chooser.
- Add airport/city autocomplete from OurAirports.
- Derive trip name, dates, origin, and destination.
- Move household size to Settings.
- Apply default policy automatically.
- Rename segment language.

Exit: manual one-way trip needs no more than five user-entered values.

### UX 2: Calendar-first capture

- Scan automatically after Google OAuth.
- Prioritise `fromGmail` events.
- Group related flights into trips.
- Add confidence and conflict handling.
- Review only uncertain fields.

Exit: complete Calendar itinerary imports with one confirmation after connection.

### UX 3: Itinerary ingestion

- Add `.ics`, pasted text, and PDF input.
- Add canonical parser contract and provider adapters.
- Add redacted parsing fixtures.
- Add clear data-retention controls.

Exit: supported itinerary can be added without manual airport or time entry.

### UX 4: Customer language and home

- Reduce navigation to Home, Trips, and Settings.
- Rewrite customer-facing copy around monitoring and decisions.
- Remove infrastructure language from customer pages.
- Add monitoring readiness and alert states.

Exit: five beta users can explain SafarSet's current value after viewing Home for ten seconds.

## Validation Before Calling It Good

Test with three to five target travellers. Give no product explanation.

Tasks:

1. Add a real upcoming trip.
2. Explain when SafarSet will begin monitoring it.
3. Change the rule for keeping family members together.
4. Explain what SafarSet will and will not do during a disruption.

Success criteria:

- 80% complete Calendar import without help.
- median add-trip time under 60 seconds.
- no participant types an airport code unless they choose to.
- no participant confuses trip dates with individual flight times.
- all participants correctly state that ticket execution is not live.
- all participants find travel rules within ten seconds.

## Product Boundary

Do not build more dashboard surface until trip capture is fixed. Trip capture is activation. If customer cannot add a real itinerary with low effort, monitoring, policies, admin analytics, and visual polish have little value.
