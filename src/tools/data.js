import { jsYaml } from '../core/deps.js';
import { h, clear, copyBtn, debounce } from '../core/dom.js';
import { baseName, formatBytes } from '../core/files.js';
import { dropzone } from '../ui/dropzone.js';
import { t } from '../i18n.js';

// ------------------------------------------------------------------ JSON

/**
 * V8 stopped reporting a character offset for most JSON errors, so when
 * JSON.parse fails we re-scan the text ourselves to say exactly where and why.
 * The happy path still goes through the native parser.
 */
function locateJsonError(s) {
  let i = 0;
  const fail = (key, vars) => { throw { at: i, key, vars }; };
  const ws = () => { while (i < s.length && ' \t\n\r'.includes(s[i])) i++; };

  function str() {
    i++;
    while (i < s.length) {
      const c = s[i];
      if (c === '"') { i++; return; }
      if (c === '\n') fail('json.newlineInString');
      if (c === '\\') {
        i++;
        if (!'"\\/bfnrtu'.includes(s[i])) fail('json.badEscape', { char: s[i] ?? '' });
        if (s[i] === 'u') {
          if (!/^[0-9a-fA-F]{4}$/.test(s.slice(i + 1, i + 5))) fail('json.badUnicode');
          i += 4;
        }
      }
      i++;
    }
    fail('json.unclosedString');
  }

  function num() {
    const m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(s.slice(i));
    if (!m || !m[0]) fail('json.badNumber');
    i += m[0].length;
  }

  function obj() {
    i++; ws();
    if (s[i] === '}') { i++; return; }
    for (;;) {
      ws();
      if (s[i] !== '"') fail('json.expectedKey');
      str(); ws();
      if (s[i] !== ':') fail('json.expectedColon');
      i++; value(); ws();
      if (s[i] === ',') { i++; ws(); if (s[i] === '}') fail('json.trailingCommaObject'); continue; }
      if (s[i] === '}') { i++; return; }
      fail('json.expectedCommaObject');
    }
  }

  function arr() {
    i++; ws();
    if (s[i] === ']') { i++; return; }
    for (;;) {
      value(); ws();
      if (s[i] === ',') { i++; ws(); if (s[i] === ']') fail('json.trailingCommaArray'); continue; }
      if (s[i] === ']') { i++; return; }
      fail('json.expectedCommaArray');
    }
  }

  function value() {
    ws();
    const c = s[i];
    if (c === undefined) fail('json.truncated');
    if (c === '{') return obj();
    if (c === '[') return arr();
    if (c === '"') return str();
    if (c === '-' || (c >= '0' && c <= '9')) return num();
    for (const lit of ['true', 'false', 'null']) if (s.startsWith(lit, i)) { i += lit.length; return undefined; }
    if (c === "'") fail('json.singleQuotes');
    return fail('json.unexpected', { char: c });
  }

  try {
    value(); ws();
    if (i < s.length) fail('json.trailingContent');
    return null;
  } catch (e) {
    if (e && typeof e.at === 'number') return e;
    throw e;
  }
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const loc = locateJsonError(text);
    if (loc) {
      const before = text.slice(0, loc.at);
      const line = before.split('\n').length;
      const col = loc.at - before.lastIndexOf('\n');
      throw new Error(t('err.jsonAt', { line, col, why: t(loc.key, loc.vars) }));
    }
    throw new Error(t('err.jsonPlain', { detail: e.message.slice(0, 200) }));
  }
}

const indentOf = (v) => (v === 'tab' ? '\t' : Number(v) || 0);

function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sortDeep(value[k])]));
  }
  return value;
}

function jsonFormat(text, p) {
  const data = parseJson(text);
  return JSON.stringify(p.sortKeys ? sortDeep(data) : data, null, indentOf(p.indent));
}

// ------------------------------------------------------------------- CSV

function flattenObj(obj, prefix, out) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flattenObj(v, key, out);
    else out[key] = Array.isArray(v) ? JSON.stringify(v) : v;
  }
  return out;
}

function csvCell(v, delim) {
  if (v == null) return '';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /["\n\r]/.test(s) || s.includes(delim) ? `"${s.replace(/"/g, '""')}"` : s;
}

function jsonToCsv(text, p) {
  let data = parseJson(text);
  if (!Array.isArray(data)) {
    // A single object, or { rows: [...] } — take the first array we find.
    const arr = data && typeof data === 'object' && Object.values(data).find(Array.isArray);
    if (arr) data = arr;
    else if (data && typeof data === 'object') data = [data];
    else throw new Error(t('err.csvNeedsArray'));
  }
  if (!data.length) return '';
  const rows = data.map((r) => (r && typeof r === 'object' && !Array.isArray(r)
    ? (p.flatten ? flattenObj(r, '', {}) : r)
    : { valor: r }));

  const cols = [];
  const seen = new Set();
  for (const r of rows) for (const k of Object.keys(r)) if (!seen.has(k)) { seen.add(k); cols.push(k); }

  const d = p.delimiter === '\\t' ? '\t' : p.delimiter;
  const lines = [cols.map((c) => csvCell(c, d)).join(d)];
  for (const r of rows) lines.push(cols.map((c) => csvCell(r[c], d)).join(d));
  return (p.bom ? '﻿' : '') + lines.join('\r\n');
}

/** RFC 4180 parser: handles quoted fields, escaped quotes and CRLF. */
function parseCsv(text, delim) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let i = 0;
  const s = text.replace(/^﻿/, '');

  while (i < s.length) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"') {
        if (s[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"' && field === '') { quoted = true; i++; continue; }
    if (ch === delim) { row.push(field); field = ''; i++; continue; }
    if (ch === '\r') { i++; continue; }
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += ch; i++;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function detectDelimiter(text) {
  const line = text.split('\n').find((l) => l.trim()) || '';
  const counts = [',', ';', '\t', '|'].map((d) => [d, line.split(d).length - 1]);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ',';
}

const typeCell = (v) => {
  const raw = v.trim();
  if (raw === '') return '';
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw === 'null') return null;
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(raw) && String(Number(raw)) === raw) return Number(raw);
  return v;
};

function csvToJson(text, p) {
  const delim = p.delimiter === 'auto' ? detectDelimiter(text) : (p.delimiter === '\\t' ? '\t' : p.delimiter);
  const rows = parseCsv(text, delim).filter((r) => r.length > 1 || r[0] !== '');
  if (!rows.length) return '[]';
  const cast = p.typed ? typeCell : (v) => v;

  let data;
  if (p.header) {
    const head = rows[0].map((c, i) => c.trim() || `col${i + 1}`);
    data = rows.slice(1).map((r) => Object.fromEntries(head.map((k, i) => [k, cast(r[i] ?? '')])));
  } else {
    data = rows.map((r) => r.map(cast));
  }
  return JSON.stringify(data, null, indentOf(p.indent));
}

// ------------------------------------------------------------------ YAML

async function jsonToYaml(text, p) {
  const yaml = await jsYaml();
  const data = parseJson(text);
  return yaml.dump(data, {
    indent: Number(p.indent) || 2,
    lineWidth: 120,
    noRefs: true,
    quotingType: p.quoteStyle === 'single' ? "'" : '"',
    forceQuotes: p.quoteStyle !== 'auto',
  });
}

async function yamlToJson(text, p) {
  const yaml = await jsYaml();
  let docs;
  try {
    docs = yaml.loadAll(text);
  } catch (e) {
    throw new Error(t('err.yamlInvalid', { detail: `${e.reason || e.message}${e.mark ? ` (${e.mark.line + 1})` : ''}` }));
  }
  const data = docs.length === 1 ? docs[0] : docs;
  return JSON.stringify(data === undefined ? null : data, null, indentOf(p.indent));
}

// ---------------------------------------------------------------- Base64

function bytesToBase64(bytes) {
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

const base64ToBytes = (b64) => {
  const clean = b64.replace(/[\s]/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = clean + '='.repeat((4 - (clean.length % 4)) % 4);
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

const wrap76 = (s) => s.replace(/(.{76})/g, '$1\n');

function base64Text(text, p) {
  if (p.dir === 'decode') {
    try {
      return new TextDecoder().decode(base64ToBytes(text));
    } catch {
      throw new Error(t('err.base64Invalid'));
    }
  }
  let b64 = bytesToBase64(new TextEncoder().encode(text));
  if (p.urlSafe) b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return p.wrap ? wrap76(b64) : b64;
}

async function base64File(input, p) {
  const bytes = new Uint8Array(await input.blob.arrayBuffer());
  let b64 = bytesToBase64(bytes);
  if (p.wrap) b64 = wrap76(b64);
  const type = input.blob.type || 'application/octet-stream';
  const text = p.mode === 'datauri' ? `data:${type};base64,${b64}` : b64;
  return { name: `${baseName(input.name)}.base64.txt`, blob: new Blob([text], { type: 'text/plain;charset=utf-8' }) };
}

// ------------------------------------------------------------------ Hash

const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
const K = Int32Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0);

/** WebCrypto has no MD5, and people still paste MD5 checksums at us. */
export function md5(bytes) {
  const n = bytes.length;
  const blocks = ((n + 8) >> 6) + 1;
  const words = new Int32Array(blocks * 16);
  for (let i = 0; i < n; i++) words[i >> 2] |= bytes[i] << ((i % 4) * 8);
  words[n >> 2] |= 0x80 << ((n % 4) * 8);
  words[blocks * 16 - 2] = (n * 8) >>> 0;
  words[blocks * 16 - 1] = Math.floor(n / 536870912);

  let a0 = 0x67452301; let b0 = 0xefcdab89; let c0 = 0x98badcfe; let d0 = 0x10325476;
  for (let blk = 0; blk < blocks; blk++) {
    const M = words.subarray(blk * 16, blk * 16 + 16);
    let A = a0; let B = b0; let C = c0; let D = d0;
    for (let i = 0; i < 64; i++) {
      let F; let g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + K[i] + M[g]) | 0;
      A = D; D = C; C = B;
      B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) | 0;
    }
    a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
  }
  return [a0, b0, c0, d0].map((w) => {
    let s = '';
    for (let i = 0; i < 4; i++) s += ((w >>> (i * 8)) & 0xff).toString(16).padStart(2, '0');
    return s;
  }).join('');
}

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function hashAll(bytes) {
  const [sha1, sha256, sha384, sha512] = await Promise.all(
    ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].map((a) => crypto.subtle.digest(a, bytes)),
  );
  return {
    MD5: md5(bytes),
    'SHA-1': hex(sha1),
    'SHA-256': hex(sha256),
    'SHA-384': hex(sha384),
    'SHA-512': hex(sha512),
  };
}

// --------------------------------------------------------- custom: hash

function mountHash(root) {
  const results = h('div');
  const input = h('textarea', { class: 'code', style: { minHeight: '150px' }, spellcheck: false, placeholder: t('panel.writePlaceholder'), oninput: () => run() });
  const info = h('div');

  let mode = 'text';
  let fileBytes = null;
  let fileLabel = '';

  const textPane = h('div', null, input);
  const filePane = h('div', { style: { display: 'none' } },
    dropzone({
      multiple: false,
      label: t('hash.drop'),
      hint: t('hash.dropHint'),
      onFiles: async ([f]) => {
        fileBytes = new Uint8Array(await f.arrayBuffer());
        fileLabel = `${f.name} · ${formatBytes(f.size)}`;
        run();
      },
    }),
    info);

  const tabs = ['text', 'file'].map((m) => h('button', {
    class: 'tab' + (m === mode ? ' on' : ''),
    onclick: (e) => {
      mode = m;
      for (const b of e.target.parentNode.children) b.classList.toggle('on', b === e.target);
      textPane.style.display = m === 'text' ? '' : 'none';
      filePane.style.display = m === 'file' ? '' : 'none';
      run();
    },
  }, t(m === 'text' ? 'panel.text' : 'panel.file')));

  const run = debounce(async () => {
    clear(results);
    clear(info);
    const bytes = mode === 'text' ? new TextEncoder().encode(input.value) : fileBytes;
    if (mode === 'text' && !input.value) return;
    if (mode === 'file' && !bytes) return;
    if (mode === 'file') info.append(h('p', { class: 'note' }, fileLabel));

    const all = await hashAll(bytes);
    const table = h('table', { class: 'kv' });
    for (const [algo, value] of Object.entries(all)) {
      table.append(h('tr', null,
        h('td', null, algo),
        h('td', { class: 'v' }, value),
        h('td', { style: { width: '80px' } }, copyBtn(() => value))));
    }
    results.append(table);
  }, 180);

  root.append(
    h('div', { class: 'tabs' }, tabs),
    h('div', { class: 'panel' }, textPane, filePane),
    h('div', { class: 'panel' }, h('h3', null, t('panel.results')), results),
  );
}

// ---------------------------------------------------------- custom: JWT

function mountJwt(root) {
  const out = h('div');
  const input = h('textarea', {
    class: 'code', style: { minHeight: '110px' }, spellcheck: false,
    placeholder: 'eyJhbGciOi…', oninput: () => render(),
  });

  function decodePart(part) {
    return JSON.parse(new TextDecoder().decode(base64ToBytes(part)));
  }

  function table(obj, extra = {}) {
    const table_ = h('table', { class: 'kv' });
    for (const [k, v] of Object.entries(obj)) {
      table_.append(h('tr', null,
        h('td', null, k),
        h('td', { class: 'v' }, typeof v === 'object' ? JSON.stringify(v) : String(v)),
        h('td', { style: { color: 'var(--fg-3)', width: '190px', whiteSpace: 'nowrap' } }, extra[k] || '')));
    }
    return table_;
  }

  function render() {
    clear(out);
    const token = input.value.trim().replace(/^Bearer\s+/i, '');
    if (!token) return;
    const parts = token.split('.');
    if (parts.length !== 3) {
      out.append(h('div', { class: 'msg err' }, t('err.jwtParts', { n: parts.length })));
      return;
    }

    let header; let payload;
    try { header = decodePart(parts[0]); } catch { out.append(h('div', { class: 'msg err' }, t('err.jwtHeader'))); return; }
    try { payload = decodePart(parts[1]); } catch { out.append(h('div', { class: 'msg err' }, t('err.jwtPayload'))); return; }

    const now = Math.floor(Date.now() / 1000);
    const when = (ts) => new Date(ts * 1000).toLocaleString('ca');
    const notes = {};
    if (payload.exp) notes.exp = `${when(payload.exp)} · ${t(payload.exp < now ? 'jwt.expiredFlag' : 'jwt.validFlag')}`;
    if (payload.iat) notes.iat = when(payload.iat);
    if (payload.nbf) notes.nbf = `${when(payload.nbf)}${payload.nbf > now ? ` · ${t('jwt.notYet')}` : ''}`;

    out.append(
      payload.exp && payload.exp < now
        ? h('div', { class: 'msg err' }, t('jwt.expiredAt', { when: when(payload.exp) }))
        : h('div', { class: 'msg ok' }, t('jwt.ok')),
      h('div', { class: 'panel' }, h('h3', null, t('jwt.header')), table(header)),
      h('div', { class: 'panel' }, h('h3', null, t('jwt.payload')), table(payload, notes)),
      h('div', { class: 'panel' },
        h('h3', null, t('jwt.full')),
        h('pre', { class: 'out' }, JSON.stringify({ header, payload }, null, 2)),
        h('div', { class: 'actions' }, copyBtn(() => JSON.stringify({ header, payload }, null, 2)))),
    );
  }

  root.append(h('div', { class: 'panel' }, h('h3', null, t('jwt.token')), input), out);
}

// ---------------------------------------------------------------- exports

export const runners = {
  'json-to-csv': jsonToCsv,
  'csv-to-json': csvToJson,
  'json-to-yaml': jsonToYaml,
  'yaml-to-json': yamlToJson,
  'json-format': jsonFormat,
  'base64-text': base64Text,
  'base64-file': base64File,
};

export const mounts = {
  'jwt-decode': mountJwt,
  hash: mountHash,
};
