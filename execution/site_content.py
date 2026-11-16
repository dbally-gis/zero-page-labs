#!/usr/bin/env python3
"""Render the parts of the site that come from one list instead of hand-written HTML.

`data/experiments.json` is the single list of experiments. From it this module
renders the cards on /experiments/, the featured cards and compact list on the
home page, each experiment's catalogue number, and its date and status line.

`data/site.json` holds the other pages' share-card text, the public origin and
the optional visitor counter. Share metadata (`og:image` and friends) is added to
every listed page at build time, so generated experiment bundles stay untouched.
"""
from __future__ import annotations

import hashlib
import json
import re
from datetime import date
from html import escape, unescape
from pathlib import Path

STATUSES = {'live': 'LIVE', 'prototype': 'PROTOTYPE'}
MONTHS = ('JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC')
COUNT_WORDS = ('zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve')
SHARE_SIZE = (1200, 630)
SHARE_DIR = 'assets/share'
REQUIRED = ('slug', 'title', 'category', 'added', 'status', 'summary', 'tagline', 'cta', 'cover')
GOATCOUNTER_CODE = re.compile(r'[a-z0-9][a-z0-9-]{0,62}')


class ContentError(ValueError):
    """The content lists cannot produce a correct site."""


def load_experiments(root: Path) -> list[dict]:
    """Return experiments oldest first, each with its derived catalogue number."""
    data = json.loads((root / 'data/experiments.json').read_text())
    experiments = data['experiments']
    if not experiments:
        raise ContentError('data/experiments.json lists no experiments')
    seen: set[str] = set()
    previous = date.min
    for offset, item in enumerate(experiments):
        missing = [key for key in REQUIRED if not item.get(key)]
        if missing:
            raise ContentError(f"Experiment {item.get('slug', offset)} is missing {', '.join(missing)}")
        slug = item['slug']
        if slug in seen:
            raise ContentError(f'Duplicate experiment slug: {slug}')
        seen.add(slug)
        if item['status'] not in STATUSES:
            raise ContentError(f"{slug}: status must be one of {', '.join(sorted(STATUSES))}")
        added = date.fromisoformat(item['added'])
        if added < previous:
            raise ContentError(f'{slug}: experiments must be listed oldest first; numbers follow list order')
        previous = added
        if not (root / 'experiments' / slug / 'index.html').is_file():
            raise ContentError(f'{slug}: experiments/{slug}/index.html does not exist')
        if not (root / item['cover']['src'].lstrip('/')).is_file():
            raise ContentError(f"{slug}: cover {item['cover']['src']} does not exist")
        item['number'] = data['first_number'] + offset
        item['href'] = f'/experiments/{slug}/'
    unlisted = sorted(page.parent.name for page in (root / 'experiments').glob('*/index.html') if page.parent.name not in seen)
    if unlisted:
        raise ContentError(f"Published but not in data/experiments.json: {', '.join(unlisted)}")
    if not any(item.get('featured') for item in experiments):
        raise ContentError('At least one experiment must be featured on the home page')
    return experiments


def newest_first(experiments: list[dict]) -> list[dict]:
    return list(reversed(experiments))


def display_date(iso: str) -> str:
    day = date.fromisoformat(iso)
    return f'{MONTHS[day.month - 1]} {day.day}, {day.year}'


def count_word(count: int) -> str:
    return COUNT_WORDS[count] if count < len(COUNT_WORDS) else str(count)


def eyebrow(item: dict) -> str:
    return f"{item['number']:02d} / {item['category']}"


def meta_html(item: dict) -> str:
    """Status and date line: what a visitor needs to judge how fresh a piece is."""
    status = STATUSES[item['status']]
    if item.get('status_note'):
        status += f" · {item['status_note']}"
    return (f'<div class="experiment-meta experiment-meta-{item["status"]}"><i aria-hidden="true"></i>'
            f'{escape(status)} · ADDED <time datetime="{item["added"]}">{display_date(item["added"])}</time></div>')


def card_html(item: dict) -> str:
    cover = item['cover']
    href = escape(item['href'], quote=True)
    parts = [
        f'<article class="experiment-card"><a class="experiment-cover" href="{href}" aria-label="{escape(cover["label"], quote=True)}">'
        f'<img src="{escape(cover["src"], quote=True)}" alt="{escape(cover["alt"], quote=True)}" width="{int(cover["width"])}" height="{int(cover["height"])}" loading="lazy"></a>',
        f'<div class="experiment-card-copy"><div class="eyebrow">{escape(eyebrow(item))}</div>{meta_html(item)}',
        f'<h3>{escape(item["title"])}</h3><p>{escape(item["summary"])}</p>',
        f'<a class="button" href="{href}">{escape(item["cta"])} <span>↗</span></a>',
    ]
    if item.get('note'):
        parts.append(f'<span class="experiment-note">{escape(item["note"])}</span>')
    for link in item.get('links', []):
        download = ' download' if link.get('download') else ''
        parts.append(f'<a class="project-source-link" href="{escape(link["href"], quote=True)}"{download}>{escape(link["label"])}</a>')
    parts.append('</div></article>')
    return ''.join(parts)


def cards_html(experiments: list[dict]) -> str:
    """Every experiment, newest first, for /experiments/."""
    return '\n'.join(card_html(item) for item in newest_first(experiments))


def home_html(experiments: list[dict]) -> str:
    """Featured experiments as full cards, the rest as one compact row each."""
    ordered = newest_first(experiments)
    featured = [item for item in ordered if item.get('featured')]
    rest = [item for item in ordered if not item.get('featured')]
    rows = ''.join(
        f'<li><a href="{escape(item["href"], quote=True)}"><span class="experiment-more-number">{item["number"]:02d}</span>'
        f'<span class="experiment-more-title">{escape(item["title"])}</span>'
        f'<span class="experiment-more-tagline">{escape(item["tagline"])}</span>'
        f'<span class="experiment-more-meta">{STATUSES[item["status"]]} · <time datetime="{item["added"]}">{display_date(item["added"])}</time></span>'
        f'<span class="experiment-more-arrow" aria-hidden="true">↗</span></a></li>'
        for item in rest)
    more = f'<ul class="experiment-more" aria-label="More experiments">{rows}</ul>' if rest else ''
    return (f'<div class="experiment-cards">{"".join(card_html(item) for item in featured)}</div>{more}'
            f'<a class="button experiment-all" href="/experiments/">See all {count_word(len(experiments))} experiments <span>↗</span></a>')


def substitutions(root: Path) -> dict[str, str]:
    experiments = load_experiments(root)
    return {
        '{{EXPERIMENT_CARDS}}': cards_html(experiments),
        '{{HOME_EXPERIMENTS}}': home_html(experiments),
        '{{EXPERIMENT_COUNT_WORD}}': count_word(len(experiments)).capitalize(),
    }


# ── Share cards ────────────────────────────────────────────────────────────────

def load_site(root: Path) -> dict:
    return json.loads((root / 'data/site.json').read_text())


def _title_html(title: str) -> str:
    """Escape a title; a newline becomes a break and _text_ becomes the serif italic."""
    return re.sub(r'_(.+?)_', r'<span class="serif">\1</span>', escape(title)).replace('\n', '<br>')


def share_specs(root: Path) -> list[dict]:
    """One spec per distinct share image: its text, artwork and the pages that use it."""
    site = load_site(root)
    experiments = load_experiments(root)
    specs: dict[str, dict] = {}
    for page in site['pages']:
        spec = specs.setdefault(page['share'], {'name': page['share'], 'paths': []})
        spec['paths'].append(page['path'])
        if 'title' in page:
            art = dict(page.get('art', {}))
            if art.get('kind') == 'featured':
                art['covers'] = [item['cover']['src'] for item in newest_first(experiments) if item.get('featured')][:2]
            spec.update(eyebrow=page['eyebrow'], title=page['title'], alt=page['alt'], art=art,
                        deck=page['deck'].replace('{count_word}', count_word(len(experiments)).capitalize()))
    for item in experiments:
        specs[item['slug']] = {
            'name': item['slug'], 'paths': [item['href']], 'eyebrow': eyebrow(item), 'title': item['title'],
            'deck': item['tagline'], 'alt': f"{item['title']}: {item['cover']['alt']}",
            'art': {'kind': 'cover', 'src': item['cover']['src'], 'background': '#141714'},
        }
    incomplete = [name for name, spec in specs.items() if 'title' not in spec]
    if incomplete:
        raise ContentError(f"Share card has no text: {', '.join(incomplete)}")
    return list(specs.values())


def _art_html(art: dict) -> str:
    kind = art.get('kind')
    background = escape(art.get('background', '#141714'), quote=True)
    if kind == 'asterisk':
        return ''
    if kind == 'cover':
        # The whole cover, uncropped, over a blurred copy of itself so its labels are never cut off.
        src = escape(art['src'], quote=True)
        return f'<div class="art art-cover" style="background:{background}"><img class="wash" src="{src}" alt=""><img class="whole" src="{src}" alt=""></div>'
    if kind == 'contain':
        return f'<div class="art art-contain" style="background:{background}"><img src="{escape(art["src"], quote=True)}" alt=""></div>'
    if kind == 'phone':
        return f'<div class="art art-phone" style="background:{background}"><span class="ring"></span><img src="{escape(art["src"], quote=True)}" alt=""></div>'
    if kind == 'watches':
        watches = ''.join(
            f'<span class="watch watch-{index}"><span class="glass"></span><img class="screen" src="{escape(src, quote=True)}" alt="">'
            f'<img class="frame" src="/assets/pebble-time-2-frame.png" alt=""></span>'
            for index, src in enumerate(art['screens']))
        return f'<div class="art art-watches" style="background:{background}">{watches}</div>'
    if kind == 'featured':
        covers = ''.join(f'<img src="{escape(src, quote=True)}" alt="">' for src in art['covers'])
        return f'<div class="art art-featured">{covers}</div>'
    raise ContentError(f'Unknown share art kind: {kind}')


SHARE_CSS = """
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{background:#f4f1e9;color:#20211e;font-family:'DM Sans',sans-serif;display:flex}
.copy{flex:1;min-width:0;padding:56px 48px 48px 64px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:12px;font-weight:800;font-size:17px;line-height:1;letter-spacing:-.01em}
.brand i{font:54px/.8 Georgia,serif;font-style:normal;color:#fa4c25;transform:rotate(-13deg);display:block}
.eyebrow{font:500 15px 'IBM Plex Mono',monospace;letter-spacing:.06em;margin-top:auto}
h1{font-size:76px;font-weight:800;letter-spacing:-.06em;line-height:1;margin:18px 0 20px}
.wide h1{font-size:104px}
.serif{font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:400}
.deck{font-size:25px;line-height:1.3;color:#5c5e56;max-width:560px}
.wide .deck{max-width:760px}
.url{font:500 15px 'IBM Plex Mono',monospace;letter-spacing:.06em;margin-top:30px}
.asterisk{position:absolute;right:70px;top:36px;font-size:190px;line-height:1;color:#fa4c25;transform:rotate(14deg)}
.art{width:560px;height:630px;flex:none;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.art-cover .wash{position:absolute;inset:-60px;width:calc(100% + 120px);height:calc(100% + 120px);object-fit:cover;filter:blur(34px) brightness(.82)}
.art-cover .whole{position:relative;width:100%;height:auto;box-shadow:0 18px 44px #0005}
.art-contain img{width:100%;height:auto}
.art-phone img{width:236px;border-radius:26px;transform:rotate(8deg);box-shadow:16px 24px 0 #00000014,0 26px 44px #34452340;position:relative}
.art-phone .ring{position:absolute;width:520px;height:520px;border:1px solid #87977d;border-radius:50%;transform:rotate(-25deg) scaleY(.76)}
.art-watches{gap:26px}
.watch{display:block;width:216px;aspect-ratio:488/700;position:relative;flex:none;filter:drop-shadow(8px 16px 12px #0003)}
.watch-0{transform:rotate(-12deg)}
.watch-1{transform:rotate(12deg);margin-top:90px}
.watch .glass{position:absolute;left:19%;top:25%;width:60%;height:52%;background:#000;border-radius:10%}
.watch .screen{position:absolute;left:20.49%;top:27%;width:57.17%;aspect-ratio:200/228;image-rendering:pixelated}
.watch .frame{position:relative;width:100%;display:block}
.art-featured{flex-direction:column;background:#141714}
.art-featured img{width:100%;height:50%;object-fit:cover;display:block}
"""


def share_card_html(spec: dict) -> str:
    """The 1200x630 card that is photographed to make a page's share image."""
    art = _art_html(spec['art'])
    wide = '' if art else ' class="wide"'
    asterisk = '' if art else '<span class="asterisk">✳</span>'
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><style>{SHARE_CSS}</style></head><body{wide}>'
            f'<div class="copy"><div class="brand"><i>ø</i><span>ZERO PAGE<br>LABS</span></div>'
            f'<div class="eyebrow">{escape(spec["eyebrow"])}</div><h1>{_title_html(spec["title"])}</h1>'
            f'<p class="deck">{escape(spec["deck"])}</p><div class="url">ZEROPAGELABS.COM</div></div>{asterisk}{art}</body></html>')


def _art_sources(art: dict) -> list[str]:
    sources = [art['src']] if 'src' in art else []
    sources += art.get('covers', []) + art.get('screens', [])
    if art.get('kind') == 'watches':
        sources.append('/assets/pebble-time-2-frame.png')
    return sources


def share_fingerprint(root: Path, spec: dict) -> str:
    """Hash of everything a share image is drawn from, so a stale image is detectable."""
    result = hashlib.sha256(share_card_html(spec).encode())
    for source in _art_sources(spec['art']):
        result.update(source.encode() + b'\0' + (root / source.lstrip('/')).read_bytes() + b'\0')
    return result.hexdigest()


def share_manifest(root: Path) -> dict[str, dict[str, str]]:
    """For each card: the hash of what it is drawn from and the hash of the committed image."""
    manifest = {}
    for spec in share_specs(root):
        image = root / SHARE_DIR / f"{spec['name']}.png"
        manifest[spec['name']] = {
            'inputs': share_fingerprint(root, spec),
            'image': hashlib.sha256(image.read_bytes()).hexdigest() if image.is_file() else '',
        }
    return manifest


# ── Page head ──────────────────────────────────────────────────────────────────

def _first(pattern: str, content: str) -> str:
    match = re.search(pattern, content, re.S)
    return match.group(1) if match else ''


def _has(content: str, attribute: str, name: str) -> bool:
    return re.search(attribute + r'''=["']''' + re.escape(name) + r'''["']''', content) is not None


def head_tags(content: str, path: str, spec: dict, origin: str) -> str:
    """Share tags for one page. Existing og: tags are kept; only missing ones are added."""
    # Text lifted from the page is entity-decoded and re-escaped, so a quote in a title cannot break an attribute.
    title = escape(unescape(_first(r'<title>(.*?)</title>', content)), quote=True)
    description = escape(unescape(_first(r'''<meta name=["']description["'] content="(.*?)"''', content)), quote=True)
    url = origin + path
    tags = []
    if not _has(content, 'rel', 'canonical'):
        tags.append(f'<link rel="canonical" href="{url}">')
    for name, value in (('og:title', title), ('og:description', description), ('og:type', 'website'), ('og:url', url)):
        if not _has(content, 'property', name) and value:
            tags.append(f'<meta property="{name}" content="{value}">')
    image = f'{origin}/{SHARE_DIR}/{spec["name"]}.png'
    tags += [
        f'<meta property="og:image" content="{image}">',
        f'<meta property="og:image:width" content="{SHARE_SIZE[0]}">',
        f'<meta property="og:image:height" content="{SHARE_SIZE[1]}">',
        f'<meta property="og:image:alt" content="{escape(spec["alt"], quote=True)}">',
        '<meta name="twitter:card" content="summary_large_image">',
    ]
    return ''.join(tags)


def counter_tag(site: dict) -> str:
    """The visitor counter script, or nothing while no counter is configured."""
    code = site.get('analytics', {}).get('goatcounter', '')
    if not code:
        return ''
    if not isinstance(code, str) or not GOATCOUNTER_CODE.fullmatch(code):
        raise ContentError('analytics.goatcounter must be a GoatCounter site code, e.g. "zeropagelabs"')
    return f'<script data-goatcounter="https://{code}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>'


def finish_pages(root: Path, output: Path) -> None:
    """Add share tags to every listed page and the counter, if any, to every page."""
    site = load_site(root)
    by_path = {path: spec for spec in share_specs(root) for path in spec['paths']}
    counter = counter_tag(site)
    for page in output.rglob('*.html'):
        relative = page.relative_to(output).as_posix()
        path = '/' + relative.removesuffix('index.html')
        content = page.read_text()
        extra = counter
        if path in by_path and relative.endswith('index.html'):
            extra = head_tags(content, path, by_path[path], site['origin']) + extra
        if extra:
            if '</head>' not in content:
                raise ContentError(f'{relative} has no </head>')
            page.write_text(content.replace('</head>', extra + '</head>', 1))
