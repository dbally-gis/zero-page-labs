"""Evidence coverage and recovery failure contracts for Map Monsters."""
from pathlib import Path
import hashlib
import io
import json
import sys
import tempfile
import unittest
from unittest.mock import patch
import urllib.error

import rebuild_map_monsters as build


class SourceContract(unittest.TestCase):
    def test_montfort_uses_institutional_original_with_title_evidence(self):
        manifest = json.loads((build.BASE / 'manifest.json').read_text())
        crops = json.loads((build.BASE / 'build/crops.json').read_text())
        source = manifest['sources'][crops['kraken_1801']['src']]
        self.assertEqual(source['download_url'], 'https://archive.org/download/Histoirenaturel2Deny/page/n294_w2000.jpg')
        self.assertEqual(source['sha256'], 'ecfc9d5ceece34a151359db448413ab727dedb3500ca265a30dc63cf65c2f791')
        evidence = source['edition_evidence']
        self.assertIn('AN X', evidence['title_page_transcription'])
        self.assertIn('DUFART', evidence['title_page_transcription'])
        self.assertEqual(evidence['reader_index'], 294)
        self.assertEqual(evidence['scandata_leaf'], 295)
        self.assertIn('XXVI', evidence['plate_transcription'])
        self.assertIn('/page/n4/', evidence['title_page'])

    def test_captions_match_plate_renderers(self):
        sys.path.insert(0, str(build.BASE / 'build'))
        import plate
        import plates
        cells = json.loads((build.BASE / 'manifest.json').read_text())['cells']
        expected = {c['id']: (c['caption'], c['detail']) for c in cells}
        for rows in [plate.ROWS, *[p['rows'] for p in plates.PLATES.values()]]:
            for _, entries in rows:
                for entry in entries:
                    if isinstance(entry, tuple):
                        self.assertEqual(expected[entry[0][0]], (entry[2], entry[3]))

    def test_manifest_covers_each_crop_once(self):
        manifest = json.loads((build.BASE / 'manifest.json').read_text())
        crops = json.loads((build.BASE / 'build/crops.json').read_text())
        covered = [key for cell in manifest['cells'] for key in cell['crops']]
        self.assertEqual(set(covered), set(crops))
        self.assertEqual(len(covered), len(set(covered)))
        self.assertEqual({c['src'] for c in crops.values()}, set(manifest['sources']))
        for source in manifest['sources'].values():
            self.assertTrue(source['download_url'].startswith('https://'))
            self.assertEqual(len(source['sha256']), 64)
            self.assertTrue(source['rights'])

    def test_bad_download_does_not_replace_previous_file(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'scan.jpg'
            target.write_bytes(b'previous')
            with patch('urllib.request.urlopen', return_value=io.BytesIO(b'changed')):
                with self.assertRaisesRegex(ValueError, 'checksum differs'):
                    build.fetch('https://example.org/scan.jpg', target, '0' * 64)
            self.assertEqual(target.read_bytes(), b'previous')

    def test_verified_download_is_saved(self):
        data = b'source bytes'
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'new' / 'scan.jpg'
            with patch('urllib.request.urlopen', return_value=io.BytesIO(data)):
                build.fetch('https://example.org/scan.jpg', target, hashlib.sha256(data).hexdigest())
            self.assertEqual(target.read_bytes(), data)

    def test_permanent_error_is_not_retried(self):
        error = urllib.error.HTTPError('https://example.org', 404, 'missing', {}, None)
        with patch('urllib.request.urlopen', side_effect=error) as call:
            with self.assertRaises(urllib.error.HTTPError):
                build.fetch('https://example.org/scan.jpg', Path('/unused'), '0' * 64)
            self.assertEqual(call.call_count, 1)

    def test_transient_errors_terminate(self):
        error = urllib.error.HTTPError('https://example.org', 503, 'busy', {}, None)
        with patch('urllib.request.urlopen', side_effect=error) as call, patch('time.sleep'):
            with self.assertRaises(urllib.error.HTTPError):
                build.fetch('https://example.org/scan.jpg', Path('/unused'), '0' * 64, attempts=2)
            self.assertEqual(call.call_count, 2)


if __name__ == '__main__':
    unittest.main()
