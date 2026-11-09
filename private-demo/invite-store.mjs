import { validInviteId } from './invites.mjs';
import { pendingRequest, validRequestEmail } from './demo-requests.mjs';

const ledgerLimit = 2000;
const ledgerBytes = 500_000;

export function githubInviteStore(repo, token, fetcher = fetch) {
  if (!/^[\w-]+\/[\w.-]+$/.test(repo) || !token) throw new Error('Invalid invite storage configuration.');
  const endpoint = `https://api.github.com/repos/${repo}/contents/invites.json`;

  async function request(method, body) {
    return fetcher(endpoint, {
      method,
      body: body && JSON.stringify(body),
      redirect: 'error',
      signal: AbortSignal.timeout(3500),
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
  }

  async function read() {
    const response = await request('GET');
    if (!response.ok) throw new Error('Invite storage unavailable.');
    const file = await response.json();
    if (!/^[a-f0-9]{40}$/.test(file.sha) || file.encoding !== 'base64' || file.size > ledgerBytes) {
      throw new Error('Invalid invite ledger.');
    }
    const payload = Buffer.from(file.content, 'base64');
    if (payload.length > ledgerBytes) throw new Error('Invalid invite ledger.');
    const records = JSON.parse(payload.toString('utf8'));
    if (!Array.isArray(records) || records.length > ledgerLimit ||
        new Set(records.map(row => row?.id)).size !== records.length ||
        !records.every(row => row && validInviteId(row.id) && typeof row.label === 'string' &&
          row.label.length <= 100 && Number.isSafeInteger(row.expires) && typeof row.revoked === 'boolean' &&
          (row.request === undefined || (validRequestEmail(row.request?.email) &&
            typeof row.request.note === 'string' && row.request.note.length <= 300 &&
            (pendingRequest(row) ? row.revoked : row.expires > 0))))) {
      throw new Error('Invalid invite ledger.');
    }
    return { records, sha: file.sha };
  }

  return {
    async list() {
      return (await read()).records;
    },
    async update(change) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const { records, sha } = await read();
        const result = change(records);
        if (!result.changed) return result;
        const payload = Buffer.from(JSON.stringify(records) + '\n');
        if (records.length > ledgerLimit || payload.length > ledgerBytes) throw new Error('Invite ledger is full.');
        const response = await request('PUT', {
          message: 'Update private invite ledger',
          content: payload.toString('base64'),
          sha,
        });
        await response.body?.cancel();
        if (response.ok) return result;
        if (response.status !== 409) break;
      }
      throw new Error('Invite ledger update failed.');
    },
  };
}
