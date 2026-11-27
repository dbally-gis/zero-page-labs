"""Download a Wikimedia Commons file (optionally as a width-limited thumbnail). Disposable investigation script.

Usage: fetch.py <out_name> <width or 0 for original> <File:Title>
"""
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

UA = "plate-research-script/0.1 (generic client)"
API = "https://commons.wikimedia.org/w/api.php"
SRC = Path(__file__).resolve().parent.parent / "sources"


def get(url: str, tries: int = 4) -> bytes:
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=180) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and i < tries - 1:
                time.sleep(10 * (i + 1))
                continue
            raise
    raise RuntimeError("unreachable")


def main() -> int:
    out_name, width, title = sys.argv[1], int(sys.argv[2]), sys.argv[3]
    out = SRC / out_name
    if out.exists():
        print(f"exists {out.name}")
        return 0
    params = {"action": "query", "format": "json", "titles": title, "prop": "imageinfo",
              "iiprop": "url|size|extmetadata", "iiextmetadatafilter": "LicenseShortName|Credit|Artist"}
    if width:
        params["iiurlwidth"] = str(width)
    data = json.loads(get(API + "?" + urllib.parse.urlencode(params)))
    page = next(iter(data["query"]["pages"].values()))
    if "imageinfo" not in page:
        print(f"MISSING {title}")
        return 1
    ii = page["imageinfo"][0]
    url = ii.get("thumburl") if width and ii.get("thumburl") else ii["url"]
    out.write_bytes(get(url))
    lic = ii.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "?")
    meta = {"title": title, "page": ii.get("descriptionurl"), "original": f"{ii['width']}x{ii['height']}",
            "license": lic, "fetched_url": url}
    (SRC / (out_name + ".json")).write_text(json.dumps(meta, indent=2))
    print(f"ok {out.name} {out.stat().st_size // 1024} KB  orig {meta['original']}  license {lic}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
