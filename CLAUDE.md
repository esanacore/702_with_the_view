# CLAUDE.md

This repository follows Eric's Engineering Constitution.

## What This Repo Is

The listing website for the "702 with the View" rental apartment, plus its
resident-facing Property Manual. Static HTML/CSS/JS in `site/`, no build
step, no runtime dependencies. Publishing is push-to-deploy: every push to
`main` triggers `.github/workflows/deploy-pages.yml`, which runs
`tests/test_site.sh` and deploys `site/` to GitHub Pages.

## Required Reading

Before making changes, read:

- `constitution/CONSTITUTION.md`
- `constitution/AI_WORKFLOW.md`
- `constitution/TESTING.md`
- `constitution/DOCUMENTATION.md`
- `constitution/SECURITY.md`
- `constitution/CODE_STYLE.md`
- `README.md`
- `TODO.md`
- `CHANGELOG.md`
- `docs/MEMORY.md`

## Branching

The owner pushes directly to `main` — this is a single-maintainer repo and
push-to-publish is the intended workflow. The deploy workflow runs the test
suite before publishing, so a broken push does not take the live site down
(the previous deployment stays up if tests fail).

## Project-Specific Rules

- `site/` must stay dependency-free: no CDNs, no external fonts, no
  package.json. `tests/test_site.sh` T-052 enforces this.
- Photo placeholders are keyed by `data-slot`; keep
  `site/assets/photos/README.md`'s slot table in sync with `index.html`
  (T-042 enforces this).
- Real-world facts on the page (rent, dates, contact info, model numbers)
  are the owner's to provide — leave clearly-marked TBD placeholders rather
  than inventing values.
- Appliance/fixture model numbers and manuals belong in
  `docs/PROPERTY_MANUAL.md`, not in page copy.

## Completion Checklist

Before completing work:

- Confirm the requested change is implemented.
- Run `bash tests/test_site.sh` and keep it green; add tests for new behavior.
- Update requirements traceability (`docs/REQUIREMENTS_TRACEABILITY.md`).
- Update documentation when needed (including `docs/PROPERTY_MANUAL.md`).
- Update TODO.md with discovered or completed work.
- Update CHANGELOG.md for user-facing changes.
- Consider security impact.
- Propose new learnings for `docs/MEMORY.md`.
- Clear or archive `docs/SESSION_PLAN.md`.
- Summarize changes and verification.
