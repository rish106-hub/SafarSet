# GitHub Rulesets

This folder stores the intended repository ruleset for `main`.

## Main Branch Protection

Ruleset file:

- [`main-branch-protection.json`](./main-branch-protection.json)

Policy:

- Blocks branch deletion.
- Blocks force pushes.
- Requires linear history.
- Requires pull requests before merging.
- Requires one approving review.
- Requires CODEOWNERS review.
- Dismisses stale approvals after new pushes.
- Requires review-thread resolution.
- Requires PR hygiene checks:
  - `Validate PR title`
  - `Validate PR body`

## Why Latest-Pusher Approval Is Disabled

The GitHub setting called `require_last_push_approval` blocks the person who pushed the latest commit from approving the PR.

That is useful for larger teams, but it is too strict for this solo hackathon repo. It can block merge even when the PR has passed checks and has owner review.

## Apply

You need an authenticated GitHub CLI session with repository administration permission.

```bash
gh auth login -h github.com
./scripts/apply-main-ruleset.sh
```

The script creates the ruleset if missing and updates it if it already exists.

## Notes

Do not require implementation CI checks on `main` until implementation code is approved for `main`.

Code checks should stay on scoped implementation branches, such as `codex/spec1`, until that code is approved.
