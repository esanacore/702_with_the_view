# Project Memory

This file contains durable memories, codebase learnings, user preferences, and key architectural decisions. AI agents read this file at the start of each session to align with past context, and update it (at the user's discretion) at the end of a session.

> [!IMPORTANT]
> **User Discretion**: Do not add or edit entries in this file without presenting them to the user for review. The user has absolute discretion over what memories are retained.

## User Preferences & Styling Choices

- Real-world listing facts (rent, dates, contact info, appliance model
  numbers) are the owner's to provide. Leave clearly-marked TBD
  placeholders; never invent values.
- Owner wants eventual animations/visualizations of property features
  (tracked in TODO.md → Features).
- Owner's workflow is push-to-publish: direct pushes to `main` deploy the
  site. Don't introduce a PR-gate without asking.

## Codebase Learnings & Gotchas

- A detached `Image()` with `loading="lazy"` never fetches in Chromium —
  the photo auto-loader probe (`site/app.js`) must load eagerly. Don't
  "optimize" it back to lazy.
- Photo workflow is zero-edit: `site/assets/photos/<slot>.jpg` auto-fills
  its gallery figure; upgrading a photo is overwriting the file. Slots and
  the README table are kept in sync by T-042.

- `site/` must stay dependency-free (no CDNs/external fonts/packages);
  `tests/test_site.sh` T-052 fails otherwise.
- Photo placeholder slots (`data-slot` in `index.html`) must stay in sync
  with the table in `site/assets/photos/README.md`; T-042 enforces it.
- The repo name (`702_with_the_view`) and domain (`702withtheview.com`)
  differ on purpose: DNS forbids underscores in hostnames.

## Design System

- 2026-08-03: Visual language deliberately mirrors gentletable.com — warm
  cream/ink tokens, Georgia serif headings, token-driven theming
  (`prefers-color-scheme` default, `data-theme` override on `<html>`,
  localStorage key `702-theme`, pre-paint inline script against theme
  flash). Accent palette swapped to harbor blue + brass for the waterfront
  setting. Owner's direction: minimal, clean, "not AI-ish" — no emoji
  icons, no cartoon illustrations.

## Active Project Decisions

- 2026-08-03: Host on GitHub Pages (free, TLS included, push-to-deploy)
  rather than Vercel — the site is static with no backend, unlike
  gentle-table. Domain and DNS on Cloudflare, same as gentletable.com.
- 2026-08-03: Site is hand-written static HTML/CSS/JS with no framework
  and no build step (constitution Principle 7: fewer dependencies).
- 2026-08-03: Appliance/fixture documentation lives in
  `docs/PROPERTY_MANUAL.md`, not in page copy; the site links to it
  conceptually via the Property Guide section.
