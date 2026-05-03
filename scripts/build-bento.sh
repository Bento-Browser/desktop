#!/usr/bin/env bash
# Bento Browser — full pipeline wrapper.
# Runs the four Surfer phases in order: download → bootstrap → build → package.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

step() {
  printf '\n\033[1;34m==>\033[0m %s\n' "$1"
}

step "1/4 Fetching Firefox source (surfer download)"
npx surfer download

step "2/4 Bootstrapping Mozilla build environment (surfer bootstrap)"
npx surfer bootstrap

step "3/4 Building Bento Browser (surfer build)"
npx surfer build

step "4/4 Packaging artifacts (surfer package)"
npx surfer package

step "Done. Artifacts in dist/."
