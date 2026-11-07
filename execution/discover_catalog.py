#!/usr/bin/env python3
"""Discover the public Pebble developer catalog from its paginated server output."""
from __future__ import annotations
from datetime import date
import json
import re
from sync_catalog import fetch

DEVELOPER_ID = 'e8468a0ff28edd5791d1bced'
SOURCE = f'https://apps.repebble.com/apps/dev/daniel-bally_{DEVELOPER_ID}'


def parse_page(html: str, page: int) -> tuple[list[dict], bool]:
    """Decode data records as JSON. Never execute downloaded JavaScript."""
    if len(html) > 8_000_000:
        raise ValueError('Unexpected developer page size')
    chunks = []
    for raw in re.findall(r'self\.__next_f\.push\((\[.*?\])\)</script>', html, re.S):
        record = json.loads(raw)
        if len(record) > 1 and isinstance(record[1], str):
            chunks.append(record[1])
    flight = ''.join(chunks)
    marker = '{"initialApps":'
    if flight.count(marker) != 1:
        raise ValueError('Public catalog data missing or ambiguous')
    props = json.JSONDecoder().raw_decode(flight[flight.index(marker):])[0]
    if props.get('developerId') != DEVELOPER_ID or props.get('developerName') != 'Daniel Bally':
        raise ValueError('Unexpected developer identity')
    if props.get('pageNum') != page:
        raise ValueError('Pagination returned the wrong page')
    if type(props.get('initialHasNextPage')) is not bool or not isinstance(props.get('initialApps'), list):
        raise ValueError('Invalid pagination schema')
    binary = flight.encode('utf-8')

    def text(value: str) -> str:
        if not isinstance(value, str):
            raise ValueError('Invalid catalog text')
        if re.fullmatch(r'\$[0-9a-f]+', value):
            ref = value[1:].encode()
            match = re.search(rb'(?<![0-9a-f])' + ref + rb':T([0-9a-f]+),', binary)
            if not match:
                raise ValueError('Unresolved public description')
            size = int(match.group(1), 16)
            payload = binary[match.end():match.end()+size]
            if len(payload) != size:
                raise ValueError('Truncated public description')
            value = payload.decode('utf-8')
        return value.replace('\r\n', '\n').strip()

    entries = []
    for app in props['initialApps']:
        app_id = app.get('id', '')
        if not re.fullmatch(r'[0-9a-f]{24}', app_id) or app.get('developer_id') != DEVELOPER_ID:
            raise ValueError('Invalid public app identity')
        title, category = text(app.get('title')), text(app.get('category'))
        if not title or not category or app.get('visible') is not True:
            raise ValueError('Unexpected public app metadata')
        if category == 'Faces' and app.get('type') != 'watchface':
            raise ValueError('Face category is not a watchface')
        slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
        images = [url for image in app.get('screenshot_images', []) for url in image.values() if isinstance(url, str)]
        entries.append({'name': title, 'url': f'https://apps.repebble.com/{slug}_{app_id}',
                        'category': category, 'description': text(app.get('description')),
                        'thumbnail': images[0] if images else '',
                        'release_version': str((app.get('latest_release') or {}).get('version', '')),
                        'time2_preview': next((h.get('images', {}).get('screenshot', '') for h in app.get('hardware_platforms', []) if h.get('name') == 'emery'), '')})
    return entries, props['initialHasNextPage']


def discover(fetcher=fetch, max_pages: int = 50) -> dict:
    entries, seen = [], set()
    for page in range(1, max_pages + 1):
        url = SOURCE if page == 1 else f'{SOURCE}?page={page}'
        batch, more = parse_page(fetcher(url).decode('utf-8'), page)
        if more and not batch:
            raise ValueError('Empty nonterminal catalog page')
        for entry in batch:
            app_id = entry['url'].rsplit('_', 1)[-1]
            if app_id in seen:
                raise ValueError('Duplicate public app across pages; source may be changing')
            seen.add(app_id)
            entries.append(entry)
        if not more:
            if not entries or not any(e['category'] == 'Faces' for e in entries):
                raise ValueError('Empty public watchface catalog')
            return {'source': SOURCE, 'observedAt': date.today().isoformat(),
                    'pagination': {'loadedPages': page, 'entries': len(entries), 'reachedBottom': True},
                    'entries': entries}
    raise ValueError('Catalog pagination exceeded its bound')
