# TODO

This file is the living roadmap for the project.

Keep entries specific, actionable, and current.

## Blocking the Live Listing

- [x] Purchase `702withtheview.com` (done 2026-08-03, Cloudflare Registrar)
- [x] Add DNS records in Cloudflare and set the custom domain on GitHub Pages (done 2026-08-03)
- [x] Enforce HTTPS (done 2026-08-03; cert valid to 2026-11-02, auto-renews)
- [x] Contact wired to listing agent Peggy Moran (2026-08-03) — owner said "likely" the right address, confirm before sharing widely
- [x] Fill the Details section (beds/sqft/view researched 2026-08-03 — see `docs/PROPERTY_MANUAL.md` "Property Facts & Sources")
- [ ] Owner: confirm bathroom count (listing data ambiguous) and the community amenities list
- [ ] Owner: set rent, availability date, and lease terms (currently TBD)
- [ ] Remaining interior photos (kitchen, refrigerator, bathroom,
      medicine cabinet, bedroom) — 5 slots still placeholders; drop
      `<slot>.jpg` in `site/assets/photos/` (living room ✓, dusk view ✓,
      owner-shot 2026-08-03)
- [ ] Replace the 5 current MLS photo pulls with full-resolution photography
      (same filenames — the zero-edit workflow keeps it a file overwrite)
- [ ] Confirm with Peggy Moran that reusing the OneKey MLS listing photos on
      this site is OK

## Features

- [x] Lightbox for gallery photos (2026-08-03)
- [x] Interactive visualization of the filtered-water path to the icemaker
      (2026-08-18, CSS-only diagram in the "How it works" section)
- [x] Second visualization: medicine-cabinet feature callouts (2026-08-19)
- [ ] Publish the Property Manual as a page on the site (private link or
      resident-only section) once model numbers are in
- [x] Open Graph / social preview tags + JSON-LD structured data (2026-08-03)
- [x] Compress the timelapse: 38MB HEVC → 6MB H.264 @1440px (2026-08-19).
      Also fixes playback in Chrome/Firefox, which often reject HEVC.
- [x] Dedicated poster frame extracted from the video (2026-08-19)

## Property Manual

- [ ] Collect model & serial numbers for the GE appliance suite (owner)
- [ ] Collect model numbers for medicine cabinet, bathroom fan, and water filter (owner)
- [ ] Link manufacturer manuals and write per-appliance how-tos in `docs/PROPERTY_MANUAL.md`
- [ ] Document filter replacement schedule and Bluetooth pairing/reset steps

## Technical Debt

- [x] GitHub wiki initialized and first sync published (2026-08-16);
      `wiki/` now auto-syncs to the GitHub wiki on every push.


## Testing

- [x] HTML validity + a11y check, dependency-free and CI-enforced
      (2026-08-19, `tests/validate_html.py`; closes GAP-002)
- [ ] Cross-browser spot-check (Safari/iOS especially, for `aspect-ratio`
      and `backdrop-filter`) once the site is live
- [x] Interaction/behavior coverage — `tests/test_interactions.sh` with
      100% measured line+block coverage of app.js (2026-08-17, closes GAP-001)
- [ ] GAP-003: run the browser suites (layout, interaction, coverage) in CI
      — needs a browser on the runner; weigh against the no-dependency
      principle. A `workflow_dispatch`-only job may be the compromise.
- [ ] GAP-004: extend coverage measurement to the inline pre-paint theme
      script in `index.html` (today asserted by T-063/I-012, not profiled)

## Documentation

- [ ] Record actual DNS records and dates in `docs/DOMAIN_SETUP.md` once configured
- [ ] Move-in / move-out checklists in `docs/PROPERTY_MANUAL.md`

## Nice-to-Have

- [ ] Day/dusk toggle could follow local sunset time automatically
- [ ] Neighborhood/location section with a map once the listing is public
