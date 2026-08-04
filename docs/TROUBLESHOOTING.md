# Troubleshooting

This guide helps diagnose and fix common issues in the project.

## Common Issues

### Site didn't update after a push

- **Symptoms**: pushed to `main`, but the live site shows old content.
- **Cause**: the deploy workflow failed (usually a failing test), or the
  browser is caching.
- **Fix**: check the Actions tab (`gh run list`); if `tests/test_site.sh`
  failed, the previous deployment intentionally stays live — fix the test
  failure and push again. Otherwise hard-refresh (Ctrl+F5).

### `tests/test_site.sh` fails after editing the page

- **Symptoms**: a `T-xxx` check reports FAIL.
- **Cause**: an edit removed a required section/feature phrase, added an
  external dependency (T-052), or added a photo slot without documenting it
  (T-042).
- **Fix**: the failing check's ID and description name the exact rule;
  restore the content or update the test *and* the traceability matrix
  together.

### Domain doesn't resolve / certificate warning

- **Symptoms**: `702withtheview.com` errors while the
  `*.github.io` URL works.
- **Cause**: DNS records missing or orange-clouded, or GitHub's certificate
  is still being issued.
- **Fix**: see `docs/DOMAIN_SETUP.md` → "If something looks wrong".

### Constitution scripts missing after clone

- **Symptoms**: `constitution/scripts/...` not found.
- **Cause**: cloned without submodules.
- **Fix**: `git submodule update --init --recursive`.

## Environment Reset

Nothing to reset — the project has no dependencies or build artifacts. A
fresh `git clone --recurse-submodules` is a complete environment.
