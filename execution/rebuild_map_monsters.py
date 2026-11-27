#!/usr/bin/env python3
"""Verify/fetch scans, rebuild plates and publish the accessible specimen catalogue."""
from __future__ import annotations

import argparse
import hashlib
from html import escape
import importlib.util
import json
import logging
from pathlib import Path
import random
import subprocess
import sys
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'experiments-source/map-monsters'
PUBLIC = ROOT / 'experiments/map-monsters'
LOG = logging.getLogger('map-monsters')


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def fetch(url: str, target: Path, expected: str, attempts: int = 4) -> None:
    """Write only verified bytes; leave a previous file intact on failure."""
    if not url.startswith('https://'):
        raise ValueError('Source downloads must use HTTPS')
    for attempt in range(attempts):
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'ZeroPageLabs-MapMonsters/1.0'})
            with urllib.request.urlopen(request, timeout=45) as response:
                data = response.read(120_000_001)
            if len(data) > 120_000_000:
                raise ValueError(f'{target.name}: source exceeds 120 MB')
            if hashlib.sha256(data).hexdigest() != expected:
                raise ValueError(f'{target.name}: downloaded checksum differs; inspect upstream revision')
            target.parent.mkdir(parents=True, exist_ok=True)
            temporary = target.with_suffix(target.suffix + '.part')
            temporary.write_bytes(data)
            temporary.replace(target)
            return
        except urllib.error.HTTPError as error:
            if error.code not in (408, 425, 429, 500, 502, 503, 504) or attempt == attempts - 1:
                raise
            retry = error.headers.get('Retry-After', '')
            delay = min(float(retry), 30) if retry.isdigit() else min(2 ** attempt + random.random(), 20)
        except (urllib.error.URLError, TimeoutError):
            if attempt == attempts - 1:
                raise
            delay = min(2 ** attempt + random.random(), 20)
        LOG.warning('Retry %s/%s for %s in %.1fs', attempt + 1, attempts, target.name, delay)
        time.sleep(delay)
    raise RuntimeError(f'{target.name}: retries exhausted')


def verify_sources(manifest: dict, download: bool = False) -> None:
    for filename, source in manifest['sources'].items():
        if Path(filename).name != filename:
            raise ValueError('Source filenames must be basenames')
        path = BASE / 'sources' / filename
        if not path.exists():
            if not download:
                raise FileNotFoundError(f'{filename}: missing; rerun with --fetch')
            fetch(source['download_url'], path, source['sha256'])
        if digest(path) != source['sha256']:
            raise ValueError(f'{filename}: checksum mismatch; source cache left unchanged')
    LOG.info('Verified %s source checksums', len(manifest['sources']))


def catalogue(manifest: dict, crops: dict) -> str:
    parts = ['<section class="sources" aria-labelledby="sources-title"><h2 id="sources-title">Explore the specimens</h2>',
             '<p>Open a specimen for its caption, interpretation and source context. Red boxes show the selected detail within the supplied scan; some scans are already extracts. Follow the source record for the full work.</p>']
    for plate, title in [('viii', 'VIII · Whale, walrus & sea-unicorn'), ('ix', 'IX · Sea serpent & kraken'), ('x', 'X · Dragons across media')]:
        parts.append(f'<section data-catalogue="{plate}"><h3>{title}</h3><div class="specimens">')
        for cell in [c for c in manifest['cells'] if c['plate'] == plate]:
            key = cell['id']
            parts.append(f'<details class="specimen" id="specimen-{key}"><summary><span>{escape(cell["row"])}</span> {escape(cell["creature"])}</summary>')
            parts.append(f'<p class="caption">{escape(cell["caption"])}</p><p>{escape(cell["detail"])}</p><p>{escape(cell["interpretation"])}</p>')
            for crop in cell['crops']:
                source = manifest['sources'][crops[crop]['src']]
                parts.append(f'<figure><a href="img/context/{crop}.webp" target="_blank" rel="noopener" aria-label="Enlarge source context for {escape(cell["creature"])}"><img src="img/context/{crop}.webp" loading="lazy" width="{min(1400, source["size"][0])}" alt="Selected detail outlined in red within the supplied scan: {escape(cell["caption"])}"></a><figcaption><a href="{escape(source["page"], quote=True)}">Source record / full work ↗</a> · {escape(source["rights"])}</figcaption></figure>')
            if cell['evidence']:
                parts.append('<p class="evidence">Evidence notes: ' + ' · '.join(f'<a href="{escape(url, quote=True)}">Reference {i + 1} ↗</a>' for i, url in enumerate(cell['evidence'])) + '</p>')
            parts.append('</details>')
        parts.append('</div></section>')
    parts.append('</section>')
    return '\n'.join(parts)


def export(manifest: dict) -> None:
    from PIL import Image, ImageDraw
    crops = json.loads((BASE / 'build/crops.json').read_text())
    output = PUBLIC / 'img'
    (output / 'context').mkdir(parents=True, exist_ok=True)
    for filename, name in [('map-monsters-plate-real.png', 'sources'), ('map-monsters-plate-ix-real.png', 'ix-sources'), ('map-monsters-plate-x-real.png', 'x-sources')]:
        with Image.open(BASE / 'renders' / filename) as plate:
            plate.save(output / f'{name}.webp', quality=90, method=6)
            plate.resize((1200, 1600), Image.Resampling.LANCZOS).save(output / f'{name}-1200.webp', quality=90, method=6)
    for key, spec in crops.items():
        with Image.open(BASE / 'sources' / spec['src']) as original:
            image = original.convert('RGB')
        scale = image.width / spec.get('basis', image.width)
        box = tuple(round(v * scale) for v in spec['box'])
        if box[0] < 0 or box[1] < 0 or box[2] > image.width or box[3] > image.height or box[0] >= box[2] or box[1] >= box[3]:
            raise ValueError(f'{key}: crop lies outside source')
        image.thumbnail((1400, 1800), Image.Resampling.LANCZOS)
        k = image.width / manifest['sources'][spec['src']]['size'][0]
        ImageDraw.Draw(image).rectangle(tuple(round(v * k) for v in box), outline='#c3442e', width=4)
        image.save(output / 'context' / f'{key}.webp', quality=86, method=6)
    path = PUBLIC / 'index.html'
    text = path.read_text()
    start, end = '<!-- CATALOGUE START -->', '<!-- CATALOGUE END -->'
    before, rest = text.split(start, 1)
    _, after = rest.split(end, 1)
    path.write_text(before + start + '\n' + catalogue(manifest, crops) + '\n' + end + after)
    LOG.info('Exported three plates, 31 context images and 30 catalogue entries')


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fetch', action='store_true', help='Download missing scans; reject changed bytes')
    parser.add_argument('--verify-only', action='store_true', help='Check cache without rebuilding')
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format='%(levelname)s %(message)s')
    try:
        if importlib.util.find_spec('PIL') is None:
            raise RuntimeError('Pillow is required; see experiments-source/map-monsters/README.md')
        manifest = json.loads((BASE / 'manifest.json').read_text())
        verify_sources(manifest, args.fetch)
        if not args.verify_only:
            for script in ('crop.py', 'plate.py', 'plates.py'):
                subprocess.run([sys.executable, '-I', str(BASE / 'build' / script)], check=True)
            export(manifest)
        return 0
    except (OSError, ValueError, RuntimeError, subprocess.CalledProcessError) as error:
        LOG.error('%s', error)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
