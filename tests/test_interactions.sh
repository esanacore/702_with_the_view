#!/usr/bin/env bash
set -euo pipefail

# Behavior/interaction tests (I-xxx) — full app.js branch coverage.
#
# Drives the real page in headless Chromium and exercises EVERY code path
# in site/app.js, including ones normal browsing can't reach:
#   - the OS theme-change handler (via the window.__702test seam — a real
#     prefers-color-scheme flip can't be triggered from inside a page)
#   - localStorage read/write failures (Storage.prototype poisoned in-page)
#   - the no-IntersectionObserver and prefers-reduced-motion fallbacks
#     (variant page with the APIs stubbed before app.js runs)
# The branch → check mapping lives in docs/TEST_PLAN.md ("Coverage matrix").
#
# Requires the local browse daemon; SKIPs with exit 0 where it's absent
# (CI), like tests/test_layout.sh.

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

B="$HOME/.claude/skills/gstack/browse/dist/browse"
if [ ! -x "$B" ]; then
  echo "  SKIP  interaction tests (gstack browse not installed)"
  exit 0
fi

site_url="file://$(printf '%s' "$root/site/index.html" | sed -E 's#^/([a-zA-Z])/#/\U\1:/#')"

pass=0
fail=0

check() {
  # check <id> <description> — asserts the last js() result was "true"
  local id="$1" desc="$2" result="$3"
  if [ "$result" = "true" ]; then
    echo "  PASS  $id  $desc"
    pass=$((pass + 1))
  else
    echo "  FAIL  $id  $desc (got: $result)"
    fail=$((fail + 1))
  fi
}

js() {
  "$B" js "$1" 2>/dev/null | grep -v "UNTRUSTED" | tr -d '\r' | tail -1
}

echo "Interaction tests (headless Chromium)"
echo "====================================="

"$B" viewport 1280x900 >/dev/null

# ---- Theme toggle -------------------------------------------------------
"$B" goto "$site_url" >/dev/null 2>&1
js "localStorage.removeItem('702-theme'); 'ok'" >/dev/null
"$B" reload >/dev/null 2>&1; sleep 1

check I-010 "initial theme follows system, label set" "$(js "
  var t = document.documentElement.dataset.theme;
  var sys = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  t === sys && document.getElementById('themeToggleLabel').textContent.length > 0
")"

check I-011 "toggle to opposite theme + persists + aria" "$(js "
  var before = document.documentElement.dataset.theme;
  document.getElementById('themeToggle').click();
  var after = document.documentElement.dataset.theme;
  after !== before &&
    localStorage.getItem('702-theme') === after &&
    document.getElementById('themeToggle').getAttribute('aria-pressed') === (after === 'dark' ? 'true' : 'false')
")"

js "localStorage.setItem('702-theme','dark'); 'ok'" >/dev/null
"$B" reload >/dev/null 2>&1; sleep 1
check I-012 "stored preference wins on reload (pre-paint)" "$(js "
  document.documentElement.dataset.theme === 'dark' &&
  document.getElementById('themeToggleLabel').textContent === 'Light mode'
")"

check I-013 "seam: system change ignored when preference stored" "$(js "
  window.__702test.onSystemThemeChange(false);
  document.documentElement.dataset.theme === 'dark'
")"

check I-014 "seam: system change followed when no preference" "$(js "
  localStorage.removeItem('702-theme');
  window.__702test.onSystemThemeChange(false);
  var light = document.documentElement.dataset.theme === 'light';
  window.__702test.onSystemThemeChange(true);
  light && document.documentElement.dataset.theme === 'dark'
")"

check I-015 "storage failure: toggle still works, no crash" "$(js "
  var origGet = Storage.prototype.getItem, origSet = Storage.prototype.setItem;
  Storage.prototype.getItem = function () { throw new Error('blocked'); };
  Storage.prototype.setItem = function () { throw new Error('blocked'); };
  var before = document.documentElement.dataset.theme;
  document.getElementById('themeToggle').click();
  var flipped = document.documentElement.dataset.theme !== before;
  var followed;
  try { window.__702test.onSystemThemeChange(before === 'dark'); followed = true; }
  catch (e) { followed = false; }
  Storage.prototype.getItem = origGet; Storage.prototype.setItem = origSet;
  flipped && followed
")"

# ---- Photo auto-loader --------------------------------------------------
"$B" reload >/dev/null 2>&1; sleep 1

check I-020 "existing slots filled, missing slots keep placeholder" "$(js "
  document.querySelectorAll('.ph img').length === 7 &&
  document.querySelectorAll('.ph .ph__frame').length === 5
")"

# Every filled slot ships a real data-alt, so this covers the primary path;
# the caption-fallback branch is covered by I-022 on a variant page.
check I-021 "alt taken from data-alt when present" "$(js "
  var fig = document.querySelector('[data-slot=view-main]');
  var alt = fig.querySelector('img').alt;
  alt === fig.getAttribute('data-alt') && alt.length > 20
")"

# ---- Scroll-reveal + scrollspy ------------------------------------------
js "window.scrollTo(0, document.body.scrollHeight); 'ok'" >/dev/null; sleep 1
js "document.getElementById('community').scrollIntoView({block:'center'}); 'ok'" >/dev/null; sleep 1

check I-030 "revealed sections become visible on scroll" "$(js "
  document.querySelectorAll('#community .reveal.is-visible').length > 0
")"

check I-040 "scrollspy marks the section in view" "$(js "
  var active = document.querySelector('.nav__links a.is-active');
  !!active && active.getAttribute('href') === '#community'
")"

# ---- Lightbox -----------------------------------------------------------
check I-050 "click opens lightbox with matching caption" "$(js "
  var img = document.querySelector('[data-slot=view-main] img');
  img.click();
  var lb = document.getElementById('lightbox');
  !lb.hidden &&
    document.getElementById('lightboxCaption').textContent === 'The water view' &&
    document.body.style.overflow === 'hidden'
")"

check I-051 "prev from first wraps to last photo" "$(js "
  document.getElementById('lightboxPrev').click();
  var photos = document.querySelectorAll('.ph img');
  document.getElementById('lightboxImg').src === photos[photos.length - 1].src
")"

check I-052 "arrow keys navigate" "$(js "
  var before = document.getElementById('lightboxImg').src;
  document.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'}));
  var moved = document.getElementById('lightboxImg').src !== before;
  document.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}));
  moved && document.getElementById('lightboxImg').src === before
")"

check I-053 "Escape closes, focus returns to trigger" "$(js "
  document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
  var lb = document.getElementById('lightbox');
  lb.hidden &&
    document.body.style.overflow === '' &&
    document.activeElement === document.querySelector('[data-slot=view-main] img')
")"

check I-054 "backdrop click closes" "$(js "
  document.querySelector('.ph img').click();
  var lb = document.getElementById('lightbox');
  var wasOpen = !lb.hidden;
  lb.click();
  wasOpen && lb.hidden
")"

check I-055 "keyboard: Enter on focused photo opens viewer" "$(js "
  var img = document.querySelector('[data-slot=living-room] img');
  img.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
  var open = !document.getElementById('lightbox').hidden;
  document.getElementById('lightboxClose').click();
  open &&
    img.getAttribute('role') === 'button' &&
    img.getAttribute('tabindex') === '0' &&
    document.getElementById('lightbox').hidden
")"

# ---- Fallback branches (variant pages with stubbed APIs) ----------------
# The stubs must run BEFORE app.js, so we generate variant pages that
# inject a stub <script> ahead of it. Assets resolve absolutely; photos
# aren't needed for these assertions.
variant_dir="${TMPDIR:-$HOME/AppData/Local/Temp}/702-interaction-variants"
mkdir -p "$variant_dir"
site_dir_url="$(printf '%s' "$root/site" | sed -E 's#^/([a-zA-Z])/#/\1:/#')"

make_variant() {
  # make_variant <name> <stub-js>
  # A <base> tag points every relative URL (styles.css, app.js, and the
  # photo slots the auto-loader probes) back at the real site directory,
  # so the variant behaves exactly like the deployed page apart from the
  # injected stub. The stub must precede app.js to take effect.
  sed -e "s#<head>#<head><base href=\"file://$site_dir_url/\">#" \
      -e "s#<script src=\"app.js\"></script>#<script>$2</script><script src=\"app.js\"></script>#" \
      "$root/site/index.html" > "$variant_dir/$1.html"
}

# Caption-fallback branch: strip every data-alt so the loader must fall
# back to each figure's caption text.
make_variant no-data-alt ""
sed -i -E 's# data-alt="[^"]*"##g' "$variant_dir/no-data-alt.html"
"$B" goto "file://$(printf '%s' "$variant_dir" | sed -E 's#^/([a-zA-Z])/#/\U\1:/#')/no-data-alt.html" >/dev/null 2>&1; sleep 2
check I-022 "alt falls back to caption when data-alt absent" "$(js "
  var fig = document.querySelector('[data-slot=view-main]');
  var img = fig.querySelector('img');
  !!img && img.alt === fig.querySelector('figcaption').textContent
")"

make_variant no-io "delete window.IntersectionObserver;"
"$B" goto "file://$(printf '%s' "$variant_dir" | sed -E 's#^/([a-zA-Z])/#/\U\1:/#')/no-io.html" >/dev/null 2>&1; sleep 1
check I-031 "no IntersectionObserver: everything visible at once" "$(js "
  document.querySelectorAll('.reveal').length > 0 &&
  document.querySelectorAll('.reveal:not(.is-visible)').length === 0
")"

make_variant reduced-motion "var _mm = window.matchMedia; window.matchMedia = function (q) { if (q.indexOf('reduced-motion') >= 0) { return { matches: true, addEventListener: function(){} }; } return _mm.call(window, q); };"
"$B" goto "file://$(printf '%s' "$variant_dir" | sed -E 's#^/([a-zA-Z])/#/\U\1:/#')/reduced-motion.html" >/dev/null 2>&1; sleep 1
check I-032 "prefers-reduced-motion: reveals skipped, all visible" "$(js "
  document.querySelectorAll('.reveal:not(.is-visible)').length === 0
")"

rm -rf "$variant_dir"

echo "-------------------------------------"
echo "Passed: $pass  Failed: $fail"
[ "$fail" -eq 0 ]
