"""Search Wikimedia Commons for candidate source scans. Disposable investigation script."""
import json
import sys
import urllib.parse
import urllib.request

UA = "plate-research-script/0.1 (generic client)"
API = "https://commons.wikimedia.org/w/api.php"


def search(q: str, limit: int = 40) -> list[dict]:
    params = {
        "action": "query", "format": "json", "generator": "search",
        "gsrsearch": q, "gsrnamespace": "6", "gsrlimit": str(limit),
        "prop": "imageinfo", "iiprop": "size|url|mime",
    }
    req = urllib.request.Request(API + "?" + urllib.parse.urlencode(params), headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    pages = data.get("query", {}).get("pages", {})
    out = []
    for p in sorted(pages.values(), key=lambda x: x.get("index", 0)):
        ii = (p.get("imageinfo") or [{}])[0]
        out.append({"title": p["title"], "w": ii.get("width"), "h": ii.get("height"), "url": ii.get("url")})
    return out


for q in sys.argv[1:]:
    print(f"## {q}")
    try:
        for r in search(q):
            print(f"  {r['w']}x{r['h']}  {r['title']}")
    except Exception as e:  # noqa: BLE001
        print(f"  ERROR {e}")
