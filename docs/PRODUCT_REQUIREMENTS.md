# Product Requirements

This document translates product intent into concrete implementation requirements.

Each requirement carries a stable ID and explicit acceptance criteria. The mapping from requirement to verifying test is tracked in `docs/REQUIREMENTS_TRACEABILITY.md`.

## Requirement Levels

- `MUST`: Required for the current release or MVP.
- `SHOULD`: Important, but can be deferred if needed.
- `COULD`: Useful future enhancement.
- `WON'T`: Explicitly out of scope for the current release or MVP.

## Requirement Identifiers

- Functional requirements use the prefix `FR-` (for example, `FR-001`).
- Non-functional requirements use the prefix `NFR-` (for example, `NFR-001`).
- Acceptance criteria may carry sub-identifiers (for example, `FR-001-AC-1`).
- IDs are stable and never reused for a different requirement, even after one is removed or superseded.

## Product Summary

A single-page listing website for the "702 with the View" rental apartment,
published via GitHub Pages at `702withtheview.com`. Target users are
prospective tenants; the release goal is a polished page the owner can share
the moment photos and listing details are finalized. A companion Property
Manual (`docs/PROPERTY_MANUAL.md`) documents the apartment itself.

## Functional Requirements

### Listing Content

**FR-001** The page presents all listing sections a prospective tenant needs.

- Level: `MUST`
- Acceptance criteria:
  - `FR-001-AC-1`: gallery, kitchen, bathroom, details, property-guide, and contact sections are all present on the page.

**FR-002** The kitchen section accurately describes the new GE appliances.

- Level: `MUST`
- Acceptance criteria:
  - `FR-002-AC-1`: copy mentions the GE suite, the French-door refrigerator's icemaker, and the filtered cold-water line.

**FR-003** The bathroom section accurately describes the remodel.

- Level: `MUST`
- Acceptance criteria:
  - `FR-003-AC-1`: copy mentions the medicine cabinet defogger (with lighting, shelving, outlet/USB) and the fan's built-in lighting and Bluetooth speaker.

### Photos

**FR-004** Photo placeholders are wired for a later drop-in swap.

- Level: `MUST`
- Acceptance criteria:
  - `FR-004-AC-1`: every placeholder carries a `data-slot` identifier.
  - `FR-004-AC-2`: every slot is documented in `site/assets/photos/README.md`.

### Publishing

**FR-005** Pushing to `main` publishes the site with no manual steps.

- Level: `MUST`
- Acceptance criteria:
  - `FR-005-AC-1`: a GitHub Actions workflow deploys `site/` to GitHub Pages on push to `main`, gated on the test suite.

### Interactivity

**FR-006** The page is modern and interactive, degrading gracefully.

- Level: `SHOULD`
- Acceptance criteria:
  - `FR-006-AC-1`: scroll-reveal, scrollspy, and the theme toggle work with JS enabled; all content remains readable with JS disabled.

### Verified Property Facts

**FR-007** The page presents the researched unit and community facts.

- Level: `MUST`
- Acceptance criteria:
  - `FR-007-AC-1`: unit particulars (1 bed, 655 sq ft, water view) and The Anchorage community amenities appear on the page.
  - `FR-007-AC-2`: facts trace to listing sources recorded in `docs/PROPERTY_MANUAL.md`; owner-unconfirmed values stay visibly TBD.

### Theming

**FR-008** The site renders in light or dark mode, following the device
default until the reader chooses.

- Level: `MUST`
- Acceptance criteria:
  - `FR-008-AC-1`: with no stored preference, the page follows `prefers-color-scheme` (including live OS changes).
  - `FR-008-AC-2`: a labeled toggle overrides the system theme and the choice persists across visits.
  - `FR-008-AC-3`: no wrong-theme flash on load.

### Sharing & Discovery

**FR-009** The listing link unfurls with a rich preview when shared.

- Level: `MUST`
- Acceptance criteria:
  - `FR-009-AC-1`: Open Graph and Twitter-card tags with the aerial view image; canonical URL declared.
  - `FR-009-AC-2`: schema.org `Apartment` structured data with address, size, and amenities.

### Media

**FR-010** Gallery photos open in a full-screen lightbox.

- Level: `SHOULD`
- Acceptance criteria:
  - `FR-010-AC-1`: click (or Enter/Space on a focused photo) opens the viewer; arrows navigate; Escape closes and focus returns.

**FR-011** A missing URL lands on a helpful, themed 404 page.

- Level: `SHOULD`
- Acceptance criteria:
  - `FR-011-AC-1`: `site/404.html` exists, follows the theme system, links back to the listing.

**FR-012** The sunrise timelapse video plays on demand without taxing page load.

- Level: `SHOULD`
- Acceptance criteria:
  - `FR-012-AC-1`: video defers download (`preload="metadata"`) and shows a poster frame until played.

## Non-Functional Requirements

### Security

**NFR-001** The site ships no third-party code and leaks no local paths.

- Level: `MUST`
- Acceptance criteria:
  - `NFR-001-AC-1`: no external scripts, stylesheets, or fonts are referenced.
  - `NFR-001-AC-2`: no absolute local filesystem paths appear in the page.

### Reliability

**NFR-002** A broken change cannot take down the live site.

- Level: `MUST`
- Acceptance criteria:
  - `NFR-002-AC-1`: the deploy workflow runs the test suite before publishing; on failure the previous deployment remains live.

### Accessibility & Performance

**NFR-003** The page is mobile-friendly and honors reduced-motion preferences.

- Level: `MUST`
- Acceptance criteria:
  - `NFR-003-AC-1`: a viewport meta tag is present and layout is responsive.
  - `NFR-003-AC-2`: `prefers-reduced-motion` disables animations.

## Explicit Non-Goals

- `WON'T` (this release): online applications, payments, or tenant portals.
- `WON'T` (this release): a CMS — content is edited directly in `site/index.html`.
- `WON'T` (ever, without owner sign-off): invented listing facts; unknown values stay visibly TBD.

## Acceptance Criteria Summary

Release-level acceptance criteria roll up the per-requirement criteria above. A release is ready when every `MUST` requirement is `Verified` in the traceability matrix.

- [x] All `MUST` requirements have verifying tests and are marked `Verified` in `docs/REQUIREMENTS_TRACEABILITY.md`.
- [ ] Owner-provided content (photos, details, contact) replaces TBD placeholders before the listing is shared publicly.

## Traceability

Each requirement above is tracked to its verifying tests and status in `docs/REQUIREMENTS_TRACEABILITY.md`. Keep the two documents in sync: when a requirement is added or changed here, update the matrix in the same change.
