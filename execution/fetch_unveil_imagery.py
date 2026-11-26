"""Fetch true-colour Sentinel-2 L2A images for experiments/unveil from Copernicus Data Space.

Reads experiments/unveil/sites.json and writes experiments/unveil/img/<id>.webp, one square
image per site, least-cloudy mosaic over the site's month window. Existing images are kept
unless --force or --only names them.

Credentials: CDSE_CLIENT_ID and CDSE_CLIENT_SECRET in the environment or in the project .env
(an OAuth client from https://dataspace.copernicus.eu/ → Dashboard → OAuth Clients).

    /Users/danielbally/Git/.venv/bin/python3 execution/fetch_unveil_imagery.py [--only id,id] [--force] [--year 2025]
"""
from __future__ import annotations

import argparse
import calendar
import io
import json
import math
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
GAME = ROOT / "experiments" / "unveil"
TOKEN_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
PROCESS_URL = "https://sh.dataspace.copernicus.eu/api/v1/process"
SIZE = 1024       # requested pixels, square
OUT_W = 960       # saved width
TIMEOUT = 120

# True colour with a soft shoulder so sand and rock keep detail. Sites marked "bright"
# (salt, snow, ice) get a lower curve so they don't clip to white.
TONE = {False: (3.2, 1.55), True: (1.6, 1.25)}
EVALSCRIPT = """//VERSION=3
function setup() { return { input: ["B02", "B03", "B04"], output: { bands: 3 } }; }
function tone(x) { const c = GAIN * Math.max(0, x); return Math.min(1, SCALE * c / (1 + c)); }
function evaluatePixel(s) { return [tone(s.B04), tone(s.B03), tone(s.B02)]; }
"""


def credentials() -> tuple[str, str]:
    try:
        from dotenv import load_dotenv
        load_dotenv(ROOT / ".env", override=False)
    except ImportError:
        pass
    cid, secret = os.environ.get("CDSE_CLIENT_ID"), os.environ.get("CDSE_CLIENT_SECRET")
    if not cid or not secret:
        sys.exit("CDSE_CLIENT_ID and CDSE_CLIENT_SECRET are not set (environment or .env).")
    return cid, secret


def post(url: str, data: bytes, headers: dict, tries: int = 4) -> bytes:
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            body = e.read()[:400].decode("utf-8", "replace")
            if e.code in (429, 500, 502, 503, 504) and attempt < tries - 1:
                time.sleep(2 ** attempt * 3)
                continue
            raise RuntimeError(f"HTTP {e.code} from {url}: {body}") from None
        except urllib.error.URLError as e:
            if attempt < tries - 1:
                time.sleep(2 ** attempt * 3)
                continue
            raise RuntimeError(f"Network error for {url}: {e.reason}") from None
    raise RuntimeError("unreachable")


def token(cid: str, secret: str) -> str:
    body = urllib.parse.urlencode({"grant_type": "client_credentials", "client_id": cid, "client_secret": secret}).encode()
    return json.loads(post(TOKEN_URL, body, {"Content-Type": "application/x-www-form-urlencoded"}))["access_token"]


def bbox(site: dict) -> list[float]:
    half = site["km"] / 2
    dlat = half / 110.57
    dlon = half / (111.32 * math.cos(math.radians(site["lat"])))
    return [site["lon"] - dlon, site["lat"] - dlat, site["lon"] + dlon, site["lat"] + dlat]


def window(site: dict, year: int) -> tuple[str, str]:
    """Month window ending in `year`; a window like [11, 2] starts in the previous year."""
    m0, m1 = site["months"]
    y0 = year - 1 if m1 < m0 else year
    return f"{y0}-{m0:02d}-01T00:00:00Z", f"{year}-{m1:02d}-{calendar.monthrange(year, m1)[1]}T23:59:59Z"


def fetch(site: dict, tok: str, year: int) -> Image.Image:
    start, end = window(site, year)
    req = {
        "input": {
            "bounds": {"bbox": bbox(site), "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"}},
            "data": [{"type": "sentinel-2-l2a", "dataFilter": {
                "timeRange": {"from": start, "to": end}, "maxCloudCoverage": site.get("maxcc", 15), "mosaickingOrder": "leastCC"}}],
        },
        "output": {"width": SIZE, "height": SIZE, "responses": [{"identifier": "default", "format": {"type": "image/jpeg"}}]},
        "evalscript": EVALSCRIPT.replace("GAIN", str(TONE[site.get("bright", False)][0])).replace("SCALE", str(TONE[site.get("bright", False)][1])),
    }
    raw = post(PROCESS_URL, json.dumps(req).encode(), {"Authorization": f"Bearer {tok}", "Content-Type": "application/json", "Accept": "image/jpeg"})
    return Image.open(io.BytesIO(raw)).convert("RGB")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--only", help="comma-separated site ids")
    ap.add_argument("--force", action="store_true", help="refetch images that already exist")
    ap.add_argument("--year", type=int, default=2025)
    ap.add_argument("--sites", type=Path, default=GAME / "sites.json", help="site list to read (default: the game's)")
    args = ap.parse_args()
    sites = json.loads(args.sites.read_text(encoding="utf-8"))
    only = set(args.only.split(",")) if args.only else None
    (GAME / "img").mkdir(exist_ok=True)
    tok = token(*credentials())
    results = []
    for site in sites:
        out = GAME / "img" / f"{site['id']}.webp"
        if only and site["id"] not in only:
            continue
        if out.exists() and not (args.force or only):
            results.append((site["id"], "kept"))
            continue
        try:
            img = fetch(site, tok, site.get("year", args.year))
            img.resize((OUT_W, OUT_W), Image.LANCZOS).save(out, "WEBP", quality=80, method=6)
            results.append((site["id"], f"saved {out.stat().st_size // 1024} KB"))
        except RuntimeError as e:
            results.append((site["id"], f"FAILED: {e}"))
    for sid, status in results:
        print(f"{sid:16} {status}")
    if any(s.startswith("FAILED") for _, s in results):
        sys.exit(1)


if __name__ == "__main__":
    main()
