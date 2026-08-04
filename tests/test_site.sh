#!/usr/bin/env bash
set -euo pipefail

# Automated checks for the static site (constitution Principle 2).
#
# The site is dependency-free static HTML/CSS/JS, so these are structural
# assertions run with grep — no runtime or package install required, which
# keeps CI honest on a bare ubuntu runner. Test IDs (T-xxx) are referenced
# from docs/REQUIREMENTS_TRACEABILITY.md.

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
site="$root/site"
index="$site/index.html"

pass=0
fail=0

check() {
  # check <test-id> <description> <command...>
  local id="$1" desc="$2"
  shift 2
  if "$@" >/dev/null 2>&1; then
    echo "  PASS  $id  $desc"
    pass=$((pass + 1))
  else
    echo "  FAIL  $id  $desc"
    fail=$((fail + 1))
  fi
}

echo "Site structural tests"
echo "====================="

# --- T-001 .. T-004: required files exist -------------------------------
check T-001 "index.html exists"            test -f "$index"
check T-002 "styles.css exists"            test -f "$site/styles.css"
check T-003 "app.js exists"                test -f "$site/app.js"
check T-004 "deploy workflow exists"       test -f "$root/.github/workflows/deploy-pages.yml"

# --- T-010 .. T-015: page structure -------------------------------------
check T-010 "has an html5 doctype"         grep -qi '^<!DOCTYPE html>' "$index"
check T-011 "has a <title>"                grep -q '<title>.*702.*</title>' "$index"
check T-012 "has viewport meta (mobile)"   grep -q 'name="viewport"' "$index"
check T-013 "has meta description"         grep -q 'name="description"' "$index"
check T-014 "links styles.css"             grep -q 'href="styles.css"' "$index"
check T-015 "links app.js"                 grep -q 'src="app.js"' "$index"

# --- T-020 .. T-026: every listing section is present -------------------
check T-020 "gallery section present"      grep -q 'id="gallery"' "$index"
check T-021 "kitchen section present"      grep -q 'id="kitchen"' "$index"
check T-022 "bathroom section present"     grep -q 'id="bathroom"' "$index"
check T-023 "details section present"      grep -q 'id="details"' "$index"
check T-024 "property guide teaser"        grep -q 'id="guide"' "$index"
check T-025 "contact section present"      grep -q 'id="contact"' "$index"
check T-026 "community section present"    grep -q 'id="community"' "$index"

# --- T-030 .. T-034: feature copy the listing promises ------------------
check T-030 "GE appliances mentioned"      grep -qi 'GE' "$index"
check T-031 "French-door fridge + icemaker" grep -qi 'icemaker' "$index"
check T-032 "filtered water line"          grep -qi 'filtered cold-water line' "$index"
check T-033 "medicine cabinet defogger"    grep -qi 'defogger' "$index"
check T-034 "fan with Bluetooth speaker"   grep -qi 'Bluetooth speaker' "$index"
check T-035 "water view stated"            grep -qi 'water view\|>Water<' "$index"
check T-036 "655 sq ft stated"             grep -qi '655' "$index"
check T-037 "Anchorage community named"    grep -qi 'The Anchorage' "$index"

# --- T-060 .. T-063: light/dark theming ---------------------------------
check T-060 "theme toggle button exists"   grep -q 'id="themeToggle"' "$index"
check T-061 "CSS follows system scheme"    grep -q 'prefers-color-scheme: dark' "$site/styles.css"
check T-062 "reader override wins in CSS"  grep -q 'data-theme="dark"' "$site/styles.css"
check T-063 "pre-paint theme script"       grep -q 'localStorage.getItem("702-theme")' "$index"

# --- T-040 .. T-042: photo placeholders wired for later swap ------------
check T-040 "photo placeholders exist"     grep -q 'data-slot=' "$index"
check T-041 "photo swap guide exists"      test -f "$site/assets/photos/README.md"
check T-042 "every slot documented" bash -c '
  for slot in $(grep -o "data-slot=\"[^\"]*\"" "'"$index"'" | cut -d\" -f2); do
    grep -q "\`$slot\`" "'"$site"'/assets/photos/README.md" || exit 1
  done
'

# --- T-050 .. T-052: quality and safety ---------------------------------
check T-050 "no absolute local paths leak" bash -c '! grep -q "C:\\\\" "'"$index"'"'
check T-051 "reduced-motion is honored"    grep -q 'prefers-reduced-motion' "$site/styles.css"
check T-052 "no external network deps" bash -c '
  ! grep -Eq "https?://[^\"]*\.(js|css|woff2?)" "'"$index"'"
'

echo "---------------------"
echo "Passed: $pass  Failed: $fail"
[ "$fail" -eq 0 ]
