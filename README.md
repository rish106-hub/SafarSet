# SafarSet

SafarSet is a private beta travel monitoring and recovery-control application for families.

This branch replaces the hackathon demo with account-scoped customer data, real trip entry, configurable recovery rules, optional Google Calendar import, and Aviationstack live flight-status checks.

## What works

- Supabase email and password authentication using SSR cookies.
- Customer-owned profiles, policies, trips, segments, audit events, and recovery checks.
- Row Level Security on every exposed customer table.
- Hidden role-based admin portal.
- Manual trip entry with one to eight continuous flight segments.
- Customer controls for family seating, self-transfer, cabin, stops, transit airports, connection time, arrival delay, spend, approval, overnight waits, and notifications.
- Google Calendar OAuth with read-only event access, encrypted server-side tokens, refresh handling, deterministic route detection, and mandatory review before import.
- Aviationstack live flight status when the operator API key exists.
- Deterministic disruption detection against customer constraints.
- Clear unavailable states when a provider or credential is missing.

## What does not work yet

- Ticket reissue or airline inventory hold.
- Hotel or transfer booking.
- Universal OTA, airline, or PNR import.
- Gmail inbox scanning. Gmail read access uses restricted scopes and is intentionally excluded from this small beta.
- Automatic spending or payment processing.

SafarSet reports live status and detected disruption. It does not claim a real booking transaction or fabricate replacement offers.

## Local setup

Requirements:

- Node.js 20.19 or newer.
- Supabase CLI 2.109.1 or newer.
- Docker Desktop for local Supabase.

```bash
npm install
cp .env.example .env.local
supabase start
supabase db reset
npm run verify:database
npm run dev
```

Use the values printed by `supabase status`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-or-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Open [http://localhost:3000](http://localhost:3000).

## Admin account

Admin access is controlled by Supabase `app_metadata.role`. It is not based on the email string alone.

For local beta testing, you may use the requested credentials:

```bash
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD='admin@123'
npm run seed:admin
```

The seed script blocks `admin@123` when `VERCEL_ENV=production`. Use a unique production secret stored outside git.

Normal users use the same login page. Admin users are redirected to `/admin`. The admin route is not linked from the public site.

## Google sign-in and Calendar

Google Cloud project: `safarset-502905`. Enable the Google Calendar API, create an External testing OAuth app, add beta users as test users, and create a Web application client with:

```text
Authorized JavaScript origin: http://localhost:3000
Authorized redirect URI 1: http://127.0.0.1:54321/auth/v1/callback
Authorized redirect URI 2: http://localhost:3000/api/connections/google/callback
```

The first callback belongs to Supabase Auth and is required for **Continue with Google**. The second belongs to the optional read-only Calendar connection. They are different flows and both must be registered exactly, including scheme, host, port, path, and trailing slash.

For production, add the exact deployed origin and both callbacks separately:

```text
https://YOUR_DOMAIN
https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
https://YOUR_DOMAIN/api/connections/google/callback
```

The hosted Supabase callback is shown in Supabase Dashboard → Authentication → Providers → Google. Do not replace it with the Vercel application callback.

Set:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/connections/google/callback
GOOGLE_TOKEN_ENCRYPTION_KEY=
```

Generate a 32-byte encryption key:

```bash
openssl rand -base64 32
```

SafarSet requests only `calendar.events.readonly`. It prioritises flight events created from Gmail and validates detected IATA codes against the bundled OurAirports index. Detected trips are never saved without review.

## Aviationstack

```bash
PROVIDER_MODE=live
AVIATIONSTACK_API_KEY=
```

Aviationstack is the only flight-data provider. It checks live status for saved flight numbers. It does not supply booking ownership, rebooking offers, seat inventory, ticket changes, or payments. On disruption, SafarSet records the evidence and tells the customer to contact the airline or booking provider.

## Hosted Supabase

Apply migrations:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

For a closed beta, disable email confirmation in the hosted Auth settings if immediate sign-in is required. For a wider release, enable confirmation, configure custom SMTP, CAPTCHA, and leaked-password protection.

Add `private` to the hosted project API schema allow-list. The migration revokes this schema from browser roles and grants it only to `service_role`. This lets server-only Google connection code use PostgREST without exposing provider tokens to customers.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run verify:database
```

`verify:database` creates two temporary local users, checks cross-customer isolation, and deletes both users. It requires the three Supabase environment variables listed above.

With local Supabase running, `npm run test:e2e:local-auth` creates one temporary customer, verifies customer and admin browser flows, and removes the temporary customer.

Authenticated browser coverage runs when these are set:

```bash
E2E_USER_EMAIL=
E2E_USER_PASSWORD=
```

## Architecture

```text
Server Components and Route Handlers
  -> authenticated data access layer
  -> Supabase Auth and RLS data
  -> provider adapters
  -> deterministic recovery engine
  -> domain models
```

Test fixtures remain in `src/data` only to verify the deterministic engine. No production page, action, or API route imports them.

Read:

- [Production beta spec](./Documentation/specs/07-production-beta-rebuild.md)
- [Architecture](./Documentation/ARCHITECTURE.md)
- [Brand system](./Documentation/BRAND.md)
- [Integration order](./Documentation/INTEGRATIONS.md)
- [Operations](./Documentation/OPERATIONS.md)
