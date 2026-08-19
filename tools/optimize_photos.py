#!/usr/bin/env python3
"""Generate WebP derivatives for every photo in site/assets/photos/.

The owner's workflow stays "drop a .jpg and push" (see
site/assets/photos/README.md). This script produces a .webp beside each
.jpg; the page prefers the .webp and falls back to the .jpg when one is
missing, so forgetting to run this degrades speed, never correctness.

Usage:
    python tools/optimize_photos.py            # generate missing/stale webp
    python tools/optimize_photos.py --check    # report only, exit 1 if stale

Requires Pillow, a local tool only — nothing in site/ depends on it.
"""
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow is required: python -m pip install Pillow", file=sys.stderr)
    sys.exit(2)

QUALITY = 80
PHOTOS = Path(__file__).resolve().parent.parent / "site" / "assets" / "photos"


def stale(jpg: Path, webp: Path) -> bool:
    return not webp.exists() or webp.stat().st_mtime < jpg.stat().st_mtime


def main() -> int:
    check_only = "--check" in sys.argv
    jpgs = sorted(PHOTOS.glob("*.jpg"))
    if not jpgs:
        print("no photos found")
        return 0

    saved = 0
    outdated = []
    for jpg in jpgs:
        webp = jpg.with_suffix(".webp")
        if stale(jpg, webp):
            outdated.append(jpg.name)
            if check_only:
                continue
            Image.open(jpg).convert("RGB").save(webp, "WEBP", quality=QUALITY, method=6)
        before, after = jpg.stat().st_size, webp.stat().st_size
        saved += before - after
        print(f"  {jpg.name:24} {before // 1024:>4}K -> {after // 1024:>4}K webp"
              f"  ({100 - after * 100 // before}% smaller)")

    if check_only and outdated:
        print(f"STALE: {', '.join(outdated)} — run python tools/optimize_photos.py")
        return 1
    print(f"  total saved: {saved // 1024}K across {len(jpgs)} photos")
    return 0


if __name__ == "__main__":
    sys.exit(main())
