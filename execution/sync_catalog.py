#!/usr/bin/env python3
"""Import a complete browser-observed public developer catalog and native previews."""
from __future__ import annotations
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
import concurrent.futures
import json
import random
import re
import shutil
import struct
import time

ROOT = Path(__file__).resolve().parents[1]
TRANSIENT = {408, 425, 429, 500, 502, 503, 504}


def fetch(url: str, opener=urlopen, sleep=time.sleep) -> bytes:
    """Bounded read-only retries; no credentials, cookies, or signed URLs."""
    if urlsplit(url).hostname not in {'apps.repebble.com', 'assets.repebble.com'}:
        raise ValueError('Unexpected public asset host')
    for attempt in range(4):
        try:
            with opener(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=25) as response:
                return response.read()
        except HTTPError as error:
            if error.code not in TRANSIENT or attempt == 3:
                raise
            delay = error.headers.get('Retry-After', '') if error.headers else ''
            wait = float(delay) if delay.isdigit() else 2 ** attempt + random.uniform(0, .25)
            print(json.dumps({'event': 'retry', 'status': error.code, 'attempt': attempt + 1}))
            sleep(min(wait, 30))
        except (URLError, TimeoutError):
            if attempt == 3:
                raise
            sleep(2 ** attempt + random.uniform(0, .25))
    raise RuntimeError('Retry budget exhausted')


def native_size(payload: bytes) -> tuple[int, int]:
    if payload.startswith(b'\x89PNG\r\n\x1a\n') and len(payload) >= 24:
        return struct.unpack('>II', payload[16:24])
    if payload[:6] in {b'GIF87a', b'GIF89a'} and len(payload) >= 10:
        return struct.unpack('<HH', payload[6:10])
    raise ValueError('Preview is not a PNG or GIF')


def catalog_errors(faces: list[dict], snapshot: dict) -> list[str]:
    """Completeness is checked against observed public IDs, never a fixed count."""
    expected = {entry['url'].rsplit('_', 1)[-1] for entry in snapshot['entries'] if entry['category'] == 'Faces'}
    actual = [face['url'].rsplit('_', 1)[-1].rsplit('/', 1)[-1] for face in faces]
    errors = []
    if set(actual) != expected:
        errors.append(f'Catalog differs from published Faces: missing={sorted(expected-set(actual))}, extra={sorted(set(actual)-expected)}')
    if len(actual) != len(set(actual)):
        errors.append('Duplicate public face ID')
    return errors


STYLES = {
    'PBL-2500': 'Analog', 'Railway': 'Analog', 'Origin': 'Analog', 'Vector': 'Analog',
    'Meridian': 'Analog', 'Cardinal': 'Analog', 'Mono': 'Minimal', 'Margin': 'Minimal',
    'Ledger': 'Minimal', 'Rainy Bookshop': 'Illustrated', 'Clockfish': 'Illustrated',
    'TERCOM': 'Illustrated', 'Pangaea Drift': 'Illustrated', 'From Here': 'Illustrated',
    'Straight Ahead': 'Illustrated',
}


def sync() -> None:
    snapshot = json.loads((ROOT / 'data/developer-catalog.json').read_text())
    if not snapshot['pagination']['reachedBottom']:
        raise ValueError('Catalog snapshot does not establish end of pagination')
    entries = [entry for entry in snapshot['entries'] if entry['category'] == 'Faces']
    if len(snapshot['entries']) != snapshot['pagination']['entries']:
        raise ValueError('Snapshot entry count mismatch')
    staging = ROOT / '.tmp/catalog-downloads'
    staging.mkdir(parents=True, exist_ok=True)
    previous = {face['name']: face for face in json.loads((ROOT / 'data/watchfaces.json').read_text())}

    def acquire(entry: dict) -> tuple[dict, Path]:
        app_id = entry['url'].rsplit('_', 1)[-1]
        if not re.fullmatch(r'[a-f0-9]{24}', app_id):
            raise ValueError('Malformed public app ID')
        html = fetch(entry['url']).decode()
        if 'Application not found' in html:
            raise ValueError(f"Listing unavailable: {entry['name']}")
        pattern = rf'https://assets\.repebble\.com/screenshots/{app_id}/emery/[a-f0-9-]+\.(?:png|gif)'
        urls = list(dict.fromkeys(re.findall(pattern, html)))
        urls.sort(key=lambda url: not url.endswith('.png'))
        for url in urls:
            try:
                payload = fetch(url)
            except HTTPError as error:
                if error.code == 404:
                    continue
                raise
            if native_size(payload) != (200, 228):
                continue
            slug = entry['url'].rsplit('/', 1)[-1].rsplit('_', 1)[0]
            filename = f"catalog-{app_id}.{url.rsplit('.', 1)[-1]}"
            target = staging / filename
            target.write_bytes(payload)
            description = entry['description'].split('\n', 1)[0].strip()
            if len(description) > 130:
                description = description.split('. ', 1)[0] + '.'
            # Keep concise editorial descriptions where they still describe the current face.
            if entry['name'] in previous and entry['name'] != 'World Timer':
                description = previous[entry['name']]['description']
            face = {'name': entry['name'], 'slug': slug, 'url': entry['url'],
                    'image': f'/assets/{filename}', 'style': STYLES.get(entry['name'], 'Digital'),
                    'description': description, 'source_image': url}
            return face, target
        raise ValueError(f"No native Time2 preview: {entry['name']}")

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(acquire, entries))
    faces = [item[0] for item in results]
    errors = catalog_errors(faces, snapshot)
    if errors:
        raise ValueError('; '.join(errors))
    for _, file in results:
        shutil.copyfile(file, ROOT / 'assets' / file.name)
    (ROOT / 'data/watchfaces.json').write_text(json.dumps(faces, indent=2) + '\n')
    print(json.dumps({'event': 'catalog_synced', 'faces': len(faces), 'excluded_apps': len(snapshot['entries']) - len(faces)}))

if __name__ == '__main__':
    sync()
