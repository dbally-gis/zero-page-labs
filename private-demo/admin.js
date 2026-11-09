const status = document.querySelector('#status');
const signIn = document.querySelector('#sign-in');
const manager = document.querySelector('#manager');
const login = document.querySelector('#login');
const create = document.querySelector('#create');
const invites = document.querySelector('#invites');
const requests = document.querySelector('#requests');
const output = document.querySelector('#output');
const link = document.querySelector('#link');
let shownId;

function signedOut() {
  manager.hidden = true;
  signIn.hidden = false;
  invites.replaceChildren();
  requests.replaceChildren();
  clearLink();
}

function clearLink() {
  shownId = undefined;
  output.hidden = true;
  link.value = '';
}

async function api(path, body) {
  const response = await fetch(`/admin/${path}`, body === undefined ? {} : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const value = await response.json().catch(() => null);
  if (response.status === 401 && path !== 'login') signedOut();
  if (!response.ok) throw new Error(value?.message ?? 'Could not reach invite storage. Try again.');
  return value;
}

async function run(button, work) {
  if (button) button.disabled = true;
  status.textContent = '';
  try {
    await work();
  } catch (error) {
    status.textContent = error.message;
  } finally {
    if (button) button.disabled = false;
  }
}

async function copy(url) {
  try {
    await navigator.clipboard.writeText(url);
    status.textContent = 'Invite link copied.';
  } catch {
    output.hidden = false;
    link.value = url;
    link.select();
    status.textContent = 'Select and copy the invite link from the field.';
  }
}

function showLink(row) {
  shownId = row.id;
  link.value = row.url;
  output.hidden = false;
}

function action(text, label, click) {
  const button = document.createElement('button');
  button.textContent = text;
  button.setAttribute('aria-label', label);
  button.addEventListener('click', click);
  return button;
}

async function refresh() {
  const [records, pending] = await Promise.all([api('invites'), api('requests')]);
  requests.replaceChildren(...pending.map(requestRow));
  document.querySelector('#no-requests').hidden = pending.length !== 0;
  const rows = records.map(row => {
    const item = document.createElement('li');
    const details = document.createElement('div');
    const name = document.createElement('strong');
    const meta = document.createElement('p');
    name.textContent = row.label;
    meta.textContent = `${row.status} · Expires ${new Date(row.expires * 1000).toLocaleString()}`;
    details.append(name, meta);
    if (row.request) {
      const contact = document.createElement('p');
      contact.textContent = row.request.email;
      details.append(contact);
    }
    item.append(details);
    if (row.emailStatus) {
      const delivery = document.createElement('p');
      const badge = document.createElement('strong');
      badge.className = 'delivery-status';
      badge.dataset.status = row.emailStatus;
      badge.textContent = row.emailStatus;
      delivery.append(badge);
      if (row.emailStatusAt) delivery.append(' · ' + new Date(row.emailStatusAt).toLocaleString());
      details.append(delivery);
    }
    if (row.status === 'Active') {
      const actions = document.createElement('div');
      actions.className = 'actions';
      actions.append(
        action('Copy link', `Copy link for ${row.label}`, () => {
          showLink(row);
          return copy(row.url);
        }),
        action('Revoke', `Revoke invite for ${row.label}`, event => {
          if (!confirm(`Revoke the invite for ${row.label}?`)) return;
          return run(event.currentTarget, async () => {
            await api('revoke', { id: row.id });
            if (shownId === row.id) clearLink();
            status.textContent = 'Invite revoked.';
            await refresh();
          });
        }),
      );
      if (row.retryEmail) {
        actions.prepend(action('Retry email', `Retry email for ${row.label}`, event => run(event.currentTarget, async () => {
          const result = await api('retry-email', { id: row.id });
          status.textContent = result.emailStatus;
          await refresh();
        })));
      }
      item.append(actions);
    }
    return item;
  });
  invites.replaceChildren(...rows);
  document.querySelector('#empty').hidden = rows.length !== 0;
}

function requestRow(row) {
  const item = document.createElement('li');
  const details = document.createElement('div');
  const name = document.createElement('strong');
  const email = document.createElement('p');
  const note = document.createElement('p');
  name.textContent = row.label;
  email.textContent = row.request.email;
  note.textContent = row.request.note;
  details.append(name, email);
  if (row.request.note) details.append(note);

  const form = document.createElement('form');
  const label = document.createElement('label');
  const expiration = document.createElement('input');
  expiration.type = 'datetime-local';
  expiration.required = true;
  expiration.value = defaultExpiration();
  label.append('Expiration in your local time', expiration);
  const actions = document.createElement('div');
  actions.className = 'actions';
  const approve = document.createElement('button');
  approve.className = 'primary';
  approve.textContent = row.emailEnabled ? 'Approve and email invite' : 'Approve and create invite';
  const dismiss = action('Dismiss', `Dismiss request from ${row.label}`, event => {
    if (!confirm(`Dismiss the request from ${row.label}?`)) return;
    return run(event.currentTarget, async () => {
      await api('dismiss', { id: row.id });
      await refresh();
      status.textContent = 'Request dismissed.';
    });
  });
  dismiss.type = 'button';
  actions.append(approve, dismiss);
  form.append(label, actions);
  form.addEventListener('submit', event => {
    event.preventDefault();
    return run(approve, async () => {
      const result = await api('approve', { id: row.id, expires: new Date(expiration.value).toISOString() });
      if (result.url) {
        showLink(result);
        link.focus();
        status.textContent = result.emailStatus ?? 'Invite created. Copy the link to share it.';
      } else {
        status.textContent = 'This request already has an invite.';
      }
      await refresh();
    });
  });
  item.append(details, form);
  return item;
}

function defaultExpiration() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function signedIn() {
  signIn.hidden = true;
  manager.hidden = false;
  create.elements.expires.value = defaultExpiration();
}

login.addEventListener('submit', event => {
  event.preventDefault();
  return run(event.submitter, async () => {
    await api('login', { password: login.elements.password.value });
    login.reset();
    signedIn();
    await refresh();
  });
});

create.addEventListener('submit', event => {
  event.preventDefault();
  return run(event.submitter, async () => {
    const expires = new Date(create.elements.expires.value).toISOString();
    const row = await api('invites', { label: create.elements.label.value, expires });
    showLink(row);
    create.elements.label.value = '';
    status.textContent = 'Invite created. Copy the link to share it.';
    await refresh();
  });
});

document.querySelector('#copy').addEventListener('click', () => copy(link.value));
document.querySelector('#logout').addEventListener('click', event => run(event.currentTarget, async () => {
  await api('logout', {});
  signedOut();
  login.elements.password.focus();
}));

run(null, async () => {
  try {
    await refresh();
    signedIn();
  } catch (error) {
    if (signIn.hidden) {
      signedIn();
      throw error;
    }
  }
});
