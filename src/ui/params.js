import { h } from '../core/dom.js';
import { t } from '../i18n.js';

const KEY = (id) => `webtools:params:${id}`;

// Claus que la pàgina ja fa servir per a altres coses i que no són mai un
// paràmetre d'eina.
const RESERVED = new Set(['q', 'sw', 'from', 'share']);

/** Una cadena de l'URL, convertida al tipus que el camp espera. */
function coerce(field, raw) {
  if (field.type === 'checkbox') {
    if (/^(1|true|si|sí|yes|on)$/i.test(raw)) return true;
    if (/^(0|false|no|off)$/i.test(raw)) return false;
    return null;
  }
  if (field.type === 'range' || field.type === 'number') {
    const n = Number(raw);
    return Number.isFinite(n) ? clamp(n, field) : null;
  }
  if (field.type === 'select') {
    return field.options?.some((o) => String(o.v) === raw) ? raw : null;
  }
  return raw;
}

/**
 * El que digui l'URL guanya. Serveix per compartir una configuració sencera
 * per xat i per aterrar amb l'eina ja parada on toca, que és mig ús de les
 * pàgines de variant.
 */
function fromUrl(schema, lock) {
  const out = {};
  let q;
  try { q = new URLSearchParams(location.search); } catch { return out; }
  for (const f of schema) {
    if (lock.includes(f.key) || RESERVED.has(f.key) || !q.has(f.key)) continue;
    const v = coerce(f, q.get(f.key));
    if (v !== null) out[f.key] = v;
  }
  return out;
}

/**
 * Deixa a la barra d'adreces només el que s'aparta del valor per defecte.
 * Amb els setze paràmetres d'algunes eines, escriure'ls tots faria un URL
 * que ningú enganxaria enlloc.
 */
function toUrl(schema, values, preset, lock) {
  let q;
  try { q = new URLSearchParams(location.search); } catch { return; }
  const base = defaults(schema, preset);
  for (const f of schema) {
    if (lock.includes(f.key) || RESERVED.has(f.key)) continue;
    if (values[f.key] === base[f.key]) q.delete(f.key);
    else q.set(f.key, String(values[f.key]));
  }
  const search = q.toString();
  const url = location.pathname + (search ? `?${search}` : '') + location.hash;
  try { history.replaceState(history.state, '', url); } catch { /* file:// */ }
}

/** Defaults, with a landing page's presets replacing them where given. */
function defaults(schema, preset) {
  return Object.fromEntries(schema.map((f) => [f.key, f.key in preset ? preset[f.key] : f.def]));
}

function load(storeKey, schema, preset, lock) {
  const values = defaults(schema, preset);
  try {
    const saved = JSON.parse(localStorage.getItem(KEY(storeKey)) || '{}');
    for (const f of schema) {
      if (lock.includes(f.key)) continue; // the URL decided this one
      if (f.key in saved && typeof saved[f.key] === typeof f.def) values[f.key] = saved[f.key];
    }
  } catch { /* corrupt or unavailable storage: defaults are fine */ }
  // Per damunt de tot: un enllaç compartit ha d'ensenyar el mateix a tothom,
  // tinguin el que tinguin desat de l'última vegada.
  return Object.assign(values, fromUrl(schema, lock));
}

/**
 * Renders a schema as a form and keeps a plain values object in sync.
 * Fields with `showIf` appear and disappear as their dependencies change;
 * fields named in `lock` are not rendered at all and keep their preset value.
 * Returns { el, values, reset }.
 */
export function paramsForm(storeKey, schema, onChange, { preset = {}, lock = [], presets = [] } = {}) {
  const shown = schema.filter((f) => !lock.includes(f.key));
  const values = load(storeKey, schema, preset, lock);
  const el = h('div', { class: 'params' });
  const rows = new Map();

  const persist = () => {
    try { localStorage.setItem(KEY(storeKey), JSON.stringify(values)); } catch { /* private mode */ }
    toUrl(schema, values, preset, lock);
  };

  const refresh = () => {
    for (const f of shown) {
      const visible = !f.showIf || f.showIf(values);
      rows.get(f.key).style.display = visible ? '' : 'none';
    }
  };

  const set = (f, v) => {
    values[f.key] = v;
    persist();
    refresh();
    onChange?.(values, f.key);
  };

  for (const f of shown) {
    const row = buildField(f, values[f.key], (v) => set(f, v));
    rows.set(f.key, row);
    el.append(row);
  }
  refresh();

  /** Write a whole set of values at once and bring the inputs along. */
  function apply(patch) {
    for (const [key, value] of Object.entries(patch)) {
      if (lock.includes(key) || !(key in values)) continue;
      values[key] = value;
      const field = schema.find((f) => f.key === key);
      const input = rows.get(key)?.querySelector('input, select, textarea');
      if (!input) continue;
      if (field.type === 'checkbox') input.checked = value;
      else input.value = value;
      if (field.type === 'range') input.dispatchEvent(new Event('input'));
    }
    persist();
    refresh();
    onChange?.(values, null);
  }

  // One click instead of four fields: the combinations people actually want.
  const presetBar = presets.length
    ? h('div', { class: 'presets' },
      h('span', { class: 'hint' }, t('params.quick')),
      presets.map((p) => h('button', {
        class: 'btn ghost sm', title: p.hint || '',
        onclick: () => apply(p.values),
      }, p.name)))
    : null;

  return {
    el: presetBar ? h('div', null, presetBar, el) : el,
    values,
    apply,
    empty: shown.length === 0,
    reset() {
      const base = defaults(schema, preset);
      Object.assign(values, base);
      try { localStorage.removeItem(KEY(storeKey)); } catch { /* ignore */ }
      toUrl(schema, base, preset, lock);
      for (const f of shown) {
        const input = rows.get(f.key).querySelector('input, select, textarea');
        if (!input) continue;
        if (f.type === 'checkbox') input.checked = base[f.key];
        else input.value = base[f.key];
        input.dispatchEvent(new Event(f.type === 'range' ? 'input' : 'change'));
      }
      refresh();
      onChange?.(values, null);
    },
  };
}

function buildField(f, value, set) {
  const id = `p-${f.key}-${Math.random().toString(36).slice(2, 7)}`;
  const hint = f.hint ? h('span', { class: 'hint' }, f.hint) : null;

  if (f.type === 'checkbox') {
    return h('div', { class: 'field row' + (f.wide ? ' wide' : ''), title: f.hint || '' },
      h('input', { type: 'checkbox', id, checked: !!value, onchange: (e) => set(e.target.checked) }),
      h('label', { for: id }, f.label));
  }

  let input;
  if (f.type === 'select') {
    input = h('select', { id, onchange: (e) => set(e.target.value) },
      f.options.map((o) => h('option', { value: o.v, selected: o.v === value }, o.t)));
  } else if (f.type === 'range') {
    const out = h('span', { class: 'range-val' }, `${value}${f.unit || ''}`);
    const r = h('input', {
      type: 'range', id, min: f.min, max: f.max, step: f.step, value,
      oninput: (e) => { out.textContent = `${e.target.value}${f.unit || ''}`; set(Number(e.target.value)); },
    });
    input = h('div', { class: 'range-wrap' }, r, out);
  } else if (f.type === 'number') {
    input = h('input', {
      type: 'number', id, min: f.min, max: f.max, step: f.step, value,
      onchange: (e) => set(clamp(Number(e.target.value), f)),
    });
  } else if (f.type === 'color') {
    const text = h('input', { type: 'text', value, onchange: (e) => { pick.value = e.target.value; set(e.target.value); } });
    const pick = h('input', {
      type: 'color', value, style: { width: '38px', height: '34px', padding: '2px', flex: 'none' },
      oninput: (e) => { text.value = e.target.value; set(e.target.value); },
    });
    input = h('div', { class: 'range-wrap' }, pick, text);
  } else if (f.type === 'textarea') {
    input = h('textarea', { id, rows: 3, onchange: (e) => set(e.target.value) }, value);
  } else {
    input = h('input', { type: 'text', id, value, onchange: (e) => set(e.target.value) });
  }

  const label = f.unit && f.type !== 'range' ? `${f.label} (${f.unit})` : f.label;
  return h('div', { class: 'field' + (f.wide ? ' wide' : '') }, h('label', { for: id }, label), input, hint);
}

function clamp(n, f) {
  if (!Number.isFinite(n)) return f.def;
  if (f.min != null) n = Math.max(f.min, n);
  if (f.max != null) n = Math.min(f.max, n);
  return n;
}
