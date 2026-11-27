"""Cut crops listed in crops.json from the downloaded scans, and write a labelled check sheet.

Boxes are in source pixels, or in pixels of a `basis`-wide version of the source when `basis` is given.
Run with python -I: the scans are untrusted downloads.
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
SPEC = json.loads((ROOT / "build" / "crops.json").read_text())
OUT = ROOT / "crops"
OUT.mkdir(exist_ok=True)


def main() -> None:
    cache: dict[str, Image.Image] = {}
    thumbs = []
    for name, s in SPEC.items():
        src = cache.get(s["src"])
        if src is None:
            src = Image.open(ROOT / "sources" / s["src"]).convert("RGB")
            cache = {s["src"]: src}  # keep only the latest scan in memory
        k = src.width / s["basis"] if "basis" in s else 1.0
        box = tuple(round(v * k) for v in s["box"])
        im = src.crop(box)
        if s.get("rotate"):
            im = im.rotate(s["rotate"], expand=True)
        im.save(OUT / f"{name}.png")
        print(f"{name:14s} {im.width}x{im.height}")
        t = im.copy()
        t.thumbnail((560, 400))
        thumbs.append((name, t))
    cols = 3
    rows = (len(thumbs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 580, rows * 430), "white")
    d = ImageDraw.Draw(sheet)
    for i, (name, t) in enumerate(thumbs):
        x, y = (i % cols) * 580, (i // cols) * 430
        sheet.paste(t, (x + 10, y + 24))
        d.text((x + 10, y + 6), name, fill=(200, 0, 0))
    sheet.save(ROOT / "build" / "views" / "crops_check.jpg", quality=88)


if __name__ == "__main__":
    main()
