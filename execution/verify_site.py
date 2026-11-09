#!/usr/bin/env python3
"""Check shipped navigation, assets, gallery records, and publication boundaries."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
import hashlib
import argparse
import sys
from sync_catalog import catalog_errors, native_size, validate_preview

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.refs: list[str] = []
        self.ids: set[str] = set()
        self.headings = 0
        self.images: list[dict[str, str]] = []
    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        d = dict(attrs)
        if d.get('id'): self.ids.add(d['id'])
        if tag == 'h1': self.headings += 1
        if tag == 'img': self.images.append(d)
        for key in ('href', 'src'):
            if d.get(key): self.refs.append(d[key])

def verify(deep: bool = False) -> None:
    output = ROOT / 'dist'
    errors = []
    pages = {}
    for file in output.rglob('*.html'):
        page = Page()
        content = file.read_text()
        page.feed(content)
        pages[file] = page
        if '{{' in content: errors.append(f'Unexpanded template: {file.name}')
        if page.headings != 1: errors.append(f'Expected one h1: {file}')
        for image in page.images:
            if 'alt' not in image: errors.append(f'Missing alt: {file}')
    for file, page in pages.items():
        for ref in page.refs:
            parts = urlsplit(ref)
            if parts.scheme or parts.netloc: continue
            target = output / unquote(parts.path).lstrip('/') if parts.path.startswith('/') else file.parent / unquote(parts.path)
            if not parts.path: target = file
            if target.is_dir(): target = target / 'index.html'
            if not target.is_file(): errors.append(f'Missing {ref} from {file.relative_to(output)}')
            elif parts.fragment and target in pages and parts.fragment not in pages[target].ids:
                errors.append(f'Missing fragment: {ref}')
    faces = json.loads((ROOT / 'data/watchfaces.json').read_text())
    snapshot = json.loads((ROOT / 'data/developer-catalog.json').read_text())
    errors.extend(catalog_errors(faces, snapshot))
    if not faces: errors.append('Empty watchface catalog')
    if len({f['url'] for f in faces}) != len(faces): errors.append('Duplicate store link')
    gallery = (output / 'watchfaces/index.html').read_text()
    for face in faces:
        if face['url'] not in gallery: errors.append(f"Missing link: {face['name']}")
        image = output / face['image'].lstrip('/')
        try:
            if deep:
                validate_preview(image.read_bytes())
            if native_size(image.read_bytes()) != (200, 228): errors.append(f'Non-native Time2 image: {image}')
        except ValueError as error:
            errors.append(f'{image}: {error}')
    if gallery.count('class="pebble-hardware"') != len(faces): errors.append('Hardware frame count differs from catalog')
    if f'>{len(faces)} faces<' not in gallery: errors.append('Gallery count differs from catalog')
    if f'{len(faces)} faces /' not in (output / 'index.html').read_text(): errors.append('Home count differs from catalog')
    for document, digest in json.loads((ROOT / 'data/gridcore-provenance.json').read_text())['specification_hashes'].items():
        if hashlib.sha256((output / 'gridcore/specs' / document).read_bytes()).hexdigest() != digest: errors.append(f'Gridcore specification changed: {document}')
    vendor = json.loads((ROOT / 'data/maritime-vendor.json').read_text())
    library = output / 'experiments/maritime/vendor/three-0.160.1.module.min.js'
    if not library.is_file() or hashlib.sha256(library.read_bytes()).hexdigest() != vendor['sha256']:
        errors.append('Maritime Three.js vendor differs from pinned source')
    if not (library.parent / 'THREE-LICENSE.txt').is_file():
        errors.append('Maritime Three.js license is missing')
    forbidden = {'.env', 'AGENTS.md', 'SESSION.md', 'task.md', 'config.example.js'}
    for file in output.rglob('*'):
        if file.name in forbidden or '.tmp' in file.relative_to(output).parts: errors.append(f'Private scaffold shipped: {file}')
    if errors:
        print('\n'.join(errors)); sys.exit(1)
    print(f'PASS: {len(pages)} pages; internal assets/links/fragments resolve; {len(faces)} unique gallery links; public-only output.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--deep', action='store_true', help='Fully decode previews; requires requirements-sync.txt')
    verify(deep=parser.parse_args().deep)
