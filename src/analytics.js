/* Shared opt-in analytics. The measurement ID is public, not a credential. */
(() => {
  'use strict';
  if (!['zeropagelabs.com', 'www.zeropagelabs.com', 'localhost', '127.0.0.1'].includes(location.hostname)) return;
  const key = 'zpl-analytics-consent-v1';
  let choice;
  try { choice = localStorage.getItem(key); } catch (_) {}
  let started = false;
  function start() {
    if (started) return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('consent', 'default', {analytics_storage:'granted', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
    gtag('js', new Date());
    const page = new URL(location.origin + location.pathname);
    const params = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(name => {
      const value = params.get(name);
      if (value) page.searchParams.set(name, value.slice(0, 200));
    });
    gtag('config', 'G-RGDHSTD8FE', {
      page_location: page.href,
      page_referrer: document.referrer ? new URL(document.referrer).origin + new URL(document.referrer).pathname : '',
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-RGDHSTD8FE';
    document.head.append(script);
  }
  function save(value) {
    choice = value;
    try { localStorage.setItem(key, value); } catch (_) {}
    panel.hidden = true;
    if (value === 'granted') start();
    else if (started) {
      gtag('consent', 'update', {analytics_storage:'denied'});
      document.cookie.split(';').forEach(entry => {
        const name = entry.split('=')[0].trim();
        if (name === '_ga' || name.startsWith('_ga_')) {
          ['', location.hostname, '.zeropagelabs.com'].forEach(domain => {
            document.cookie = name + '=; Max-Age=0; Path=/' + (domain ? '; Domain=' + domain : '');
          });
        }
      });
      location.reload();
    }
  }
  const host = document.createElement('div');
  document.body.append(host);
  const root = host.attachShadow({mode:'open'});
  root.innerHTML = `<style>
    :host{font:14px/1.5 system-ui,sans-serif;color:#242821}
    button,a{font:inherit}button{cursor:pointer;border:1px solid #555d50;border-radius:4px;padding:8px 12px;background:#f4f1e9;color:#242821}
    a{color:#273e28}section{position:fixed;z-index:2147483647;bottom:48px;right:16px;width:min(420px,calc(100vw - 64px));padding:16px;background:#f4f1e9;border:1px solid #555d50;box-shadow:0 4px 24px #0003;border-radius:8px}section[hidden]{display:none}p{margin:0 0 12px}.actions{display:flex;flex-wrap:wrap;gap:8px}.settings{position:fixed;z-index:2147483646;bottom:8px;right:16px;font-size:12px;padding:4px 8px}strong{display:block;margin-bottom:6px}
    </style><section role="region" aria-label="Analytics preferences"><strong>Help improve Zero Page Labs?</strong><p>Allow Google Analytics to count visits and show which projects people explore. You can change this choice anytime. <a href="/privacy.html">Privacy details</a></p><div class="actions"><button id="decline">No thanks</button><button id="allow">Allow analytics</button></div></section><button class="settings">Analytics settings</button>`;
  const panel = root.querySelector('section');
  panel.hidden = choice === 'granted' || choice === 'denied';
  root.querySelector('#decline').onclick = () => save('denied');
  root.querySelector('#allow').onclick = () => save('granted');
  root.querySelector('.settings').onclick = () => { panel.hidden = false; root.querySelector('#decline').focus(); };
  if (choice === 'granted') start();
})();
