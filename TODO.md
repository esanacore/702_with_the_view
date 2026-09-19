# TODO

This file is the living roadmap for the project.

Keep entries specific, actionable, and current.

## Blocking the Live Listing

- [x] Purchase `702withtheview.com` (done 2026-08-03, Cloudflare Registrar)
- [x] Add DNS records in Cloudflare and set the custom domain on GitHub Pages (done 2026-08-03)
- [x] Enforce HTTPS (done 2026-08-03; cert valid to 2026-11-02, auto-renews)
- [x] Contact wired to listing agent Peggy Moran (2026-08-03) — owner said "likely" the right address, confirm before sharing widely
- [x] Fill the Details section (beds/sqft/view researched 2026-08-03 — see `docs/PROPERTY_MANUAL.md` "Property Facts & Sources")
- [ ] Owner: confirm the community amenities list (bathroom count settled
      2026-09-18: the agent's listing says 1BR / 1Ba)
- [x] Rent, availability and lease terms set from the agent's listing
      (2026-09-18: $3,150/mo, available now, one-year lease)
- [x] Interior size settled by the owner 2026-09-18: 800 sq ft, matching the
      agent's listing (Zillow's 655 retired from the page and JSON-LD)
- [x] Interior placeholders resolved 2026-09-18: kitchen, bathroom, medicine
      cabinet and bedroom filled from the agent's listing; the refrigerator
      tile was removed (no dedicated photo). To bring it back, re-add a
      `refrigerator` figure and drop `refrigerator.jpg`.
- [ ] Low-resolution listing photos to replace with originals when available:
      living-room-sofa, open-plan, sliders-sunset, deck-seating (384px wide);
      kitchen-overview, dining, deck-view, marsh-sunset (640px);
      bathroom-overview, shower, medicine-cabinet (675px).
- [x] v1.8.0 released 2026-09-18 (listing photos and facts, import tool,
      gallery integrity checker)
- [ ] Performance: all 30 photos download on page load (2.75 MB of the 3 MB
      budget). Start each photo's load only as its figure nears the viewport
      (IntersectionObserver in the auto-loader, with a no-IO fallback and
      coverage checks) before adding more photos.
- [ ] Replace the MLS photo pulls (now 26, all watermarked OneKey MLS) with full-resolution photography
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

- [ ] Optional: the original 38 MB HEVC timelapse still sits in git history,
      so a fresh clone pulls ~52 MB. Only a history rewrite
      (`git filter-repo`) would reclaim it, which rewrites published commit
      SHAs and invalidates existing release tags — not worth it unless the
      clone size becomes a real annoyance.


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
- [x] Gallery integrity checker (2026-09-18, `tests/check_gallery.py`,
      G-001..G-008, self-tested, runs in CI): regression tests for the
      duplicated, dropped and orphaned tiles made during the photo import
- [ ] `tools/optimize_photos.py` judges staleness by mtime only, so changing
      its QUALITY regenerates nothing until the `.webp` files are deleted by
      hand (done for the 80 → 72 change on 2026-09-18). Record the quality used.
- [x] GAP-005: availability wording is checked across hero, Details and
      footer (2026-09-18, T-039), after the owner confirmed the unit is
      available now
- [ ] GAP-004: extend coverage measurement to the inline pre-paint theme
      script in `index.html` (today asserted by T-063/I-012, not profiled)

## Documentation

- [ ] Record actual DNS records and dates in `docs/DOMAIN_SETUP.md` once configured
- [ ] Move-in / move-out checklists in `docs/PROPERTY_MANUAL.md`

## Nice-to-Have

- [ ] Day/dusk toggle could follow local sunset time automatically
- [ ] Neighborhood/location section with a map once the listing is public
