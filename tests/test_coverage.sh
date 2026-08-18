#!/usr/bin/env bash
set -euo pipefail

# Measured coverage gate for site/app.js (see tests/coverage.js).
#
# Requires Node plus a Playwright install. Neither is a project dependency:
# the site itself ships no packages (docs/adr/0002), and CI never needs
# this — the structural and interaction suites are the CI gates. When the
# tooling is absent this SKIPs with exit 0.

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "  SKIP  coverage (node not installed)"
  exit 0
fi

# Playwright is borrowed from the gstack skill install, the same browser
# tooling tests/test_layout.sh uses. Override with PLAYWRIGHT_PATH.
if [ -z "${PLAYWRIGHT_PATH:-}" ]; then
  for candidate in \
    "$HOME/.claude/skills/gstack/node_modules/playwright" \
    "$root/node_modules/playwright"
  do
    [ -d "$candidate" ] && PLAYWRIGHT_PATH="$candidate" && break
  done
fi

if [ -z "${PLAYWRIGHT_PATH:-}" ] || [ ! -d "$PLAYWRIGHT_PATH" ]; then
  echo "  SKIP  coverage (Playwright not found; set PLAYWRIGHT_PATH)"
  exit 0
fi

echo "Coverage (V8 profiler)"
echo "======================"
PLAYWRIGHT_PATH="$PLAYWRIGHT_PATH" node "$root/tests/coverage.js"
