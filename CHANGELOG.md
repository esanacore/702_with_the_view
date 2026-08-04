# Changelog

All notable user-facing changes to this project should be documented in this file.

This project follows semantic versioning.

## Unreleased

### Added

- Initial listing site (`site/`): hero with day/dusk sky toggle, highlights
  strip, gallery with 8 labeled photo placeholders, kitchen section (all-new
  GE suite, French-door refrigerator with icemaker on a filtered cold-water
  line), bathroom section (smart medicine cabinet with defogger/lighting/
  shelving/outlet+USB, fan with built-in light and Bluetooth speaker),
  details, Property Guide teaser, and contact sections.
- Scroll-reveal animations, nav scrollspy, and reduced-motion support.
- Push-to-publish deployment: GitHub Pages workflow that tests then deploys
  `site/` on every push to `main`.
- Structural test suite (`tests/test_site.sh`, 27 checks) run locally and in CI.
- Property Manual skeleton (`docs/PROPERTY_MANUAL.md`) awaiting model numbers.
- Domain purchase & DNS guide (`docs/DOMAIN_SETUP.md`) for `702withtheview.com`.
- Eric's Engineering Constitution adopted as the `constitution/` submodule
  with full governance docs and CI gates.
- Initial changelog.

- Light/dark theming: follows the device default, labeled toggle override,
  choice persisted, no wrong-theme flash (modeled on gentletable.com).
- Community section (The Anchorage amenities) and researched unit facts
  (1 bed, 655 sq ft, water view) with sources in the Property Manual.

### Changed

- Redesigned to a minimal, clean look: warm cream/ink palette, serif
  headings, quiet wave motif; removed emoji icons and the cartoon sky hero
  (the day/dusk toggle gave way to the site-wide theme toggle).

### Fixed

### Removed

### Security
