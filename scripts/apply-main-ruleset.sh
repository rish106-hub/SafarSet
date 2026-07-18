#!/usr/bin/env bash
set -euo pipefail

REPO="rish106-hub/SafarSet"
RULESET_NAME="Main branch protection"
RULESET_FILE=".github/rulesets/main-branch-protection.json"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI is required. Install gh first."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run: gh auth login -h github.com"
  exit 1
fi

if [ ! -f "$RULESET_FILE" ]; then
  echo "Missing ruleset file: $RULESET_FILE"
  exit 1
fi

ruleset_id="$(gh api "repos/$REPO/rulesets" --jq ".[] | select(.name == \"$RULESET_NAME\") | .id" || true)"

if [ -n "$ruleset_id" ]; then
  gh api \
    --method PUT \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "repos/$REPO/rulesets/$ruleset_id" \
    --input "$RULESET_FILE"
  echo "Updated ruleset: $RULESET_NAME"
else
  gh api \
    --method POST \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "repos/$REPO/rulesets" \
    --input "$RULESET_FILE"
  echo "Created ruleset: $RULESET_NAME"
fi
