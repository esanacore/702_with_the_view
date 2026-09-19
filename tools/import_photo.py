#!/usr/bin/env python3
"""Import a photo into a gallery slot, toning down over-processed sources.

MLS and phone-HDR photos arrive over-bright and over-saturated (neon lawns,
blown-out white rooms). This tool measures each photo and applies only the
correction it needs, then saves it as site/assets/photos/<slot>.jpg:

  1. applies the EXIF orientation, so phone photos are not imported sideways
  2. trims baked-in letterbox bars (flat, near-white, at most 15% per side;
     a bright sky or a white wall has texture and is left alone)
  3. pulls down highlights LOCALLY (by neighbourhood brightness, so detail
     inside bright areas keeps its contrast instead of going grey)
  4. reduces saturation vibrance-style: only already-loud pixels are touched
  5. caps the long edge at 1600px, JPEG quality 80 (see photos/README.md)

A well-exposed photo measures as needing nothing and passes through
untouched apart from the resize.

The untouched source is always preserved, byte for byte, as
photos-original/<slot>.<ext>. That folder is outside site/, so it is never
deployed and costs the page nothing.

Usage:
    python tools/import_photo.py SRC SLOT     # import SRC as <SLOT>.jpg
    python tools/import_photo.py --selftest   # exit 0 ok, 1 fail, 3 skipped

Always feed it the ORIGINAL. It is not idempotent: pointing it at its own
output corrects an already-corrected photo. To redo a slot, import from the
preserved copy:  python tools/import_photo.py photos-original/pool.jpg pool
Afterwards run tools/optimize_photos.py to generate the WebP.

Requires Pillow and numpy, local tools only; nothing in site/ depends on them.
"""
import re
import shutil
import sys
from pathlib import Path

try:
    import numpy as np
    from PIL import Image, ImageFilter, ImageOps
except ImportError:
    print("Pillow and numpy are required: python -m pip install Pillow numpy",
          file=sys.stderr)
    sys.exit(3)

ROOT = Path(__file__).resolve().parent.parent
PHOTOS = ROOT / "site" / "assets" / "photos"
ORIGINALS = ROOT / "photos-original"
LUMA = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
MAX_EDGE = 1600
QUALITY = 80
SLOT_NAME = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".tif", ".tiff"}

# Letterbox bars are flat and near-white. Real bright content (sky, a white
# wall) has texture, so it fails the flatness test and is never trimmed.
BAR_MIN_LEVEL = 250      # mean grey level of a bar row/column
BAR_MAX_SPREAD = 2.0     # standard deviation within a bar row/column
BAR_MAX_FRACTION = 0.15  # never trim more than this from any one side

HIGHLIGHT_MAX = 0.20     # strongest highlight pull, for a very bright photo
CLIPPED_BONUS = 0.05     # extra pull when >1% of pixels are blown out
SATURATION_MAX = 0.42    # strongest desaturation of the loudest pixels
CONTRAST_RESTORE = 0.7   # midtone contrast given back per unit of highlight pull


def smoothstep(lo, hi, x):
    t = np.clip((x - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def _bar_depth(levels, spreads, limit):
    """How many leading rows/columns are flat near-white bar, up to limit."""
    depth = 0
    while (depth < limit and levels[depth] >= BAR_MIN_LEVEL
           and spreads[depth] <= BAR_MAX_SPREAD):
        depth += 1
    return depth


def trim_letterbox(im):
    """Crop flat near-white bars baked into the file. Returns (image, box)."""
    grey = np.asarray(im.convert("L"), dtype=np.float32)
    h, w = grey.shape
    row_mean, row_std = grey.mean(1), grey.std(1)
    col_mean, col_std = grey.mean(0), grey.std(0)
    max_rows, max_cols = int(h * BAR_MAX_FRACTION), int(w * BAR_MAX_FRACTION)
    top = _bar_depth(row_mean, row_std, max_rows)
    bottom = _bar_depth(row_mean[::-1], row_std[::-1], max_rows)
    left = _bar_depth(col_mean, col_std, max_cols)
    right = _bar_depth(col_mean[::-1], col_std[::-1], max_cols)
    box = (left, top, w - right, h - bottom)
    return (im.crop(box), box) if box != (0, 0, w, h) else (im, None)


def measure(a):
    """Per-pixel luminance and HSV-style saturation of a float RGB array."""
    lum = a @ LUMA
    mx, mn = a.max(-1), a.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    return lum, sat


def strengths(a):
    """How much highlight pull (h) and desaturation (d) this photo needs."""
    lum, sat = measure(a)
    clipped = (lum > 0.94).mean() * 100
    loud = (sat > 0.7).mean() * 100
    h = float(np.clip((lum.mean() - 0.45) / 0.2, 0, 1) * HIGHLIGHT_MAX
              + (CLIPPED_BONUS if clipped > 1 else 0))
    d = float(max(np.clip((loud - 3) / 22, 0, 1) * SATURATION_MAX,
                  np.clip((sat.mean() - 0.30) / 0.2, 0, 1) * 0.30))
    return h, d


def tone(im):
    """Return (corrected image, (h, d))."""
    a = np.asarray(im.convert("RGB"), dtype=np.float32) / 255
    h, d = strengths(a)
    if h > 0:
        lum, _ = measure(a)
        radius = max(4, im.width // 40)
        grey = Image.fromarray((lum * 255).astype(np.uint8))
        near = np.asarray(grey.filter(ImageFilter.GaussianBlur(radius)),
                          dtype=np.float32) / 255
        a = a * (1 - h * smoothstep(0.5, 1.0, near))[..., None]
    if d > 0:
        lum, sat = measure(a)
        keep = 1 - d * smoothstep(0.35, 0.9, sat)
        a = lum[..., None] + (a - lum[..., None]) * keep[..., None]
    if h > 0:  # an S-curve, strongest in the midtones, zero at black and white
        a = a + CONTRAST_RESTORE * h * (a - 0.5) * (1 - np.abs(2 * a - 1))
    out = Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))
    return out, (round(h, 2), round(d, 2))


def preserve(src: Path, slot: str, originals: Path) -> Path:
    """Keep the untouched source as <originals>/<slot>.<ext>, byte for byte.

    The new copy is fully written before any older original of the same slot
    is removed, and the source itself is never removed, so a failure part-way
    can never lose the real photo.
    """
    originals.mkdir(parents=True, exist_ok=True)
    kept = originals / f"{slot}{src.suffix.lower() or '.jpg'}"
    if src.resolve() == kept.resolve():
        return kept
    staging = originals / f".{slot}.incoming"
    shutil.copyfile(src, staging)
    for old in originals.iterdir():
        if (old.stem == slot and old.suffix.lower() in IMAGE_SUFFIXES
                and old.resolve() != src.resolve()):
            old.unlink()
    staging.replace(kept)
    return kept


def import_photo(src: Path, slot: str, photos: Path = PHOTOS,
                 originals: Path = ORIGINALS) -> Path:
    if not SLOT_NAME.match(slot):
        raise ValueError(f"slot must be lowercase words joined by hyphens, got {slot!r}")
    im = Image.open(src)
    im.load()                       # fail on a bad file BEFORE touching originals
    preserve(src, slot, originals)
    im = ImageOps.exif_transpose(im).convert("RGB")
    im, box = trim_letterbox(im)
    im, (h, d) = tone(im)
    im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
    photos.mkdir(parents=True, exist_ok=True)
    dest = photos / f"{slot}.jpg"
    im.save(dest, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    print(f"  {slot}.jpg  {im.width}x{im.height}  {dest.stat().st_size // 1024}K"
          f"  highlights -{h}  saturation -{d}"
          + (f"  letterbox trimmed to {box}" if box else ""))
    return dest


def selftest() -> int:
    """A corrector that cannot fail proves nothing: check both directions."""
    import io
    import tempfile
    from contextlib import redirect_stdout

    def arr(im):
        return np.asarray(im, dtype=np.float32) / 255

    def quiet_import(*args):
        with redirect_stdout(io.StringIO()):
            return import_photo(*args)

    def raises(fn, *args):
        try:
            fn(*args)
        except Exception:
            return True
        return False

    neon = Image.new("RGB", (64, 64), (20, 235, 40))       # neon lawn
    bright = Image.new("RGB", (64, 64), (236, 236, 232))   # blown-out room
    calm = Image.new("RGB", (64, 64), (120, 110, 100))     # well exposed

    boxed = Image.new("RGB", (64, 64), (255, 255, 255))    # white bars top+bottom
    boxed.paste((90, 90, 90), (0, 8, 64, 56))
    rng = np.random.default_rng(7)
    sky = np.full((100, 64, 3), 90, dtype=np.uint8)        # textured blown sky
    sky[:40] = rng.integers(244, 256, (40, 64, 3))
    sky = Image.fromarray(sky)
    wall = Image.new("RGB", (100, 60), (90, 90, 90))       # flat white wall, 30% wide
    wall.paste((253, 253, 253), (0, 0, 30, 60))

    checks = [
        ("loud colour is reduced", measure(arr(tone(neon)[0]))[1].mean() < measure(arr(neon))[1].mean() - 0.05),
        ("bright photo is darkened", measure(arr(tone(bright)[0]))[0].mean() < measure(arr(bright))[0].mean() - 0.03),
        ("good photo is left alone", tone(calm)[1] == (0.0, 0.0)
         and tone(calm)[0].tobytes() == calm.tobytes()),
        ("letterbox bars are trimmed", trim_letterbox(boxed)[0].size == (64, 48)),
        ("textured bright sky is NOT trimmed", trim_letterbox(sky)[0].size == sky.size),
        ("a wall wider than 15% is NOT trimmed away", trim_letterbox(wall)[0].width >= 85),
    ]

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        photos, orig = tmp / "photos-out", tmp / "orig"
        src = tmp / "source.JPG"
        Image.new("RGB", (64, 64), (20, 235, 40)).save(src, "JPEG")
        quiet_import(src, "lawn", photos, orig)
        kept = orig / "lawn.jpg"
        checks.append(("original is preserved byte for byte",
                       kept.exists() and kept.read_bytes() == src.read_bytes()))
        checks.append(("site copy differs from the original",
                       (photos / "lawn.jpg").read_bytes() != src.read_bytes()))

        # Re-importing FROM the preserved original must not delete it.
        quiet_import(kept, "lawn", photos, orig)
        checks.append(("re-import from the original keeps it", kept.exists()))

        # A source inside the originals folder whose name merely starts with
        # the slot must survive (it used to be deleted as "stale").
        sibling = orig / "lawn.old.jpg"
        shutil.copyfile(kept, sibling)
        quiet_import(sibling, "lawn", photos, orig)
        checks.append(("source named <slot>.old.jpg is not deleted", sibling.exists() and kept.exists()))

        # A neighbouring slot's original is never touched.
        quiet_import(src, "lawn-view", photos, orig)
        quiet_import(src, "lawn", photos, orig)
        checks.append(("slot 'lawn' leaves 'lawn-view' alone", (orig / "lawn-view.jpg").exists()))

        # A junk source must fail BEFORE the existing original is replaced.
        junk = tmp / "junk.png"
        junk.write_bytes(b"not an image")
        before = kept.read_bytes()
        failed = raises(quiet_import, junk, "lawn", photos, orig)
        checks.append(("junk source fails and the original survives",
                       failed and kept.read_bytes() == before and not (orig / "lawn.png").exists()))

        checks.append(("unsafe slot names are rejected",
                       raises(quiet_import, src, "../escape", photos, orig)
                       and raises(quiet_import, src, "README", photos, orig)))

        # Phone photo stored sideways with an EXIF orientation flag.
        side = tmp / "sideways.jpg"
        exif = Image.Exif()
        exif[0x0112] = 6            # rotate 90 degrees clockwise to display
        Image.new("RGB", (80, 40), (120, 110, 100)).save(side, "JPEG", exif=exif)
        quiet_import(side, "phone", photos, orig)
        checks.append(("EXIF orientation is applied", Image.open(photos / "phone.jpg").size == (40, 80)))

    for name, ok in checks:
        print(f"  {'ok  ' if ok else 'FAIL'}  {name}")
    return 0 if all(ok for _, ok in checks) else 1


def main() -> int:
    if sys.argv[1:] == ["--selftest"]:
        return selftest()
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    try:
        import_photo(Path(sys.argv[1]), sys.argv[2])
    except (OSError, ValueError) as err:
        print(f"import failed, nothing was changed: {err}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
