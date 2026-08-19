# Changelog

All notable user-facing changes to this project should be documented in this file.

This project follows semantic versioning.

## Unreleased

### Added

### Changed

### Fixed

## 1.6.0 — 2026-08-19

### Added

- HTML + accessibility validator (`tests/validate_html.py`, stdlib only, so
  unlike the browser suites it **runs in CI**): checks tag nesting, duplicate
  ids, missing alt text, heading order, landmarks, button names, and dangling
  aria references. It self-tests against ten deliberately broken fixtures
  first, because a validator that cannot fail proves nothing.
- Page-weight budget: core files under 200 KB,each photo under 400 KB, and the
  initial payload under 3 MB (T-100..T-102).

### Changed

- Cabinet diagram corrected to the real fixture: lighting now runs the full
  perimeter of the mirror with rounded corners, and the outlet/USB block sits
  in the top right corner (owner correction).

### Fixed

- The page had no `<main>` landmark, so screen-reader users had no way to
  skip to content; the skip link pointed at the gallery instead. Added a
  proper landmark, retargeted the link, and the scrollspy now sets
  `aria-current` so the section being read is announced, not just underlined.

### Added

- Medicine-cabinet diagram: hovering or focusing a feature (defogger,
  lighting, shelving, outlet/USB) highlights that part of a CSS-drawn
  cabinet. Like the water-path diagram, it uses no JavaScript.
- A real poster frame pulled from the timelapse itself, replacing the
  stand-in dusk photo.

### Changed

- **Timelapse re-encoded: 38 MB → 6 MB (-85%).** The camera file was HEVC,
  which Chrome and Firefox frequently refuse to play, so the video may not
  have played at all for many visitors; it is now H.264 at 1440px wide
  (the player is 720px), quality visually unchanged.

## 1.4.0 — 2026-08-18

### Added

- "Where your ice comes from": an interactive diagram tracing the water
  path — building supply → dedicated inline filter → GE refrigerator →
  icemaker. Nodes respond to hover and keyboard focus, connectors show
  flow direction, and it's built entirely in CSS, so there is no script to
  fail (the property-feature visualization first sketched at kickoff).
- `robots.txt` and `sitemap.xml` so search engines can crawl the listing.
- `theme-color` meta tags: mobile browser chrome now matches the page in
  both light and dark.
- Automated contrast testing: the layout suite measures every text
  element against its painted background in both themes at both widths
  and fails below the WCAG AA 4.5:1 floor (L-xxx-5).

### Changed

- The design system now separates accent colors by role: `--accent` is for
  button backgrounds, and a new `--link` token carries text and lines. A
  single accent used for both is what allowed the contrast bugs below.

### Fixed

- **Unreadable text in both themes.** Links measured 2.0:1 on white and
  section labels 2.2:1; the new diagram's label measured 1.04:1 on
  near-black (effectively invisible). All text now measures 5.5:1 or
  better in light and 8:1 or better in dark.
- Layout suite aborted after its first block when a check passed, because
  the passing branch left a non-zero status as the function's last
  command under `set -e` — three of four matrices were silently skipped.
- Contrast helper misread Chrome's `color(srgb …)` values (0–1 floats) as
  0–255 channels, reporting a passing element as a failure; it now parses
  both notations and composites translucent layers.

## 1.3.0 — 2026-08-17

### Added

- Interaction test suite (`tests/test_interactions.sh`, 19 checks): drives
  the real page in headless Chromium and asserts every behavior — theme
  toggle and persistence, OS-theme following, storage-failure resilience,
  photo auto-loading and alt fallbacks, scroll-reveal, scrollspy, and all
  lightbox paths. Branches unreachable by normal browsing are covered with
  fixture variants (stubbed APIs, stripped markup, empty photo directory).
- Measured coverage gate (`tests/test_coverage.sh` + `tests/coverage.js`):
  runs the page under V8's profiler and **fails below 100% line and block
  coverage** of `site/app.js`. Current: 176/176 lines, 0 uncovered blocks.
- `docs/TEST_PLAN.md` coverage matrix mapping every branch to its check.

### Changed

- The full suite (`bash tests/test_site.sh`) now chains all four suites:
  structural → layout → interaction → coverage. Each browser-dependent
  suite SKIPs cleanly where its tooling is absent, so CI is unaffected.
- Simplified `site/app.js`: the photo loader iterates frames directly
  (removing a redundant guard) and the scrollspy's unreachable null check
  is gone. Both were dead branches that no user path could reach — deleted
  rather than papered over with contrived tests.

## 1.2.0 — 2026-08-03

### Added

- Rich link previews: Open Graph + Twitter-card tags with the aerial view,
  canonical URL, and schema.org `Apartment` structured data (address,
  size, amenities) for search engines.
- Gallery lightbox: click any photo for a full-screen view; arrow keys
  navigate, Escape closes, keyboard-focusable photos (Enter/Space opens).
- Sunrise timelapse video section (owner-shot) with click-to-play.
- Themed 404 page.
- Accessibility: skip-to-content link and a consistent visible focus ring.

### Changed

- The timelapse defers its ~38MB download until played
  (`preload="metadata"`) and shows the dusk view as its poster frame.
- Kitchen copy simplified with accurate details; filtered-water tile text
  shortened; waterfront-lawn photo relabeled "Beautiful marshlands" (owner
  edits).

## 1.1.0 — 2026-08-03

### Added

- Owner photos: living room (vaulted ceiling, water view) and the dusk
  view; waterfront-lawn photo upgraded. 7 of 12 slots now filled.
- Layout regression suite (`tests/test_layout.sh`): renders the real page
  in headless Chromium and asserts photos stay inside their figures,
  captions are never buried, and the page never scrolls horizontally —
  at desktop and mobile widths, in light and dark themes. Skips cleanly
  where the browser tool is absent (CI), where structural guard T-053
  still protects the known regression.

### Changed

### Fixed

- Gallery photos overflowed their figures and buried the caption of the
  figure below (a percentage height inside an auto-height figure); photos
  now size from width + aspect-ratio only. Guarded by T-053 and the
  layout suite.

### Removed

### Security

## 1.0.0 — 2026-08-03

First public release: the site is live at https://702withtheview.com.

### Added

- Initial listing site (`site/`): gallery, kitchen section (all-new GE
  suite, French-door refrigerator with icemaker on a filtered cold-water
  line), bathroom section (smart medicine cabinet with defogger/lighting/
  shelving/outlet+USB, fan with built-in light and Bluetooth speaker),
  details, Property Guide teaser, and contact sections.
- Light/dark theming: follows the device default, labeled toggle override,
  choice persisted, no wrong-theme flash (modeled on gentletable.com).
- Community section for The Anchorage (gated, 24-hour security, pool,
  tennis & pickleball, clubhouse & gym, boardwalk, dock space, assigned
  parking, Nautical Mile, LIRR) and researched unit facts (1 bed,
  655 sq ft, water view) with sources in the Property Manual.
- First photos: aerial water view in the gallery and four community shots
  (pool/clubhouse aerial, tennis courts, boardwalk, waterfront lawn) —
  MLS pulls serving as placeholders until final photography.
- Zero-edit photo workflow: drop `site/assets/photos/<slot>.jpg` and the
  page picks it up automatically; overwriting the file upgrades the photo.
- Contact section wired to the listing agent (Peggy Moran, Charles
  Rutenberg Realty): email button with prefilled subject, phone link.
- Scroll-reveal animations, nav scrollspy, and reduced-motion support.
- Push-to-publish deployment: GitHub Pages workflow that tests then deploys
  `site/` on every push to `main`; custom domain `702withtheview.com` with
  enforced HTTPS.
- Structural test suite (`tests/test_site.sh`, 37 checks) run locally and in CI.
- Property Manual skeleton (`docs/PROPERTY_MANUAL.md`) with researched
  facts & sources; awaiting appliance model numbers.
- Domain purchase & DNS guide (`docs/DOMAIN_SETUP.md`).
- Eric's Engineering Constitution adopted as the `constitution/` submodule
  with full governance docs and CI gates.

### Changed

- Redesigned from the first draft to a minimal, clean look: warm cream/ink
  palette, serif headings, quiet wave motif; removed emoji icons and the
  cartoon sky hero (the day/dusk toggle gave way to the site-wide theme
  toggle).

### Fixed

- Photo auto-loader probe: a detached image with `loading="lazy"` never
  fetches, so slot photos silently failed to appear; the probe now loads
  eagerly.
