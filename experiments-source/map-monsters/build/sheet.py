"""Contact sheet of candidate thumbnails. Disposable investigation script."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw
ROOT = Path(__file__).resolve().parent.parent
files = sorted((ROOT / "sources").glob(sys.argv[1]), key=lambda p: int(p.stem.split("_")[-1]))
cell = 300
cols = 10
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * cell, rows * cell), "white")
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB")
    im.thumbnail((cell - 10, cell - 30))
    x, y = (i % cols) * cell, (i // cols) * cell
    sheet.paste(im, (x + 5, y + 25))
    d.text((x + 8, y + 5), f.stem, fill=(200, 0, 0))
out = ROOT / "build" / "views" / sys.argv[2]
sheet.save(out, quality=85)
print(out, sheet.size)
