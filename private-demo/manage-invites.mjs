import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { signInvite, validInviteId } from './invites.mjs';

const keyFile = new URL('../.tmp/come-at-me-signing-key', import.meta.url);
const ledgerFile = new URL('../.tmp/come-at-me-invites.jsonl', import.meta.url);
const demo = 'https://come-at-me-playtest.onrender.com/';
const [command, recipient, expiration] = process.argv.slice(2);

function readLedger() {
  return existsSync(ledgerFile)
    ? readFileSync(ledgerFile, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line))
    : [];
}

function addRecord(record) {
  appendFileSync(ledgerFile, JSON.stringify(record) + '\n', { mode: 0o600 });
}

function expirationSeconds(input) {
  const days = /^([1-9][0-9]*)d$/.exec(input ?? '');
  const timestamp = days
    ? Date.now() + Number(days[1]) * 86_400_000
    : /T.*(?:Z|[+-][0-9]{2}:[0-9]{2})$/.test(input ?? '') ? Date.parse(input) : NaN;
  const seconds = Math.floor(timestamp / 1000);
  if (!Number.isSafeInteger(seconds) || seconds <= Math.floor(Date.now() / 1000) || seconds >= 1e12) {
    throw new Error('Enter a future expiration as 7d or an ISO date with time zone.');
  }
  return seconds;
}

try {
  const ledger = readLedger();
  const revoked = new Set(ledger.filter(record => record.action === 'revoke').map(record => record.id));
  const issued = ledger.filter(record => record.action === 'issue');
  if (command === 'issue' && recipient?.trim()) {
    const expires = expirationSeconds(expiration);
    const hex = readFileSync(keyFile, 'utf8').trim();
    if (!/^[a-f0-9]{64}$/.test(hex)) throw new Error('The owner signing key is invalid.');
    const { id, token } = signInvite(Buffer.from(hex, 'hex'), expires);
    addRecord({ action: 'issue', id, recipient: recipient.trim(), expires });
    console.log(`Invite ID: ${id}\nExpires: ${new Date(expires * 1000).toISOString()}\n${demo}#${token}`);
  } else if (command === 'revoke' && validInviteId(recipient ?? '') && issued.some(record => record.id === recipient)) {
    if (!revoked.has(recipient)) addRecord({ action: 'revoke', id: recipient });
    revoked.add(recipient);
    console.log('Replace DEMO_REVOKED_IDS in Render with the full value below, then save and deploy.');
    console.log([...revoked].join(','));
  } else if (command === 'list') {
    for (const { id, recipient: label, expires } of issued) {
      const status = revoked.has(id) ? 'revocation recorded locally' : expires * 1000 <= Date.now() ? 'expired' : 'issued';
      console.log(`${id}  ${new Date(expires * 1000).toISOString()}  ${status}  ${label}`);
    }
  } else {
    throw new Error('Usage: manage-invites.mjs issue "Recipient" 7d | list | revoke INVITE_ID');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
