// Boot for a statically generated page.
//
// Every URL is a real HTML file written by scripts/build-pages.mjs: the heading,
// the prose and (on the home page) the whole tool grid are already in the
// markup. This script only adds the interactive part, so the pages still say
// something useful with JavaScript switched off.
//
// The page declares what it is through `window.__PAGE__`:
//   { kind: 'home' }
//   { kind: 'tool', tool: '<id>', slug, preset?, lock?, accepts? }

import { h, clear, debounce } from './core/dom.js';
import { byId, bySlug } from './registry.js';
import { loadLocale, t, localiseTool } from './i18n.js';

const PAGE = window.__PAGE__ || { kind: 'home', lang: 'ca' };

// Before anything renders. Every t() in the UI modules is called lazily, so a
// static import is fine — but nothing may be mounted until this resolves.
await loadLocale(PAGE.lang);

// ---------------------------------------------------------------- theme
const themeBtn = document.getElementById('theme');
const applyTheme = (mode) => document.documentElement.setAttribute('data-theme', mode);
let theme = localStorage.getItem('webtools:theme')
  || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
applyTheme(theme);
if (themeBtn) {
  themeBtn.onclick = () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try { localStorage.setItem('webtools:theme', theme); } catch { /* private mode */ }
  };
}

// ---------------------------------------------------------------- install
// Chrome hides the install affordance in the address bar, where most people
// never look, so the button offers it once the browser says the app qualifies.
// There is nothing to show on iOS or in an already-installed window.
const installBtn = document.getElementById('install');
if (installBtn) {
  let prompt = null;
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    prompt = e;
    installBtn.hidden = matchMedia('(display-mode: standalone)').matches;
  });
  addEventListener('appinstalled', () => { installBtn.hidden = true; prompt = null; });
  installBtn.onclick = async () => {
    if (!prompt) return;
    installBtn.disabled = true;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    prompt = null;
    installBtn.disabled = false;
    if (outcome === 'accepted') installBtn.hidden = true;
  };
}

// -------------------------------------------------------------- palette
// Ctrl+K des de qualsevol pàgina. La caixa de la barra només filtra a la
// portada; fora d'allà, tocar-la obre la paleta en comptes de fer-te
// navegar i tornar a començar.
const palette = (await import('./ui/palette.js')).mountPalette(PAGE.home || './');

// ---------------------------------------------------------------- search
const searchBox = document.getElementById('search');
if (searchBox) {
  // On the home page the cards are already in the DOM, so searching is just
  // hiding rows. Anywhere else, typing takes you home with the query.
  const cards = [...document.querySelectorAll('.card[data-search]')];
  const empty = document.getElementById('no-results');

  if (!cards.length) {
    searchBox.title = t('palette.open');
    searchBox.readOnly = true; // que ningú escrigui en una caixa que no filtra res
    searchBox.addEventListener('focus', () => { searchBox.blur(); palette.show(); });
    searchBox.addEventListener('click', () => palette.show());
  }

  const filter = debounce(() => {
    const q = searchBox.value.trim().toLowerCase();
    if (!cards.length) return;
    const words = q.split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const card of cards) {
      const hit = words.every((w) => card.dataset.search.includes(w));
      card.hidden = !hit;
      if (hit) shown++;
    }
    for (const area of document.querySelectorAll('.area')) {
      area.hidden = ![...area.querySelectorAll('.card')].some((c) => !c.hidden);
    }
    if (empty) {
      empty.hidden = shown > 0;
      empty.textContent = shown ? '' : t('shell.noResults', { q: searchBox.value.trim() });
    }
  }, 120);

  searchBox.addEventListener('input', filter);
  searchBox.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { searchBox.value = ''; filter(); }
  });

  const q = new URLSearchParams(location.search).get('q');
  if (q && cards.length) { searchBox.value = q; filter(); }

  addEventListener('keydown', (e) => {
    if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) {
      e.preventDefault();
      if (cards.length) searchBox.focus();
      else palette.show();
    }
  });
}

// ------------------------------------------------------- shared with us
// Arribem d'un «Compartir → WebTools» del sistema, o d'un «envia-ho a una
// altra eina» que apuntava a la portada. Els fitxers ja són desats; només
// falta preguntar què n'hem de fer.
if (PAGE.kind === 'home' && new URLSearchParams(location.search).has('from')) {
  (async () => {
    const q = new URLSearchParams(location.search);
    const id = q.get('from');
    q.delete('from');
    const rest = q.toString();
    try { history.replaceState(history.state, '', location.pathname + (rest ? `?${rest}` : '')); } catch { /* ignore */ }
    const files = await (await import('./core/handoff.js')).claim(id);
    if (!files.length) return;
    const { sendTo } = await import('./ui/sendto.js');
    sendTo(files.map((f) => ({ name: f.name, blob: f })), { home: PAGE.home || './' });
  })();
}

// --------------------------------------------------- old hash bookmarks
// The site used #/tool-id before every tool got its own page.
if (PAGE.kind === 'home' && /^#\/?[a-z0-9-]+$/.test(location.hash)) {
  const key = location.hash.replace(/^#\/?/, '');
  const legacy = byId[key] || bySlug[key];
  if (legacy) location.replace(`${legacy.slug}/`);
}

// ---------------------------------------------------------------- offline
// Vendoring keeps the tools working once a page is open; this is what lets the
// site open at all with no network. It stays off on localhost so a rebuild is
// never shadowed by a stale cache: add ?sw=1 to try it there, and ?sw=0
// anywhere to tear it down again.
if ('serviceWorker' in navigator) {
  const flag = new URLSearchParams(location.search).get('sw');
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (flag === '0') {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) { reg.active?.postMessage('unregister'); reg.unregister(); }
    });
  } else if (flag === '1' || !local) {
    addEventListener('load', () => {
      navigator.serviceWorker
        .register(new URL('../sw.js', import.meta.url))
        .catch((e) => console.warn('WebTools: could not register the offline worker.', e));
    });
  }
}

// ------------------------------------------------------------- tool page
if (PAGE.kind === 'tool') {
  const host = document.getElementById('tool');
  const tool = byId[PAGE.tool];

  if (!host || !tool) {
    console.error('WebTools: this page declares an unknown tool', PAGE.tool);
  } else {
    // What the page renders is the tool as this URL configures it: a variant
    // narrows the accepted files and pre-answers some of the parameters.
    const view = {
      ...localiseTool(tool),
      accepts: PAGE.accepts || tool.accepts,
      preset: PAGE.preset || {},
      lock: PAGE.lock || [],
      storeKey: PAGE.slug || tool.id,
    };

    host.append(h('p', { class: 'empty' }, t('shell.loading')));

    (async () => {
      let mod;
      try {
        mod = await tool.load();
      } catch (e) {
        clear(host).append(h('div', { class: 'msg err' }, t('shell.loadFailed', { msg: e.message })));
        return;
      }
      clear(host);
      try {
        if (tool.kind === 'custom') {
          mod.mounts[tool.id](host, view);
        } else if (tool.kind === 'text') {
          (await import('./ui/texttool.js')).mountTextTool(host, view, mod);
        } else {
          (await import('./ui/filetool.js')).mountFileTool(host, view, mod);
        }
      } catch (e) {
        clear(host).append(h('div', { class: 'msg err' }, t('shell.bootFailed', { msg: e.message })));
        throw e;
      }
    })();
  }
}
