"""Automatic discovery, transaction-boundary, and deployment regression checks."""
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch
from io import BytesIO
import struct
import contextlib
import json
import shutil
import unittest
from urllib.error import URLError
import discover_catalog as discovery
import sync_catalog as sync
import build_site as builder
import deploy_catalog as deployment

REPO = Path(__file__).resolve().parents[1]
(REPO / '.tmp').mkdir(exist_ok=True)
A, B = 'a'*24, 'b'*24
COMMIT = 'c'*40


def app(app_id=A, title='Existing Face', description='A clear digital clock.'):
    return {'id': app_id, 'title': title, 'category': 'Faces', 'type': 'watchface',
            'description': description, 'developer_id': discovery.DEVELOPER_ID, 'visible': True,
            'screenshot_images': [], 'hardware_platforms': [], 'latest_release': {'version': '1.0'}}


def html(apps, page=1, more=False, developer=discovery.DEVELOPER_ID, prefix=''):
    props = {'initialApps': apps, 'initialHasNextPage': more, 'developerName': 'Daniel Bally', 'developerId': developer, 'pageNum': page}
    flight = prefix + '5:["$","$Le",null,' + json.dumps(props, ensure_ascii=False) + ']\n'
    return '<script>self.__next_f.push(' + json.dumps([1, flight], ensure_ascii=False) + ')</script>'


def snapshot(entries):
    return {'source': discovery.SOURCE, 'observedAt': '2026-11-07', 'pagination': {'loadedPages': 1, 'entries': len(entries), 'reachedBottom': True}, 'entries': entries}


class DiscoveryTests(unittest.TestCase):
    def test_pagination_to_explicit_terminal_page(self):
        urls=[]
        def fetch(url):
            urls.append(url)
            return (html([app(A)], more=True) if len(urls)==1 else html([app(B)], page=2)).encode()
        result=discovery.discover(fetch)
        self.assertEqual(len(result['entries']),2)
        self.assertTrue(result['pagination']['reachedBottom'])
        self.assertTrue(urls[1].endswith('?page=2'))
    def test_wrong_owner_and_wrong_page_are_rejected(self):
        with self.assertRaises(ValueError): discovery.parse_page(html([app()], developer='x'*24),1)
        with self.assertRaises(ValueError): discovery.parse_page(html([app()],page=2),1)
    def test_duplicate_pages_are_rejected(self):
        calls=[]
        def fetch(url):
            calls.append(1);return html([app()],page=len(calls),more=len(calls)==1).encode()
        with self.assertRaises(ValueError): discovery.discover(fetch)
    def test_incomplete_or_unbounded_source_is_rejected(self):
        with self.assertRaises(ValueError): discovery.discover(lambda _:b'<html>maintenance</html>')
        with self.assertRaises(ValueError): discovery.discover(lambda _:html([],more=True).encode())
        def fetch(url):
            page=1 if '?page=' not in url else int(url.rsplit('=',1)[-1])
            return html([app(f'{page:024x}')],page=page,more=True).encode()
        with self.assertRaises(ValueError): discovery.discover(fetch,max_pages=2)
    def test_utf8_text_reference_is_resolved_by_byte_length(self):
        description='Café — a clear time.\nSecond line.'
        prefix='12:T'+format(len(description.encode()),'x')+','+description
        entries,_=discovery.parse_page(html([app(description='$12')],prefix=prefix),1)
        self.assertEqual(entries[0]['description'],description)


class SyncTests(unittest.TestCase):
    def test_truncated_previews_are_rejected(self):
        png = b'\x89PNG\r\n\x1a\n' + b'\x00'*8 + struct.pack('>II', 200, 228)
        gif = b'GIF89a' + struct.pack('<HH', 200, 228)
        self.assertEqual(sync.native_size(png), (200, 228))
        for payload in (png, gif):
            with self.assertRaises(ValueError): sync.validate_preview(payload)

    def test_unchanged_snapshot_ignores_observation_date(self):
        entries,_=discovery.parse_page(html([app()]),1)
        with TemporaryDirectory(dir=REPO/'.tmp') as temp:
            root=Path(temp);(root/'data').mkdir();old=snapshot(entries)
            path=root/'data/developer-catalog.json';path.write_text(json.dumps(old));original=path.read_bytes()
            new=dict(old,observedAt='2026-11-08')
            with patch.object(sync,'ROOT',root),patch.object(discovery,'discover',return_value=new),patch.object(sync,'fetch') as fetch:
                self.assertFalse(sync.sync(refresh=True))
                fetch.assert_not_called()
            self.assertEqual(path.read_bytes(),original)
    def test_failed_preview_keeps_catalog_files_unchanged(self):
        entries,_=discovery.parse_page(html([app()]),1)
        new_entries,_=discovery.parse_page(html([app(),app(B,'New Face')]),1)
        with TemporaryDirectory(dir=REPO/'.tmp') as temp:
            root=Path(temp);(root/'data').mkdir();(root/'assets').mkdir()
            first=root/'data/developer-catalog.json';first.write_text(json.dumps(snapshot(entries)))
            second=root/'data/watchfaces.json';second.write_text('[]')
            before=(first.read_bytes(),second.read_bytes())
            with patch.object(sync,'ROOT',root),patch.object(discovery,'discover',return_value=snapshot(new_entries)),patch.object(sync,'fetch',return_value=b'<html>bad preview</html>'):
                with self.assertRaises(ValueError):sync.sync(refresh=True)
            self.assertEqual((first.read_bytes(),second.read_bytes()),before)
    def test_new_face_builds_without_manual_classification(self):
        entries,_=discovery.parse_page(html([app(),app(B,'New Face')]),1)
        with TemporaryDirectory(dir=REPO/'.tmp') as temp:
            root=Path(temp)
            for directory in ('assets','src','thumbwords','watchfaces','gridcore','data','experiments'):
                shutil.copytree(REPO/directory,root/directory)
            shutil.copytree(REPO/'experiments-source',root/'experiments-source',ignore=shutil.ignore_patterns('node_modules'))
            for name in ('index.html','style.css','robots.txt','sitemap.xml','404.html'):
                shutil.copyfile(REPO/name,root/name)
            (root/'data/developer-catalog.json').write_text(json.dumps(snapshot(entries[:1])))
            faces=[]
            sample=next((root/'assets').glob('catalog-*.png'))
            for entry in entries:
                faces.append({'name':entry['name'],'slug':entry['name'].lower().replace(' ','-'),'url':entry['url'],'image':'/assets/'+sample.name,'style':'Other','description':entry['description']})
            (root/'data/watchfaces.json').write_text(json.dumps(faces[:1]))
            payload = sample.read_bytes()
            def fetch(url):
                if url.startswith('https://assets.repebble.com/'):
                    return payload
                return f'<html>https://assets.repebble.com/screenshots/{B}/emery/11111111-1111-1111-1111-111111111111.png</html>'.encode()
            with patch.object(sync,'ROOT',root),patch.object(discovery,'discover',return_value=snapshot(entries)),patch.object(sync,'fetch',side_effect=fetch):
                self.assertTrue(sync.sync(refresh=True))
            with patch.object(builder,'ROOT',root),patch.dict('os.environ',{'RENDER_GIT_COMMIT':COMMIT}):builder.build()
            output=(root/'dist/watchfaces/index.html').read_text()
            self.assertIn('New Face',output)
            self.assertIn('data-filter="Other"',output)
            self.assertIn('>2 faces<',output)


class Response(BytesIO):
    status=200


class DeploymentTests(unittest.TestCase):
    def test_unchanged_output_does_not_use_hook(self):
        with TemporaryDirectory(dir=REPO/'.tmp') as temp:
            root=Path(temp);(root/'dist').mkdir();expected={'content_sha256':'same','watchfaces':34}
            (root/'dist/deployment.json').write_text(json.dumps(expected));calls=[]
            def opener(request,timeout):
                calls.append(request.full_url);return Response(json.dumps(expected).encode())
            with patch.object(deployment,'ROOT',root),patch.object(deployment.subprocess,'check_output',return_value=COMMIT):
                result=deployment.deploy(opener=opener)
            self.assertEqual(result['event'],'deployment_unchanged')
            self.assertEqual(calls,[deployment.STATUS_URL])
    def test_deploy_hook_is_service_scoped_and_commit_pinned(self):
        hook=f'https://api.render.com/deploy/{deployment.SERVICE}?key=PRIVATE'
        request=deployment.hook_request(hook,COMMIT)
        self.assertEqual(request.get_method(),'POST')
        self.assertIn('ref='+COMMIT,request.full_url)
        with self.assertRaises(ValueError):deployment.hook_request('https://example.com/?key=PRIVATE',COMMIT)
    def test_ambiguous_deploy_request_is_not_retried_or_leaked(self):
        with TemporaryDirectory(dir=REPO/'.tmp') as temp:
            root=Path(temp);(root/'dist').mkdir();(root/'dist/deployment.json').write_text(json.dumps({'content_sha256':'new','watchfaces':34}));posts=[]
            def opener(request,timeout):
                if request.get_method()=='POST':
                    posts.append(1);raise URLError('secret URL must never be printed')
                return Response(b'{}')
            with patch.object(deployment,'ROOT',root),patch.object(deployment.subprocess,'check_output',return_value=COMMIT),patch.dict('os.environ',{'RENDER_DEPLOY_HOOK_URL':f'https://api.render.com/deploy/{deployment.SERVICE}?key=PRIVATE'}):
                with self.assertRaises(RuntimeError) as error:deployment.deploy(opener=opener)
            self.assertEqual(len(posts),1)
            self.assertNotIn('PRIVATE',str(error.exception))
            self.assertNotIn('secret URL',str(error.exception))

if __name__=='__main__':unittest.main()
