#!/usr/bin/env python3
"""Build the public static site using only explicitly allowlisted inputs."""
from pathlib import Path
from html import escape
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]

def build() -> None:
    """Package source and expand the watchface catalog without runtime requests."""
    output = ROOT / 'dist'
    if output.exists():
        shutil.rmtree(output)
    output.mkdir()
    for file in ('index.html', 'style.css', 'robots.txt', 'sitemap.xml', '404.html'):
        shutil.copyfile(ROOT / file, output / file)
    for directory in ('assets', 'src', 'thumbwords', 'watchfaces'):
        shutil.copytree(ROOT / directory, output / directory)
    faces = json.loads((ROOT / 'data/watchfaces.json').read_text())
    cards = []
    for face in faces:
        d = {key: escape(value, quote=True) for key, value in face.items()}
        cards.append(f'''<article class="watch-card" data-style="{d['style']}"><a href="{d['url']}" aria-label="{d['name']} — view in the Pebble appstore"><div class="watch-image"><span class="pebble-device"><span class="pebble-glass" aria-hidden="true"></span><img class="pebble-screen" src="{d['image']}" alt="{d['name']} watchface shown on Pebble Time 2" width="200" height="228" loading="lazy"><img class="pebble-hardware" src="/assets/pebble-time-2-frame.png" alt="" width="488" height="700" loading="lazy"></span></div><div class="watch-info"><h2>{d['name']}</h2><span>{d['style'].upper()}</span></div><p>{d['description']}</p><span class="store-link">Pebble appstore ↗</span></a></article>''')
    gallery = output / 'watchfaces/index.html'
    gallery.write_text(gallery.read_text().replace('{{WATCH_CARDS}}', '\n'.join(cards)))
    print(f'Built dist with {len(faces)} watchfaces; only public website files included.')

if __name__ == '__main__':
    build()
