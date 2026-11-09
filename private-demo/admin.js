const status = document.querySelector('#status');
const signIn = document.querySelector('#sign-in');
const manager = document.querySelector('#manager');
const login = document.querySelector('#login');
const create = document.querySelector('#create');
const invites = document.querySelector('#invites');
const output = document.querySelector('#output');
const link = document.querySelector('#link');
let shownId;

function signedOut() {
  manager.hidden = true;
  signIn.hidden = false;
  invites.replaceChildren();
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
  const records = await api('invites');
  const rows = records.map(row => {
    const item = document.createElement('li');
    const details = document.createElement('div');
    const name = document.createElement('strong');
    const meta = document.createElement('p');
    name.textContent = row.label;
    meta.textContent = `${row.status} · Expires ${new Date(row.expires * 1000).toLocaleString()}`;
    details.append(name, meta);
    item.append(details);
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
      item.append(actions);
    }
    return item;
  });
  invites.replaceChildren(...rows);
  document.querySelector('#empty').hidden = rows.length !== 0;
}

function defaultExpiration() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  create.elements.expires.value = date.toISOString().slice(0, 16);
}

function signedIn() {
  signIn.hidden = true;
  manager.hidden = false;
  defaultExpiration();
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
