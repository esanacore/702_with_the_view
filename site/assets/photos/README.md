# Photos — the zero-edit workflow

**To add or replace a photo: drop a `.jpg` in this folder named after its
slot, commit, push. That's it.** No HTML editing — the page checks for each
slot's file at load time (`site/app.js`, "Photo auto-loader") and swaps the
placeholder automatically. If a file is missing, the placeholder stays.

Upgrading a low-res photo later (e.g. replacing today's MLS pulls with real
photography) is the same move: overwrite the file, keep the name, push.

## Slots

| File name to use          | Subject                              |
| ------------------------- | ------------------------------------ |
| `view-main.jpg`           | The view (hero shot, wide)           |
| `living-room.jpg`         | Living room                          |
| `kitchen-overview.jpg`    | Kitchen with the new GE suite        |
| `refrigerator.jpg`        | GE French-door refrigerator          |
| `bathroom-overview.jpg`   | Remodeled bathroom                   |
| `medicine-cabinet.jpg`    | Smart medicine cabinet               |
| `bedroom.jpg`             | Bedroom                              |
| `view-dusk.jpg`           | The view at dusk (wide)              |
| `community-aerial.jpg`    | Community section: pool, clubhouse & courts aerial |
| `tennis-courts.jpg`       | Community section: tennis & pickleball |
| `boardwalk.jpg`           | Community section: the boardwalk     |
| `waterfront-lawn.jpg`     | Community section: waterfront lawn   |

(The slot names come from each figure's `data-slot` in `site/index.html`.
`tests/test_site.sh` T-042 keeps this table and the page in sync.)

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
