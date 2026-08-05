#!/usr/bin/env bash
set -euo pipefail

# Browser-based layout regression tests (L-xxx checks).
#
# Renders the real page in headless Chromium (gstack browse) and asserts
# geometry the grep-based suite cannot see: photos stay inside their
# figures, captions are never buried under a neighboring photo (the
# v1.0.0 height:100% bug), and the page never scrolls horizontally.
# Runs at desktop and mobile widths, in light and dark themes.
#
# The browse daemon is a local dev tool, not a CI dependency: when it is
# not installed this suite SKIPs with exit 0, and the structural guard
# T-053 in test_site.sh still protects the known regression in CI.

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

B="$HOME/.claude/skills/gstack/browse/dist/browse"
if [ ! -x "$B" ]; then
  echo "  SKIP  layout tests (gstack browse not installed — structural guard T-053 still applies)"
  exit 0
fi

# file:// URL for the local page. On Git Bash, /c/... must become
# file:///C:/... — keep the leading slash (or "c:" parses as a hostname)
# and uppercase the drive letter (the daemon's path allowlist is
# case-sensitive). On macOS/Linux the sed is a no-op.
site_url="file://$(printf '%s' "$root/site/index.html" | sed -E 's#^/([a-zA-Z])/#/\U\1:/#')"

pass=0
fail=0

assert() {
  local id="$1" desc="$2" ok="$3"
  if [ "$ok" = "true" ]; then
    echo "  PASS  $id  $desc"
    pass=$((pass + 1))
  else
    echo "  FAIL  $id  $desc"
    fail=$((fail + 1))
  fi
}

run_checks() {
  # run_checks <id-prefix> <viewport> <theme>
  local prefix="$1" viewport="$2" theme="$3"
  "$B" viewport "$viewport" >/dev/null
  "$B" goto "$site_url" >/dev/null 2>&1
  "$B" js "document.documentElement.dataset.theme='$theme'" >/dev/null
  # Force-finish reveal animations so geometry is final before measuring.
  "$B" js "document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('is-visible')}); 'ok'" >/dev/null
  sleep 1
  local out
  out=$("$B" eval "$root/tests/layout_assertions.js" 2>/dev/null | grep -v "UNTRUSTED" || true)
  local photos overflow clipped pagex
  photos=$(printf '%s' "$out" | sed -n 's/.*"photosChecked":\([0-9]*\).*/\1/p')
  overflow=$(printf '%s' "$out" | sed -n 's/.*"overflowingSlots":\[\([^]]*\)\].*/\1/p')
  clipped=$(printf '%s' "$out" | sed -n 's/.*"clippedCaptions":\[\([^]]*\)\].*/\1/p')
  pagex=$(printf '%s' "$out" | sed -n 's/.*"pageOverflowX":\(true\|false\).*/\1/p')

  assert "$prefix-1" "photos measurable ($viewport $theme: ${photos:-0} imgs)" \
    "$([ -n "$photos" ] && [ "$photos" -gt 0 ] && echo true || echo false)"
  assert "$prefix-2" "no photo escapes its figure ($viewport $theme)" \
    "$([ -z "$overflow" ] && echo true || echo false)"
  [ -n "$overflow" ] && echo "          overflowing: $overflow"
  assert "$prefix-3" "no caption buried under a photo ($viewport $theme)" \
    "$([ -z "$clipped" ] && echo true || echo false)"
  [ -n "$clipped" ] && echo "          clipped: $clipped"
  assert "$prefix-4" "no horizontal page scroll ($viewport $theme)" \
    "$([ "$pagex" = "false" ] && echo true || echo false)"
}

echo "Layout regression tests (headless Chromium)"
echo "==========================================="
run_checks L-010 1280x900 light
run_checks L-020 1280x900 dark
run_checks L-030 375x812  light
run_checks L-040 375x812  dark

echo "-------------------------------------------"
echo "Passed: $pass  Failed: $fail"
[ "$fail" -eq 0 ]
