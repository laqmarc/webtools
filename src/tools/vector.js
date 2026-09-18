import { svgo } from '../core/deps.js';
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

export const runners = {
  'svg-optimize': optimizeSvg,
  'svg-to-png': svgToRaster,
};
