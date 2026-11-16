#!/usr/bin/env python3
"""Tests for the generated experiment cards, share metadata and their checks."""
import json
import shutil
import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / 'execution'))

import site_content  # noqa: E402
import verify_site  # noqa: E402


def experiment(slug: str, added: str, **extra) -> dict:
    return {'slug': slug, 'title': slug.title(), 'category': 'CATEGORY', 'added': added, 'status': 'live',
            'summary': f'About {slug}.', 'tagline': f'{slug} in a line.', 'cta': 'Open',
            'cover': {'src': f'/assets/{slug}.png', 'alt': f'{slug} cover', 'width': 960, 'height': 640, 'label': f'Open {slug}'},
            'links': [], **extra}


def make_root(root: Path, experiments: list[dict]) -> None:
    (root / 'data').mkdir()
    (root / 'assets').mkdir()
    (root / 'data/experiments.json').write_text(json.dumps({'first_number': 4, 'experiments': experiments}))
    (root / 'data/site.json').write_text(json.dumps({'origin': 'https://example.test', 'analytics': {'goatcounter': ''}, 'pages': []}))
    for item in experiments:
        (root / 'experiments' / item['slug']).mkdir(parents=True)
        (root / 'experiments' / item['slug'] / 'index.html').write_text('<title>T</title>')
        (root / 'assets' / f"{item['slug']}.png").write_bytes(b'cover')


class ExperimentListTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.addCleanup(self.temp.cleanup)

    def load(self, experiments: list[dict]) -> list[dict]:
        make_root(self.root, experiments)
        return site_content.load_experiments(self.root)

    def test_numbers_follow_list_order(self):
        loaded = self.load([experiment('a', '2026-11-07'), experiment('b', '2026-11-09', featured=True)])
        self.assertEqual([item['number'] for item in loaded], [4, 5])

    def test_out_of_date_order_is_rejected(self):
        with self.assertRaisesRegex(site_content.ContentError, 'oldest first'):
            self.load([experiment('a', '2026-11-09', featured=True), experiment('b', '2026-11-07')])

    def test_missing_field_is_rejected(self):
        broken = experiment('a', '2026-11-07', featured=True)
        del broken['tagline']
        with self.assertRaisesRegex(site_content.ContentError, 'tagline'):
            self.load([broken])

    def test_unknown_status_is_rejected(self):
        with self.assertRaisesRegex(site_content.ContentError, 'status'):
            self.load([experiment('a', '2026-11-07', featured=True, status='abandoned')])

    def test_missing_page_is_rejected(self):
        make_root(self.root, [experiment('a', '2026-11-07', featured=True)])
        (self.root / 'experiments/a/index.html').unlink()
        with self.assertRaisesRegex(site_content.ContentError, 'does not exist'):
            site_content.load_experiments(self.root)

    def test_no_featured_experiment_is_rejected(self):
        with self.assertRaisesRegex(site_content.ContentError, 'featured'):
            self.load([experiment('a', '2026-11-07')])

    def test_published_experiment_missing_from_the_list_is_rejected(self):
        make_root(self.root, [experiment('a', '2026-11-07', featured=True)])
        (self.root / 'experiments/forgotten').mkdir()
        (self.root / 'experiments/forgotten/index.html').write_text('<title>F</title>')
        with self.assertRaisesRegex(site_content.ContentError, 'forgotten'):
            site_content.load_experiments(self.root)

    def test_listing_shows_every_experiment_newest_first(self):
        loaded = self.load([experiment('a', '2026-11-07'), experiment('b', '2026-11-09', featured=True)])
        html = site_content.cards_html(loaded)
        self.assertLess(html.index('05 / CATEGORY'), html.index('04 / CATEGORY'))
        self.assertEqual(html.count('<article class="experiment-card">'), 2)

    def test_card_shows_status_and_date(self):
        loaded = self.load([experiment('a', '2026-11-07', featured=True, status='prototype', status_note='INVITE-ONLY DEMO')])
        html = site_content.card_html(loaded[0])
        self.assertIn('experiment-meta-prototype', html)
        self.assertIn('PROTOTYPE · INVITE-ONLY DEMO · ADDED <time datetime="2026-11-07">NOV 7, 2026</time>', html)

    def test_card_text_is_escaped(self):
        loaded = self.load([experiment('a', '2026-11-07', featured=True, summary='Tom & <b>Jerry</b>')])
        self.assertIn('Tom &amp; &lt;b&gt;Jerry&lt;/b&gt;', site_content.card_html(loaded[0]))

    def test_home_features_some_and_links_the_rest(self):
        loaded = self.load([experiment('a', '2026-11-07'), experiment('b', '2026-11-08'), experiment('c', '2026-11-09', featured=True)])
        html = site_content.home_html(loaded)
        self.assertEqual(html.count('<article class="experiment-card">'), 1)
        self.assertEqual(html.count('<li>'), 2)
        for slug in 'abc':
            self.assertIn(f'href="/experiments/{slug}/"', html)
        self.assertIn('See all three experiments', html)

    def test_download_link_keeps_its_attribute(self):
        loaded = self.load([experiment('a', '2026-11-07', featured=True, links=[{'label': 'Get STL', 'href': '/x.stl', 'download': True}])])
        self.assertIn('href="/x.stl" download>Get STL</a>', site_content.card_html(loaded[0]))


class HeadTests(unittest.TestCase):
    SPEC = {'name': 'thing', 'alt': 'A "quoted" thing'}

    def test_missing_tags_are_added(self):
        page = '<head><title>Thing — Labs</title><meta name="description" content="About it."></head>'
        tags = site_content.head_tags(page, '/thing/', self.SPEC, 'https://example.test')
        self.assertIn('<link rel="canonical" href="https://example.test/thing/">', tags)
        self.assertIn('<meta property="og:title" content="Thing — Labs">', tags)
        self.assertIn('<meta property="og:description" content="About it.">', tags)
        self.assertIn('<meta property="og:image" content="https://example.test/assets/share/thing.png">', tags)
        self.assertIn('content="A &quot;quoted&quot; thing"', tags)
        self.assertIn('<meta name="twitter:card" content="summary_large_image">', tags)

    def test_existing_tags_are_not_duplicated(self):
        page = '<head><title>T</title><meta name="description" content="D"><link rel="canonical" href="x"><meta property="og:title" content="Mine"></head>'
        tags = site_content.head_tags(page, '/thing/', self.SPEC, 'https://example.test')
        self.assertNotIn('og:title', tags)
        self.assertNotIn('canonical', tags)
        self.assertIn('og:description', tags)

    def test_quote_in_a_title_cannot_break_the_attribute(self):
        page = '<head><title>The "Big" one &amp; more</title><meta name="description" content="D"></head>'
        tags = site_content.head_tags(page, '/thing/', self.SPEC, 'https://example.test')
        self.assertIn('<meta property="og:title" content="The &quot;Big&quot; one &amp; more">', tags)

    def test_single_quoted_existing_tag_is_recognised(self):
        page = "<head><title>T</title><meta name='description' content=\"D\"><meta property='og:title' content='Mine'></head>"
        tags = site_content.head_tags(page, '/thing/', self.SPEC, 'https://example.test')
        self.assertNotIn('og:title', tags)
        self.assertIn('<meta property="og:description" content="D">', tags)

    def test_counter_is_absent_until_configured(self):
        self.assertEqual(site_content.counter_tag({'analytics': {'goatcounter': ''}}), '')
        self.assertEqual(site_content.counter_tag({}), '')

    def test_counter_uses_the_configured_site(self):
        tag = site_content.counter_tag({'analytics': {'goatcounter': 'zeropagelabs'}})
        self.assertIn('data-goatcounter="https://zeropagelabs.goatcounter.com/count"', tag)

    def test_counter_rejects_anything_but_a_site_code(self):
        for bad in ('https://evil.test/x.js', 'abc\n', 'Has.Dot', 7):
            with self.subTest(bad=bad), self.assertRaises(site_content.ContentError):
                site_content.counter_tag({'analytics': {'goatcounter': bad}})


class RealSiteTests(unittest.TestCase):
    """The repository's own content must build into a site that passes its checks."""

    @classmethod
    def setUpClass(cls) -> None:
        import build_site
        build_site.build()
        cls.output = REPO / 'dist'

    def test_built_site_has_no_content_errors(self):
        self.assertEqual(verify_site.content_errors(self.output), [])

    def test_stale_share_card_is_reported(self):
        with TemporaryDirectory() as temp:
            root = Path(temp)
            for name in ('data', 'experiments', 'assets'):
                shutil.copytree(REPO / name, root / name)
            data = json.loads((root / 'data/experiments.json').read_text())
            data['experiments'][0]['tagline'] = 'A different line.'
            (root / 'data/experiments.json').write_text(json.dumps(data))
            errors = verify_site.content_errors(self.output, root)
            self.assertTrue(any('Share card is stale: retro-glitch' in error for error in errors), errors)

    def test_experiment_missing_from_home_is_reported(self):
        with TemporaryDirectory() as temp:
            output = Path(temp) / 'dist'
            shutil.copytree(self.output, output)
            home = output / 'index.html'
            home.write_text(home.read_text().replace('href="/experiments/maritime/"', 'href="/nowhere/"'))
            errors = verify_site.content_errors(output)
            self.assertIn('Home page does not link /experiments/maritime/', errors)

    def test_page_without_share_image_is_reported(self):
        with TemporaryDirectory() as temp:
            output = Path(temp) / 'dist'
            shutil.copytree(self.output, output)
            (output / 'assets/share/home.png').unlink()
            errors = verify_site.content_errors(output)
            self.assertTrue(any('Share image missing' in error and 'home' in error for error in errors), errors)

    def test_swapped_share_image_is_reported(self):
        with TemporaryDirectory() as temp:
            output = Path(temp) / 'dist'
            shutil.copytree(self.output, output)
            shutil.copyfile(output / 'assets/share/bellona.png', output / 'assets/share/maritime.png')
            errors = verify_site.content_errors(output)
            self.assertIn('Share image differs from the recorded one: maritime', errors)

    def test_no_counter_ships_while_none_is_configured(self):
        self.assertEqual(site_content.load_site(REPO)['analytics']['goatcounter'], '')
        for page in self.output.rglob('*.html'):
            self.assertNotIn('goatcounter', page.read_text(), page)

    def test_stray_counter_script_is_reported(self):
        with TemporaryDirectory() as temp:
            output = Path(temp) / 'dist'
            shutil.copytree(self.output, output)
            page = output / '404.html'
            page.write_text(page.read_text().replace('</head>', '<script data-goatcounter="x"></script></head>'))
            errors = verify_site.content_errors(output)
            self.assertIn('Visitor counter does not match data/site.json: 404.html', errors)

    def test_generated_bundles_are_not_edited_in_source(self):
        # Share tags are added to dist only; the attested bundle sources must stay as built.
        for bundle in ('lexical', 'rack-lab'):
            self.assertNotIn('og:image', (REPO / 'experiments' / bundle / 'index.html').read_text())
            self.assertIn('og:image', (self.output / 'experiments' / bundle / 'index.html').read_text())


if __name__ == '__main__':
    unittest.main()
