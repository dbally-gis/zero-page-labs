#!/usr/bin/env python3
"""Photograph each page's share card into assets/share/ and record what it was drawn from.

Run this on a Mac or Linux machine with Google Chrome after changing an
experiment's title, tagline or cover, or a page's entry in data/site.json. The
images and data/share-cards.json are committed; the normal site build only
checks that they are current, so the build and CI need no browser.

Usage:
    python3 execution/build_share_cards.py            # rebuild stale cards
    python3 execution/build_share_cards.py --all      # rebuild every card
    python3 execution/build_share_cards.py --check    # report stale cards, write nothing
"""
from __future__ import annotations

import argparse
import functools
import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import site_content
from sync_catalog import native_size

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'data/share-cards.json'
CHROME_CANDIDATES = (
    os.environ.get('CHROME_BIN', ''),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'google-chrome', 'chromium', 'chromium-browser',
)
CARD_PREFIX = '/__share/'


def find_chrome() -> str:
    for candidate in CHROME_CANDIDATES:
        if candidate and (Path(candidate).is_file() or shutil.which(candidate)):
            return candidate
    raise SystemExit('Google Chrome not found. Install it or set CHROME_BIN.')


def stale_cards(root: Path = ROOT) -> list[str]:
    """Names of cards whose image is missing, the wrong size, or drawn from older content."""
    recorded = json.loads(MANIFEST.read_text()) if MANIFEST.is_file() else {}
    stale = []
    for name, current in site_content.share_manifest(root).items():
        image = root / site_content.SHARE_DIR / f'{name}.png'
        if recorded.get(name) != current or not image.is_file() or native_size(image.read_bytes()) != site_content.SHARE_SIZE:
            stale.append(name)
    return stale


def make_handler(cards: dict[str, str]):
    class Handler(SimpleHTTPRequestHandler):
        def do_GET(self) -> None:  # noqa: N802
            if self.path.startswith(CARD_PREFIX):
                body = cards.get(self.path[len(CARD_PREFIX):], '').encode()
                self.send_response(200 if body else 404)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            super().do_GET()

        def log_message(self, *args) -> None:
            pass

    return functools.partial(Handler, directory=str(ROOT))


def photograph(chrome: str, url: str, target: Path) -> None:
    width, height = site_content.SHARE_SIZE
    with tempfile.TemporaryDirectory() as profile:
        subprocess.run(
            [chrome, '--headless=new', '--disable-gpu', '--hide-scrollbars', f'--user-data-dir={profile}',
             f'--window-size={width},{height}', '--virtual-time-budget=8000', f'--screenshot={target}', url],
            check=True, timeout=90, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if native_size(target.read_bytes()) != (width, height):
        raise SystemExit(f'{target.name}: Chrome produced {native_size(target.read_bytes())}, expected {(width, height)}')


def build(everything: bool) -> list[str]:
    specs = {spec['name']: spec for spec in site_content.share_specs(ROOT)}
    recorded = json.loads(MANIFEST.read_text()) if MANIFEST.is_file() else {}
    current = site_content.share_manifest(ROOT)
    # Rebuild a card when its text or artwork changed; a changed image alone is reported by --check, not silently accepted.
    names = sorted(specs) if everything else sorted(
        name for name in specs
        if recorded.get(name, {}).get('inputs') != current[name]['inputs'] or not current[name]['image'])
    out_dir = ROOT / site_content.SHARE_DIR
    out_dir.mkdir(parents=True, exist_ok=True)
    if names:
        chrome = find_chrome()
        cards = {name: site_content.share_card_html(specs[name]) for name in names}
        server = ThreadingHTTPServer(('127.0.0.1', 0), make_handler(cards))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            for name in names:
                photograph(chrome, f'http://127.0.0.1:{server.server_port}{CARD_PREFIX}{name}', out_dir / f'{name}.png')
                print(f'Photographed {name}')
        finally:
            server.shutdown()
    for orphan in out_dir.glob('*.png'):
        if orphan.stem not in specs:
            orphan.unlink()
            print(f'Removed {orphan.name}: no page uses it')
    MANIFEST.write_text(json.dumps(site_content.share_manifest(ROOT), indent=2, sort_keys=True) + '\n')
    return names


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--all', action='store_true', help='rebuild every card, not only stale ones')
    parser.add_argument('--check', action='store_true', help='list stale cards and exit 1 if any')
    args = parser.parse_args()
    if args.check:
        stale = stale_cards()
        print('Stale share cards: ' + ', '.join(stale) if stale else 'All share cards are current.')
        return 1 if stale else 0
    built = build(args.all)
    print(f'{len(built)} share card(s) rebuilt; manifest written.' if built else 'All share cards were already current.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
