# Photos — the zero-edit workflow

**To add or replace a photo: drop a `.jpg` in this folder named after its
slot, commit, push. That's it.** No HTML editing — the page checks for each
slot's file at load time (`site/app.js`, "Photo auto-loader") and swaps the
placeholder automatically. If a file is missing, the placeholder stays.

**One optional extra step:** run `python tools/optimize_photos.py` to
generate a smaller `.webp` beside each `.jpg` (about 25% lighter overall).
The page prefers the `.webp` and falls back to your `.jpg` automatically, so
skipping this costs a little speed but never breaks anything. A check
(T-045) reminds you when a photo has no WebP yet.

Upgrading a low-res photo later (e.g. replacing today's MLS pulls with real
photography) is the same move: overwrite the file, keep the name, push.

## Slots

| File name to use          | Subject                              |
| ------------------------- | ------------------------------------ |
| `view-main.jpg`           | The view (hero shot, wide)           |
| `living-room.jpg`         | Living room                          |
| `kitchen-overview.jpg`    | Open kitchen & dining                |
| `living-room-sofa.jpg`    | Living room, second angle            |
| `open-plan.jpg`           | Open floor plan                      |
| `dining.jpg`              | Dining area                          |
| `sliders-sunset.jpg`      | Sunset through the sliding doors     |
| `bathroom-overview.jpg`   | Remodeled bathroom                   |
| `shower.jpg`              | Walk-in shower                       |
| `medicine-cabinet.jpg`    | Smart medicine cabinet & Bluetooth vent fan |
| `bedroom.jpg`             | Bedroom                              |
| `bedroom-closets.jpg`     | Bedroom, closet side                 |
| `bedroom-staged.jpg`      | Bedroom, virtually staged (caption must say so) |
| `deck-seating.jpg`        | Deck seating, from above             |
| `deck.jpg`                | Wrap-around deck (aerial)            |
| `deck-view.jpg`           | The view from the deck               |
| `marsh-sunset.jpg`        | Sunset over the marsh, from the deck |
| `view-dusk.jpg`           | The view at dusk (wide)              |
| `community-aerial.jpg`    | Community section: pool, clubhouse & courts aerial |
| `pool.jpg`                | Community section: the pool (wide)   |
| `tennis-courts.jpg`       | Community section: tennis & pickleball |
| `gym.jpg`                 | Community section: the gym           |
| `boardwalk.jpg`           | Community section: the boardwalk     |
| `dock.jpg`                | Community section: dock space        |
| `waterfront-lawn.jpg`     | Community section: waterfront lawn   |
| `boat-parade.jpg`         | Community section: holiday boat parade on the canal |
| `gatehouse.jpg`           | Community section: gated entry       |
| `anchorage-aerial.jpg`    | Community section: aerial of the grounds (wide) |
| `lawn-sunset.jpg`         | Community section: waterfront lawn at sunset (wide) |
| `sunset-sky.jpg`          | Community section: sunset sky (wide) |

(The slot names come from each figure's `data-slot` in `site/index.html`.
`tests/test_site.sh` T-042 keeps this table and the page in sync.)

## Photos that look over-bright or over-saturated

MLS and phone-HDR photos often arrive with neon lawns and blown-out white
rooms. Instead of copying such a file in by hand, import it:

    python tools/import_photo.py path/to/source.jpg slot-name

The tool measures the photo and applies only the correction it needs
(local highlight pull, saturation trimmed on the loudest pixels only), then
writes `slot-name.jpg` here. A well-exposed photo passes through untouched.
The untouched source is preserved as `photos-original/slot-name.jpg`
(outside `site/`, never deployed), so the real photo is never lost.
Always feed it the original: it is not idempotent. To redo a slot, import
from `photos-original/`.

## Adding a NEW slot (rare)

1. Add a `<figure class="ph" data-slot="new-name">` in `index.html`
   (copy an existing one; edit the caption).
2. Add its row to the table above.
3. Drop `new-name.jpg` here.

## Guidelines

- `.jpg` only — the auto-loader looks for `<slot>.jpg` exactly.
- Prefer landscape 4:3 (wide slots display 8:3); `object-fit: cover` crops
  gracefully either way.
- For final photography: ≤ 1600 px long edge, JPEG quality ~80. Keep the
  whole page under ~2 MB for fast mobile loads.
- Captions in `index.html` double as alt-text fallback; add a `data-alt`
  attribute on the figure for a richer screen-reader description.
