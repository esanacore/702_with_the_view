# Requirements Traceability Matrix

This matrix links each requirement to its acceptance criteria, the tests that verify it, and its current verification status. It provides a single, auditable view from product intent to evidence of completion.

It is a living document. Update it in the same change that adds, modifies, or verifies a requirement.

Related documents:

- `docs/PRODUCT_REQUIREMENTS.md` — the source of requirement definitions and IDs.
- `docs/TEST_PLAN.md` — coverage targets, continuous evaluation, and the gap log.

## Conventions

- **Requirement ID**: matches the ID in `docs/PRODUCT_REQUIREMENTS.md` (for example, `FR-001`, `NFR-001`).
- **Level**: `MUST`, `SHOULD`, `COULD`, or `WON'T`.
- **Acceptance criteria**: the verifiable conditions for the requirement (may be referenced as `FR-001-AC-1`).
- **Verifying tests**: the test names, files, or IDs that exercise the requirement (`T-xxx` IDs live in `tests/test_site.sh`).
- **Status**: `Not Started`, `In Progress`, `Verified`, or `Deferred`.

A requirement with no verifying test is a coverage gap. Record it in `docs/TEST_PLAN.md` (gap log) and in `TODO.md` under Testing.

## Functional Requirements

| Requirement ID | Level | Description | Acceptance Criteria | Verifying Tests | Status |
| --- | --- | --- | --- | --- | --- |
| FR-001 | MUST | All listing sections present | FR-001-AC-1 | T-020, T-021, T-022, T-023, T-024, T-025 | Verified |
| FR-002 | MUST | Kitchen copy: GE suite, icemaker, filtered line | FR-002-AC-1 | T-030, T-031, T-032 | Verified |
| FR-003 | MUST | Bathroom copy: cabinet defogger, fan speaker | FR-003-AC-1 | T-033, T-034 | Verified |
| FR-004 | MUST | Photo placeholders wired for drop-in swap | FR-004-AC-1, FR-004-AC-2 | T-040, T-041, T-042, T-043 (auto-loader) | Verified |
| FR-005 | MUST | Push to `main` publishes, gated on tests | FR-005-AC-1 | T-004 (workflow present); gate exercised by every CI run | Verified |
| FR-006 | SHOULD | Interactive, progressively enhanced page | FR-006-AC-1 | T-003, T-015; interaction suite I-010..I-055; 100% measured line+block coverage of app.js | Verified |
| FR-007 | MUST | Unit & community facts on page | FR-007-AC-1, FR-007-AC-2 | T-026, T-035, T-036, T-037 | Verified |
| FR-008 | MUST | Light/dark theming with system default + override | FR-008-AC-1, FR-008-AC-2, FR-008-AC-3 | T-060, T-061, T-062, T-063; live toggle behavior verified manually in browser | Verified |
| FR-009 | MUST | Rich link previews + structured data | FR-009-AC-1, FR-009-AC-2 | T-070, T-071, T-072, T-073 | Verified |
| FR-010 | SHOULD | Gallery lightbox | FR-010-AC-1 | T-080; I-050..I-055 (open, wrap, arrows, Escape, backdrop, keyboard) | Verified |
| FR-011 | SHOULD | Themed 404 page | FR-011-AC-1 | T-081 | Verified |
| FR-012 | SHOULD | Video defers download, shows poster, plays cross-browser | FR-012-AC-1, FR-012-AC-2 | T-054, T-096 | Verified |
| FR-013 | SHOULD | Water-path feature diagram (CSS-only) | FR-013-AC-1 | T-093 | Verified |
| FR-014 | SHOULD | Crawlable: robots.txt + sitemap.xml | FR-014-AC-1 | T-090, T-091 | Verified |
| FR-015 | SHOULD | Medicine-cabinet feature diagram (CSS-only) | FR-015-AC-1 | T-095 | Verified |

## Non-Functional Requirements

| Requirement ID | Level | Description | Acceptance Criteria | Verifying Tests | Status |
| --- | --- | --- | --- | --- | --- |
| NFR-001 | MUST | No third-party code, no local path leaks | NFR-001-AC-1, NFR-001-AC-2 | T-052, T-050 | Verified |
| NFR-002 | MUST | Broken change cannot take down live site | NFR-002-AC-1 | T-004; deploy workflow orders tests before publish | Verified |
| NFR-003 | MUST | Mobile-friendly; honors reduced motion | NFR-003-AC-1, NFR-003-AC-2 | T-012, T-051; layout suite L-030/L-040 (mobile geometry, local runs) | Verified |
| NFR-004 | MUST | WCAG AA text contrast in both themes | NFR-004-AC-1, NFR-004-AC-2 | L-010-5, L-020-5, L-030-5, L-040-5 (measured); T-094 (token discipline) | Verified |

## Coverage Summary

| Metric | Count |
| --- | --- |
| Total requirements | 19 |
| Verified | 19 |
| In progress | 0 |
| Not started | 0 |
| Requirements without a verifying test (gaps) | 0 |
