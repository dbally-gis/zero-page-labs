"""Prepare the painted art for experiments/westminster-tilt from imagegen renders.

Inputs (in --src): 01-backdrop.png, c-<id>.png (close-ups), k-<id>.png (knight on
magenta), h-<id>.png (same horse, rider removed, on magenta, pixel-aligned with k-).
Outputs (in --out): webp files plus meta.mjs with the measurements scene.mjs needs.

    /Users/danielbally/Git/.venv/bin/python3 execution/prepare_tilt_art.py \
        --src "/Volumes/Extreme SSD/AI_Workspace_Temp/zero-page-labs/.tmp/tilt-art" \
        --out experiments/westminster-tilt/art
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

KNIGHTS = {"player": "right", "henry": "left", "knyvet": "left", "courtenay": "left", "neville": "left"}
SPRITE_W = 760       # px; the near knight is ~460 viewBox units wide, ~0.83 px/unit on a 2x phone
CLOSEUP_W = 960
BACKDROP_W = 1920
VIEW_W, VIEW_H = 1600, 640  # scene viewBox


def chroma_key(path: Path) -> np.ndarray:
    """RGBA array with the magenta background keyed out; soft alpha only in a thin edge band.

    Purple and red cloth sit close to magenta, so the soft key must not touch the interior.
    """
    a = np.asarray(Image.open(path).convert("RGB")).astype(np.int32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    hard = (r > 170) & (b > 170) & (g < 120) & (np.abs(r - b) < 70)
    hard = ndimage.binary_opening(hard, iterations=1)  # isolated magenta-ish pixels inside cloth stay opaque
    edge = ndimage.binary_dilation(hard, iterations=3) & ~hard
    magenta = np.clip(((r + b) / 2 - g - 60) / 80, 0, 1)
    alpha = np.where(hard, 0, np.where(edge, (1 - magenta) * 255, 255))
    r = np.where(edge, np.minimum(r, g + 60), r)
    b = np.where(edge, np.minimum(b, g + 60), b)
    return np.dstack([r, g, b, alpha]).clip(0, 255).astype(np.uint8)


def rider_mask(k: np.ndarray, h: np.ndarray) -> np.ndarray:
    """Pixels of the knight image that the riderless horse does not have: rider and lance."""
    diff = np.abs(k[..., :3].astype(int) - h[..., :3].astype(int)).sum(axis=2)
    m = (k[..., 3] > 128) & ((diff > 90) | (h[..., 3] < 128))
    m = ndimage.binary_opening(m, iterations=2)       # drop speckle where the repaint differs slightly
    labels, n = ndimage.label(m)
    if n == 0:
        return m
    sizes = ndimage.sum(m, labels, range(1, n + 1))
    keep = np.isin(labels, 1 + np.where(sizes >= sizes.max() * 0.08)[0])  # rider+lance, plus big pieces like the plume
    return ndimage.binary_dilation(keep, iterations=3) & (k[..., 3] > 0)


def save_webp(arr: np.ndarray, path: Path, width: int, quality: int = 82) -> tuple[int, int]:
    im = Image.fromarray(arr)
    h = round(im.height * width / im.width)
    im.resize((width, h), Image.LANCZOS).save(path, "WEBP", quality=quality, method=6)
    return width, h


def prepare_knight(src: Path, out: Path, kid: str, facing: str) -> dict:
    k = chroma_key(src / f"k-{kid}.png")
    h = chroma_key(src / f"h-{kid}.png")
    rider = rider_mask(k, h)
    r = k.copy()
    r[..., 3] = np.where(rider, k[..., 3], 0)

    ys, xs = np.where(k[..., 3] > 40)
    pad = 6
    x0, y0, x1, y1 = xs.min() - pad, ys.min() - pad, xs.max() + pad, ys.max() + 1
    crop = lambda a: a[y0:y1, x0:x1]
    kc, hc, rc = crop(k), crop(h), crop(r)
    w_px, h_px = kc.shape[1], kc.shape[0]

    solid = kc[..., 3] > 128
    cols = solid.sum(axis=0)
    thick = np.where(cols > 60)[0]          # the lance is thin; horse and rider are thick
    lance_cols = np.where(cols > 0)[0]
    if facing == "right":
        tip_x, nose_x = lance_cols.max(), thick.max()
    else:
        tip_x, nose_x = lance_cols.min(), thick.min()
    tip_y = np.where(solid[:, tip_x - 3 if facing == "right" else tip_x + 3])[0].mean()
    rys, rxs = np.where(crop(rider))
    seat = (float(np.median(rxs)) / w_px, float(rys.max()) / h_px) if len(rxs) else (0.5, 0.5)

    for name, arr in (("k", kc), ("h", hc), ("r", rc)):
        save_webp(arr, out / f"{name}-{kid}.webp", SPRITE_W)
    return {
        "aspect": round(w_px / h_px, 4),
        "tip": [round(tip_x / w_px, 4), round(float(tip_y) / h_px, 4)],
        "nose": round(nose_x / w_px, 4),
        "seat": [round(seat[0], 4), round(seat[1], 4)],
    }


def barrier_band(img: Image.Image) -> tuple[float, float]:
    """Rows of the green-and-white tilt barrier, as fractions of image height."""
    a = np.asarray(img.convert("RGB")).astype(int)
    green = (a[..., 1] > a[..., 0] + 10) & (a[..., 1] > a[..., 2] + 5)  # painted green is dull olive
    rows = np.where(green.mean(axis=1) > 0.12)[0]
    if not len(rows):
        raise SystemExit("Could not find the green tilt barrier in the backdrop")
    rail = round(a.shape[0] * 0.015)  # the wooden top rail sits just above the stripes
    return (rows.min() - rail) / a.shape[0], rows.max() / a.shape[0]


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--src", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    args = ap.parse_args()
    missing = [p for p in ["01-backdrop.png"] + [f"{t}-{k}.png" for k in KNIGHTS for t in "kh"]
               + [f"c-{k}.png" for k in KNIGHTS if k != "player"] if not (args.src / p).exists()]
    if missing:
        raise SystemExit(f"Missing renders in {args.src}: {', '.join(missing)}")
    args.out.mkdir(parents=True, exist_ok=True)

    meta: dict = {"knights": {}}
    bd = Image.open(args.src / "01-backdrop.png").convert("RGB")
    top, bottom = barrier_band(bd)
    # The backdrop is drawn with preserveAspectRatio slice into the 1600x640 viewBox
    scale = max(VIEW_W / bd.width, VIEW_H / bd.height)
    off_y = (VIEW_H - bd.height * scale) / 2
    meta["barrier"] = [round(top * bd.height * scale + off_y, 1), round(bottom * bd.height * scale + off_y, 1)]
    save_webp(np.asarray(bd), args.out / "backdrop.webp", BACKDROP_W, quality=80)

    for kid in KNIGHTS:
        if kid != "player":
            save_webp(np.asarray(Image.open(args.src / f"c-{kid}.png").convert("RGB")), args.out / f"c-{kid}.webp", CLOSEUP_W, 80)
    for kid, facing in KNIGHTS.items():
        meta["knights"][kid] = prepare_knight(args.src, args.out, kid, facing)

    (args.out / "meta.mjs").write_text(
        "// Generated by execution/prepare_tilt_art.py; do not edit by hand.\n"
        f"export const art = {json.dumps(meta, indent=2)};\n", encoding="utf-8")
    total = sum(p.stat().st_size for p in args.out.glob("*.webp"))
    print(json.dumps({"files": len(list(args.out.glob('*.webp'))), "kb": round(total / 1024), **meta}, indent=1))


if __name__ == "__main__":
    main()
