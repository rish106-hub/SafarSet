# Spec 04: Notifications and Prose

## Goal

Add useful communication while keeping external services outside decision authority.

## Deliverables

- Deterministic in-app and email message renderer.
- Optional Resend email adapter with lazy server-side initialization.
- Optional Gemini prose adapter with lazy server-side initialization.
- Gemini receives completed structured decision only.
- Logged fallback for email or prose failure.
- Email failure scenarios and manually triggered delivery test.

## Exit

Gemini and Resend failures leave route choice, simulated recovery, audit, and in-app confirmation intact.

## Implementation

- Deterministic rendering is the default and remains available without credentials.
- Gemini receives only completed route, arrival, and simulated action facts.
- Gemini output is rejected unless every completed fact remains present.
- Resend initializes only when a real delivery is attempted.
- Email uses a stable recovery-run idempotency key.
- The browser marks recovery complete before optional communication starts.
- Provider failures are converted into audit events and never thrown into the recovery flow.
- Real email delivery runs only through the manual integration command.
