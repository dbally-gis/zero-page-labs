"""Build the Atlantic coastline file for the Longitude, 1714 experiment.

Reads Natural Earth 1:50m land polygons (public domain), clips them to the
Atlantic window, simplifies them, and writes experiments/longitude/land.json as
a list of rings [[lon, lat], ...] rounded to 0.01 degrees.

Usage:
    python3 execution/build_longitude_land.py --src .tmp/ne/ne_50m_land.geojson
Source: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "experiments" / "longitude" / "land.json"
WINDOW = (-100.0, -45.0, 30.0, 68.0)  # west, south, east, north
TOLERANCE = 0.03  # degrees, Douglas-Peucker
# Islands too small for the 1:50m data that matter to the story, traced by hand (lon, lat).
EXTRA_RINGS = {
    "Scilly Isles": [[-6.37, 49.97], [-6.29, 49.98], [-6.26, 49.94], [-6.29, 49.90], [-6.35, 49.89], [-6.40, 49.92], [-6.37, 49.97]],
}


def clip_ring(ring: list[list[float]], window: tuple[float, float, float, float]) -> list[list[float]]:
    """Sutherland-Hodgman clip of a closed ring against an axis-aligned box."""
    w, s, e, n = window
    edges = [
        (lambda p: p[0] >= w, lambda a, b: _cross_x(a, b, w)),
        (lambda p: p[0] <= e, lambda a, b: _cross_x(a, b, e)),
        (lambda p: p[1] >= s, lambda a, b: _cross_y(a, b, s)),
        (lambda p: p[1] <= n, lambda a, b: _cross_y(a, b, n)),
    ]
    pts = ring[:-1] if ring and ring[0] == ring[-1] else ring
    for inside, cross in edges:
        if not pts:
            break
        out: list[list[float]] = []
        prev = pts[-1]
        for cur in pts:
            if inside(cur):
                if not inside(prev):
                    out.append(cross(prev, cur))
                out.append(cur)
            elif inside(prev):
                out.append(cross(prev, cur))
            prev = cur
        pts = out
    return pts


def _cross_x(a: list[float], b: list[float], x: float) -> list[float]:
    t = (x - a[0]) / (b[0] - a[0])
    return [x, a[1] + t * (b[1] - a[1])]


def _cross_y(a: list[float], b: list[float], y: float) -> list[float]:
    t = (y - a[1]) / (b[1] - a[1])
    return [a[0] + t * (b[0] - a[0]), y]


def simplify(pts: list[list[float]], tol: float) -> list[list[float]]:
    """Iterative Douglas-Peucker on an open polyline."""
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        ax, ay = pts[i]
        bx, by = pts[j]
        dx, dy = bx - ax, by - ay
        norm = (dx * dx + dy * dy) ** 0.5
        best, idx = -1.0, -1
        for k in range(i + 1, j):
            px, py = pts[k]
            d = abs(dy * px - dx * py + bx * ay - by * ax) / norm if norm else ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
            if d > best:
                best, idx = d, k
        if best > tol:
            keep[idx] = True
            stack += [(i, idx), (idx, j)]
    return [p for p, k in zip(pts, keep) if k]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--src", type=Path, required=True)
    args = ap.parse_args()
    if not args.src.exists():
        print(f"Missing source: {args.src}", file=sys.stderr)
        return 1
    data = json.loads(args.src.read_text())
    rings: list[list[list[float]]] = []
    for feature in data["features"]:
        geom = feature["geometry"]
        polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
        for poly in polys:
            outer = poly[0]  # holes (lakes) are not needed at sea
            clipped = clip_ring(outer, WINDOW)
            if len(clipped) < 3:
                continue
            # Small islands keep their shape; big coasts are simplified.
            span = max(p[0] for p in clipped) - min(p[0] for p in clipped)
            pts = simplify(clipped + [clipped[0]], TOLERANCE if span > 0.6 else TOLERANCE / 4)
            out: list[list[float]] = []
            for lon, lat in pts:
                q = [round(lon, 2), round(lat, 2)]
                if not out or out[-1] != q:
                    out.append(q)
            if len(out) >= 4:
                rings.append(out)
    rings.extend(EXTRA_RINGS.values())
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(rings, separators=(",", ":")))
    print(json.dumps({"rings": len(rings), "points": sum(len(r) for r in rings), "bytes": OUT.stat().st_size, "out": str(OUT.relative_to(ROOT))}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
