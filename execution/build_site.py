#!/usr/bin/env python3
"""Build the public static site using only explicitly allowlisted inputs."""
from pathlib import Path
from html import escape
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]

def build() -> None:
    """Package source and expand the watchface catalog without runtime requests."""
    from build_experiments import verify as verify_experiments
    verify_experiments(ROOT)
    output = ROOT / 'dist'
    if output.exists():
        shutil.rmtree(output)
    output.mkdir()
    for file in ('index.html', 'style.css', 'robots.txt', 'sitemap.xml', '404.html'):
        shutil.copyfile(ROOT / file, output / file)
    for directory in ('assets', 'src', 'thumbwords', 'watchfaces', 'gridcore', 'experiments'):
        shutil.copytree(ROOT / directory, output / directory)
    faces = json.loads((ROOT / 'data/watchfaces.json').read_text())
    if not faces:
        raise ValueError('Cannot build an empty face catalog')
    by_name = {face['name']: face for face in faces}
    featured_one = by_name.get('Hi-Fi', faces[0])
    featured_two = by_name.get('PBL-2500', faces[min(1, len(faces)-1)])
    styles = list(dict.fromkeys(face['style'] for face in faces))
    order = ['Analog', 'Digital', 'Minimal', 'Illustrated', 'Other']
    styles.sort(key=lambda style: order.index(style) if style in order else len(order))
    filters = '<button type="button" data-filter="All" aria-pressed="true">All faces</button>' + ''.join(f'<button type="button" data-filter="{escape(style, quote=True)}" aria-pressed="false">{escape(style)}</button>' for style in styles)
    substitutions = {'{{WATCH_COUNT}}': str(len(faces)), '{{FEATURE_ONE_IMAGE}}': featured_one['image'], '{{FEATURE_ONE_NAME}}': escape(featured_one['name']), '{{FEATURE_TWO_IMAGE}}': featured_two['image'], '{{FEATURE_TWO_NAME}}': escape(featured_two['name']), '{{WATCH_FILTERS}}': filters}
    for page in output.rglob('*.html'):
        content = page.read_text()
        for marker, value in substitutions.items():
            content = content.replace(marker, value)
        page.write_text(content)
    public_sources = json.loads((ROOT / 'data/public-repositories.json').read_text())['watchfaces']
    cards = []
    for face in faces:
        d = {key: escape(value, quote=True) for key, value in face.items()}
        source_url = public_sources.get(face['slug'])
        source_link = f'<a class="watch-source-link" href="{escape(source_url, quote=True)}" aria-label="{d["name"]} source on GitHub">Source on GitHub ↗</a>' if source_url else ''
        cards.append(f'''<article class="watch-card" data-style="{d['style']}"><a href="{d['url']}" aria-label="{d['name']} — view in the Pebble appstore"><div class="watch-image"><span class="pebble-device"><span class="pebble-glass" aria-hidden="true"></span><img class="pebble-screen" src="{d['image']}" alt="{d['name']} watchface shown on Pebble Time 2" width="200" height="228" loading="lazy"><img class="pebble-hardware" src="/assets/pebble-time-2-frame.png" alt="" width="488" height="700" loading="lazy"></span></div><div class="watch-info"><h2>{d['name']}</h2><span>{d['style'].upper()}</span></div><p>{d['description']}</p><span class="store-link">Pebble appstore ↗</span></a>{source_link}</article>''')
    gallery = output / 'watchfaces/index.html'
    gallery.write_text(gallery.read_text().replace('{{WATCH_CARDS}}', '\n'.join(cards)))
    import os
    import subprocess
    import hashlib
    content = hashlib.sha256()
    for artifact in sorted(output.rglob('*')):
        if artifact.is_file():
            content.update(artifact.relative_to(output).as_posix().encode() + b'\0' + artifact.read_bytes() + b'\0')
    source_commit = os.environ.get('RENDER_GIT_COMMIT') or subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    (output / 'deployment.json').write_text(json.dumps({'source_commit': source_commit, 'content_sha256': content.hexdigest(), 'watchfaces': len(faces)}, sort_keys=True) + '\n')
    print(f'Built dist with {len(faces)} watchfaces; only public website files included.')

if __name__ == '__main__':
    build()
