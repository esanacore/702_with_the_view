# Operations

This guide covers operational procedures, runbooks, and safe execution practices.

## Deployment

- **Environments**: local (open `site/index.html` or `python -m http.server`)
  and production (GitHub Pages at `702withtheview.com` /
  `esanacore.github.io/702_with_the_view`). No staging — preview locally.
- **Deployment Procedure**: push to `main`. `.github/workflows/deploy-pages.yml`
  runs `tests/test_site.sh`, uploads `site/` as the Pages artifact, and
  deploys. No manual steps.
- **Approvals / Gates**: the test suite gates every deploy; constitution CI
  workflows run alongside. Single-maintainer repo — no review gate.
- **Rollback**: `git revert <bad-commit> && git push` — the workflow
  redeploys the previous content. A failed test run never replaces the live
  deployment.

## Monitoring & Observability

- **Logs**: GitHub → Actions tab (deploy + CI runs).
- **Metrics**: GitHub Pages has no built-in analytics; add a privacy-light
  analytics script only as a deliberate, documented decision (it would also
  require relaxing test T-052).
- **Alerts**: GitHub emails the owner on workflow failure.

## Safe Operations

- **Backup/Restore**: the repository *is* the site; git history is the
  backup. No runtime state exists.
- **Maintenance Mode**: not applicable — static content.
- **Stateful Changes**: none. The only external state is DNS (Cloudflare)
  and the Pages custom-domain setting; record changes to either in
  `docs/DOMAIN_SETUP.md`.

## Incident Response

1. Site down or wrong? Check the latest run in the Actions tab.
2. Bad content live: `git revert` the offending commit and push.
3. Domain/TLS issues: see the troubleshooting section of
   `docs/DOMAIN_SETUP.md` (grey-cloud DNS records, certificate issuance).
4. GitHub Pages platform outage: nothing to do but wait —
   https://www.githubstatus.com.
