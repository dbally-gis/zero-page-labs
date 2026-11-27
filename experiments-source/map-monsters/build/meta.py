"""Print Commons description metadata for the scans used. Disposable investigation script."""
import json, re, time, urllib.parse, urllib.request
from pathlib import Path
UA = "plate-research-script/0.1 (generic client)"
SRC = Path(__file__).resolve().parent.parent / "sources"
for name in ["viladestes_whaling.jpg", "carta_marina.jpg", "islandia_full.jpg", "edge_1625.jpg", "gerritsz_walrus.jpg", "webber_full.jpg", "wald_s2_full.jpg", "scoresby_narwal.jpg"]:
    title = json.loads((SRC / (name + ".json")).read_text())["title"]
    q = {"action": "query", "format": "json", "titles": title, "prop": "imageinfo", "iiprop": "extmetadata"}
    for attempt in range(4):
        try:
            req = urllib.request.Request("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(q), headers={"User-Agent": UA})
            d = json.load(urllib.request.urlopen(req, timeout=60))
            break
        except Exception as e:
            time.sleep(15)
    else:
        print(name, "FAILED"); continue
    em = next(iter(d["query"]["pages"].values()))["imageinfo"][0]["extmetadata"]
    strip = lambda s: re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s or "")).strip()
    print(f"## {name}")
    for k in ["ImageDescription", "DateTimeOriginal", "Artist", "Credit", "LicenseShortName"]:
        print(f"  {k}: {strip(em.get(k, {}).get('value', ''))[:330]}")
    time.sleep(4)
