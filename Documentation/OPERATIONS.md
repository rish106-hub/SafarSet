# Private Beta Operations

## Capacity

The current architecture is suitable for three to four beta customers. Supabase Auth, Postgres, and Vercel Functions are sufficient. No queue, worker fleet, or separate backend service is needed.

## Required secrets

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD` when seeding admin

Optional:

- Aviationstack API key
- Google OAuth credentials
- Google token-encryption key
- Resend and Gemini credentials for future communication work

## Admin

Run `npm run seed:admin` with a server-only password. The requested `admin@123` password is allowed only outside Vercel production. Never commit the password.

## Before inviting users

1. Apply migrations.
2. Run Supabase database advisors.
3. Configure the site URL and redirect allow-list.
4. Add `private` to the API schema allow-list. Keep its grants service-role only.
5. Decide whether email confirmation is disabled for the closed beta.
6. Seed admin.
7. Create one normal-user test account.
8. Run authenticated Playwright coverage.
9. Run `npm run verify:database` to prove that a second user cannot read or attach records to the first user’s trip.
10. Verify provider unavailable states with credentials removed.
11. Verify secrets are absent from client bundles and logs.
