import { createHmac, timingSafeEqual } from 'node:crypto';
import { validInviteId } from './invites.mjs';

export const inviteEmailSubject = 'Your COME AT ME! playtest invite';

export function validMailId(id) {
  return typeof id === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id);
}

export function applyMailEvent(row, { status, at }) {
  const prior = row.delivery.outcome;
  if (prior && (prior.at > at || (prior.at === at && (prior.status === status || prior.status === 'bounced')))) {
    return false;
  }
  row.delivery.outcome = { status, at };
  return true;
}

export function resendMailEvents({ secret, from, store, send }) {
  if (!secret) return null;
  if (!/^whsec_[A-Za-z0-9+/]+={0,2}$/.test(secret)) throw new Error('Invalid Resend signing secret.');
  const key = Buffer.from(secret.slice(6), 'base64');
  if (key.length < 16) throw new Error('Invalid Resend signing secret.');
  const sender = from?.match(/<([^>]+)>$/)?.[1] ?? from;
  return async (request, response) => {
    if (request.method !== 'POST') return send(response, 405, 'Method unavailable.');
    const { 'svix-id': id, 'svix-timestamp': timestamp, 'svix-signature': signatures } = request.headers;
    if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,160}$/.test(id) ||
        typeof timestamp !== 'string' || !/^\d{1,12}$/.test(timestamp) ||
        Math.abs(Date.now() / 1000 - Number(timestamp)) > 300 || typeof signatures !== 'string') {
      return send(response, 401, 'Invalid webhook signature.');
    }
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 32_768) return send(response, 413, 'Webhook too large.');
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);
    const digest = createHmac('sha256', key).update(`${id}.${timestamp}.`).update(body).digest();
    const verified = signatures.split(' ').some(signature => {
      if (!/^v1,[A-Za-z0-9+/]{43}=$/.test(signature)) return false;
      return timingSafeEqual(digest, Buffer.from(signature.slice(3), 'base64'));
    });
    if (!verified) return send(response, 401, 'Invalid webhook signature.');

    let event;
    try {
      event = JSON.parse(body.toString('utf8'));
    } catch {
      return send(response, 400, 'Invalid webhook payload.');
    }
    if (event?.type !== 'email.delivered' && event?.type !== 'email.bounced') return send(response, 204);
    const data = event.data;
    const recipient = Array.isArray(data?.to) && data.to.length === 1 ? data.to[0] : null;
    const at = Date.parse(event.created_at);
    if (!validMailId(data?.email_id) || typeof recipient !== 'string' || !Number.isSafeInteger(at)) {
      return send(response, 400, 'Invalid webhook payload.');
    }
    const eventSender = typeof data.from === 'string' ? (data.from.match(/<([^>]+)>$/)?.[1] ?? data.from) : null;
    const isInvite = Boolean(sender && eventSender === sender && data.subject === inviteEmailSubject);
    const sameRecipient = row => row.request.email.toLowerCase() === recipient.toLowerCase();
    const result = await store.update(records => {
      const row = records.find(record => record.delivery?.mailId === data.email_id);
      if (row && sameRecipient(row)) {
        return { changed: applyMailEvent(row, { status: event.type.slice(6), at }) };
      }

      // A tagged event can reconcile the send even if its API response was lost.
      if (row || !isInvite) return { changed: false };
      const tag = data.tags?.invite_id;
      if (typeof tag === 'string' && validInviteId(tag)) {
        const tracked = records.find(record => record.id === tag && record.delivery?.tracking);
        if (!tracked || tracked.delivery.mailId || !sameRecipient(tracked)) return { changed: false };
        tracked.delivery.accepted = true;
        tracked.delivery.mailId = data.email_id;
        return { changed: applyMailEvent(tracked, { status: event.type.slice(6), at }) };
      }
      // A send started before tracking was enabled may still be saving its ID.
      const pending = records.some(record => record.delivery && !record.delivery.accepted &&
        record.delivery.started <= at + 300_000 && at - record.delivery.started <= 86_400_000 &&
        sameRecipient(record));
      return { changed: false, pending };
    });
    return result.pending ? send(response, 503, 'Invite email is still being recorded.') : send(response, 204);
  };
}
