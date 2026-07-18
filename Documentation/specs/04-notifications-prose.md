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
