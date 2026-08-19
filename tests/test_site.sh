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
check T-016 "skip-to-content link"         grep -q 'class="skip-link"' "$index"

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
check T-032 "filtered water line"          grep -qi 'filtered water' "$index"
check T-033 "medicine cabinet defogger"    grep -qi 'defogger' "$index"
check T-034 "fan with Bluetooth speaker"   grep -qi 'Bluetooth speaker' "$index"
check T-035 "water view stated"            grep -qi 'water view\|>Water<' "$index"
check T-036 "655 sq ft stated"             grep -qi '655' "$index"
check T-037 "Anchorage community named"    grep -qi 'The Anchorage' "$index"
check T-038 "realtor contact wired" bash -c '
  grep -q "mailto:pmoranhomes@gmail.com" "'"$index"'" &&
  grep -q "tel:+16314870153" "'"$index"'" &&
  ! grep -q "CONTACT-EMAIL-TBD" "'"$index"'"
'

# --- T-060 .. T-063: light/dark theming ---------------------------------
check T-060 "theme toggle button exists"   grep -q 'id="themeToggle"' "$index"
check T-061 "CSS follows system scheme"    grep -q 'prefers-color-scheme: dark' "$site/styles.css"
check T-062 "reader override wins in CSS"  grep -q 'data-theme="dark"' "$site/styles.css"
check T-063 "pre-paint theme script"       grep -q 'localStorage.getItem("702-theme")' "$index"

# --- T-040 .. T-043: photo placeholders wired for later swap ------------
check T-040 "photo placeholders exist"     grep -q 'data-slot=' "$index"
check T-041 "photo swap guide exists"      test -f "$site/assets/photos/README.md"
check T-042 "every slot documented" bash -c '
  for slot in $(grep -o "data-slot=\"[^\"]*\"" "'"$index"'" | cut -d\" -f2); do
    grep -q "\`$slot\.jpg\`" "'"$site"'/assets/photos/README.md" || { echo "undocumented: $slot"; exit 1; }
  done
'
check T-043 "photo auto-loader wired"      grep -q 'assets/photos/" + slot' "$site/app.js"

# --- T-050 .. T-052: quality and safety ---------------------------------
check T-050 "no absolute local paths leak" bash -c '! grep -q "C:\\\\" "'"$index"'"'
check T-051 "reduced-motion is honored"    grep -q 'prefers-reduced-motion' "$site/styles.css"
check T-052 "no external network deps" bash -c '
  ! grep -Eq "https?://[^\"]*\.(js|css|woff2?)" "'"$index"'"
'
# Regression guard for the v1.0.0 caption bug: a percentage height on the
# swapped-in gallery photos makes them overflow their figure and bury the
# caption below. Photos must size from width + aspect-ratio only.
check T-053 "gallery photos never height:100%" bash -c '
  rule=$(sed -n "/^\.ph__frame img,/,/^}/p" "'"$site"'/styles.css");
  [ -n "$rule" ] &&
  printf "%s" "$rule" | grep -q "height: auto" &&
  ! printf "%s" "$rule" | grep -q "height: 100%"
'
# The timelapse is ~6MB H.264 (re-encoded from 38MB HEVC in v1.5.0);
# preload=metadata keeps it off the wire until the visitor presses play.
check T-054 "video deferred + postered" bash -c '
  grep -q "preload=\"metadata\"" "'"$index"'" &&
  grep -q "poster=\"assets/videos/poster.jpg\"" "'"$index"'" &&
  test -f "'"$site"'/assets/videos/timelapse.mp4"
'

# --- T-070 .. T-073: sharing & SEO --------------------------------------
check T-070 "Open Graph image set"         grep -q 'property="og:image"' "$index"
check T-071 "Twitter card set"             grep -q 'name="twitter:card"' "$index"
check T-072 "JSON-LD structured data"      grep -q 'application/ld+json' "$index"
check T-073 "canonical URL set"            grep -q 'rel="canonical"' "$index"

# --- T-080 .. T-081: lightbox & 404 -------------------------------------
check T-080 "lightbox present and wired" bash -c '
  grep -q "id=\"lightbox\"" "'"$index"'" &&
  grep -q "lightboxClose" "'"$site"'/app.js"
'
check T-081 "404 page exists, themed" bash -c '
  test -f "'"$site"'/404.html" &&
  grep -q "702-theme" "'"$site"'/404.html"
'

# --- T-090 .. T-093: discovery files & the feature diagram --------------
check T-090 "robots.txt points at sitemap" bash -c '
  test -f "'"$site"'/robots.txt" &&
  grep -q "Sitemap: https://702withtheview.com/sitemap.xml" "'"$site"'/robots.txt"
'
check T-091 "sitemap lists the canonical URL" bash -c '
  test -f "'"$site"'/sitemap.xml" &&
  grep -q "<loc>https://702withtheview.com/</loc>" "'"$site"'/sitemap.xml"
'
check T-092 "theme-color for both schemes" bash -c '
  grep -q "theme-color.*prefers-color-scheme: light" "'"$index"'" &&
  grep -q "theme-color.*prefers-color-scheme: dark" "'"$index"'"
'
check T-093 "water-path diagram present, CSS-only" bash -c '
  grep -q "id=\"how\"" "'"$index"'" &&
  grep -q "flow__node" "'"$index"'" &&
  grep -q "aria-describedby=\"flow-d1\"" "'"$index"'" &&
  ! grep -q "flow__" "'"$site"'/app.js"
'
# HEVC (the camera's default) is rejected by Chrome/Firefox on most systems,
# and a 38MB hero video is a bad mobile experience. Both are guarded here.
check T-096 "video is H.264 and under 10MB" bash -c '
  v="'"$site"'/assets/videos/timelapse.mp4";
  test -f "$v" &&
  [ "$(wc -c < "$v")" -lt 10485760 ] &&
  head -c 4096 "$v" | grep -qa "avc1" &&
  ! head -c 4096 "$v" | grep -qa "hvc1"
'
check T-095 "cabinet diagram present, CSS-only, labeled" bash -c '
  grep -q "cab__feature" "'"$index"'" &&
  grep -q "data-part=\"defog\"" "'"$index"'" &&
  grep -q "data-part=\"power\"" "'"$index"'" &&
  grep -q "cab__art\" role=\"img\"" "'"$index"'" &&
  ! grep -q "cab__" "'"$site"'/app.js"
'
# The palette once shipped gold links at 2:1 on white and a diagram label at
# 1.04:1 on near-black. --accent is for button backgrounds; text and lines
# use --link, which is legible in both themes (measured by L-xxx-5).
check T-094 "text accents use --link, not --accent" bash -c '
  grep -q -- "--link:" "'"$site"'/styles.css" &&
  ! grep -E "^\s*(a|\.overline|\.hero__overline)\s*\{[^}]*var\(--accent\)" "'"$site"'/styles.css" &&
  ! grep -q "outline: 2px solid var(--accent)" "'"$site"'/styles.css"
'

echo "---------------------"
echo "Passed: $pass  Failed: $fail"
[ "$fail" -eq 0 ] || exit 1

# Browser-based suites. Each SKIPs cleanly where its tooling is absent
# (e.g. CI runners), so the structural checks above remain the CI gate.
for suite in test_layout test_interactions test_coverage; do
  if [ -f "$root/tests/$suite.sh" ]; then
    echo
    bash "$root/tests/$suite.sh"
  fi
done
