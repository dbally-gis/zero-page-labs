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

def content_errors(output: Path, root: Path | None = None) -> list[str]:
    """Check that every experiment is reachable and every listed page can be shared with an image."""
    import re
    import site_content
    root = root or ROOT
    errors = []
    experiments = site_content.load_experiments(root)
    site = site_content.load_site(root)
    home = (output / 'index.html').read_text()
    listing = (output / 'experiments/index.html').read_text()
    sitemap = (output / 'sitemap.xml').read_text()
    for item in experiments:
        if f'href="{item["href"]}"' not in home: errors.append(f'Home page does not link {item["href"]}')
        if listing.count(f'class="button" href="{item["href"]}"') != 1: errors.append(f'Experiments page must show {item["href"]} exactly once')
        if f'{site["origin"]}{item["href"]}</loc>' not in sitemap: errors.append(f'Sitemap omits {item["href"]}')
    numbers = re.findall(r'<div class="eyebrow">(\d\d) / ', listing)
    expected = [f'{item["number"]:02d}' for item in site_content.newest_first(experiments)]
    if numbers != expected: errors.append(f'Experiment numbers {numbers} differ from the list {expected}')
    if listing.count('class="experiment-meta ') != len(experiments): errors.append('An experiment card has no date and status line')
    featured = sum(1 for item in experiments if item.get('featured'))
    if home.count('<article class="experiment-card">') != featured: errors.append('Home page featured cards differ from the list')
    recorded = json.loads((root / 'data/share-cards.json').read_text()) if (root / 'data/share-cards.json').is_file() else {}
    for name, current in site_content.share_manifest(root).items():
        if recorded.get(name, {}).get('inputs') != current['inputs']: errors.append(f'Share card is stale: {name}. Run python3 execution/build_share_cards.py')
        shipped = output / site_content.SHARE_DIR / f'{name}.png'
        if shipped.is_file() and hashlib.sha256(shipped.read_bytes()).hexdigest() != recorded.get(name, {}).get('image'): errors.append(f'Share image differs from the recorded one: {name}')
    counter = site_content.counter_tag(site)
    for page in output.rglob('*.html'):
        if (counter in page.read_text() if counter else 'goatcounter' not in page.read_text()) is False: errors.append(f'Visitor counter does not match data/site.json: {page.relative_to(output)}')
    for spec in site_content.share_specs(root):
        image = output / site_content.SHARE_DIR / f'{spec["name"]}.png'
        if not image.is_file() or native_size(image.read_bytes()) != site_content.SHARE_SIZE:
            errors.append(f'Share image missing or not {site_content.SHARE_SIZE}: {spec["name"]}')
        for path in spec['paths']:
            page = output / path.lstrip('/') / 'index.html'
            if not page.is_file():
                errors.append(f'Listed page does not exist: {path}')
                continue
            content = page.read_text()
            if f'{site["origin"]}{path}</loc>' not in sitemap: errors.append(f'Sitemap omits {path}')
            for needle in (f'property="og:image" content="{site["origin"]}/{site_content.SHARE_DIR}/{spec["name"]}.png"', 'property="og:title"', 'property="og:description"', 'name="twitter:card"'):
                if content.count(needle) != 1: errors.append(f'{path} needs exactly one {needle.split(" content")[0]}')
    listed = {path for spec in site_content.share_specs(root) for path in spec['paths']}
    for location in re.findall(r'<loc>(.*?)</loc>', sitemap):
        if location.removeprefix(site['origin']) not in listed: errors.append(f'Sitemap page has no share card: {location}')
    return errors


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
    errors.extend(content_errors(output))
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
