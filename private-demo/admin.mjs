import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { secondsRemaining, signInvite, validInviteId } from './invites.mjs';

const empty = new Set();
const maxSessionSeconds = 8 * 3600;
const cookieName = '__Secure-cam-owner';
const page = readFileSync(new URL('./admin.html', import.meta.url));
const script = readFileSync(new URL('./admin.js', import.meta.url));

async function jsonBody(request) {
  if (request.headers['content-type'] !== 'application/json') return null;
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 4096) return null;
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

export function inviteAdmin({ store, signingKey, passwordHash, origin, revoked, send, security }) {
  const sessionKey = createHmac('sha256', signingKey).update('come-at-me-owner-session-v1:').update(passwordHash).digest();
  const cookie = (value, age) => `${cookieName}=${value}; Path=/admin; Secure; HttpOnly; SameSite=Strict; Max-Age=${age}`;
  const reply = (response, code, value, headers) => send(response, code, JSON.stringify(value), {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });
  const error = (response, code, message) => reply(response, code, { message });
  const present = row => {
    const status = row.revoked || revoked.has(row.id) ? 'Revoked' :
      row.expires <= Date.now() / 1000 ? 'Expired' : 'Active';
    return {
      ...row,
      status,
      url: status === 'Active' ? `${origin}/#${signInvite(signingKey, row.expires, row.id).token}` : null,
    };
  };

  return async function serveAdmin(request, response) {
    const { method, url } = request;
    if (method === 'GET' && url === '/admin') {
      return send(response, 200, page, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': `${security}; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'`,
      });
    }
    if (method === 'GET' && url === '/admin/client.js') {
      return send(response, 200, script, { 'Content-Type': 'text/javascript; charset=utf-8' });
    }
    if (method === 'POST' && request.headers.origin !== origin) return error(response, 403, 'Invalid request origin.');
    if (method === 'POST' && url === '/admin/login') {
      const body = await jsonBody(request);
      if (typeof body?.password !== 'string') return error(response, 400, 'Enter the admin password.');
      const actual = createHash('sha256').update(body.password).digest();
      if (!timingSafeEqual(actual, passwordHash)) return error(response, 401, 'That password did not match.');
      const { token } = signInvite(sessionKey, Math.floor(Date.now() / 1000) + maxSessionSeconds);
      return reply(response, 200, {}, { 'Set-Cookie': cookie(token, maxSessionSeconds) });
    }

    const session = /(?:^|;\s*)__Secure-cam-owner=([^;]*)/.exec(request.headers.cookie ?? '')?.[1];
    if (!secondsRemaining(session, sessionKey, empty)) return error(response, 401, 'Sign in to manage invitations.');
    if (method === 'POST' && url === '/admin/logout') {
      return reply(response, 200, {}, { 'Set-Cookie': cookie('', 0) });
    }
    if (method === 'GET' && url === '/admin/invites') {
      const records = await store.list();
      return reply(response, 200, records.slice().reverse().map(present));
    }
    if (method === 'POST' && url === '/admin/invites') {
      const body = await jsonBody(request);
      const label = typeof body?.label === 'string' ? body.label.trim() : '';
      const expires = typeof body?.expires === 'string' ? Math.floor(Date.parse(body.expires) / 1000) : NaN;
      if (!label || label.length > 100 || !Number.isSafeInteger(expires) ||
          expires <= Date.now() / 1000 || expires > 999999999999) {
        return error(response, 400, 'Enter a recipient label and a future expiration.');
      }
      const { id } = signInvite(signingKey, expires);
      const row = { id, label, expires, revoked: false };
      await store.update(records => {
        records.push(row);
        return { changed: true };
      });
      return reply(response, 201, present(row));
    }
    if (method === 'POST' && url === '/admin/revoke') {
      const body = await jsonBody(request);
      if (typeof body?.id !== 'string' || !validInviteId(body.id)) return error(response, 400, 'Invalid invite ID.');
      const result = await store.update(records => {
        const row = records.find(record => record.id === body.id);
        if (!row || row.revoked) return { changed: false, row };
        row.revoked = true;
        return { changed: true, row };
      });
      if (!result.row) return error(response, 404, 'Invite not found.');
      return reply(response, 200, present(result.row));
    }
    return error(response, 404, 'Page unavailable.');
  };
}
