#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web. The cloud environment caches the
# filesystem after its setup script runs, so node_modules can lag behind
# pnpm-lock.yaml in later sessions. Installing here keeps them in sync.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"
pnpm install --frozen-lockfile --prefer-offline
