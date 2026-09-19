#!/usr/bin/env python3
"""Gallery integrity checker: the photo tiles, their files, and their layout.

Standard library only, so it runs on a bare CI runner. Every rule exists
because the mistake it names was actually made while editing the galleries
(2026-09-18) and was caught by eye or by luck rather than by a test:

  G-001  no data-slot appears twice, anywhere   (a bad splice duplicated four tiles)
  G-002  every photo file belongs to a slot     (a bad splice dropped two tiles,
                                                 stranding gym.jpg and boardwalk.jpg)
  G-003  every .webp has its .jpg fallback      (app.js falls back to the .jpg)
  G-004  every tile has a real data-alt (20+ chars) and a caption
  G-005  every gallery fills complete rows at 4 and 2 columns, with no holes
         (a lone fifth tile shipped once; wide tiles can also leave gaps)
  G-006  a slot named *staged* says "virtually staged" in its caption
         (the tile crop hides the image's own "Virtual Staging" label)
  G-007  the photos folder holds only <slot>.jpg, <slot>.webp and README.md
         (pool.JPG or pool.jpeg never loads: app.js asks for <slot>.jpg exactly)
  G-008  every preserved original in photos-original/ belongs to a slot
         (renaming or removing a tile must not strand the real photo)

Slots are collected from the whole document, because app.js loads
.ph[data-slot] wherever it appears; rows are counted per .gallery.

Exit status: 0 clean, 1 problems found (each printed with its G-id).
"""
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "site" / "index.html"
PHOTOS = ROOT / "site" / "assets" / "photos"
ORIGINALS = ROOT / "photos-original"
# Mirrors .gallery in site/styles.css: 4 columns, 2 at <=1024px. At <=560px
# there is 1 column and a wide tile spans 1, so nothing can go wrong there.
COLUMN_LAYOUTS = (4, 2)
MIN_ALT = 20
ALLOWED_NON_PHOTOS = {"README.md"}


class GalleryParser(HTMLParser):
    """Collect every slotted figure, and each .gallery's row of tiles."""

    def __init__(self):
        super().__init__()
        self.tiles = []          # every figure[data-slot] in the document
        self.galleries = []      # per .gallery: every <figure> child, slotted or not
        self._depth = 0          # <div> depth inside the open gallery
        self._tile = None
        self._in_caption = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        classes = (a.get("class") or "").split()
        if tag == "div":
            if self._depth:
                self._depth += 1
            elif "gallery" in classes:
                self.galleries.append([])
                self._depth = 1
        elif tag == "figure" and ("data-slot" in a or self._depth):
            self._tile = {"slot": a.get("data-slot"), "wide": "ph--wide" in classes,
                          "alt": a.get("data-alt") or "", "caption": ""}
            if self._tile["slot"] is not None:
                self.tiles.append(self._tile)
            if self._depth:
                self.galleries[-1].append(self._tile)
        elif tag == "figcaption" and self._tile is not None:
            self._in_caption = True

    def handle_endtag(self, tag):
        if tag == "div" and self._depth:
            self._depth -= 1
        elif tag == "figure":
            self._tile = None
        elif tag == "figcaption":
            self._in_caption = False

    def handle_data(self, data):
        if self._in_caption and self._tile is not None:
            self._tile["caption"] += data


def pack(tiles, columns):
    """Simulate CSS grid sparse row flow. Return (holes, cells_in_last_row)."""
    holes, col = 0, 0
    for tile in tiles:
        span = min(2 if tile["wide"] else 1, columns)
        if col + span > columns:        # does not fit: the rest of the row is a hole
            holes += columns - col
            col = 0
        col = (col + span) % columns
    return holes, col


def check(html, photo_files, original_files=()):
    """Pure check: page markup + file names in photos/ and photos-original/."""
    parser = GalleryParser()
    parser.feed(html)
    slots = [t["slot"] for t in parser.tiles]
    problems = []

    for slot in sorted({s for s in slots if slots.count(s) > 1}):
        problems.append(f'G-001 data-slot "{slot}" appears {slots.count(slot)} times')

    names = set(photo_files)
    for name in sorted(names):
        stem, dot, ext = name.rpartition(".")
        if name in ALLOWED_NON_PHOTOS:
            continue
        if not dot or ext not in ("jpg", "webp"):
            problems.append(f"G-007 {name} is not <slot>.jpg or <slot>.webp (lowercase); app.js will never load it")
        elif ext == "jpg" and stem not in slots:
            problems.append(f"G-002 {name} has no tile on the page")
        elif ext == "webp" and f"{stem}.jpg" not in names:
            problems.append(f"G-003 {name} has no .jpg fallback")

    for t in parser.tiles:
        caption = " ".join(t["caption"].split())
        if len(t["alt"].strip()) < MIN_ALT:
            problems.append(f'G-004 "{t["slot"]}" needs a data-alt of {MIN_ALT}+ characters')
        if not caption:
            problems.append(f'G-004 "{t["slot"]}" has no caption')
        if "staged" in t["slot"] and "virtually staged" not in caption.lower():
            problems.append(f'G-006 "{t["slot"]}" caption must say "virtually staged"')

    for number, gallery in enumerate(parser.galleries, 1):
        for columns in COLUMN_LAYOUTS:
            holes, leftover = pack(gallery, columns)
            if holes or leftover:
                problems.append(
                    f"G-005 gallery {number} at {columns} columns: {holes} hole(s), "
                    f"last row has {leftover or columns} of {columns} cells filled")

    for name in sorted(set(original_files) - ALLOWED_NON_PHOTOS):
        if name.rpartition(".")[0] not in slots:
            problems.append(f"G-008 photos-original/{name} belongs to no slot on the page")
    return problems


def selftest():
    """A checker that can only pass is worse than none: prove each rule fires.

    Each negative case names a substring its message must contain, and every
    OTHER rule must stay silent, so a case cannot pass on the strength of a
    different rule firing.
    """
    def tile(slot, wide=False, alt="A descriptive alternative text.", cap="Caption"):
        cls = "ph ph--wide reveal" if wide else "ph reveal"
        return (f'<figure class="{cls}" data-slot="{slot}" data-alt="{alt}">'
                f'<div class="ph__frame"><span>x</span></div>'
                f"<figcaption>{cap}</figcaption></figure>")

    def page(*tiles):
        return '<div class="gallery">' + "".join(tiles) + "</div><p>after</p>"

    def jpgs(*stems):
        return {f"{s}.jpg" for s in stems}

    four = [tile(s) for s in "abcd"]
    files = jpgs(*"abcd") | {f"{s}.webp" for s in "abcd"}
    cases = [
        # (rule, must contain, html, photo files, original files)
        ("G-001", '"a" appears 2', page(*four) + tile("a"), files, ()),   # duplicate OUTSIDE a gallery
        ("G-002", "orphan.jpg", page(*four), files | {"orphan.jpg"}, ()),
        ("G-003", "ghost.webp", page(*four), files | {"ghost.webp"}, ()),
        ("G-004", "data-alt", page(*four[:3], tile("d", alt="too short")), files, ()),
        ("G-004", "no caption", page(*four[:3], tile("d", cap="  ")), files, ()),
        ("G-005", "0 hole(s), last row has 1 of 4",                       # a lone fifth tile
         page(*four, tile("e")), files | jpgs("e"), ()),
        ("G-005", "1 hole(s), last row has 4 of 4",                       # wide tile leaves a hole, rows otherwise full
         page(*four[:3], tile("w", wide=True), tile("d"), tile("e")), jpgs("a", "b", "c", "w", "d", "e"), ()),
        ("G-005", "last row has 1 of 4",                                  # an unslotted figure still takes a cell
         page(*four, "<figure class='ph'><figcaption>x</figcaption></figure>"), files, ()),
        ("G-006", "virtually staged", page(*four[:3], tile("bedroom-staged", cap="Bedroom")),
         jpgs("a", "b", "c", "bedroom-staged"), ()),
        ("G-007", "d.JPG", page(*four), (files - {"d.jpg", "d.webp"}) | {"d.JPG"}, ()),
        ("G-007", "d.jpeg", page(*four), (files - {"d.jpg", "d.webp"}) | {"d.jpeg"}, ()),
        ("G-008", "gone.png", page(*four), files, {"a.jpg", "gone.png", "README.md"}),
    ]
    failed = 0
    for rule, needle, html, names, originals in cases:
        found = check(html, names, originals)
        hit = [p for p in found if p.startswith(rule) and needle in p]
        other = [p for p in found if not p.startswith(rule)]
        # G-007 cases remove d.jpg, so nothing else should fire either.
        ok = bool(hit) and not other
        print(f"  {'PASS' if ok else 'FAIL'}  selftest {rule} detected ({needle})"
              + ("" if ok else f" (got: {found})"))
        failed += not ok

    clean = check(page(tile("v", wide=True), tile("a"), tile("b"),
                       tile("bedroom-staged", cap="Bedroom (virtually\n   staged)"),
                       tile("c"), tile("w", wide=True)),
                  jpgs("v", "a", "b", "c", "w", "bedroom-staged") | {"v.webp", "README.md"},
                  {"v.jpg", "bedroom-staged.png", "README.md"})
    print(f"  {'FAIL' if clean else 'PASS'}  selftest clean gallery reports nothing"
          + (f": {clean}" if clean else ""))
    failed += bool(clean)
    return 1 if failed else 0


def main():
    names = {p.name for p in PHOTOS.iterdir() if p.is_file()}
    originals = {p.name for p in ORIGINALS.iterdir() if p.is_file()} if ORIGINALS.is_dir() else set()
    problems = check(INDEX.read_text(encoding="utf-8"), names, originals)
    for p in problems:
        print(f"  FAIL  {p}")
    if not problems:
        print(f"  PASS  galleries: {sum(n.endswith('.jpg') for n in names)} photos, "
              f"{len(originals - ALLOWED_NON_PHOTOS)} originals; slots unique, files matched, "
              "alts and captions present, rows complete")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(selftest() if "--selftest" in sys.argv else main())
