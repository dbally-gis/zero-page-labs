"""Compose the 'Three Monsters Tamed' plate from crops of the real sources.

Layout is fixed here; crops come from crop.py. Run with python -I (crops derive from untrusted downloads).
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
CROPS = ROOT / "crops"
OUT = ROOT / "renders" / "map-monsters-plate-real.png"

W, H = 2400, 3200
INK = (58, 40, 28)
MUTED = (112, 88, 66)
RULE = (96, 72, 52)
RED = (176, 62, 44)
PAPER = (236, 223, 194)

BASK = "/System/Library/Fonts/Supplemental/Baskerville.ttc"


def font(size: int, style: str = "regular") -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(BASK, size, index={"regular": 0, "italic": 2, "semibold": 4}[style])


def paper() -> Image.Image:
    base = Image.new("RGB", (W, H), PAPER)
    blotch = Image.effect_noise((W // 16, H // 16), 60).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(40))
    grain = Image.effect_noise((W, H), 14)
    tone = ImageChops.add(blotch, grain, scale=2.0)  # mean ~128
    tone = tone.point(lambda v: 250 + (v - 128) * 0.30)
    base = ImageChops.multiply(base, Image.merge("RGB", [tone, tone, tone]))
    # darker toward the edges
    vig = Image.new("L", (W, H), 0)
    ImageDraw.Draw(vig).rectangle([90, 90, W - 90, H - 90], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(120)).point(lambda v: 232 + v * 23 // 255)
    return ImageChops.multiply(base, Image.merge("RGB", [vig, vig, vig]))


def fit_text(d: ImageDraw.ImageDraw, text: str, style: str, size: int, max_w: int, min_size: int = 20) -> ImageFont.FreeTypeFont:
    while size > min_size and d.textlength(text, font=font(size, style)) > max_w:
        size -= 1
    return font(size, style)


# (key, crops, on_map, caption line 1, caption line 2)
ROWS = [
    ("to 1516", [
        (["whale_1413"], True, "Mecia de Viladestes, portolan chart, 1413", "whaling scene in the North Atlantic"),
        (["walrus_1516"], True, "Martin Waldseemüller, Carta marina, 1516", "“Morsus animal ingens quantitate elephantis”"),
        None,
    ]),
    ("1539", [
        (["whale_1539"], True, "Olaus Magnus, Carta marina, 1539", "“Balena” attacked by “Orcha”"),
        (["walrus_1539"], True, "Olaus Magnus, Carta marina, 1539", "“Ros marus piscis”, by “Vardahus”"),
        (["unicorn_1539"], True, "Olaus Magnus, Carta marina, 1539", "horned head in the sea south of Iceland"),
    ]),
    ("1590", [
        (["whale_1590"], True, "Abraham Ortelius, Islandia, 1590", "L · Steipereidur"),
        (["walrus_1590"], True, "Abraham Ortelius, Islandia, 1590", "N · Rostunger"),
        (["unicorn_1590"], True, "Abraham Ortelius, Islandia, 1590", "A · Nahval"),
    ]),
    ("1613–55", [
        (["whale_1625"], True, "Thomas Edge, in Purchas His Pilgrimes, 1625", "vignette on the “Greneland” map of Spitsbergen"),
        (["walrus_1613"], False, "Hessel Gerritsz, Histoire du pays nommé Spitsberghe, 1613", "walrus and calf"),
        (["unicorn_1655a", "unicorn_1655b"], False, "Ole Worm, Museum Wormianum, 1655", "“Unicornu marinum”: narwhal and its skull, pp. 282–283"),
    ]),
    ("1784–\n1820", [
        (["whale_1820"], False, "William Scoresby, Arctic Regions, 1820, pl. XII", "“Balæna Mysticetus, or Common Whale”"),
        (["walrus_1784"], False, "John Webber, “Sea Horses”, in Cook’s Voyage, 1784", "detail, from the 1785 printing"),
        (["unicorn_1820"], False, "William Scoresby, Arctic Regions, 1820, pl. XV", "“Male Narwal, or Unicorn”"),
    ]),
]

X0, X1 = 80, W - 80          # table extent
LABEL_W = 260
COL_W = (X1 - X0 - LABEL_W) // 3
TOP = 372
HEAD_H = 84
ROW_H = 504
PAD = 22
CAP_H = 92


def place(img: Image.Image, canvas: Image.Image, box: tuple[int, int, int, int]) -> None:
    bw, bh = box[2] - box[0], box[3] - box[1]
    k = min(bw / img.width, bh / img.height)
    im = img.resize((max(1, round(img.width * k)), max(1, round(img.height * k))), Image.LANCZOS)
    x = box[0] + (bw - im.width) // 2
    y = box[1] + (bh - im.height) // 2
    canvas.paste(im, (x, y))
    ImageDraw.Draw(canvas).rectangle([x - 1, y - 1, x + im.width, y + im.height], outline=RULE, width=2)


def marker(d: ImageDraw.ImageDraw, cx: int, cy: int, on_map: bool) -> None:
    r = 9
    if on_map:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=RED)
    else:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=RED, width=3)


def main() -> None:
    im = paper()
    d = ImageDraw.Draw(im)
    d.rectangle([34, 34, W - 34, H - 34], outline=RULE, width=4)
    d.rectangle([48, 48, W - 48, H - 48], outline=RULE, width=1)

    d.text((W // 2, 150), "Map Monsters", font=font(170, "semibold"), fill=INK, anchor="mm")
    d.text((W // 2, 292), "Plate VIII. Three Monsters Tamed, 1413–1820", font=font(62, "italic"), fill=INK, anchor="mm")

    bottom = TOP + HEAD_H + ROW_H * len(ROWS)
    # frame and rules
    d.rectangle([X0, TOP, X1, bottom], outline=RULE, width=2)
    d.line([X0, TOP + HEAD_H, X1, TOP + HEAD_H], fill=RULE, width=2)
    for c in range(3):
        x = X0 + LABEL_W + c * COL_W
        d.line([x, TOP, x, bottom], fill=RULE, width=2)
    for r in range(1, len(ROWS)):
        y = TOP + HEAD_H + r * ROW_H
        d.line([X0, y, X1, y], fill=RULE, width=2)

    for c, name in enumerate(["WHALE", "WALRUS", "SEA-UNICORN"]):
        cx = X0 + LABEL_W + c * COL_W + COL_W // 2
        f = font(44, "semibold")
        # letterspaced capitals
        total = sum(d.textlength(ch, font=f) for ch in name) + 9 * (len(name) - 1)
        x = cx - total / 2
        for ch in name:
            d.text((x, TOP + HEAD_H // 2), ch, font=f, fill=INK, anchor="lm")
            x += d.textlength(ch, font=f) + 9

    for r, (label, cells) in enumerate(ROWS):
        y0 = TOP + HEAD_H + r * ROW_H
        d.multiline_text((X0 + LABEL_W // 2, y0 + ROW_H // 2), label, font=font(60, "semibold"), fill=INK,
                         anchor="mm", align="center", spacing=6)
        for c, cell in enumerate(cells):
            x0 = X0 + LABEL_W + c * COL_W
            cx = x0 + COL_W // 2
            if cell is None:
                d.multiline_text((cx, y0 + ROW_H // 2), "none found on a map\nbefore 1539", font=font(46, "italic"),
                                 fill=MUTED, anchor="mm", align="center", spacing=10)
                continue
            keys, on_map, line1, line2 = cell
            area = (x0 + PAD, y0 + PAD, x0 + COL_W - PAD, y0 + ROW_H - CAP_H - 6)
            if len(keys) == 1:
                place(Image.open(CROPS / f"{keys[0]}.png").convert("RGB"), im, area)
            else:
                mid = (area[1] + area[3]) // 2
                place(Image.open(CROPS / f"{keys[0]}.png").convert("RGB"), im, (area[0], area[1], area[2], mid - 8))
                place(Image.open(CROPS / f"{keys[1]}.png").convert("RGB"), im, (area[0], mid + 8, area[2], area[3]))
            d = ImageDraw.Draw(im)
            max_w = COL_W - 2 * PAD - 34
            f1 = fit_text(d, line1, "italic", 33, max_w)
            w1 = d.textlength(line1, font=f1)
            ty = y0 + ROW_H - CAP_H + 22
            marker(d, int(cx - w1 / 2 - 20), ty, on_map)
            d.text((cx + 8, ty), line1, font=f1, fill=INK, anchor="mm")
            f2 = fit_text(d, line2, "regular", 27, COL_W - 2 * PAD)
            d.text((cx, ty + 40), line2, font=f2, fill=MUTED, anchor="mm")

    # legend and credit
    ly = bottom + 58
    f = font(34, "italic")
    a, b = "drawn on a map", "printed in a book"
    wa, wb = d.textlength(a, font=f), d.textlength(b, font=f)
    total = 30 + wa + 90 + 30 + wb
    x = W / 2 - total / 2
    marker(d, int(x + 9), ly, True)
    d.text((x + 30, ly), a, font=f, fill=INK, anchor="lm")
    x += 30 + wa + 90
    marker(d, int(x + 9), ly, False)
    d.text((x + 30, ly), b, font=f, fill=INK, anchor="lm")
    d.text((W // 2, ly + 54), "Details cut from public-domain scans of the sources named; nothing redrawn.",
           font=font(30, "italic"), fill=MUTED, anchor="mm")

    im.save(OUT)
    print(OUT, im.size, "table bottom", bottom)


if __name__ == "__main__":
    main()
