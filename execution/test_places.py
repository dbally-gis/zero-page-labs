"""Check published scan integrity and evidence coverage without network access."""
from pathlib import Path
import hashlib
import json
import unittest
from unittest.mock import patch
import tempfile
import build_places

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'experiments-source/places-that-werent'
PUBLIC = ROOT / 'experiments/places-that-werent'


class ScanIntegrityTests(unittest.TestCase):
    def test_changed_download_does_not_replace_previous_scan(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'source.jpg'
            target.write_bytes(b'previous')
            def changed_download(*args, **kwargs):
                target.with_suffix('.part').write_bytes(b'changed')
            with patch('build_places.subprocess.run', side_effect=changed_download):
                with self.assertRaisesRegex(ValueError, 'checksum differs'):
                    build_places.acquire({'id': 'sample', 'download': 'https://example.org/map.jpg', 'input_sha256': '0'*64}, target)
            self.assertEqual(target.read_bytes(), b'previous')
            self.assertFalse(target.with_suffix('.part').exists())

    def test_published_images_match_provenance_manifest(self):
        for filename, evidence in json.loads((SOURCE / 'assets.json').read_text()).items():
            self.assertEqual(hashlib.sha256((PUBLIC / 'img' / filename).read_bytes()).hexdigest(), evidence['sha256'], filename)

    def test_four_cases_have_identified_scans_and_evidence(self):
        data = json.loads((SOURCE / 'cases.json').read_text())['cases']
        self.assertEqual({c['id'] for c in data}, {'california', 'frisland', 'kong', 'terra-australis'})
        html = (PUBLIC / 'index.html').read_text()
        for case in data:
            self.assertEqual(len(case['input_sha256']), 64)
            self.assertTrue(case['holder'])
            self.assertTrue(case['rights'])
            self.assertGreaterEqual(len(case['sources']), 2)
            self.assertIn(f'id="{case["id"]}"', html)
            self.assertTrue(case['limit'])
            self.assertIn(case['download'].split('://')[0], ['https'])


if __name__ == '__main__':
    unittest.main()
