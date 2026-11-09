import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { gunzipSync } from 'node:zlib';
import { secondsRemaining, validInviteId } from './invites.mjs';
import { githubInviteStore } from './invite-store.mjs';
import { inviteAdmin } from './admin.mjs';
import { demoRequests } from './demo-requests.mjs';

function configuredKey(name) {
  const value = process.env[name];
  if (!value) return null;
  if (!/^[a-f0-9]{64}$/.test(value)) throw new Error(`Invalid ${name} configuration.`);
  return Buffer.from(value, 'hex');
}

const legacyHash = configuredKey('DEMO_TOKEN_SHA256');
const signingKey = configuredKey('DEMO_SIGNING_KEY');
if (!legacyHash && !signingKey) throw new Error('Configure an invitation key.');

const revoked = new Set((process.env.DEMO_REVOKED_IDS ?? '').split(',').map(id => id.trim()).filter(Boolean));
if ([...revoked].some(id => !validInviteId(id))) throw new Error('Invalid DEMO_REVOKED_IDS configuration.');

const packed = readFileSync(process.env.DEMO_FILE ?? '/etc/secrets/come-at-me.b64', 'utf8');
const game = gunzipSync(Buffer.from(packed, 'base64'), { maxOutputLength: 1_000_000 });
const sessionLimit = 86_400;
const maxTokenLength = 89;

async function sessionSeconds(token) {
  if (legacyHash && /^[A-Za-z0-9_-]{43}$/.test(token ?? '')) {
    const actual = createHash('sha256').update(token).digest();
    return timingSafeEqual(actual, legacyHash) ? sessionLimit : 0;
  }
  const validFor = secondsRemaining(token, signingKey, revoked);
  if (validFor || !store) return Math.min(sessionLimit, validFor);
  if (!secondsRemaining(token, browserInviteKey, revoked)) return 0;
  const [id, expires] = token.split('.', 2);
  const records = await store.list();
  if (!records.some(row => row.id === id && row.expires === Number(expires) && !row.revoked)) return 0;
  return Math.min(sessionLimit, secondsRemaining(token, browserInviteKey, revoked));
}

const client = `
const status = document.querySelector('#status');
const token = location.hash.slice(1);
if (token) {
  history.replaceState(null, '', '/');
  status.textContent = 'Checking your invitation…';
  fetch('/unlock', { method: 'POST', body: token, redirect: 'error' })
    .then(response => {
      if (response.ok) location.replace('/play');
      else status.textContent = 'This invitation could not be accepted. Ask Daniel for a current link.';
    })
    .catch(() => { status.textContent = 'The demo could not be reached. Reopen your invite link to try again.'; });
}
`;
const clientHash = createHash('sha256').update(client).digest('base64');
const landing = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>COME AT ME | Private playtest</title>
<style>
  body { margin: 0; padding: 24px; min-height: 90vh; display: grid; place-items: center; background: #f4f1e9; color: #182230; font: 17px/1.5 system-ui, sans-serif; }
  main { max-width: 36rem; padding: clamp(24px, 6vw, 48px); background: #fff8e8; border-top: 6px solid #b53825; }
  h1 { font-size: clamp(32px, 7vw, 64px); line-height: .9; margin: 12px 0 24px; letter-spacing: -.065em; }
  a { color: #8d2f1e; }
</style></head>
<body><main><small>ZERO PAGE LABS / INVITE-ONLY PLAYTEST</small>
<h1>COME AT ME!</h1>
<p id="status" role="status">Open the invitation link Daniel shared with you to play.</p>
<noscript><p>Enable JavaScript to open the browser prototype.</p></noscript>
<p><a href="https://zeropagelabs.com/experiments/come-at-me/#request-demo">Request the playable demo</a></p>
</main><script>${client}</script></body></html>`;

const security = "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'";
const landingPolicy = `${security}; script-src 'sha256-${clientHash}'; style-src 'unsafe-inline'; connect-src 'self'`;
const gamePolicy = `${security}; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:`;

function send(response, code, body, headers = {}) {
  response.writeHead(code, {
    'Cache-Control': 'no-store, private',
    'Content-Type': 'text/plain; charset=utf-8',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow',
    'Content-Security-Policy': security,
    ...headers,
  });
  response.end(body);
}

const adminHash = configuredKey('DEMO_ADMIN_SHA256');
const store = adminHash && signingKey ? githubInviteStore(
  process.env.DEMO_LEDGER_REPO ?? '', process.env.DEMO_LEDGER_TOKEN,
) : null;
const browserInviteKey = store && createHmac('sha256', signingKey).update('come-at-me-browser-invites-v1').digest();
const origin = process.env.DEMO_ADMIN_ORIGIN ?? 'https://come-at-me-playtest.onrender.com';
const requests = store && demoRequests({ store, origin, send, security });
const admin = store && inviteAdmin({
  store, signingKey: browserInviteKey, passwordHash: adminHash, revoked, send, security,
  origin,
});

async function serve(request, response) {
  if (requests && (request.url === '/request' || request.url === '/request/received')) {
    return requests(request, response);
  }
  if (admin && (request.url === '/admin' || request.url.startsWith('/admin/'))) {
    return admin(request, response);
  }
  if (request.method === 'GET' && request.url === '/health') return send(response, 200, 'OK');
  if (request.method === 'GET' && request.url === '/') {
    return send(response, 200, landing, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': landingPolicy,
    });
  }
  if (request.method === 'GET' && request.url === '/play') {
    const cookie = /(?:^|;\s*)__Secure-cam=([^;]*)/.exec(request.headers.cookie ?? '')?.[1];
    if (!await sessionSeconds(cookie)) return send(response, 403, 'Open the private invitation link to play.');
    return send(response, 200, game, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': gamePolicy,
    });
  }
  if (request.method === 'POST' && request.url === '/unlock') {
    let token = '';
    for await (const chunk of request) {
      token += chunk.toString('utf8');
      if (token.length > maxTokenLength) return send(response, 413, 'Invalid invitation.');
    }
    const maxAge = await sessionSeconds(token);
    if (!maxAge) return send(response, 403, 'Invalid invitation.');
    return send(response, 204, undefined, {
      'Set-Cookie': `__Secure-cam=${token}; Path=/play; Secure; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`,
    });
  }
  send(response, 404, 'Page unavailable.');
}

const server = createServer({ requestTimeout: 15_000 }, (request, response) => {
  serve(request, response).catch(() => {
    if (!response.headersSent) send(response, 503, 'Request temporarily unavailable. Try again.');
  });
});
server.listen(Number(process.env.PORT ?? 10000), process.env.DEMO_BIND_HOST ?? '0.0.0.0');
