// Minimal hyperscript. Keeps the UI modules free of innerHTML string soup.

import { t } from '../i18n.js';

export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k in el && k !== 'list' && k !== 'type' && k !== 'size') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  append(el, kids);
  return el;
}

function append(el, kids) {
  for (const k of kids) {
    if (k == null || k === false) continue;
    if (Array.isArray(k)) append(el, k);
    else el.append(k instanceof Node ? k : String(k));
  }
}

export const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };

export function debounce(fn, ms = 180) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/** Copy-to-clipboard button that confirms itself and reverts. */
export function copyBtn(getText, label = t('copy')) {
  const b = h('button', {
    class: 'btn ghost sm',
    onclick: async () => {
      try {
        await navigator.clipboard.writeText(getText());
        b.textContent = t('copied');
      } catch {
        b.textContent = t('copyFailed');
      }
      setTimeout(() => { b.textContent = label; }, 1400);
    },
  }, label);
  return b;
}
