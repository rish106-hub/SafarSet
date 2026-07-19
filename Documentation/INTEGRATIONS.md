# Integration Order

## 1. Manual itinerary

Status: available.

Why first: no provider cost, no OAuth approval, and the user can verify every field against the issued itinerary.

## 2. Google Calendar

Status: implemented when operator OAuth credentials exist.

SafarSet reads upcoming timed events using `calendar.events.readonly`. It prioritises `fromGmail` flight events, then scans other events for real IATA airport codes. Every detected trip is reviewed before saving.

Google Cloud project: `safarset-502905`.

Local OAuth client settings:

- JavaScript origin: `http://localhost:3000`
- Redirect URI: `http://localhost:3000/api/connections/google/callback`

The deployed origin and callback must be added after the production domain is known.

## 3. Aviationstack live status

Status: implemented when the operator API key exists.

It provides live status for saved flight numbers. It does not provide booking import, seat inventory, rebooking offers, or ticket reissue. Live provider failure is visible.

## 4. Gmail

Status: intentionally excluded.

Gmail message reading uses restricted scopes. A public app can require OAuth verification and a security assessment when restricted data is stored or transmitted. That is a poor trade for a three-user beta.

## 5. Airline or OTA booking sync

Status: commercial dependency.

This requires supplier agreements or booking-management APIs. A generic free API cannot reliably fetch every customer booking.
