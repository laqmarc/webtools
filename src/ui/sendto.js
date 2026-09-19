// «Envia el resultat a…»: el menú que fa que les cinquanta eines siguin una.
//
// Ensenya només les eines que accepten el que s'acaba de produir, o sigui que
// la llista d'un PNG i la d'un PDF no s'assemblen gens. Reaprofita l'aspecte
// i el teclat de la paleta d'ordres: és la mateixa pregunta —quina eina?—
// feta amb la resposta ja escurçada.

import { h, clear } from '../core/dom.js';
import { TOOLS } from '../registry.js';
import { matchesAccept } from '../core/files.js';
import { stash } from '../core/handoff.js';
import { t, tn, localiseTool, toolSlug } from '../i18n.js';

// Una eina sense accepts declarats accepta qualsevol cosa, que per a una
// caixa on enganxes text és exactament el que toca — però vol dir que
// matchesAccept() diria que sí a enviar un JPEG cap a «Minificar CSS». Aquí,
// doncs, «res declarat» vol dir «text», i prou.
const TEXTY = /^(text\/|application\/(json|xml|x-yaml|yaml|javascript|sql|x-sh)|image\/svg)/;
const TEXT_EXT = /\.(txt|md|json|ya?ml|csv|tsv|xml|svg|html?|css|js|mjs|sql|log|ini|conf|srt|vtt)$/i;
const looksTextual = (p) => TEXTY.test(p.type) || TEXT_EXT.test(p.name);

/**
 * Les eines que es podrien menjar aquestes sortides. L'eina d'on venim queda
 * fora: encadenar-la amb ella mateixa és la manera lenta de tornar a prémer
 * «Processa».
 */
export function targetsFor(outputs, excludeId) {
  const probes = outputs.map((o) => ({ name: o.name, type: o.blob?.type || '' }));
  if (!probes.length) return [];
  return TOOLS
    .filter((tool) => tool.id !== excludeId && tool.kind !== 'custom')
    .filter((tool) => (tool.accepts?.length
      ? probes.every((p) => matchesAccept(p, tool.accepts))
      : probes.every(looksTextual)))
    .map((tool) => {
      const l = localiseTool(tool);
      return { id: tool.id, slug: toolSlug(tool), title: l.title, desc: l.desc, area: tool.area };
    });
}

/** Obre el menú i navega. No torna res: o se'n va, o es tanca. */
export function sendTo(outputs, { excludeId, home = '../', onFail } = {}) {
  const targets = targetsFor(outputs, excludeId);

  const list = h('div', { class: 'pal-list', role: 'listbox' });
  const box = h('div', {
    class: 'pal-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('chain.title'),
  },
  h('div', { class: 'pal-input', style: { cursor: 'default' } },
    tn('chain.heading', outputs.length)),
  list,
  h('div', { class: 'pal-hint' }, t('chain.hint')));

  const overlay = h('div', {
    class: 'pal',
    onmousedown: (e) => { if (e.target === overlay) close(); },
  }, box);

  let cursor = 0;

  function close() {
    overlay.remove();
    document.documentElement.style.overflow = '';
    removeEventListener('keydown', onKey, true);
  }

  async function go(target) {
    clear(list).append(h('p', { class: 'pal-empty' }, t('chain.handing')));
    const id = await stash(outputs);
    if (!id) {
      close();
      onFail?.(t('chain.failed'));
      return;
    }
    location.href = `${home}${target.slug}/?from=${id}`;
  }

  function paint() {
    [...list.children].forEach((el, i) => el.classList.toggle('on', i === cursor));
    list.children[cursor]?.scrollIntoView({ block: 'nearest' });
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); cursor = (cursor + 1) % targets.length; paint(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); cursor = (cursor - 1 + targets.length) % targets.length; paint(); }
    else if (e.key === 'Enter' && targets[cursor]) { e.preventDefault(); go(targets[cursor]); }
  }

  if (!targets.length) {
    list.append(h('p', { class: 'pal-empty' }, t('chain.none')));
  } else {
    targets.forEach((target, i) => list.append(h('button', {
      class: 'pal-item' + (i === 0 ? ' on' : ''),
      type: 'button',
      role: 'option',
      onmousemove: () => { if (cursor !== i) { cursor = i; paint(); } },
      onclick: () => go(target),
    },
    h('b', null, target.title),
    h('span', null, target.desc),
    h('em', { class: 'pal-area' }, t(`area.${target.area}`)))));
  }

  document.body.append(overlay);
  document.documentElement.style.overflow = 'hidden';
  addEventListener('keydown', onKey, true);
  list.querySelector('.pal-item')?.focus();
}
