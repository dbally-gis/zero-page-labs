"""Fetch page thumbnails from Internet Archive or BHL for a range, to locate a plate. Disposable investigation script.

Usage: pages.py ia <identifier> <first> <last> <prefix>   |   pages.py bhl <first_id> <last_id> <prefix>
"""
import sys
import time
import urllib.request
from pathlib import Path

UA = "plate-research-script/0.1 (generic client)"
SRC = Path(__file__).resolve().parent.parent / "sources"
kind = sys.argv[1]
if kind == "ia":
    ident, a, b, prefix = sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
    urls = {n: f"https://archive.org/download/{ident}/page/n{n}_w300.jpg" for n in range(a, b + 1)}
else:
    a, b, prefix = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
    urls = {n: f"https://www.biodiversitylibrary.org/pagethumb/{n},300,300" for n in range(a, b + 1)}
ok = 0
for n, url in urls.items():
    out = SRC / f"{prefix}_{n}.jpg"
    if out.exists():
        ok += 1
        continue
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=60) as r:
            out.write_bytes(r.read())
        ok += 1
    except Exception as e:  # noqa: BLE001
        print(f"fail {n}: {e}")
    time.sleep(0.4)
print(f"{ok}/{len(urls)} fetched")
