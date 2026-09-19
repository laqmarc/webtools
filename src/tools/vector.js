import { svgo, pdfLib } from '../core/deps.js';
import { baseName, withExt } from '../core/files.js';
import { t } from '../i18n.js';

// ------------------------------------------------------------ optimitzar

async function optimizeSvg(input, p) {
  const { optimize } = await svgo();
  const text = await input.blob.text();
  const plugins = [
    { name: 'preset-default', params: { overrides: { removeViewBox: false } } },
  ];
  if (p.removeDimensions) plugins.push('removeDimensions');
  if (p.prefixIds) {
    plugins.push({ name: 'prefixIds', params: { prefix: baseName(input.name).replace(/[^a-zA-Z0-9_-]/g, '-') } });
  }

  let res;
  try {
    res = optimize(text, {
      multipass: !!p.multipass,
      floatPrecision: Number(p.precision) ?? 3,
      js2svg: { pretty: !!p.pretty, indent: 2 },
      plugins,
    });
  } catch (e) {
    throw new Error(t('err.svgInvalid', { detail: e.message }));
  }

  return {
    name: input.name,
    blob: new Blob([res.data], { type: 'image/svg+xml;charset=utf-8' }),
  };
}

// --------------------------------------------------------- rasteritzar

/** Read the drawing size out of the markup so we never inherit the 300×150 default. */
function intrinsicSize(svgEl) {
  const num = (v) => {
    const m = String(v || '').match(/^\s*([\d.]+)\s*(px)?\s*$/);
    return m ? parseFloat(m[1]) : 0;
  };
  let w = num(svgEl.getAttribute('width'));
  let h = num(svgEl.getAttribute('height'));
  const vb = (svgEl.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  if ((!w || !h) && vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
    if (!w && !h) { w = vb[2]; h = vb[3]; }
    else if (!w) w = h * (vb[2] / vb[3]);
    else h = w * (vb[3] / vb[2]);
  }
  return { w: w || 300, h: h || 150 };
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(t('err.svgDraw')));
    img.src = url;
  });
}

const toBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
  canvas.toBlob((b) => (b ? resolve(b) : reject(new Error(t('err.encodeTo', { type })))), type, quality);
});

async function svgToRaster(input, p) {
  const text = await input.blob.text();
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const svgEl = doc.documentElement;
  if (!svgEl || svgEl.nodeName === 'parsererror' || doc.querySelector('parsererror')) {
    throw new Error(t('err.svgInvalidPlain'));
  }

  const { w: iw, h: ih } = intrinsicSize(svgEl);
  const target = Number(p.width) > 0
    ? { w: Number(p.width), h: Math.round(Number(p.width) * (ih / iw)) }
    : { w: Math.round(iw * (Number(p.scale) || 1)), h: Math.round(ih * (Number(p.scale) || 1)) };

  // Pin the size on the root: without it Chrome rasterises at the default size.
  if (!svgEl.getAttribute('viewBox')) svgEl.setAttribute('viewBox', `0 0 ${iw} ${ih}`);
  svgEl.setAttribute('width', target.w);
  svgEl.setAttribute('height', target.h);

  const src = new XMLSerializer().serializeToString(doc);
  const url = URL.createObjectURL(new Blob([src], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = await loadImage(url);
    const canvas = Object.assign(document.createElement('canvas'), { width: Math.max(1, target.w), height: Math.max(1, target.h) });
    const ctx = canvas.getContext('2d');
    const opaque = !p.transparent || p.format === 'jpeg';
    if (opaque) {
      ctx.fillStyle = p.background || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const type = { png: 'image/png', webp: 'image/webp', jpeg: 'image/jpeg' }[p.format] || 'image/png';
    const blob = await toBlob(canvas, type, Math.min(1, Math.max(0.01, (p.quality ?? 90) / 100)));
    return { name: withExt(input.name, { png: 'png', webp: 'webp', jpeg: 'jpg' }[p.format] || 'png'), blob };
  } finally {
    URL.revokeObjectURL(url);
  }
}


// -------------------------------------------------------------- a PDF

/** Analitza l'SVG i el torna amb la mida coneguda. Tres eines ho necessiten. */
function parseSvg(text) {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const svgEl = doc.documentElement;
  if (!svgEl || svgEl.nodeName === 'parsererror' || doc.querySelector('parsererror')) {
    throw new Error(t('err.svgInvalidPlain'));
  }
  return { doc, svgEl, size: intrinsicSize(svgEl) };
}

/**
 * Un PDF d'una pagina amb el dibuix a dins.
 *
 * Rasteritza. pdf-lib no sap llegir SVG, i traduir-ne el cami de pintura
 * sencer -gradients, mascares, text amb tipografia- seria escriure un motor
 * de renderitzat; el que surt d'aqui es una imatge a la resolucio que
 * demanis, i el text de dins deixa de ser text. La pagina, aixo si, queda a
 * la mida real del dibuix en punts, o sigui que s'imprimeix com toca.
 */
async function svgToPdf(input, p) {
  const { PDFDocument } = await pdfLib();
  const { doc, svgEl, size } = parseSvg(await input.blob.text());

  const dpi = Math.min(600, Math.max(72, Number(p.dpi) || 150));
  const scale = dpi / 96; // el px de CSS es 1/96 de polzada
  const px = { w: Math.max(1, Math.round(size.w * scale)), h: Math.max(1, Math.round(size.h * scale)) };

  if (!svgEl.getAttribute('viewBox')) svgEl.setAttribute('viewBox', `0 0 ${size.w} ${size.h}`);
  svgEl.setAttribute('width', px.w);
  svgEl.setAttribute('height', px.h);

  const url = URL.createObjectURL(new Blob(
    [new XMLSerializer().serializeToString(doc)],
    { type: 'image/svg+xml;charset=utf-8' },
  ));
  let png;
  try {
    const img = await loadImage(url);
    const canvas = Object.assign(document.createElement('canvas'), { width: px.w, height: px.h });
    const ctx = canvas.getContext('2d');
    if (!p.transparent) {
      ctx.fillStyle = p.background || '#ffffff';
      ctx.fillRect(0, 0, px.w, px.h);
    }
    ctx.drawImage(img, 0, 0, px.w, px.h);
    png = await toBlob(canvas, 'image/png');
  } finally {
    URL.revokeObjectURL(url);
  }

  // 1 px de CSS = 0,75 punts: la pagina surt de la mida real del dibuix.
  const pt = { w: size.w * 0.75, h: size.h * 0.75 };
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([pt.w, pt.h]);
  const embedded = await pdf.embedPng(await png.arrayBuffer());
  page.drawImage(embedded, { x: 0, y: 0, width: pt.w, height: pt.h });

  return {
    name: withExt(input.name, 'pdf'),
    blob: new Blob([await pdf.save()], { type: 'application/pdf' }),
    note: t('note.svgRasterised', { dpi, w: px.w, h: px.h }),
  };
}

// ----------------------------------------------------------- a data URI

/**
 * Es codifica amb percentatges i no amb base64: un SVG es text, i el base64
 * l'engreixa un terc llarg per res. Nomes s'escapen els caracters que
 * trencarien un url(...), que es el que el deixa curt i encara llegible.
 */
const svgDataUri = (svg) => `data:image/svg+xml,${
  svg.replace(/\s+/g, ' ').trim()
    .replace(/%/g, '%25').replace(/#/g, '%23').replace(/&/g, '%26')
    .replace(/"/g, "'")
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
}`;

async function svgToCss(input, p) {
  const text = await input.blob.text();
  parseSvg(text); // si no es un SVG valid, millor dir-ho ara
  const uri = svgDataUri(text);
  const name = baseName(input.name).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'icona';

  let out;
  let ext;
  if (p.mode === 'uri') {
    out = uri;
    ext = 'txt';
  } else if (p.mode === 'img') {
    out = `<img src="${uri}" alt="" width="24" height="24">`;
    ext = 'html';
  } else if (p.mode === 'var') {
    out = `:root {\n  --${name}: url("${uri}");\n}`;
    ext = 'css';
  } else {
    out = `.${name} {\n  background-image: url("${uri}");\n  background-repeat: no-repeat;\n  background-size: contain;\n}`;
    ext = 'css';
  }

  return {
    name: withExt(input.name, ext),
    blob: new Blob([`${out}\n`], {
      type: ext === 'css' ? 'text/css;charset=utf-8' : 'text/plain;charset=utf-8',
    }),
    note: uri.length > 4000 ? t('note.svgUriBig', { kb: Math.round(uri.length / 1024) }) : undefined,
  };
}

// -------------------------------------------------------------- esprai

/**
 * Un sol fitxer amb tots els dibuixos com a <symbol>, per posar-los amb
 * <use href="#icona-nom">. Una peticio en comptes de vint, i amb els fills
 * despullats de fill el color el decideix el CSS que els faci servir.
 */
async function svgSprite(inputs, p) {
  const prefix = String(p.prefix || '').trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/-$/, '');
  const seen = new Set();
  const symbols = [];

  for (const input of inputs) {
    const { svgEl, size } = parseSvg(await input.blob.text());
    let id = baseName(input.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'icona';
    if (prefix) id = `${prefix}-${id}`;
    let unique = id;
    let n = 2;
    while (seen.has(unique)) unique = `${id}-${n++}`;
    seen.add(unique);

    const viewBox = svgEl.getAttribute('viewBox') || `0 0 ${size.w} ${size.h}`;
    const symbol = svgEl.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'symbol');
    symbol.setAttribute('id', unique);
    symbol.setAttribute('viewBox', viewBox);
    while (svgEl.firstChild) symbol.appendChild(svgEl.firstChild);

    if (p.currentColor) {
      for (const el of symbol.querySelectorAll('*')) {
        const fill = el.getAttribute('fill');
        if (fill && fill !== 'none') el.setAttribute('fill', 'currentColor');
        const stroke = el.getAttribute('stroke');
        if (stroke && stroke !== 'none') el.setAttribute('stroke', 'currentColor');
      }
    }
    symbols.push(new XMLSerializer().serializeToString(symbol));
  }

  if (!symbols.length) throw new Error(t('err.spriteEmpty'));

  const open = p.hidden
    ? '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">'
    : '<svg xmlns="http://www.w3.org/2000/svg">';
  const body = `${open}\n  ${symbols.join('\n  ')}\n</svg>\n`;
  const ids = [...seen];

  return {
    name: 'sprite.svg',
    blob: new Blob([body], { type: 'image/svg+xml;charset=utf-8' }),
    note: t('note.spriteIds', { ids: ids.slice(0, 3).join(', ') + (ids.length > 3 ? '...' : '') }),
  };
}

// ----------------------------------------------------------- recolorir

const COLOUR_ATTRS = ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color'];

/** #ABC -> #aabbcc, i qualsevol altra cosa tal com ve. */
function normalColour(v) {
  const s = String(v || '').trim().toLowerCase();
  const m = s.match(/^#([0-9a-f]{3})$/);
  return m ? `#${m[1].split('').map((c) => c + c).join('')}` : s;
}

/**
 * Canviar el color d'un joc d'icones sense obrir-les d'una en una.
 *
 * Toca els atributs i tambe els que van dins d'un style="", que es on els
 * deixa la meitat dels exportadors. El que no fa es entrar en un <style> del
 * document: alla hauria d'entendre CSS, i per a aixo ja hi ha el
 * cercar-i-substituir de qualsevol editor.
 */
async function svgRecolour(input, p) {
  const { doc, svgEl } = parseSvg(await input.blob.text());
  const from = normalColour(p.from);
  const to = p.mode === 'current' ? 'currentColor' : (p.to || '#000000');
  let changed = 0;

  const wants = (value) => {
    const v = normalColour(value);
    if (!v || v === 'none' || v === 'transparent' || v.startsWith('url(')) return false;
    return p.mode === 'one' ? v === from : true;
  };

  for (const el of [svgEl, ...svgEl.querySelectorAll('*')]) {
    for (const attr of COLOUR_ATTRS) {
      const value = el.getAttribute(attr);
      if (value && wants(value)) { el.setAttribute(attr, to); changed++; }
    }
    const style = el.getAttribute('style');
    if (!style) continue;
    const next = style.replace(
      /(^|;)\s*(fill|stroke|stop-color|flood-color|lighting-color)\s*:\s*([^;]+)/gi,
      (whole, head, prop, value) => {
        if (!wants(value)) return whole;
        changed++;
        return `${head}${prop}:${to}`;
      },
    );
    if (next !== style) el.setAttribute('style', next);
  }

  // Un SVG sense cap color declarat es pinta de negre per defecte, i llavors
  // no hi ha res per substituir: val mes dir-ho que tornar el mateix fitxer
  // fent veure que s'ha fet alguna cosa.
  if (!changed) {
    return { name: input.name, blob: input.blob, note: t('note.recolourNone') };
  }

  return {
    name: input.name,
    blob: new Blob([new XMLSerializer().serializeToString(doc)], { type: 'image/svg+xml;charset=utf-8' }),
    note: t('note.recolourDone', { n: changed }),
  };
}

export const runners = {
  'svg-optimize': optimizeSvg,
  'svg-to-png': svgToRaster,
  'svg-to-pdf': svgToPdf,
  'svg-to-css': svgToCss,
  'svg-sprite': svgSprite,
  'svg-recolour': svgRecolour,
};
