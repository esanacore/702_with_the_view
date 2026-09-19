# Original photos — untouched sources

The real, unedited file behind every photo on the site that was cropped or
tone-corrected on import. Kept byte for byte. This folder is **outside
`site/`**, so it is never deployed and adds nothing to page weight.

- Written automatically by `python tools/import_photo.py SRC SLOT`.
- Named after the slot: `photos-original/pool.jpg` is the source of
  `site/assets/photos/pool.jpg`.
- To redo a slot (say the correction changes), import from here:
  `python tools/import_photo.py photos-original/pool.jpg pool`
- `boat-parade.jpg` is the owner's full portrait shot; the site copy is a
  hand-made 4:3 crop of it (rows 640-1602), not a tool import.

Photos with **no** file here (`living-room`, `view-dusk`, `waterfront-lawn`)
are owner-shot and were never edited: the file in `site/assets/photos/` is
the original.

`tests/check_gallery.py` G-008 checks that every file here belongs to a slot on
the page, so a renamed or removed slot cannot strand its original.
