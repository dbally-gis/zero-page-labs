"""Contact sheet of named source files. Usage: sheet2.py <out> <file>... Disposable."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw
Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
files = [ROOT / "sources" / f for f in sys.argv[2:]]
cell, cols = 600, 4
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * cell, rows * cell), "white")
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB"); im.thumbnail((cell - 10, cell - 30))
    x, y = (i % cols) * cell, (i // cols) * cell
    sheet.paste(im, (x + 5, y + 25)); d.text((x + 8, y + 5), f.name, fill=(200, 0, 0))
out = ROOT / "build" / "views" / sys.argv[1]; sheet.save(out, quality=85); print(out)
