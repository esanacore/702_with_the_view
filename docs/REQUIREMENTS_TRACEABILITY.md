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
| FR-006 | SHOULD | Interactive, progressively enhanced page | FR-006-AC-1 | T-003, T-015 (script wired); runtime behavior checked manually each release, tracked in TEST_PLAN.md's coverage log | In Progress |
| FR-007 | MUST | Unit & community facts on page | FR-007-AC-1, FR-007-AC-2 | T-026, T-035, T-036, T-037 | Verified |
| FR-008 | MUST | Light/dark theming with system default + override | FR-008-AC-1, FR-008-AC-2, FR-008-AC-3 | T-060, T-061, T-062, T-063; live toggle behavior verified manually in browser | Verified |

## Non-Functional Requirements

| Requirement ID | Level | Description | Acceptance Criteria | Verifying Tests | Status |
| --- | --- | --- | --- | --- | --- |
| NFR-001 | MUST | No third-party code, no local path leaks | NFR-001-AC-1, NFR-001-AC-2 | T-052, T-050 | Verified |
| NFR-002 | MUST | Broken change cannot take down live site | NFR-002-AC-1 | T-004; deploy workflow orders tests before publish | Verified |
| NFR-003 | MUST | Mobile-friendly; honors reduced motion | NFR-003-AC-1, NFR-003-AC-2 | T-012, T-051 | Verified |

## Coverage Summary

| Metric | Count |
| --- | --- |
| Total requirements | 11 |
| Verified | 10 |
| In progress | 1 |
| Not started | 0 |
| Requirements without a verifying test (gaps) | 0 |
