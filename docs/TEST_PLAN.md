# Test Plan

This document defines how this repository is tested, what coverage it targets, and where coverage gaps currently exist.

It is a living document. Update it whenever the test strategy, targets, or known gaps change.

## Test Strategy

The site is dependency-free static HTML/CSS/JS, so the pyramid collapses to
one structural layer plus manual visual QA:

- **Unit tests**: n/a — no application logic beyond ~100 lines of
  progressive-enhancement JS (scroll-reveal, scrollspy, sky toggle).
- **Integration tests**: `tests/test_site.sh` — structural assertions with
  grep against the built page: required files, sections, feature copy,
  placeholder wiring, accessibility and dependency rules. Runs on a bare
  runner with no installs, so CI can never silently skip it.
- **End-to-end tests**: manual visual pass in a browser before releases;
  the deploy workflow runs the structural suite before every publish.

## How to Run Tests

- Full suite: `bash tests/test_site.sh`
- With coverage: n/a — structural checks, not instrumented code
- A single test or subset: run the suite; each check reports its `T-xxx` ID
  individually

## Coverage Targets

Targets are a floor, not a ceiling. Changes that drop measured coverage below a floor require explicit, documented justification.

| Scope | Metric | Floor |
| --- | --- | --- |
| Listing sections & feature copy | Structural assertions | Every section and promised feature has a `T-xxx` check |
| Photo placeholder wiring | Structural assertions | Every `data-slot` documented (T-042) |
| Dependency policy | Structural assertions | No external js/css/fonts (T-052) |

New or modified code should meet the floor on its own, not lean on untouched legacy code.

## Continuous Coverage Evaluation

Coverage is measured on every change (locally and, where possible, in CI). Record the latest figures here so trends stay visible.

| Date | Overall coverage | Notes |
| --- | --- | --- |
| 2026-08-03 | 27/27 structural checks passing | Baseline at initial site build |

A downward trend is a signal to investigate, even when the number stays above the floor.

## Coverage Gap Log

Track known untested behavior here. A percentage alone hides gaps; this log makes them explicit. Each entry should have a follow-up item in `TODO.md` under Testing.

| Gap ID | Area / behavior | Risk | Related requirement | Status | TODO ref |
| --- | --- | --- | --- | --- | --- |
| GAP-001 | JS behavior (reveal/scrollspy/toggle) has no automated browser test | low | FR-006 | Open | TODO.md → Testing (cross-browser spot-check) |
| GAP-002 | HTML validity not machine-checked | low | NFR-001 | Open | TODO.md → Testing (tidy) |

## Requirement Coverage

For product-facing repositories, every requirement ID should map to at least one test. The authoritative mapping lives in `docs/REQUIREMENTS_TRACEABILITY.md`. Requirements with no verifying test are gaps and should appear in the gap log above.
