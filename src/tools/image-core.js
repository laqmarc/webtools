// The whole raster pipeline. Written against OffscreenCanvas only, so the same
// file runs inside the worker and, if workers are unavailable, on the main
// thread. Nothing here touches the DOM.

import { avifEnc } from '../core/deps.js';
import { t } from '../i18n.js';

const MIME = { webp: 'image/webp', jpeg: 'image/jpeg', png: 'image/png', avif: 'image/avif' };

export function extFor(fmt) {
  return { webp: 'webp', jpeg: 'jpg', png: 'png', avif: 'avif' }[fmt] || 'bin';
}

/** Resolve 'same' against the source type, mapping formats we cannot write to PNG. */
export function resolveFormat(fmt, sourceType) {
  if (fmt && fmt !== 'same') return fmt;
  const type = (sourceType || '').toLowerCase();
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpeg';
  if (type.includes('webp')) return 'webp';
  if (type.includes('avif')) return 'avif';
  return 'png';
}

async function decode(blob, applyOrientation = true) {
  try {
    return await createImageBitmap(blob, { imageOrientation: applyOrientation ? 'from-image' : 'none' });
  } catch (e) {
    throw new Error(t('err.imageUnreadable', { type: blob.type || t('err.unknownType'), detail: e.message }));
  }
}

function canvasOf(w, h) {
  const c = new OffscreenCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  const ctx = c.getContext('2d', { alpha: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return { c, ctx };
}

function flatten(ctx, w, h, color) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = color || '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// ---------------------------------------------------------------- encoding

let avifNative = null; // null = untested, true/false once known

async function canvasSupportsAvif(canvas) {
  if (avifNative !== null) return avifNative;
  try {
    const b = await canvas.convertToBlob({ type: 'image/avif', quality: 0.5 });
    avifNative = b.type === 'image/avif';
  } catch {
    avifNative = false;
  }
  return avifNative;
}

/**
 * No browser engine writes AVIF from a canvas today — Chrome quietly hands
 * back a PNG — so this WASM codec is the only path, not a rare fallback.
 */
async function encodeAvifWasm(canvas, quality) {
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const mod = await avifEnc();
  const buf = await mod.encode(data, { cqLevel: Math.round(63 - (quality / 100) * 63), speed: 6 });
  return new Blob([buf], { type: 'image/avif' });
}

/** Encode a canvas. `quality` is 1..100; PNG ignores it. */
export async function encode(canvas, fmt, quality = 82) {
  const type = MIME[fmt] || 'image/png';
  if (fmt === 'avif' && !(await canvasSupportsAvif(canvas))) return encodeAvifWasm(canvas, quality);
  const blob = await canvas.convertToBlob({ type, quality: Math.min(1, Math.max(0.01, quality / 100)) });
  // Some engines silently fall back to PNG for formats they cannot write.
  if (blob.type !== type && fmt !== 'png') {
    if (fmt === 'avif') return encodeAvifWasm(canvas, quality);
    throw new Error(t('err.cannotWriteFormat', { format: fmt.toUpperCase() }));
  }
  return blob;
}

// ---------------------------------------------------------------- geometry

function fitSize(sw, sh, tw, th, fit, noUpscale) {
  let w = Number(tw) || 0;
  let h = Number(th) || 0;
  if (!w && !h) { w = sw; h = sh; }
  else if (!w) w = Math.round(sw * (h / sh));
  else if (!h) h = Math.round(sh * (w / sw));
  else if (fit === 'contain') {
    const k = Math.min(w / sw, h / sh);
    w = Math.round(sw * k); h = Math.round(sh * k);
  }
  if (noUpscale && (w > sw || h > sh)) {
    const k = Math.min(sw / w, sh / h);
    w = Math.round(w * k); h = Math.round(h * k);
  }
  return { w: Math.max(1, w), h: Math.max(1, h) };
}

/** Draw the source into a canvas of w×h, cropping for 'cover'. */
function drawFitted(bmp, w, h, fit) {
  const { c, ctx } = canvasOf(w, h);
  if (fit === 'cover') {
    const k = Math.max(w / bmp.width, h / bmp.height);
    const dw = bmp.width * k;
    const dh = bmp.height * k;
    ctx.drawImage(bmp, (w - dw) / 2, (h - dh) / 2, dw, dh);
  } else {
    ctx.drawImage(bmp, 0, 0, w, h);
  }
  return { c, ctx };
}

function scaledCanvas(bmp, scale) {
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  return drawFitted(bmp, w, h, 'stretch');
}

// ------------------------------------------------------- target-size search

/**
 * Get under `targetBytes`: binary-search the quality first, and only start
 * shrinking the pixels once even the lowest usable quality is too big.
 */
async function encodeToTarget(bmp, fmt, targetBytes, background) {
  const LO = 25;
  const HI = 95;
  let smallest = null;

  for (let step = 0; step < 6; step++) {
    const scale = 0.8 ** step;
    const { c, ctx } = scaledCanvas(bmp, scale);
    if (fmt === 'jpeg') flatten(ctx, c.width, c.height, background);

    if (fmt === 'png') {
      const blob = await encode(c, 'png');
      if (!smallest || blob.size < smallest.size) smallest = blob;
      if (blob.size <= targetBytes) return blob;
      continue;
    }

    let best = null;
    let lo = LO;
    let hi = HI;
    const top = await encode(c, fmt, HI);
    if (!smallest || top.size < smallest.size) smallest = top;
    if (top.size <= targetBytes) return top;

    while (lo <= hi) {
      const mid = Math.round((lo + hi) / 2);
      const blob = await encode(c, fmt, mid);
      if (!smallest || blob.size < smallest.size) smallest = blob;
      if (blob.size <= targetBytes) { best = blob; lo = mid + 1; } else { hi = mid - 1; }
      if (hi - lo < 2) break;
    }
    if (best) return best;
  }
  // Could not reach the target even at 1/3 the size: hand back the smallest.
  return smallest;
}

// -------------------------------------------------------------------- ops

const OPS = {
  async 'image-convert'(bmp, p, srcType) {
    const fmt = resolveFormat(p.format, srcType);
    const { c, ctx } = scaledCanvas(bmp, 1);
    if (fmt === 'jpeg') flatten(ctx, c.width, c.height, p.background);
    return { blob: await encode(c, fmt, p.lossless && fmt === 'webp' ? 100 : p.quality), fmt };
  },

  async 'image-compress'(bmp, p, srcType) {
    const fmt = resolveFormat(p.format, srcType);
    let src = bmp;
    const maxW = Number(p.maxWidth) || 0;
    if (maxW && bmp.width > maxW) {
      const { c } = drawFitted(bmp, maxW, Math.round(bmp.height * (maxW / bmp.width)), 'stretch');
      src = await createImageBitmap(c);
    }
    if (p.mode === 'target') {
      const blob = await encodeToTarget(src, fmt, Math.max(1, Number(p.targetKB) || 200) * 1024, p.background);
      return { blob, fmt };
    }
    const { c, ctx } = scaledCanvas(src, 1);
    if (fmt === 'jpeg') flatten(ctx, c.width, c.height, p.background);
    return { blob: await encode(c, fmt, p.quality), fmt };
  },

  async 'image-resize'(bmp, p, srcType) {
    const fmt = resolveFormat(p.format, srcType);
    const { w, h } = fitSize(bmp.width, bmp.height, p.width, p.height, p.fit, p.noUpscale);
    const { c, ctx } = drawFitted(bmp, w, h, p.fit);
    if (fmt === 'jpeg') flatten(ctx, w, h, p.background);
    return { blob: await encode(c, fmt, p.quality), fmt };
  },

  async 'image-crop'(bmp, p, srcType) {
    const fmt = resolveFormat(p.format, srcType);
    let { x, y, w, h } = p.mode === 'pixels'
      ? { x: Number(p.x) || 0, y: Number(p.y) || 0, w: Number(p.w) || bmp.width, h: Number(p.h) || bmp.height }
      : ratioBox(bmp.width, bmp.height, p.ratio, p.gravity);

    x = Math.max(0, Math.min(x, bmp.width - 1));
    y = Math.max(0, Math.min(y, bmp.height - 1));
    w = Math.max(1, Math.min(w, bmp.width - x));
    h = Math.max(1, Math.min(h, bmp.height - y));

    const { c, ctx } = canvasOf(w, h);
    ctx.drawImage(bmp, x, y, w, h, 0, 0, w, h);
    if (fmt === 'jpeg') flatten(ctx, w, h, p.background);
    return { blob: await encode(c, fmt, p.quality), fmt };
  },

  async 'image-rotate'(bmp, p, srcType) {
    const fmt = resolveFormat(p.format, srcType);
    const deg = ((Number(p.angle) % 360) + 360) % 360;
    const swap = deg === 90 || deg === 270;
    const w = swap ? bmp.height : bmp.width;
    const h = swap ? bmp.width : bmp.height;
    const { c, ctx } = canvasOf(w, h);
    ctx.translate(w / 2, h / 2);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.scale(p.flipH ? -1 : 1, p.flipV ? -1 : 1);
    ctx.drawImage(bmp, -bmp.width / 2, -bmp.height / 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (fmt === 'jpeg') flatten(ctx, w, h, p.background);
    return { blob: await encode(c, fmt, p.quality), fmt };
  },

  async 'image-strip'(bmp, p, srcType) {
    const fmt = resolveFormat('same', srcType);
    const { c } = scaledCanvas(bmp, 1);
    return { blob: await encode(c, fmt, p.quality ?? 95), fmt };
  },
};

function ratioBox(sw, sh, ratio, gravity) {
  const [rw, rh] = String(ratio || '1:1').split(':').map(Number);
  const target = (rw || 1) / (rh || 1);
  let w = sw;
  let h = Math.round(sw / target);
  if (h > sh) { h = sh; w = Math.round(sh * target); }
  let x = Math.round((sw - w) / 2);
  let y = Math.round((sh - h) / 2);
  if (gravity === 'top') y = 0;
  if (gravity === 'bottom') y = sh - h;
  if (gravity === 'left') x = 0;
  if (gravity === 'right') x = sw - w;
  return { x, y, w, h };
}

/** Entry point shared by the worker and the main-thread fallback. */
export async function process({ op, blob, params }) {
  const fn = OPS[op];
  if (!fn) throw new Error(t('err.unknownOp', { op }));
  const bmp = await decode(blob, params.applyOrientation !== false);
  try {
    const { blob: out, fmt } = await fn(bmp, params, blob.type);
    if (!out) throw new Error(t('err.encodeEmpty'));
    return { blob: out, ext: extFor(fmt) };
  } finally {
    bmp.close?.();
  }
}
