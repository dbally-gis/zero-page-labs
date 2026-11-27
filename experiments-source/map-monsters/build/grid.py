"""Make a downscaled overview of a region of a source image with a labelled coordinate grid, to pick crop boxes.

Usage: grid.py <source name> <out name> [x0 y0 x1 y1] [step]
Coordinates are in source pixels. Disposable investigation script.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
src = Image.open(ROOT / "sources" / sys.argv[1]).convert("RGB")
out = ROOT / "build" / "views" / sys.argv[2]
out.parent.mkdir(exist_ok=True)
args = [int(a) for a in sys.argv[3:]]
box = tuple(args[:4]) if len(args) >= 4 else (0, 0, src.width, src.height)
step = args[4] if len(args) >= 5 else max(1, round(max(box[2] - box[0], box[3] - box[1]) / 10 / 50) * 50)
reg = src.crop(box)
scale = min(1.0, 1800 / max(reg.size))
reg = reg.resize((max(1, int(reg.width * scale)), max(1, int(reg.height * scale))), Image.LANCZOS)
d = ImageDraw.Draw(reg)
try:
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
except OSError:
    font = ImageFont.load_default()
x = (box[0] // step + 1) * step
while x < box[2]:
    px = (x - box[0]) * scale
    d.line([(px, 0), (px, reg.height)], fill=(255, 0, 255), width=1)
    d.text((px + 3, 3), str(x), fill=(255, 0, 255), font=font, stroke_width=2, stroke_fill=(255, 255, 255))
    x += step
y = (box[1] // step + 1) * step
while y < box[3]:
    py = (y - box[1]) * scale
    d.line([(0, py), (reg.width, py)], fill=(0, 200, 255), width=1)
    d.text((3, py + 3), str(y), fill=(0, 120, 200), font=font, stroke_width=2, stroke_fill=(255, 255, 255))
    y += step
reg.save(out, quality=88)
print(f"{out} src={src.size} box={box} step={step} view={reg.size}")
