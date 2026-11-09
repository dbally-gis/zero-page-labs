import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const format = /^([a-f0-9]{32})\.([1-9][0-9]{0,11})\.([A-Za-z0-9_-]{43})$/;
export const validInviteId = id => /^[a-f0-9]{32}$/.test(id);

function signature(key, claims) {
  return createHmac('sha256', key).update('come-at-me-invite-v1:').update(claims).digest('base64url');
}

export function signInvite(key, expires, id = randomBytes(16).toString('hex')) {
  const claims = `${id}.${expires}`;
  return { id, token: `${claims}.${signature(key, claims)}` };
}

export function secondsRemaining(token, key, revoked, now = Math.floor(Date.now() / 1000)) {
  const match = format.exec(token ?? '');
  if (!key || !match) return 0;

  const [, id, expiration, provided] = match;
  const remaining = Number(expiration) - now;
  if (remaining <= 0 || revoked.has(id)) return 0;
  const expected = signature(key, `${id}.${expiration}`);
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected)) ? remaining : 0;
}
