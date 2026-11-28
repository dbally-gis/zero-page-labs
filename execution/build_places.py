"""Prepare checksum-verified map details and the static Places That Weren't catalogue."""
from pathlib import Path
from html import escape
import argparse
import hashlib
import json
import logging
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'experiments-source/places-that-werent'
PUBLIC = ROOT / 'experiments/places-that-werent'


def acquire(case, target):
    """Retrieve into a temporary file; only checksum-verified bytes replace the cache."""
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_suffix('.part')
    try:
        subprocess.run(['curl', '--fail', '--location', '--silent', '--show-error',
                        '--max-time', '60', '--retry', '2', '--proto', '=https',
                        '--proto-redir', '=https', '--user-agent', 'Mozilla/5.0',
                        case['download'], '--output', str(temporary)], check=True, timeout=200)
        if hashlib.sha256(temporary.read_bytes()).hexdigest() != case['input_sha256']:
            raise ValueError(f'{case["id"]}: downloaded checksum differs; inspect upstream revision')
        temporary.replace(target)
    finally:
        temporary.unlink(missing_ok=True)


def build(fetch=False):
    try:
        from PIL import Image, ImageOps
    except ImportError as exc:
        raise SystemExit('Pillow is required; use the existing Map Monsters environment.') from exc
    data = json.loads((SOURCE / 'cases.json').read_text())
    output = PUBLIC / 'img'
    output.mkdir(parents=True, exist_ok=True)
    nav, panels, assets = [], [], {}
    for index, case in enumerate(data['cases']):
        key = case['id']
        source = SOURCE / 'sources' / f'{key}.jpg'
        if fetch and not source.exists():
            acquire(case, source)
        if hashlib.sha256(source.read_bytes()).hexdigest() != case['input_sha256']:
            raise ValueError(f'{key}: input checksum differs; inspect source before accepting it')
        with Image.open(source) as image:
            image = image.convert('RGB')
            size = image.size
            box = tuple(round(v * size[i % 2]) for i, v in enumerate(case['crop']))
            detail = image.crop(box)
            for label, view in [('sheet', image.copy()), ('detail', detail.copy())]:
                view.thumbnail((2400, 1800))
                path = output / f'{key}-{label}.webp'
                view.save(path, 'WEBP', quality=88, method=6)
                assets[path.name] = {'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'size': list(view.size)}
            thumb = ImageOps.fit(detail, (400, 220), method=Image.Resampling.LANCZOS)
            thumb.save(output / f'{key}-thumb.webp', 'WEBP', quality=83)
            path = output / f'{key}-thumb.webp'
            assets[path.name] = {'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'size': list(thumb.size)}
            if index == 0:
                cover = ImageOps.fit(image, (960, 640), method=Image.Resampling.LANCZOS)
                cover.save(ROOT / 'assets/experiment-places-that-werent.jpg', quality=91)
        e = lambda k: escape(str(case[k]))
        nav.append(f'<a class="case-link" href="#{key}" data-case="{key}"><img src="img/{key}-thumb.webp" width="400" height="220" alt="" loading="lazy"><span><small>{index+1:02d} / {e("date")}</small><strong>{e("short")}</strong><em>{e("kind")}</em></span></a>')
        links = ''.join(f'<li><a href="{escape(url, quote=True)}">{escape(label)} ↗</a></li>' for label, url in case['sources'])
        moments = ''.join(f'<li><b>{escape(date)}</b><span>{escape(text)}</span></li>' for date, text in case['milestones'])
        panels.append(f'''<article class="case" id="{key}" aria-labelledby="{key}-title">
<div class="case-top"><p class="eyebrow">{index+1:02d} / {e('region')}</p><span class="classification">{e('kind')}</span></div>
<h2 id="{key}-title">{e('name')}</h2><p class="claim">{e('claim')}</p>
<figure class="map-figure"><div class="viewer-tools" aria-label="Map view"><div><button type="button" data-view="detail" aria-pressed="true">Map detail</button><button type="button" data-view="sheet" aria-pressed="false">Whole sheet</button></div><a class="enlarge" href="img/{key}-detail.webp" target="_blank" rel="noopener">Open larger ↗</a></div>
<div class="map-window"><img class="map-image" src="img/{key}-detail.webp" width="{assets[key+'-detail.webp']['size'][0]}" height="{assets[key+'-detail.webp']['size'][1]}" alt="Historical map detail: {e('look')}" {'fetchpriority="high"' if index==0 else 'loading="lazy"'} data-detail-alt="Historical map detail: {e('look')}" data-sheet-alt="Complete supplied scan of {e('title')} by {e('maker')}"></div>
<figcaption><span class="view-label">Detail of the supplied scan</span><span>{e('maker')} · {e('date')}</span></figcaption></figure>
<p class="look"><b>Look closely</b> {e('look')}</p>
<div class="reading"><section><h3>What the map claims</h3><p>{e('story')}</p></section><section><h3>What changed</h3><p>{e('change')}</p></section></div>
<ol class="chronology" aria-label="Selected dates, not a continuous publication history">{moments}</ol>
<details class="evidence"><summary>Sources &amp; what we can verify</summary><div><p class="limitation">{e('limit')}</p><dl><dt>Map</dt><dd><cite>{e('title')}</cite></dd><dt>Collection</dt><dd>{e('holder')}</dd><dt>Image credit</dt><dd>{e('rights')}</dd></dl><ul>{links}</ul></div></details>
<a class="next-case" href="#{data['cases'][(index+1)%len(data['cases'])]['id']}">{'Next place' if index<3 else 'Return to California'} <span aria-hidden="true">→</span></a>
</article>''')
    template = (SOURCE / 'template.html').read_text()
    (PUBLIC / 'index.html').write_text(template.replace('{{CASE_NAV}}', '\n'.join(nav)).replace('{{CASES}}', '\n'.join(panels)))
    (SOURCE / 'assets.json').write_text(json.dumps(assets, indent=2)+'\n')
    logging.info('Prepared %s map cases', len(panels))


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fetch', action='store_true', help='retrieve missing source scans; verify recorded hashes')
    build(parser.parse_args().fetch)
