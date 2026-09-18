// The small text tools. Each one is a handful of lines, but together they are
// the bulk of what people actually reach for, and every one is its own URL.

import { beautify, sqlFormatter } from '../core/deps.js';
import { h, clear, debounce, copyBtn } from '../core/dom.js';
import { t, currentLang } from '../i18n.js';

// ------------------------------------------------------------------ case

const words = (s) => s.match(/[\p{L}\p{N}]+/gu) || [];
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

// Catalan and Spanish style: minor words stay lowercase unless they open the title.
const MINOR = new Set(['de', 'del', 'la', 'les', 'el', 'els', 'i', 'a', 'en', 'amb', 'per', 'un', 'una',
  'y', 'o', 'the', 'of', 'and', 'in', 'on', 'for', 'to', 'at', 'an']);

function changeCase(text, p) {
  switch (p.mode) {
    case 'upper': return text.toUpperCase();
    case 'lower': return text.toLowerCase();
    case 'sentence':
      return text.toLowerCase().replace(/(^\s*|[.!?¿¡]\s+)(\p{L})/gu, (_, pre, c) => pre + c.toUpperCase());
    case 'title':
      return text.replace(/\p{L}[\p{L}\p{N}'’-]*/gu, (w, i) => (i > 0 && MINOR.has(w.toLowerCase()) ? w.toLowerCase() : cap(w)));
    case 'camel': {
      const parts = words(text);
      return parts.map((w, i) => (i ? cap(w) : w.toLowerCase())).join('');
    }
    case 'pascal': return words(text).map(cap).join('');
    case 'snake': return words(text).map((w) => w.toLowerCase()).join('_');
    case 'kebab': return words(text).map((w) => w.toLowerCase()).join('-');
    case 'constant': return words(text).map((w) => w.toUpperCase()).join('_');
    case 'invert':
      return [...text].map((c) => (c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase())).join('');
    default: return text;
  }
}

// ----------------------------------------------------------------- lines

function processLines(text, p) {
  let list = text.split('\n');
  if (p.trim) list = list.map((l) => l.trim());
  if (p.removeEmpty) list = list.filter((l) => l !== '');
  if (p.dedupe) {
    const seen = new Set();
    list = list.filter((l) => {
      const key = p.ignoreCase ? l.toLowerCase() : l;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const collator = new Intl.Collator('ca', { numeric: true, sensitivity: 'base' });
  if (p.sort === 'asc') list.sort(collator.compare);
  else if (p.sort === 'desc') list.sort((a, b) => collator.compare(b, a));
  else if (p.sort === 'length') list.sort((a, b) => a.length - b.length || collator.compare(a, b));
  else if (p.sort === 'shuffle') {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
  }
  if (p.reverse) list.reverse();
  if (p.number) {
    const pad = String(list.length).length;
    list = list.map((l, i) => `${String(i + 1).padStart(pad, ' ')}. ${l}`);
  }
  return list.join('\n');
}

// ------------------------------------------------------------------- url

function urlCode(text, p) {
  const fn = p.dir === 'encode'
    ? (p.scope === 'component' ? encodeURIComponent : encodeURI)
    : (p.scope === 'component' ? decodeURIComponent : decodeURI);
  try {
    const done = fn(text);
    return p.dir === 'encode' && p.plusSpaces ? done.replace(/%20/g, '+') : done;
  } catch {
    throw new Error(t('err.urlMalformed'));
  }
}

// -------------------------------------------------------------- entities

const NAMED = { '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": 'apos', ' ': 'nbsp' };

function entities(text, p) {
  if (p.dir === 'decode') {
    // The browser's own parser knows every named entity there is.
    const doc = new DOMParser().parseFromString(`<!doctype html><body>${text}`, 'text/html');
    return doc.body.textContent;
  }
  return [...text].map((c) => {
    if (NAMED[c]) return `&${NAMED[c]};`;
    const code = c.codePointAt(0);
    if (p.all && code > 127) return `&#${code};`;
    return c;
  }).join('');
}

// -------------------------------------------------------------- slugify

function slugify(text, p) {
  const sep = p.separator === 'underscore' ? '_' : '-';
  let s = text.normalize('NFD').replace(/[̀-ͯ]/g, ''); // strip accents
  s = s.replace(/[łŁ]/g, 'l').replace(/[øØ]/g, 'o').replace(/[æÆ]/g, 'ae').replace(/[ß]/g, 'ss');
  s = s.replace(/·/g, ''); // Catalan l·l becomes ll, not l-l
  if (p.lower !== false) s = s.toLowerCase();
  s = s.replace(/[^a-zA-Z0-9]+/g, sep).replace(new RegExp(`^\\${sep}+|\\${sep}+$`, 'g'), '');
  if (p.maxLength > 0 && s.length > p.maxLength) {
    s = s.slice(0, p.maxLength);
    const cut = s.lastIndexOf(sep);
    if (cut > p.maxLength * 0.6) s = s.slice(0, cut);
  }
  return s;
}

// ------------------------------------------------------------ beautifier

async function formatHtml(text, p) {
  const lib = await beautify();
  return lib.html(text, {
    indent_size: Number(p.indent) || 2,
    wrap_line_length: Number(p.wrap) || 0,
    preserve_newlines: !!p.preserveNewlines,
    max_preserve_newlines: 1,
    indent_inner_html: true,
    unformatted: [],
  });
}

async function formatXml(text, p) {
  const problem = new DOMParser().parseFromString(text, 'text/xml').querySelector('parsererror');
  if (problem) {
    // Chrome wraps the real message in a page of boilerplate, sometimes
    // without even a newline between them. Take the part that names a line.
    const raw = problem.textContent.replace(/\s+/g, ' ').trim();
    const detail = raw.match(/error on line \d+[^]*?(?= Below is|$)/i)?.[0]
      || raw.replace(/^This page contains the following errors:\s*/i, '');
    throw new Error(t('err.xmlInvalid', { detail }));
  }
  const lib = await beautify();
  return lib.html(text, {
    indent_size: Number(p.indent) || 2,
    wrap_line_length: 0,
    preserve_newlines: false,
    indent_inner_html: true,
    // XML has no void elements, so nothing may be treated as self-closing HTML.
    void_elements: [],
    inline: [],
  });
}

async function formatSql(text, p) {
  const lib = await sqlFormatter();
  const format = lib.format || lib.default?.format;
  if (!format) throw new Error(t('err.sqlInit'));
  try {
    return format(text, {
      language: p.dialect || 'sql',
      tabWidth: Number(p.indent) || 2,
      keywordCase: p.keywordCase || 'upper',
      linesBetweenQueries: 2,
    });
  } catch (e) {
    throw new Error(t('err.sqlUnparsed', { detail: e.message }));
  }
}

// ------------------------------------------------------- custom: comptar

const SPEAKING_WPM = 130;
const READING_WPM = 220;

function mountCount(root) {
  const input = h('textarea', {
    class: 'code', style: { minHeight: '260px' }, spellcheck: false,
    placeholder: t('count.placeholder'), oninput: () => update(),
  });
  const table = h('table', { class: 'kv' });
  const top = h('div');

  const minutes = (n, wpm) => {
    const total = n / wpm;
    if (total < 1) return `${Math.max(1, Math.round(total * 60))} s`;
    return `${Math.floor(total)} min ${Math.round((total % 1) * 60)} s`;
  };

  const update = debounce(() => {
    const lang = currentLang();
    const text = input.value;
    const w = words(text).length;
    const rows = [
      [t('count.chars'), text.length.toLocaleString(lang)],
      [t('count.charsNoSpaces'), text.replace(/\s/g, '').length.toLocaleString(lang)],
      [t('count.words'), w.toLocaleString(lang)],
      [t('count.lines'), text ? text.split('\n').length.toLocaleString(lang) : '0'],
      [t('count.paragraphs'), text.trim() ? text.trim().split(/\n\s*\n/).length.toLocaleString(lang) : '0'],
      [t('count.sentences'), (text.match(/[^.!?…]+[.!?…]+/g) || []).length.toLocaleString(lang)],
      [t('count.readingTime'), w ? minutes(w, READING_WPM) : '—'],
      [t('count.speakingTime'), w ? minutes(w, SPEAKING_WPM) : '—'],
    ];
    clear(table);
    for (const [k, v] of rows) table.append(h('tr', null, h('td', null, k), h('td', { class: 'v' }, v)));

    // The limits people are actually counting against.
    const limits = [[t('count.seoTitle'), 60], [t('count.metaDesc'), 158], ['Bluesky', 300], ['Mastodon', 500]];
    clear(top);
    for (const [name, max] of limits) {
      const used = text.length;
      top.append(h('div', { class: 'limit' },
        h('span', null, name),
        h('div', { class: 'bar' }, h('i', { style: { width: `${Math.min(100, (used / max) * 100)}%`, background: used > max ? 'var(--err)' : 'var(--accent)' } })),
        h('span', { class: used > max ? 'status err' : 'status' }, `${used} / ${max}`)));
    }
  }, 120);

  root.append(
    h('div', { class: 'panel' }, h('h3', null, t('panel.text')), input),
    h('div', { class: 'panel' }, h('h3', null, t('count.title')), table),
    h('div', { class: 'panel' }, h('h3', null, t('count.limits')), top,
      h('div', { class: 'actions' }, copyBtn(() => input.value, t('count.copyText')))),
  );
  update();
}

export const runners = {
  'text-case': changeCase,
  'text-lines': processLines,
  'url-encode': urlCode,
  'html-entities': entities,
  slugify,
  'format-html': formatHtml,
  'format-xml': formatXml,
  'format-sql': formatSql,
};

export const mounts = {
  'text-count': mountCount,
};
