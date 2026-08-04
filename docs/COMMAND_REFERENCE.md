# Command Reference

This document provides a quick reference for common commands used in this project.

## Development

- `python -m http.server 8000 --directory site`: serve the site locally at http://localhost:8000.
- There is no build step — edit `site/` and refresh the browser.

## Testing

- `bash tests/test_site.sh`: run the full structural test suite (27 checks, `T-xxx` IDs).

## Constitution Gates (also run in CI)

- `bash constitution/scripts/check_compliance.sh .`: governance files present.
- `bash constitution/scripts/run_declared_tests.sh .`: run the declared test suite.
- `bash constitution/scripts/check_traceability.sh`: requirements ↔ tests mapping.
- `bash constitution/scripts/check_architecture.sh .`: layer/dependency rules.
- `bash constitution/scripts/check_secrets.sh .`: secret-leak scan.

## Operations

- `git push` (to `main`): deploys the site to GitHub Pages via `.github/workflows/deploy-pages.yml`.
- `git revert <commit> && git push`: roll back a bad deploy.
- `gh run list --limit 5`: check recent CI/deploy runs.
