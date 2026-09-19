// Ctrl+K: les cinquanta eines, sense passar per la portada.
//
// La caixa de cerca de la barra ja filtra, però només serveix si ets a la
// portada; des de qualsevol altra pàgina et fa navegar i tornar a començar.
// Aquesta obre una llista per sobre del que estiguis fent i hi va directa.
//
// Els slugs del registre són els catalans, així que tot enllaç es construeix
// amb toolSlug() i amb PAGE.home, que és el camí a la portada d'aquest idioma.

import { h, clear } from '../core/dom.js';
import { TOOLS, AREAS } from '../registry.js';
import { t, localiseTool, toolSlug } from '../i18n.js';

const areaTitle = (id) => t(`area.${id}`) !== `area.${id}`
  ? t(`area.${id}`)
  : AREAS.find((a) => a.id === id)?.title || id;

/** Sense accents i en minúscules: «retallar» ha de trobar «Retallar». */
const fold = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function mountPalette(home = './') {
  const entries = TOOLS.map((tool) => {
    const l = localiseTool(tool);
    return {
      href: `${home}${toolSlug(tool)}/`,
      title: l.title,
      desc: l.desc,
      area: areaTitle(tool.area),
      hay: fold(`${l.title} ${l.desc} ${l.keywords || ''} ${toolSlug(tool)}`),
    };
  });

  let open = false;
  let cursor = 0;
  let shown = entries;
  let restoreFocus = null;

  const input = h('input', {
    class: 'pal-input', type: 'search', autocomplete: 'off', spellcheck: 'false',
    placeholder: t('palette.placeholder'), 'aria-controls': 'pal-list',
  });
  const list = h('div', { class: 'pal-list', id: 'pal-list', role: 'listbox' });
  const box = h('div', { class: 'pal-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('palette.title') },
    input, list, h('div', { class: 'pal-hint' }, t('palette.hint')));
  const overlay = h('div', { class: 'pal', hidden: true, onmousedown: (e) => { if (e.target === overlay) close(); } }, box);

  function render() {
    const q = fold(input.value.trim());
    const words = q.split(/\s+/).filter(Boolean);
    shown = words.length ? entries.filter((e) => words.every((w) => e.hay.includes(w))) : entries;
    cursor = Math.min(cursor, Math.max(0, shown.length - 1));
    clear(list);
    if (!shown.length) {
      list.append(h('p', { class: 'pal-empty' }, t('shell.noResults', { q: input.value.trim() })));
      return;
    }
    shown.forEach((e, i) => list.append(h('a', {
      class: 'pal-item' + (i === cursor ? ' on' : ''),
      href: e.href,
      role: 'option',
      'aria-selected': i === cursor ? 'true' : 'false',
      onmousemove: () => { if (cursor !== i) { cursor = i; paint(); } },
    }, h('b', null, e.title), h('span', null, e.desc), h('em', { class: 'pal-area' }, e.area))));
  }

  // Moure la selecció no ha de reconstruir la llista: amb cinquanta enllaços
  // es nota, i el ratolí perdria el que hi ha a sota del cursor.
  function paint() {
    [...list.children].forEach((el, i) => {
      el.classList.toggle('on', i === cursor);
      el.setAttribute('aria-selected', i === cursor ? 'true' : 'false');
    });
    list.children[cursor]?.scrollIntoView({ block: 'nearest' });
  }

  function move(step) {
    if (!shown.length) return;
    cursor = (cursor + step + shown.length) % shown.length;
    paint();
  }

  function show() {
    if (open) return;
    open = true;
    restoreFocus = document.activeElement;
    overlay.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    input.value = '';
    cursor = 0;
    render();
    input.focus();
  }

  function close() {
    if (!open) return;
    open = false;
    overlay.hidden = true;
    document.documentElement.style.overflow = '';
    if (restoreFocus instanceof HTMLElement) restoreFocus.focus();
  }

  input.addEventListener('input', () => { cursor = 0; render(); });

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Home') { e.preventDefault(); cursor = 0; paint(); }
    else if (e.key === 'End') { e.preventDefault(); cursor = shown.length - 1; paint(); }
    else if (e.key === 'Enter' && shown[cursor]) {
      e.preventDefault();
      // Amb Ctrl o Cmd, en una pestanya nova, com faria qualsevol enllaç.
      if (e.metaKey || e.ctrlKey) window.open(shown[cursor].href, '_blank', 'noopener');
      else location.href = shown[cursor].href;
    }
  });

  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      open ? close() : show();
    }
  });

  document.body.append(overlay);
  return { show, close };
}
