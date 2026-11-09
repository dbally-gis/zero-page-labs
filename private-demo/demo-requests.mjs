import { randomBytes } from 'node:crypto';

export const pendingRequest = row => Boolean(row.request && row.expires === 0);
export const validRequestEmail = email => typeof email === 'string' && email.length <= 160 &&
  /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(email);

function requestPage(message, received = false) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>COME AT ME! Demo request</title>
<style>
  :root { color-scheme: light; background: #f4f1e9; color: #182230; font: 16px/1.5 system-ui, sans-serif; }
  body { max-width: 36rem; margin: 0 auto; padding: clamp(1rem, 6vw, 3rem); }
  main { background: #fffbf0; padding: clamp(1rem, 5vw, 2rem); border-top: 6px solid #a13221; }
  small { color: #7d2d20; font-weight: 750; letter-spacing: .12em; }
  h1 { font-size: clamp(2rem, 7vw, 3rem); line-height: 1.05; letter-spacing: -.045em; margin: .4em 0; }
  form, label { display: grid; gap: .4rem; }
  form { gap: .9rem; }
  input, textarea, button { font: inherit; min-width: 0; padding: .55rem; border: 1px solid #8b8070; border-radius: .25rem; }
  textarea { resize: vertical; }
  button { justify-self: start; background: #8c2e20; border-color: #8c2e20; color: white; cursor: pointer; }
  a, [role=alert] { color: #7d2d20; }
  :focus-visible { outline: 3px solid #255683; outline-offset: 2px; }
</style>
</head>
<body><main>
<small>ZERO PAGE LABS / COME AT ME!</small>
<h1>${received ? 'Request received' : 'Request the playable demo'}</h1>
${received ? '<p>Daniel will review your request and email you an invite if it’s approved.</p>' : `
<p>Tell Daniel how to reach you if he can share an invite. Your details go to the private review queue.</p>
${message ? `<p role="alert">${message}</p>` : ''}
<form action="/request" method="post">
  <label>Name <input name="name" autocomplete="name" maxlength="100" required></label>
  <label>Email <input name="email" type="email" autocomplete="email" maxlength="160" required></label>
  <label>What brings you here? (Optional) <textarea name="note" rows="3" maxlength="300" placeholder="Playtesting, publisher review, or something else"></textarea></label>
  <div hidden><label>Website <input name="website" autocomplete="off" tabindex="-1"></label></div>
  <button>Send request</button>
</form>`}
<p><a href="https://zeropagelabs.com/experiments/come-at-me/">Back to COME AT ME!</a></p>
</main></body></html>`;
}

export function demoRequests({ store, origin, send, security }) {
  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    'Referrer-Policy': 'same-origin',
    'Content-Security-Policy': security.replace("form-action 'none'", "form-action 'self'") + "; style-src 'unsafe-inline'",
  };
  const received = response => send(response, 303, undefined, { Location: '/request/received' });
  const recentAttempts = [];
  return async (request, response) => {
    if (request.method === 'GET') {
      return send(response, 200, requestPage(null, request.url === '/request/received'), headers);
    }
    if (request.method !== 'POST' || request.url !== '/request') return send(response, 405, 'Method unavailable.');
    if (request.headers.origin !== origin) return send(response, 403, 'Open the request form to submit.');
    if (request.headers['content-type'] !== 'application/x-www-form-urlencoded') {
      return send(response, 415, 'Open the request form to submit.');
    }
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 8192) return send(response, 413, 'The request is too long.');
      chunks.push(chunk);
    }
    const form = new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
    if (form.get('website')) return received(response);
    const label = (form.get('name') ?? '').trim();
    const email = (form.get('email') ?? '').trim();
    const note = (form.get('note') ?? '').trim();
    if (!label || label.length > 100 || !validRequestEmail(email) || note.length > 300) {
      return send(response, 400, requestPage('Enter a name, a valid email address, and a note of up to 300 characters.'), headers);
    }

    const now = Date.now();
    while (recentAttempts.length && recentAttempts[0] <= now - 60_000) recentAttempts.shift();
    if (recentAttempts.length >= 12) {
      return send(response, 429, requestPage('Too many requests just now. Please try again in a minute.'), { ...headers, 'Retry-After': '60' });
    }
    recentAttempts.push(now);

    const row = { id: randomBytes(16).toString('hex'), label, expires: 0, revoked: true, request: { email, note } };
    const result = await store.update(records => {
      const pending = records.filter(pendingRequest);
      if (pending.some(item => item.request.email.toLowerCase() === email.toLowerCase())) return { changed: false };
      if (pending.length >= 60) return { changed: false, full: true };
      records.push(row);
      return { changed: true };
    });
    if (result.full) return send(response, 503, requestPage('The request queue is full. Please try again later.'), headers);
    return received(response);
  };
}
