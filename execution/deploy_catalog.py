#!/usr/bin/env python3
"""Deploy changed website output, then verify its public content fingerprint."""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
from urllib.error import HTTPError, URLError
import argparse
import json
import os
import re
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
STATUS_URL = 'https://zeropagelabs.com/deployment.json'
SERVICE = 'srv-dbnqdsu7bikc73d8r82g'


def public_status(opener=urlopen) -> dict:
    try:
        with opener(Request(STATUS_URL, headers={'User-Agent': 'ZeroPageLabsCatalog/1.0', 'Cache-Control': 'no-cache'}), timeout=20) as response:
            value = json.loads(response.read())
        return value if isinstance(value, dict) else {}
    except (HTTPError, URLError, TimeoutError, ValueError):
        return {}


def hook_request(hook: str, commit: str) -> Request:
    parts = urlsplit(hook)
    if parts.scheme != 'https' or parts.hostname != 'api.render.com' or parts.path != f'/deploy/{SERVICE}':
        raise ValueError('Invalid deployment hook destination')
    if not re.fullmatch(r'[a-f0-9]{40}', commit):
        raise ValueError('Invalid source commit')
    query = dict(parse_qsl(parts.query))
    if not query.get('key'):
        raise ValueError('Deployment hook credential missing')
    query['ref'] = commit
    return Request(urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), '')), data=b'', method='POST')


def deploy(force: bool = False, opener=urlopen, sleep=time.sleep, timeout: int = 900) -> dict:
    expected = json.loads((ROOT / 'dist/deployment.json').read_text())
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    if not force and public_status(opener).get('content_sha256') == expected['content_sha256']:
        return {'event': 'deployment_unchanged', 'watchfaces': expected['watchfaces']}
    # Environment values come from Actions secrets; optional local .env stays ignored.
    if (ROOT / '.env').is_file():
        from dotenv import load_dotenv
        load_dotenv(ROOT / '.env', override=True)
    hook = os.environ.get('RENDER_DEPLOY_HOOK_URL', '')
    if not hook:
        raise ValueError('RENDER_DEPLOY_HOOK_URL is not configured')
    request = hook_request(hook, commit)
    try:
        # A deployment POST is not blindly retried after an ambiguous timeout.
        with opener(request, timeout=30) as response:
            if response.status not in (200, 202):
                raise ValueError('Deploy was not accepted')
            result = json.loads(response.read())
    except (HTTPError, URLError, TimeoutError, ValueError):
        raise RuntimeError('Render deployment request failed; next scheduled run can recover') from None
    deploy_id = result.get('deploy', {}).get('id') or result.get('id')
    print(json.dumps({'event': 'deployment_started', 'deploy_id': deploy_id, 'commit': commit}), flush=True)
    elapsed = 0
    while elapsed < timeout:
        status = public_status(opener)
        if status.get('content_sha256') == expected['content_sha256'] and (not force or status.get('source_commit') == commit):
            return {'event': 'deployment_verified', 'commit': status.get('source_commit'), 'watchfaces': status.get('watchfaces')}
        sleep(15)
        elapsed += 15
    raise RuntimeError('Public deployment verification timed out; next scheduled run can recover')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--force', action='store_true')
    args = parser.parse_args()
    try:
        print(json.dumps(deploy(force=args.force)))
    except Exception as error:
        # Never print request URLs or exceptions that could contain the secret hook.
        print(json.dumps({'event': 'deployment_failed', 'error_type': type(error).__name__}), file=sys.stderr)
        sys.exit(1)
