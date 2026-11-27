"""Compose Plates IX and X of Map Monsters from crops of the real sources, in the layout of plate.py.

Usage: plates.py   (writes ../../map-monsters-plate-ix-real.png and ...-x-real.png)
Source hashes are verified by the rebuild entry point.
"""
from pathlib import Path

from PIL import Image, ImageDraw

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import plate as P  # noqa: E402

E = None  # placeholder


def cell(keys, on_map, l1, l2):
    return (keys if isinstance(keys, list) else [keys], on_map, l1, l2)


PLATES = {
    "ix": {
        "subtitle": "Plate IX. Two Monsters Half-Tamed, 1539–1873",
        "cols": ["SEA SERPENT", "KRAKEN"],
        "legend": ("drawn on a map", "printed"),
        "rows": [
            ("1539–55", [
                cell("serp_1539", True, "Olaus Magnus, Carta marina, 1539", "a serpent coils round a ship off Norway"),
                cell("polyp_1555", False, "Olaus Magnus, Historia, 1555, p. 763", "“De Polypis”: a giant crayfish takes a sailor"),
            ]),
            ("1734–55", [
                cell("serp_1734", False, "Hans Egede’s sea serpent, seen 1734", "off Greenland; as printed by Pontoppidan, 1753"),
                "described by Pontoppidan, 1752–53;\nno image included",
            ]),
            ("1801/02–48", [
                cell("serp_1848", False, "Illustrated London News, 28 October 1848", "“The sea-serpent when first seen from H.M.S. Dædalus”"),
                cell("kraken_1801", False, "Montfort, Mollusques II, An X (1801–02)", "colossal octopus; reproduction’s edition uncertain"),
            ]),
            ("1860–61", [
                cell("serp_1860", False, "“The great sea-serpent”, Bermuda, 1860", "an oarfish; wood engraving after W. D. Munro"),
                cell("kraken_1861", False, "The Alecton and the giant squid, 1861", "off Tenerife; print after E. Rodolphe, 1865"),
            ]),
            ("1873", [
                "no confirmed specimen\nfor these reports",
                cell("kraken_1873", False, "Giant squid, Logy Bay, 1873 specimen", "photograph c. 1873–74; annotated by A. E. Verrill"),
            ]),
        ],
    },
    "x": {
        "subtitle": "Plate X. Dragons across Media, c. 1265–1734",
        "cols": ["DRAGON", "HYDRA"],
        "legend": ("drawn on a map, globe or star chart", "printed in a book"),
        "rows": [
            ("World map\nc. 1265", [
                cell("dragon_1265", True, "The Psalter map, c. 1265", "two dragons beneath the world"),
                "no example included",
            ]),
            ("Globe\nc. 1510", [
                cell("dragon_1510", True, "The Hunt–Lenox globe, c. 1510", "“HC SVNT DRACONES”, off the coast of Asia"),
                "no example included",
            ]),
            ("Book\n1640", [
                cell("dragon_1640", False, "Ulisse Aldrovandi, Serpentum et draconum historiae, 1640", "winged dragons flank the title page"),
                cell("hydra_1640", False, "Ulisse Aldrovandi, Serpentum et draconum historiae, 1640", "the seven-headed hydra, p. 387"),
            ]),
            ("Sky\n1690", [
                cell("dragon_1690", True, "Johannes Hevelius, star atlas, 1690", "“Draco” coiled round the pole of the ecliptic"),
                cell("hydra_1690", True, "Johannes Hevelius, star atlas, 1690", "“Hydra”, with Crater and Corvus on its back"),
            ]),
            ("Cabinet\n1734", [
                cell("dragon_1734", False, "Albertus Seba, Thesaurus, 1734, pl. CII", "fig. 2: a flying lizard, later named Draco"),
                cell("hydra_1734", False, "Albertus Seba, Thesaurus, 1734, pl. CII", "fig. 1: the Hamburg hydra, a fake"),
            ]),
        ],
    },
}


def build(key: str, spec: dict) -> Path:
    W, H = P.W, P.H
    im = P.paper()
    d = ImageDraw.Draw(im)
    d.rectangle([34, 34, W - 34, H - 34], outline=P.RULE, width=4)
    d.rectangle([48, 48, W - 48, H - 48], outline=P.RULE, width=1)
    d.text((W // 2, 150), "Map Monsters", font=P.font(170, "semibold"), fill=P.INK, anchor="mm")
    d.text((W // 2, 292), spec["subtitle"], font=P.font(62, "italic"), fill=P.INK, anchor="mm")

    rows, cols = spec["rows"], spec["cols"]
    n = len(cols)
    col_w = (P.X1 - P.X0 - P.LABEL_W) // n
    top, head_h, row_h, pad, cap_h = P.TOP, P.HEAD_H, P.ROW_H, P.PAD, P.CAP_H
    bottom = top + head_h + row_h * len(rows)
    d.rectangle([P.X0, top, P.X1, bottom], outline=P.RULE, width=2)
    d.line([P.X0, top + head_h, P.X1, top + head_h], fill=P.RULE, width=2)
    for c in range(n):
        x = P.X0 + P.LABEL_W + c * col_w
        d.line([x, top, x, bottom], fill=P.RULE, width=2)
    for r in range(1, len(rows)):
        y = top + head_h + r * row_h
        d.line([P.X0, y, P.X1, y], fill=P.RULE, width=2)

    for c, name in enumerate(cols):
        cx = P.X0 + P.LABEL_W + c * col_w + col_w // 2
        f = P.font(44, "semibold")
        total = sum(d.textlength(ch, font=f) for ch in name) + 9 * (len(name) - 1)
        x = cx - total / 2
        for ch in name:
            d.text((x, top + head_h // 2), ch, font=f, fill=P.INK, anchor="lm")
            x += d.textlength(ch, font=f) + 9

    for r, (label, cells) in enumerate(rows):
        y0 = top + head_h + r * row_h
        size = 60 if "\n" not in label else 44
        d.multiline_text((P.X0 + P.LABEL_W // 2, y0 + row_h // 2), label, font=P.font(size, "semibold"), fill=P.INK,
                         anchor="mm", align="center", spacing=8)
        for c, item in enumerate(cells):
            x0 = P.X0 + P.LABEL_W + c * col_w
            cx = x0 + col_w // 2
            if isinstance(item, str):
                d.multiline_text((cx, y0 + row_h // 2), item, font=P.font(46, "italic"), fill=P.MUTED,
                                 anchor="mm", align="center", spacing=10)
                continue
            keys, on_map, line1, line2 = item
            area = (x0 + pad, y0 + pad, x0 + col_w - pad, y0 + row_h - cap_h - 6)
            P.place(Image.open(P.CROPS / f"{keys[0]}.png").convert("RGB"), im, area)
            d = ImageDraw.Draw(im)
            f1 = P.fit_text(d, line1, "italic", 33, col_w - 2 * pad - 34)
            w1 = d.textlength(line1, font=f1)
            ty = y0 + row_h - cap_h + 22
            P.marker(d, int(cx - w1 / 2 - 20), ty, on_map)
            d.text((cx + 8, ty), line1, font=f1, fill=P.INK, anchor="mm")
            f2 = P.fit_text(d, line2, "regular", 27, col_w - 2 * pad)
            d.text((cx, ty + 40), line2, font=f2, fill=P.MUTED, anchor="mm")

    ly = bottom + 58
    f = P.font(34, "italic")
    a, b = spec["legend"]
    wa, wb = d.textlength(a, font=f), d.textlength(b, font=f)
    x = W / 2 - (30 + wa + 90 + 30 + wb) / 2
    P.marker(d, int(x + 9), ly, True)
    d.text((x + 30, ly), a, font=f, fill=P.INK, anchor="lm")
    x += 30 + wa + 90
    P.marker(d, int(x + 9), ly, False)
    d.text((x + 30, ly), b, font=f, fill=P.INK, anchor="lm")
    d.text((W // 2, ly + 54), "Details cut from public-domain scans of the sources named; nothing redrawn.",
           font=P.font(30, "italic"), fill=P.MUTED, anchor="mm")
    out = P.OUT.parent / f"map-monsters-plate-{key}-real.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out)
    print(out, im.size, "table bottom", bottom)
    return out


if __name__ == "__main__":
    for k, s in PLATES.items():
        build(k, s)
