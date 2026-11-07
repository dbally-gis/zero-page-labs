"""Failure-path checks for catalog completeness and read-only asset acquisition."""
from io import BytesIO
from urllib.error import HTTPError
import struct
import unittest
from sync_catalog import fetch, native_size, catalog_errors

class CatalogTests(unittest.TestCase):
    def test_transient_retries_then_returns_body(self):
        calls = []
        waits = []
        def opener(request, timeout):
            calls.append(timeout)
            if len(calls) == 1:
                raise HTTPError(request.full_url, 429, 'Limited', {'Retry-After': '2'}, None)
            return BytesIO(b'ok')
        self.assertEqual(fetch('https://apps.repebble.com/example', opener, waits.append), b'ok')
        self.assertEqual(calls, [25, 25])
        self.assertEqual(waits, [2])
    def test_auth_failure_is_not_retried(self):
        calls = []
        def opener(request, timeout):
            calls.append(1)
            raise HTTPError(request.full_url, 403, 'Forbidden', {}, None)
        with self.assertRaises(HTTPError):
            fetch('https://apps.repebble.com/example', opener)
        self.assertEqual(len(calls), 1)
    def test_retries_terminate(self):
        calls = []
        def opener(request, timeout):
            calls.append(1)
            raise HTTPError(request.full_url, 503, 'Busy', {}, None)
        with self.assertRaises(HTTPError):
            fetch('https://apps.repebble.com/example', opener, lambda _: None)
        self.assertEqual(len(calls), 4)
    def test_missing_published_face_is_rejected(self):
        snapshot = {'entries': [{'url': 'https://apps.repebble.com/a_aaa', 'category': 'Faces'}, {'url': 'https://apps.repebble.com/b_bbb', 'category': 'Faces'}, {'url': 'https://apps.repebble.com/app_ccc', 'category': 'Tools & Utilities'}]}
        faces = [{'url': 'https://apps.repebble.com/a_aaa'}]
        self.assertTrue(catalog_errors(faces, snapshot))
        faces.append({'url': 'https://apps.repebble.com/b_bbb'})
        self.assertEqual(catalog_errors(faces, snapshot), [])
    def test_native_dimensions_and_invalid_body(self):
        self.assertEqual(native_size(b'GIF89a' + struct.pack('<HH', 200, 228)), (200, 228))
        with self.assertRaises(ValueError): native_size(b'<html>error</html>')

if __name__ == '__main__': unittest.main()
