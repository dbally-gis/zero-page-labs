#!/usr/bin/env python3
"""Check shipped navigation, assets, gallery records, and publication boundaries."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
import sys

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

def verify() -> None:
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
            if not image.get('alt'): errors.append(f'Missing alt: {file}')
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
    if len(faces) != 15: errors.append('Expected fifteen watchfaces')
    if len({f['url'] for f in faces}) != 15: errors.append('Duplicate store link')
    gallery = (output / 'watchfaces/index.html').read_text()
    for face in faces:
        if face['url'] not in gallery: errors.append(f"Missing link: {face['name']}")
        image = output / face['image'].lstrip('/')
        if not image.read_bytes().startswith(b'\x89PNG'): errors.append(f'Invalid PNG: {image}')
    forbidden = {'.env', 'AGENTS.md', 'SESSION.md', 'task.md', 'config.example.js'}
    for file in output.rglob('*'):
        if file.name in forbidden or '.tmp' in file.parts: errors.append(f'Private scaffold shipped: {file}')
    if errors:
        print('\n'.join(errors)); sys.exit(1)
    print(f'PASS: {len(pages)} pages; internal assets/links/fragments resolve; fifteen unique gallery links; public-only output.')

if __name__ == '__main__':
    verify()
