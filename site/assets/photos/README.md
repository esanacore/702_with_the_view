# Photos

Real photos are not in the repository yet — the site currently renders
shimmer placeholders.

## Adding a photo

1. Drop the image in this directory, named after the placeholder slot it
   fills (see the table below), e.g. `view-main.jpg`.
2. In `site/index.html`, find the `<figure>` whose `data-slot` matches, and
   replace the placeholder frame:

   ```html
   <!-- before -->
   <div class="ph__frame"><span class="ph__icon">🌅</span></div>

   <!-- after -->
   <img src="assets/photos/view-main.jpg" alt="Describe the photo for screen readers">
   ```

3. Keep the `<figcaption>` — it becomes the visible caption.

## Placeholder slots

| Slot (`data-slot`)   | Subject                              |
| -------------------- | ------------------------------------ |
| `view-main`          | The view (hero shot, wide)           |
| `living-room`        | Living room                          |
| `kitchen-overview`   | Kitchen with the new GE suite        |
| `refrigerator`       | GE French-door refrigerator          |
| `bathroom-overview`  | Remodeled bathroom                   |
| `medicine-cabinet`   | Smart medicine cabinet               |
| `bedroom`            | Bedroom                              |
| `view-dusk`          | The view at dusk (wide)              |

## Guidelines

- Prefer landscape 4:3 shots (wide slots are 8:3); the CSS crops gracefully
  either way once you add `object-fit: cover`.
- Resize to ≤ 1600 px on the long edge and compress (JPEG quality ~80 or
  WebP) — the whole page should stay under ~2 MB for fast mobile loads.
- Write a real `alt` text for every photo; the captions do not replace it.
