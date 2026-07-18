# Contributing to SafarSet

SafarSet is an engine-first travel recovery project. The core rule is simple: no change should make demo mode less reliable or make autonomous recovery less conservative.

## Working Rules

- Keep `src/engine/` pure. No network calls, database calls, provider calls, timers, random values, or UI imports.
- LLMs may write prose only. They must not choose routes, approve spend, or interpret safety rules.
- Hard constraints are non-negotiable. If data is missing, stale, or conflicting, escalate instead of acting.
- Demo mode must work with no API keys.
- Use only synthetic traveller data. Do not commit real PNR, passport, payment-card, child, or booking data.
- Label simulated actions clearly, such as `SIMULATED_REISSUE`.

## Branching

Use short scoped branches:

```bash
git switch -c codex/<scope>
```

Examples:

```bash
git switch -c codex/engine-constraints
git switch -c codex/demo-timeline
git switch -c codex/docs-ci
```

Avoid working directly on `main`. `main` should only receive reviewed, passing changes.

## What To Push

Push complete, reviewable units:

- Product docs and specs.
- Engine logic with tests.
- UI slices that run locally.
- Fixtures and deterministic test data.
- CI, repo hygiene, and deployment config.

Do not push:

- Secrets or `.env` files.
- Real traveller data.
- Broken generated files.
- Large recordings or screenshots unless requested.
- Dead experiments that are not wired into the repo.
- Dependency churn unrelated to the change.

## Commit Format

Use clear, scoped commits:

```text
Add recovery constraint fixtures
Implement missed-connection detector
Document demo acceptance flow
Fix duplicate execution guard
```

Keep commits small enough to review. Do not hide unrelated changes in one commit.

## Pull Request Format

Every PR should include:

- What changed.
- Why it changed.
- How it was tested.
- Safety impact.
- Screenshots or video for UI changes.

Before opening a PR, run:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

If a command fails, either fix it or explain the failure in the PR.

## Code Style

- TypeScript first.
- Prefer explicit domain types.
- Keep business rules in `src/engine/`, not in React components.
- Keep provider adapters behind interfaces.
- Keep fixtures deterministic and readable.
- Prefer plain names over clever abstractions.
- Avoid broad refactors unless they directly reduce risk.

## Documentation Style

- Use Markdown.
- Keep headings short.
- Use bullet lists for requirements and acceptance criteria.
- Mark assumptions clearly.
- Separate product decisions from implementation details.
- Update `PLAN.md`, `Documentation/`, or `README.md` when behavior changes.

## Testing Expectations

Engine changes need unit or scenario tests.

Required checks:

- Hard constraints pass or fail with clear reasons.
- Ranking only runs on valid candidates.
- Autonomy books, requests approval, or escalates correctly.
- Idempotency blocks duplicate execution.
- Demo fixtures remain deterministic.

UI changes should keep the hero flow usable at 390px width.

## Review Checklist

Before merging:

- CI is passing.
- No merge conflicts.
- No secrets are present.
- Demo mode still works without external credentials.
- Any simulated execution is visibly labelled.
- Docs match the behavior.
- PR has the right labels.
