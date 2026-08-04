# Changelog

All notable user-facing changes to this project should be documented in this file.

This project follows semantic versioning.

## Unreleased

### Added

### Changed

### Fixed

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
