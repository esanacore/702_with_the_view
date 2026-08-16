# Changelog

All notable user-facing changes to this project should be documented in this file.

This project follows semantic versioning.

## Unreleased

### Added

### Changed

### Fixed

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
