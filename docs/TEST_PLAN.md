# Test Plan

This document defines how this repository is tested, what coverage it targets, and where coverage gaps currently exist.

It is a living document. Update it whenever the test strategy, targets, or known gaps change.

## Test Strategy

The site is dependency-free static HTML/CSS/JS, so the pyramid inverts: no
unit layer, and four suites that all drive the real artifact.

- **Unit tests**: n/a — the only executable code is ~180 lines of
  progressive-enhancement JS, all of it DOM-coupled. It is exercised
  end-to-end by the interaction suite instead of in isolation, and that
  coverage is *measured* (see "Coverage Targets").
- **Interaction tests**: `tests/test_interactions.sh` (`I-xxx`) — drives the
  real page in headless Chromium and asserts behavior: theme toggle and
  persistence, OS-theme following, storage-failure resilience, photo
  auto-loading and alt-text fallback, scroll-reveal, scrollspy, and every
  lightbox path (open, wrap, arrows, Escape, backdrop, keyboard). Branches
  unreachable through normal browsing are covered with fixture variants
  (stubbed APIs, stripped markup, an empty photo directory).
- **Integration tests**: `tests/test_site.sh` — structural assertions with
  grep against the built page: required files, sections, feature copy,
  placeholder wiring, accessibility and dependency rules. Runs on a bare
  runner with no installs, so CI can never silently skip it.
- **Layout tests**: `tests/test_layout.sh` (`L-xxx`) — renders the page in
  headless Chromium and asserts real geometry: photos contained by their
  figures, captions never buried, no horizontal scroll; desktop + mobile,
  light + dark. Requires the local browse daemon; SKIPs with exit 0 in CI,
  where structural guard T-053 covers the known regression. Invoked by the
  full suite, so locally it always runs.
- **End-to-end tests**: manual visual pass in a browser before releases;
  the deploy workflow runs the structural suite before every publish.

## How to Run Tests

- Full suite: `bash tests/test_site.sh` — runs the structural checks, then
  the layout, interaction, and coverage suites in turn
- With coverage: `bash tests/test_coverage.sh` (fails below 100%)
- A single suite: `bash tests/test_layout.sh` / `test_interactions.sh`
- A single check: run its suite; each check reports its own ID
  (`T-xxx` structural, `L-xxx` layout, `I-xxx` interaction)

## Coverage Targets

Targets are a floor, not a ceiling. Changes that drop measured coverage below a floor require explicit, documented justification.

| Scope | Metric | Floor |
| --- | --- | --- |
| `site/app.js` | Line **and** block (branch) coverage, measured | **100%** |
| Listing sections & feature copy | Structural assertions | Every section and promised feature has a `T-xxx` check |
| Photo placeholder wiring | Structural assertions | Every `data-slot` documented (T-042) |
| Dependency policy | Structural assertions | No external js/css/fonts (T-052) |

Coverage is measured, not asserted: `tests/test_coverage.sh` runs the page
under V8's profiler (`tests/coverage.js`), replays the interaction suite,
merges results across the fixture variants, and **fails if a single line or
block is unexecuted**. Because V8 emits explicit ranges only for regions it
did *not* execute, merging across pages is byte-wise rather than by range
identity — comparing range keys would misreport covered blocks as missed.

Keeping the floor at 100% is realistic here precisely because the codebase
is small and dependency-free; when a branch cannot be reached by any real
user path, the correct fix is usually to delete the dead code rather than
contrive a test for it (two such guards were removed in v1.3.0).

New or modified code should meet the floor on its own, not lean on untouched legacy code.

## Continuous Coverage Evaluation

Coverage is measured on every change (locally and, where possible, in CI). Record the latest figures here so trends stay visible.

| Date | Overall coverage | Notes |
| --- | --- | --- |
| 2026-08-03 | 27/27 structural checks passing | Baseline at initial site build |
| 2026-08-03 | 35/35 structural checks passing | Redesign + theming + community facts (T-026, T-035..T-037, T-060..T-063 added) |
| 2026-08-03 | 37/37 structural checks passing | v1.0.0: contact wiring (T-038), photo auto-loader (T-043) |
| 2026-08-03 | 38/38 structural + 16/16 layout checks passing | Caption-burial fix; layout suite added (T-053, L-010..L-040) |
| 2026-08-17 | 46 structural + 16 layout + 19 interaction; **app.js 176/176 lines, 0 uncovered blocks (100%)** | Interaction suite + measured coverage gate added |

A downward trend is a signal to investigate, even when the number stays above the floor.

## Coverage Gap Log

Track known untested behavior here. A percentage alone hides gaps; this log makes them explicit. Each entry should have a follow-up item in `TODO.md` under Testing.

| Gap ID | Area / behavior | Risk | Related requirement | Status | TODO ref |
| --- | --- | --- | --- | --- | --- |
| GAP-001 | JS behavior untested | low | FR-006 | **Closed** (v1.3.0 — `tests/test_interactions.sh`, 100% measured line+block coverage) | — |
| GAP-003 | Browser suites (layout, interaction, coverage) run locally only — CI runners have no browser, so CI protection is the structural suite plus guards like T-053 | low | NFR-003 | Open | TODO.md → Testing |
| GAP-004 | Coverage measures `site/app.js` only; the inline pre-paint theme script in `index.html` is verified by assertion (T-063, I-012) rather than by the profiler | low | FR-008 | Open | TODO.md → Testing |
| GAP-002 | HTML validity not machine-checked | low | NFR-001 | Open | TODO.md → Testing (tidy) |

## Requirement Coverage

For product-facing repositories, every requirement ID should map to at least one test. The authoritative mapping lives in `docs/REQUIREMENTS_TRACEABILITY.md`. Requirements with no verifying test are gaps and should appear in the gap log above.

## Coverage Matrix — `site/app.js`

Every branch and which check exercises it. Verified by measurement
(`bash tests/test_coverage.sh`), not by inspection.

| Behavior / branch | Covered by |
| --- | --- |
| Theme: initial value follows system | I-010 |
| Theme: toggle flips, persists, updates aria/label | I-011 |
| Theme: stored preference wins on reload (pre-paint script) | I-012, T-063 |
| Theme: OS change ignored when a preference is stored | I-013 |
| Theme: OS change followed when no preference | I-014 |
| Theme: `localStorage` read/write throws (private mode) | I-015 |
| Theme: real `prefers-color-scheme` change event | coverage replay (`emulateMedia`) |
| Theme: system reports dark | `dark-system` fixture |
| Photos: slot file present → placeholder replaced | I-020 |
| Photos: slot file missing → placeholder kept | I-020 |
| Photos: alt from `data-alt` | I-021 |
| Photos: alt falls back to caption | I-022 (`no-data-alt` fixture) |
| Photos: alt falls back to generic text (no caption) | `bare-figures` fixture |
| Reveal: observer path marks sections visible | I-030 |
| Reveal: no `IntersectionObserver` → all visible | I-031 (`no-io` fixture) |
| Reveal: `prefers-reduced-motion` → all visible | I-032 (`reduced-motion` fixture) |
| Scrollspy: active link tracks the section in view | I-040 |
| Lightbox: click opens with caption, scroll locked | I-050 |
| Lightbox: previous from first wraps to last | I-051 |
| Lightbox: arrow keys navigate | I-052 |
| Lightbox: Escape closes, focus returns, scroll restored | I-053 |
| Lightbox: backdrop click closes | I-054 |
| Lightbox: close button closes | coverage replay |
| Lightbox: Enter/Space on a focused photo opens it | I-055 |
| Lightbox: other keys ignored | coverage replay |
| Lightbox: click on a non-photo element ignored | coverage replay |
| Lightbox: caption fallback when a figure has none | `bare-figures` fixture |
| Lightbox: no photos loaded → viewer no-ops | `no-photos` fixture |
| Lightbox: click target without `.closest` | coverage replay |
