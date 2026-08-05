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

- [ ] Lightbox for gallery photos once real images exist
- [ ] Animated/interactive visualizations of property features (e.g. the
      filtered-water path to the icemaker, the medicine-cabinet feature
      callouts) — owner idea from project kickoff
- [ ] Publish the Property Manual as a page on the site (private link or
      resident-only section) once model numbers are in
- [ ] Open Graph / social preview tags + preview image for sharing the listing

## Property Manual

- [ ] Collect model & serial numbers for the GE appliance suite (owner)
- [ ] Collect model numbers for medicine cabinet, bathroom fan, and water filter (owner)
- [ ] Link manufacturer manuals and write per-appliance how-tos in `docs/PROPERTY_MANUAL.md`
- [ ] Document filter replacement schedule and Bluetooth pairing/reset steps

## Technical Debt

- [ ] `site/index.html` mailto button points at a placeholder address — see Blocking above

## Testing

- [ ] Add an HTML validity check (e.g. `tidy -qe`) if a dependency-free way
      fits CI
- [ ] Cross-browser spot-check (Safari/iOS especially, for `aspect-ratio`
      and `backdrop-filter`) once the site is live
- [ ] GAP-003: run the layout suite in CI (would need a browser on the
      runner — weigh against the no-dependency principle)
- [ ] Extend layout suite to interaction behavior: theme-toggle click,
      scrollspy highlight (closes the rest of GAP-001)

## Documentation

- [ ] Record actual DNS records and dates in `docs/DOMAIN_SETUP.md` once configured
- [ ] Move-in / move-out checklists in `docs/PROPERTY_MANUAL.md`

## Nice-to-Have

- [ ] Day/dusk toggle could follow local sunset time automatically
- [ ] Neighborhood/location section with a map once the listing is public
