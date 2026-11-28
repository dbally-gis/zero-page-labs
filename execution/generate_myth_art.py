"""Generate the floor illustrations for Myth or Record? from floors.json.

For every floor without art/<id>.webp, asks the workspace image script for an
engraving-style cutaway of the room (using the researchers' "visual" note),
saves the raw PNG under .tmp/dungeons/raw/, then prepares the web image with
prepare_myth_art.py. Runs a few at a time.

Usage:
    /Users/danielbally/Git/.venv/bin/python3 execution/generate_myth_art.py [--only id,id] [--force] [--workers 3]
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXP = ROOT / "experiments" / "myth-or-record"
RAW = ROOT / ".tmp" / "dungeons" / "raw"
PY = "/Users/danielbally/Git/.venv/bin/python3"
GEN = "/Users/danielbally/Git/execution/generate_image.py"

STYLE = (
    "Antique copperplate engraving with a light sepia wash on plain parchment, in the manner of an 18th-century "
    "architectural plate: a cutaway cross-section of one room inside thick cut-stone walls, seen straight on, "
    "the stone walls cut away at left and right. Sober and scholarly. No people being harmed, no blood, no bodies, "
    "no skeletons, no text, no labels, no border. "
)


BRIEFS = ROOT / "execution" / "myth_art_briefs.json"


def prompt_for(f: dict) -> str:
    """Use the hand-written brief for this floor if there is one, else the researchers' visual note."""
    briefs = json.loads(BRIEFS.read_text()) if BRIEFS.exists() else {}
    room = briefs.get(f["id"], f["visual"])
    return f"{STYLE}The room: {room}. Setting: {f['site']}, {f['place']}, {f['years']}."


def make(f: dict, force: bool) -> str:
    out = EXP / "art" / f"{f['id']}.webp"
    if out.exists() and not force:
        return f"skip {f['id']}"
    raw = RAW / f"{f['id']}.png"
    RAW.mkdir(parents=True, exist_ok=True)
    cmd = [PY, GEN, "--aspect", "4:3", "--out", str(raw), "--prompt", prompt_for(f)]
    if force and raw.exists():
        cmd.append("--overwrite")
    if not raw.exists() or force:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=900)
        if r.returncode != 0:
            return f"FAIL {f['id']}: {r.stderr.strip()[-300:]}"
    r = subprocess.run([PY, str(ROOT / "execution" / "prepare_myth_art.py"), str(raw), str(out)], capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else f"FAIL prepare {f['id']}: {r.stderr.strip()[-300:]}"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--only", default="")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--workers", type=int, default=3)
    args = ap.parse_args()
    floors = json.loads((EXP / "floors.json").read_text())["floors"]
    if args.only:
        keep = set(args.only.split(","))
        floors = [f for f in floors if f["id"] in keep]
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        for line in pool.map(lambda f: make(f, args.force), floors):
            print(line, flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
