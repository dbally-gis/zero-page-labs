"""Prepare engraving-style illustrations for the Myth or Record? experiment.

Each source PNG has a parchment-coloured background. This divides every pixel
by the background tone (the median of the image border), so the paper becomes
white and the ink keeps its strength; on the page the image is drawn with
mix-blend-mode: multiply and sits directly on the page's own paper colour.

Usage:
    python3 execution/prepare_myth_art.py SRC.png OUT.webp [--size 800x600] [--crop-x 0.2,0.8]
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import numpy as np
    from PIL import Image
except ImportError:  # pragma: no cover
    print("Needs Pillow and numpy: use /Users/danielbally/Git/.venv/bin/python3", file=sys.stderr)
    raise SystemExit(1)


def whiten(im: Image.Image) -> Image.Image:
    arr = np.asarray(im.convert("RGB")).astype(float)
    h, w, _ = arr.shape
    band = max(4, min(h, w) // 40)
    border = np.concatenate([arr[:band].reshape(-1, 3), arr[-band:].reshape(-1, 3), arr[:, :band].reshape(-1, 3), arr[:, -band:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    out = np.clip(arr / np.maximum(bg, 1) * 255 * 1.04, 0, 255)  # slight lift removes paper grain
    return Image.fromarray(out.astype("uint8"), "RGB")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("src", type=Path)
    ap.add_argument("out", type=Path)
    ap.add_argument("--size", default="800x600", help="WxH; the image is cropped to this ratio, then resized")
    ap.add_argument("--crop-x", default="", help="keep this horizontal fraction range first, e.g. 0.2,0.8")
    args = ap.parse_args()
    if not args.src.exists():
        print(f"Missing {args.src}", file=sys.stderr)
        return 1
    im = Image.open(args.src)
    if args.crop_x:
        a, b = (float(x) for x in args.crop_x.split(","))
        im = im.crop((int(im.width * a), 0, int(im.width * b), im.height))
    tw, th = (int(x) for x in args.size.split("x"))
    ratio = tw / th
    if im.width / im.height > ratio:
        nw = int(im.height * ratio)
        x0 = (im.width - nw) // 2
        im = im.crop((x0, 0, x0 + nw, im.height))
    else:
        nh = int(im.width / ratio)
        y0 = (im.height - nh) // 2
        im = im.crop((0, y0, im.width, y0 + nh))
    im = whiten(im.resize((tw, th), Image.LANCZOS))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    im.save(args.out, quality=80)
    print(f"{args.out} {im.size} {args.out.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
