import { csso, terser, qrgen } from '../core/deps.js';
import { h, clear, copyBtn, debounce } from '../core/dom.js';
import { downloadBlob } from '../core/files.js';
import { t } from '../i18n.js';

// -------------------------------------------------------------- minifiers

async function minifyCss(text, p) {
  const mod = await csso();
  const minify = mod.minify || mod.default?.minify;
  if (!minify) throw new Error(t('err.cssoInit'));
  try {
    return minify(text, {
      restructure: !!p.restructure,
      comments: p.comments ? 'exclamation' : false,
    }).css;
  } catch (e) {
    throw new Error(t('err.cssInvalid', { detail: e.message }));
  }
}

async function minifyJs(text, p) {
  const mod = await terser();
  const minify = mod.minify || mod.default?.minify;
  if (!minify) throw new Error(t('err.terserInit'));
  const res = await minify(text, {
    mangle: !!p.mangle,
    compress: !!p.compress,
    module: !!p.module,
    ecma: Number(p.ecma) || 2020,
    format: { comments: false },
  }).catch((e) => {
    throw new Error(e.line ? t('err.jsAt', { msg: e.message, line: e.line, col: e.col }) : e.message);
  });
  return res.code ?? '';
}

// ----------------------------------------------------------------- colors

function parseColor(str) {
  const s = str.trim().toLowerCase();
  let m = s.match(/^#?([0-9a-f]{3,8})$/);
  if (m) {
    let hx = m[1];
    if (hx.length === 3 || hx.length === 4) hx = [...hx].map((c) => c + c).join('');
    if (hx.length !== 6 && hx.length !== 8) return null;
    return {
      r: parseInt(hx.slice(0, 2), 16),
      g: parseInt(hx.slice(2, 4), 16),
      b: parseInt(hx.slice(4, 6), 16),
      a: hx.length === 8 ? parseInt(hx.slice(6, 8), 16) / 255 : 1,
    };
  }
  m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    if (parts.length < 3) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  }
  m = s.match(/^hsla?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[\s,/%]+/).filter(Boolean).map(parseFloat);
    if (parts.length < 3) return null;
    return { ...hslToRgb(parts[0], parts[1] / 100, parts[2] / 100), a: parts[3] ?? 1 };
  }
  // Let the browser resolve named colours.
  const probe = document.createElement('span');
  probe.style.color = '';
  probe.style.color = s;
  if (!probe.style.color) return null;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  const rm = resolved.match(/rgba?\(([^)]+)\)/);
  if (!rm) return null;
  const parts = rm[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
}

function hslToRgb(hDeg, s, l) {
  const h = ((hDeg % 360) + 360) % 360 / 360;
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return { r: Math.round(f(h + 1 / 3) * 255), g: Math.round(f(h) * 255), b: Math.round(f(h - 1 / 3) * 255) };
}

function rgbToHsl({ r, g, b }) {
  const R = r / 255; const G = g / 255; const B = b / 255;
  const max = Math.max(R, G, B); const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hh;
  if (max === R) hh = ((G - B) / d + (G < B ? 6 : 0));
  else if (max === G) hh = (B - R) / d + 2;
  else hh = (R - G) / d + 4;
  return { h: hh * 60, s, l };
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function rgbToOklch({ r, g, b }) {
  const R = toLinear(r / 255); const G = toLinear(g / 255); const B = toLinear(b / 255);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  const C = Math.hypot(A, Bb);
  let H = (Math.atan2(Bb, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

const luminance = ({ r, g, b }) => 0.2126 * toLinear(r / 255) + 0.7152 * toLinear(g / 255) + 0.0722 * toLinear(b / 255);
const contrast = (a, b) => {
  const l1 = luminance(a); const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
const hexOf = ({ r, g, b }) => `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
const mix = (a, b, t) => ({ r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t });

function mountColor(root) {
  const out = h('div');
  const text = h('input', { type: 'text', value: '#6aa8ff', oninput: () => render() });
  const pick = h('input', {
    type: 'color', value: '#6aa8ff', style: { width: '52px', height: '38px', padding: '2px' },
    oninput: (e) => { text.value = e.target.value; render(); },
  });

  function rating(ratio) {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return t('color.aaLarge');
    return t('color.fail');
  }

  function render() {
    clear(out);
    const c = parseColor(text.value);
    if (!c) { out.append(h('div', { class: 'msg err' }, t('err.colorUnknown'))); return; }
    const hexv = hexOf(c);
    try { pick.value = hexv; } catch { /* alpha colours */ }

    const hsl = rgbToHsl(c);
    const ok = rgbToOklch(c);
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };
    const cw = contrast(c, white);
    const cb = contrast(c, black);

    const rows = [
      ['HEX', c.a < 1 ? hexv + Math.round(c.a * 255).toString(16).padStart(2, '0') : hexv],
      ['RGB', c.a < 1 ? `rgb(${Math.round(c.r)} ${Math.round(c.g)} ${Math.round(c.b)} / ${c.a.toFixed(2)})` : `rgb(${Math.round(c.r)} ${Math.round(c.g)} ${Math.round(c.b)})`],
      ['HSL', `hsl(${hsl.h.toFixed(1)} ${(hsl.s * 100).toFixed(1)}% ${(hsl.l * 100).toFixed(1)}%)`],
      ['OKLCH', `oklch(${(ok.L * 100).toFixed(1)}% ${ok.C.toFixed(4)} ${ok.H.toFixed(1)})`],
    ];

    const table = h('table', { class: 'kv' });
    for (const [k, v] of rows) {
      table.append(h('tr', null, h('td', null, k), h('td', { class: 'v' }, v), h('td', { style: { width: '80px' } }, copyBtn(() => v))));
    }

    const shades = h('div', { class: 'shades' });
    for (let i = 0; i <= 10; i++) {
      const step = i / 10;
      const shade = step < 0.5 ? mix(white, c, step * 2) : mix(c, black, (step - 0.5) * 2);
      const hx = hexOf(shade);
      shades.append(h('div', {
        style: { background: hx }, title: `${hx} — clic per copiar`,
        onclick: () => navigator.clipboard?.writeText(hx),
      }));
    }

    out.append(
      h('div', { class: 'panel' },
        h('div', { class: 'swatch', style: { background: hexv } }),
        shades,
        h('p', { class: 'note' }, t('color.scaleNote'))),
      h('div', { class: 'panel' }, h('h3', null, t('color.formats')), table),
      h('div', { class: 'panel' },
        h('h3', null, t('color.contrast')),
        h('table', { class: 'kv' },
          h('tr', null, h('td', null, t('color.onWhite')), h('td', { class: 'v' }, `${cw.toFixed(2)}:1`), h('td', { style: { color: cw >= 4.5 ? 'var(--ok)' : 'var(--warn)' } }, rating(cw))),
          h('tr', null, h('td', null, t('color.onBlack')), h('td', { class: 'v' }, `${cb.toFixed(2)}:1`), h('td', { style: { color: cb >= 4.5 ? 'var(--ok)' : 'var(--warn)' } }, rating(cb)))),
        h('p', {
          class: 'note',
          style: { background: hexv, color: cw > cb ? '#fff' : '#000', padding: '10px', borderRadius: '8px', marginTop: '10px' },
        }, t('color.sample'))),
    );
  }

  root.append(h('div', { class: 'panel' },
    h('h3', null, t('panel.colour')),
    h('div', { class: 'range-wrap' }, pick, text)), out);
  render();
}

// ------------------------------------------------------------------ regex

function mountRegex(root) {
  const out = h('div');
  const pattern = h('input', { type: 'text', value: '(\\w+)@(\\w+\\.\\w+)', oninput: () => run() });
  const replacement = h('input', { type: 'text', placeholder: '$1 [at] $2', oninput: () => run() });
  const subject = h('textarea', {
    class: 'code', spellcheck: false, style: { minHeight: '170px' }, oninput: () => run(),
  }, t('regex.sample'));

  const flags = { g: true, i: false, m: false, s: false, u: false };
  const flagRow = h('div', { class: 'params' }, Object.keys(flags).map((f) => {
    const id = `flag-${f}`;
    return h('div', { class: 'field row' },
      h('input', { type: 'checkbox', id, checked: flags[f], onchange: (e) => { flags[f] = e.target.checked; run(); } }),
      h('label', { for: id }, `${f} — ${t(`regex.flag.${f}`)}`));
  }));

  const run = debounce(() => {
    clear(out);
    const src = pattern.value;
    if (!src) return;
    const fl = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('');
    let re;
    try {
      re = new RegExp(src, fl);
    } catch (e) {
      out.append(h('div', { class: 'msg err' }, t('err.regexInvalid', { detail: e.message })));
      return;
    }

    const text = subject.value;
    const matches = [...text.matchAll(flags.g ? re : new RegExp(src, `${fl}g`))];
    const shown = flags.g ? matches : matches.slice(0, 1);

    // Highlighted subject, built as nodes so the text is never interpreted.
    const pre = h('pre', { class: 'out' });
    let last = 0;
    for (const m of shown) {
      if (m.index > last) pre.append(text.slice(last, m.index));
      pre.append(h('mark', { class: 'hl' }, m[0] || '​'));
      last = m.index + (m[0].length || 1);
    }
    pre.append(text.slice(last));

    const detail = h('div');
    if (!shown.length) {
      detail.append(h('div', { class: 'msg info' }, t('regex.noMatches')));
    } else {
      const t = h('table', { class: 'kv' });
      shown.slice(0, 60).forEach((m, i) => {
        const groups = m.slice(1).map((g, gi) => `$${gi + 1}=${g === undefined ? '—' : JSON.stringify(g)}`).join('  ');
        const named = m.groups ? Object.entries(m.groups).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join('  ') : '';
        t.append(h('tr', null,
          h('td', null, `#${i + 1} · pos ${m.index}`),
          h('td', { class: 'v' }, JSON.stringify(m[0])),
          h('td', { class: 'v', style: { color: 'var(--fg-2)' } }, [groups, named].filter(Boolean).join('  ') || '—')));
      });
      detail.append(t);
      if (shown.length > 60) detail.append(h('p', { class: 'note' }, t('regex.andMore', { n: shown.length - 60 })));
    }

    const panels = [
      h('div', { class: 'panel' },
        h('h3', null, shown.length === 1 ? t('regex.matchOne') : t('regex.matches', { n: shown.length })),
        pre),
      h('div', { class: 'panel' }, h('h3', null, t('regex.detail')), detail),
    ];

    if (replacement.value) {
      let replaced = '';
      try { replaced = text.replace(re, replacement.value); } catch (e) { replaced = e.message; }
      panels.push(h('div', { class: 'panel' },
        h('h3', null, t('regex.substitution')),
        h('pre', { class: 'out' }, replaced),
        h('div', { class: 'actions' }, copyBtn(() => replaced))));
    }
    out.append(...panels);
  }, 160);

  root.append(
    h('div', { class: 'panel' },
      h('h3', null, t('regex.expression')),
      h('div', { class: 'params' },
        h('div', { class: 'field wide' }, h('label', null, t('regex.pattern')), pattern),
        h('div', { class: 'field wide' }, h('label', null, t('regex.replacement')), replacement)),
      h('div', { style: { marginTop: '12px' } }, flagRow)),
    h('div', { class: 'panel' }, h('h3', null, t('regex.subject')), subject),
    out);
  run();
}

// --------------------------------------------------------------------- QR

function mountQr(root) {
  const out = h('div');
  const text = h('textarea', { class: 'code', style: { minHeight: '110px' }, spellcheck: false, oninput: () => run() }, 'https://example.com');
  const ecc = h('select', { onchange: () => run() },
    [['L', 'L — 7 %'], ['M', 'M — 15 %'], ['Q', 'Q — 25 %'], ['H', 'H — 30 %']]
      .map(([v, t]) => h('option', { value: v, selected: v === 'M' }, t)));
  const size = h('input', { type: 'number', value: 512, min: 64, max: 4096, step: 32, onchange: () => run() });
  const margin = h('input', { type: 'number', value: 4, min: 0, max: 16, step: 1, onchange: () => run() });
  const dark = h('input', { type: 'color', value: '#000000', oninput: () => run(), style: { width: '52px', height: '38px', padding: '2px' } });
  const light = h('input', { type: 'color', value: '#ffffff', oninput: () => run(), style: { width: '52px', height: '38px', padding: '2px' } });

  function buildSvg(qr, px, quiet, fg, bg) {
    const n = qr.getModuleCount();
    const total = n + quiet * 2;
    const cell = px / total;
    let path = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!qr.isDark(r, c)) continue;
        const x = ((c + quiet) * cell).toFixed(3);
        const y = ((r + quiet) * cell).toFixed(3);
        path += `M${x} ${y}h${cell.toFixed(3)}v${cell.toFixed(3)}h-${cell.toFixed(3)}z`;
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}" shape-rendering="crispEdges">`
      + `<rect width="${px}" height="${px}" fill="${bg}"/><path d="${path}" fill="${fg}"/></svg>`;
  }

  const run = debounce(async () => {
    clear(out);
    const value = text.value;
    if (!value.trim()) return;

    let qrcode;
    try {
      const mod = await qrgen();
      qrcode = mod.default || mod;
      if (qrcode.stringToBytesFuncs?.['UTF-8']) qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    } catch (e) {
      out.append(h('div', { class: 'msg err' }, e.message));
      return;
    }

    let qr;
    try {
      qr = qrcode(0, ecc.value);
      qr.addData(value);
      qr.make();
    } catch (e) {
      out.append(h('div', { class: 'msg err' }, t('err.qrTooLong', { detail: e.message })));
      return;
    }

    const px = Math.max(64, Number(size.value) || 512);
    const svg = buildSvg(qr, px, Math.max(0, Number(margin.value) || 0), dark.value, light.value);
    const holder = h('div', { class: 'qr-out', style: { background: light.value }, html: svg });

    async function downloadPng() {
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      try {
        const img = await new Promise((res, rej) => {
          const i = new Image();
          i.onload = () => res(i);
          i.onerror = () => rej(new Error(t('err.qrRaster')));
          i.src = url;
        });
        const canvas = Object.assign(document.createElement('canvas'), { width: px, height: px });
        canvas.getContext('2d').drawImage(img, 0, 0, px, px);
        canvas.toBlob((b) => b && downloadBlob(b, 'qr.png'), 'image/png');
      } finally {
        URL.revokeObjectURL(url);
      }
    }

    out.append(h('div', { class: 'panel' },
      holder,
      h('div', { class: 'actions' },
        h('button', { class: 'btn', onclick: downloadPng }, t('qr.downloadPng', { px })),
        h('button', { class: 'btn ghost', onclick: () => downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'qr.svg') }, t('qr.downloadSvg')),
        copyBtn(() => svg, t('qr.copySvg')),
        h('span', { class: 'spacer' }),
        h('span', { class: 'hint' }, t('qr.stats', { n: qr.getModuleCount(), chars: value.length })))));
  }, 200);

  const field = (label, control) => h('div', { class: 'field' }, h('label', null, label), control);
  root.append(
    h('div', { class: 'panel' }, h('h3', null, t('qr.content')), text),
    h('div', { class: 'panel' }, h('h3', null, t('panel.options')),
      h('div', { class: 'params' },
        field(t('qr.ecc'), ecc),
        field(t('qr.size'), size),
        field(t('qr.margin'), margin),
        field(t('panel.colour'), dark),
        field(t('panel.background'), light))),
    out);
  run();
}

// ------------------------------------------------------------------- diff

/** Classic LCS backtrack, capped so a pair of huge files cannot freeze the tab. */
function lineDiff(a, b) {
  const n = a.length; const m = b.length;
  if (n * m > 6e6) throw new Error(t('err.diffTooBig', { n, m }));
  const dp = new Uint32Array((n + 1) * (m + 1));
  const at = (i, j) => i * (m + 1) + j;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[at(i, j)] = a[i] === b[j] ? dp[at(i + 1, j + 1)] + 1 : Math.max(dp[at(i + 1, j)], dp[at(i, j + 1)]);
    }
  }
  const ops = [];
  let i = 0; let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push({ t: '=', a: i++, b: j++ }); }
    else if (dp[at(i + 1, j)] >= dp[at(i, j + 1)]) ops.push({ t: '-', a: i++ });
    else ops.push({ t: '+', b: j++ });
  }
  while (i < n) ops.push({ t: '-', a: i++ });
  while (j < m) ops.push({ t: '+', b: j++ });
  return ops;
}

function mountDiff(root) {
  const out = h('div');
  const left = h('textarea', { class: 'code', spellcheck: false, placeholder: 'Text original…', oninput: () => run() });
  const right = h('textarea', { class: 'code', spellcheck: false, placeholder: 'Text nou…', oninput: () => run() });
  const ctxInput = h('input', { type: 'number', value: 3, min: 0, max: 50, onchange: () => run() });
  const trimWs = h('input', { type: 'checkbox', id: 'd-ws', checked: false, onchange: () => run() });

  const run = debounce(() => {
    clear(out);
    if (!left.value && !right.value) return;
    const norm = (s) => (trimWs.checked ? s.trimEnd() : s);
    const a = left.value.split('\n').map(norm);
    const b = right.value.split('\n').map(norm);

    let ops;
    try { ops = lineDiff(a, b); } catch (e) { out.append(h('div', { class: 'msg err' }, e.message)); return; }

    const changed = ops.filter((o) => o.t !== '=').length;
    const ctx = Math.max(0, Number(ctxInput.value) || 0);
    const keep = new Array(ops.length).fill(false);
    ops.forEach((o, k) => {
      if (o.t === '=') return;
      for (let q = Math.max(0, k - ctx); q <= Math.min(ops.length - 1, k + ctx); q++) keep[q] = true;
    });

    const view = h('div', { class: 'diff' });
    let hidden = 0;
    const flush = () => {
      if (!hidden) return;
      view.append(h('div', { class: 'ln' }, h('i'), h('i'), h('code', { style: { color: 'var(--fg-3)' } }, t('diff.folded', { n: hidden }))));
      hidden = 0;
    };
    for (const [k, o] of ops.entries()) {
      if (!keep[k]) { hidden++; continue; }
      flush();
      const cls = o.t === '+' ? 'add' : o.t === '-' ? 'del' : '';
      const line = o.t === '+' ? b[o.b] : a[o.a];
      view.append(h('div', { class: `ln ${cls}` },
        h('i', null, o.a != null ? o.a + 1 : ''),
        h('i', null, o.b != null ? o.b + 1 : ''),
        h('code', null, `${o.t === '=' ? ' ' : o.t} ${line}`)));
    }
    flush();

    const adds = ops.filter((o) => o.t === '+').length;
    const dels = ops.filter((o) => o.t === '-').length;
    out.append(h('div', { class: 'panel' },
      h('h3', null, changed ? t('diff.summary', { added: adds, removed: dels }) : t('diff.identical')),
      changed ? view : null));
  }, 220);

  root.append(
    h('div', { class: 'panel' }, h('h3', null, 'Opcions'),
      h('div', { class: 'params' },
        h('div', { class: 'field' }, h('label', null, t('diff.context')), ctxInput),
        h('div', { class: 'field row' }, trimWs, h('label', { for: 'd-ws' }, t('diff.trimWs'))))),
    h('div', { class: 'io' },
      h('div', null, h('div', { class: 'io-head' }, h('label', null, t('diff.original'))), left),
      h('div', null, h('div', { class: 'io-head' }, h('label', null, t('diff.new'))), right)),
    out);
}

// ---------------------------------------------------------------- exports

export const runners = {
  'minify-css': minifyCss,
  'minify-js': minifyJs,
};

export const mounts = {
  color: mountColor,
  regex: mountRegex,
  qr: mountQr,
  diff: mountDiff,
};
