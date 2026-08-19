# ADR: Two Tiers of Tests — CI-Enforceable and Browser-Local

Status: Accepted

Date: 2026-08-19

## Relationships

- Extends: ADR-0002 (dependency-free static site on GitHub Pages)
- Supersedes: none
- Related: `docs/TEST_PLAN.md`

## Context

The site ships no dependencies, and CI runs on a bare GitHub Actions runner
with no browser installed. But the most valuable checks discovered during
development were exactly the ones a browser can answer:

- photos overflowing their figures and burying captions (v1.1.0)
- text at 1.04:1 and 2.0:1 contrast, effectively unreadable (v1.4.0)
- whether every branch of `app.js` actually executes (v1.3.0)

Installing a browser in CI would contradict the project's dependency-free
posture and slow every deploy; asserting these things with `grep` cannot
work, because they are properties of rendered output, not of source text.

## Decision

Split the suite into two tiers, and be explicit about which is which:

1. **CI-enforceable** — runs on every push, no browser, no packages:
   `tests/test_site.sh` (structural, `T-xxx`) and `tests/validate_html.py`
   (HTML/a11y, `V-xxx`, Python standard library only). These gate deploys.
2. **Browser-local** — run by the full suite on a developer machine, and
   **SKIP with exit 0** where the tooling is absent: `test_layout.sh`
   (`L-xxx`), `test_interactions.sh` (`I-xxx`), `test_coverage.sh`.

Where a browser-tier check catches a bug that could recur, add a *structural
proxy* to tier 1 so CI still guards it (e.g. T-053 greps for the CSS
pattern that caused the caption bug; T-096 checks the video's codec bytes).

Governance tooling in tier 1 must self-test (`validate_html.py --selftest`)
so a validator cannot pass vacuously.

## Consequences

- Positive: deploys stay fast and dependency-free while the expensive,
  high-signal checks still exist and run before every release. The tiering
  is honest — a skipped suite says so rather than reporting a false pass.
- Negative: a regression that only a browser can see could reach `main` if
  a developer pushes without running the full suite. This is recorded as
  GAP-003 in `docs/TEST_PLAN.md`; the structural proxies limit the blast
  radius, and a `workflow_dispatch` browser job is the likely future fix.

## Alternatives Considered

- **Install a browser in CI**: rejected for now — adds minutes and a large
  dependency to every deploy of a static page, against ADR-0002's intent.
- **Drop the browser tier**: rejected — it is where the real defects were
  found; deleting it would trade genuine coverage for a tidier story.
- **Third-party hosted testing (Lighthouse CI, Percy)**: rejected — external
  services and accounts for a single-page listing site.
