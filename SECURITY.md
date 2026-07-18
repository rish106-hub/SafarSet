# Security Policy

## Scope

SafarSet currently uses synthetic data only. It must not collect or store real traveller data.

Do not commit:

- Passport details.
- Payment-card data.
- PNRs or booking references.
- Real child data.
- API keys.
- `.env` files.

## Reporting

Open a private issue or contact the repository owner if you find a security problem.

For public issues, describe the risk without posting secrets or real personal data.

## Expected Handling

Security issues should be triaged before feature work when they affect:

- Autonomous decision safety.
- Duplicate execution.
- Secret exposure.
- Real user data exposure.
- Provider action integrity.
