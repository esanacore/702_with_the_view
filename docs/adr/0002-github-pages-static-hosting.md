# ADR: Dependency-Free Static Site on GitHub Pages

Status: Accepted

Date: 2026-08-03

## Relationships

- Extends: none
- Supersedes: none
- Related: `docs/DOMAIN_SETUP.md` (DNS/domain half of the same decision)

## Context

The project is a listing website for a single rental apartment. The owner's
core requirement is push-to-publish: edit the repository, push, and the live
page updates. The site has no backend needs — no forms, no database, no
auth. The owner's previous project (gentle-table) used Next.js on Vercel
because it needed a database and an admin view; this project does not.

## Decision

1. **Hand-written static HTML/CSS/JS** in `site/`, no framework, no build
   step, no third-party code at runtime (enforced by test T-052).
2. **GitHub Pages** hosts the site, deployed by a GitHub Actions workflow
   on every push to `main`, gated on the test suite.
3. **Cloudflare** remains registrar + DNS (`702withtheview.com`), matching
   the owner's existing gentletable.com setup.

## Consequences

- Positive: zero hosting cost, zero dependency maintenance, TLS managed by
  GitHub, rollback is `git revert`, and the whole site is auditable as
  plain text. A failed test run leaves the previous deployment live.
- Negative: no server-side capability — if the listing ever needs an
  application form or scheduling backend, that's a new ADR (likely a
  third-party embed or a move to a platform like Vercel/Workers). The
  repository must stay public for free Pages hosting.

## Alternatives Considered

- **Vercel + Next.js (the gentle-table stack)**: rejected — a framework,
  a build step, and a second hosting account for a page with no dynamic
  behavior; Hobby-tier commercial-use restrictions were also a recurring
  concern on gentle-table.
- **Cloudflare Pages**: viable and free, but GitHub Pages keeps hosting in
  the same place as the repository with one fewer integration to configure;
  Cloudflare stays purely registrar/DNS.
- **Site builders (Squarespace/Wix)**: rejected — defeats the
  repo-as-source-of-truth, push-to-publish requirement.
