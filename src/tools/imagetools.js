// Image tools that need more than a pixel transform: text drawn on top, a set
// of icons in one go, an animation, or the metadata rather than the picture.

import { exifr, gifenc } from '../core/deps.js';
import { h, clear, copyBtn } from '../core/dom.js';
import { baseName, withExt, formatBytes } from '../core/files.js';
import { dropzone } from '../ui/dropzone.js';
import { t } from '../i18n.js';

const MIME = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' };
const EXT = { png: 'png', jpeg: 'jpg', webp: 'webp' };

const POSITIONS = {
  'top-left': [0, 0], top: [0.5, 0], 'top-right': [1, 0],
  left: [0, 0.5], center: [0.5, 0.5], right: [1, 0.5],
  'bottom-left': [0, 1], bottom: [0.5, 1], 'bottom-right': [1, 1],
};

// -------------------------------------------------------- marca d'aigua

async function watermark(input, p) {
  const bmp = await createImageBitmap(input.blob);
  const canvas = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bmp, 0, 0);
  bmp.close?.();

  const text = String(p.text || '').trim();
  if (!text) throw new Error(t('err.watermarkText'));

  // Size is a share of the shortest side, so the mark looks the same on a
  // portrait photo and on a wide banner.
  const short = Math.min(canvas.width, canvas.height);
  const size = Math.max(8, (short * (Number(p.size) || 6)) / 100);
  ctx.font = `${p.bold ? '700 ' : ''}${size}px ${p.font || 'system-ui, sans-serif'}`;
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = Math.min(1, Math.max(0.02, (Number(p.opacity) || 40) / 100));
  ctx.fillStyle = p.color || '#ffffff';

  if (p.tile) {
    // Repeated diagonally across the whole image: the "do not reuse this" look.
    const step = ctx.measureText(text).width + size * 2;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((-30 * Math.PI) / 180);
    ctx.textAlign = 'center';
    const reach = Math.hypot(canvas.width, canvas.height);
    for (let y = -reach / 2; y < reach / 2; y += size * 3) {
      for (let x = -reach / 2; x < reach / 2; x += step) ctx.fillText(text, x, y);
    }
    ctx.restore();
  } else {
    const [fx, fy] = POSITIONS[p.position] || POSITIONS['bottom-right'];
    const margin = (short * (Number(p.margin) || 3)) / 100;
    const width = ctx.measureText(text).width;
    const x = margin + fx * (canvas.width - width - margin * 2);
    const y = margin + size / 2 + fy * (canvas.height - size - margin * 2);
    ctx.textAlign = 'left';
    if (p.shadow) {
      ctx.shadowColor = 'rgba(0,0,0,.55)';
      ctx.shadowBlur = size * 0.18;
      ctx.shadowOffsetY = size * 0.05;
    }
    ctx.fillText(text, x, y);
  }

  const fmt = p.format === 'same'
    ? (input.blob.type.includes('png') ? 'png' : input.blob.type.includes('webp') ? 'webp' : 'jpeg')
    : (p.format || 'jpeg');
  const blob = await canvas.convertToBlob({ type: MIME[fmt], quality: (p.quality ?? 90) / 100 });
  return { name: withExt(input.name, EXT[fmt]), blob };
}

// ------------------------------------------------------------- favicons

const ICO_SIZES = [16, 32, 48];
const PNG_SIZES = [16, 32, 48, 180, 192, 512];

/** ICO is a tiny container; since Vista it may hold PNGs verbatim. */
function buildIco(entries) {
  const header = 6;
  const dir = 16 * entries.length;
  const total = header + dir + entries.reduce((n, e) => n + e.bytes.length, 0);
  const buf = new ArrayBuffer(total);
  const view = new DataView(buf);
  const out = new Uint8Array(buf);

  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // 1 = icon
  view.setUint16(4, entries.length, true);

  let offset = header + dir;
  entries.forEach((entry, i) => {
    const at = header + i * 16;
    out[at] = entry.size >= 256 ? 0 : entry.size; // 0 means 256
    out[at + 1] = entry.size >= 256 ? 0 : entry.size;
    out[at + 2] = 0; // palette
    out[at + 3] = 0; // reserved
    view.setUint16(at + 4, 1, true); // colour planes
    view.setUint16(at + 6, 32, true); // bits per pixel
    view.setUint32(at + 8, entry.bytes.length, true);
    view.setUint32(at + 12, offset, true);
    out.set(entry.bytes, offset);
    offset += entry.bytes.length;
  });
  return out;
}

const SNIPPET = `<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
`;

async function favicons(input, p) {
  const bmp = await createImageBitmap(input.blob);
  const side = Math.min(bmp.width, bmp.height);
  const sx = (bmp.width - side) / 2;
  const sy = (bmp.height - side) / 2;

  const draw = async (size) => {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    if (p.background && p.background !== 'transparent') {
      ctx.fillStyle = p.background;
      ctx.fillRect(0, 0, size, size);
    }
    const pad = (size * (Number(p.padding) || 0)) / 100;
    ctx.drawImage(bmp, sx, sy, side, side, pad, pad, size - pad * 2, size - pad * 2);
    return new Uint8Array(await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer());
  };

  const pngs = new Map();
  for (const size of new Set([...PNG_SIZES, ...ICO_SIZES])) pngs.set(size, await draw(size));
  bmp.close?.();

  const outputs = PNG_SIZES.map((size) => ({
    name: size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`,
    blob: new Blob([pngs.get(size)], { type: 'image/png' }),
  }));

  outputs.push({
    name: 'favicon.ico',
    blob: new Blob([buildIco(ICO_SIZES.map((size) => ({ size, bytes: pngs.get(size) })))], { type: 'image/x-icon' }),
  });

  if (p.snippet) {
    outputs.push({ name: 'com-posar-ho.html', blob: new Blob([SNIPPET], { type: 'text/html;charset=utf-8' }) });
  }
  return outputs;
}

// --------------------------------------------------------- GIF animat

async function toGif(inputs, p) {
  const { GIFEncoder, quantize, applyPalette } = await gifenc();
  const maxWidth = Number(p.maxWidth) || 0;

  // Every frame must share one canvas size; the first image sets it.
  const first = await createImageBitmap(inputs[0].blob);
  const width = maxWidth && first.width > maxWidth ? maxWidth : first.width;
  const height = Math.max(1, Math.round(first.height * (width / first.width)));
  first.close?.();

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const gif = GIFEncoder();
  const delay = Math.max(20, Number(p.delay) || 120);

  const order = p.pingpong ? [...inputs, ...inputs.slice(1, -1).reverse()] : inputs;
  for (const input of order) {
    const bmp = await createImageBitmap(input.blob);
    ctx.clearRect(0, 0, width, height);
    if (p.background !== 'transparent') {
      ctx.fillStyle = p.background || '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
    // Contain, so frames of different shapes do not jump about.
    const k = Math.min(width / bmp.width, height / bmp.height);
    const w = bmp.width * k;
    const hh = bmp.height * k;
    ctx.drawImage(bmp, (width - w) / 2, (height - hh) / 2, w, hh);
    bmp.close?.();

    const { data } = ctx.getImageData(0, 0, width, height);
    const palette = quantize(data, Math.max(2, Math.min(256, Number(p.colors) || 256)));
    const index = applyPalette(data, palette);
    gif.writeFrame(index, width, height, { palette, delay });
  }
  gif.finish();

  return {
    name: `${baseName(inputs[0].name)}.gif`,
    blob: new Blob([gif.bytes()], { type: 'image/gif' }),
    note: t('note.gifFrames', { n: order.length, w: width, h: height }),
  };
}

// ---------------------------------------------------- custom: metadades

const GROUPS = [
  ['exif.camera', ['Make', 'Model', 'LensModel', 'Software', 'BodySerialNumber']],
  ['exif.exposure', ['FNumber', 'ExposureTime', 'ISO', 'FocalLength', 'FocalLengthIn35mmFormat', 'Flash', 'ExposureProgram', 'MeteringMode', 'WhiteBalance']],
  ['exif.image', ['ExifImageWidth', 'ExifImageHeight', 'Orientation', 'ColorSpace', 'XResolution', 'YResolution']],
  ['exif.dates', ['DateTimeOriginal', 'CreateDate', 'ModifyDate', 'OffsetTime']],
  ['exif.authorship', ['Artist', 'Copyright', 'ImageDescription', 'UserComment']],
];

const pretty = (key, value) => {
  if (value == null) return null;
  if (value instanceof Date) return value.toLocaleString('ca');
  if (key === 'FNumber') return `f/${value}`;
  if (key === 'ExposureTime') return value < 1 ? `1/${Math.round(1 / value)} s` : `${value} s`;
  if (key === 'FocalLength' || key === 'FocalLengthIn35mmFormat') return `${value} mm`;
  if (key === 'ISO') return `ISO ${value}`;
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

function mountExif(root) {
  const out = h('div');

  const dz = dropzone({
    accepts: ['image/*'],
    multiple: false,
    label: t('exif.drop'),
    hint: t('exif.dropHint'),
    onFiles: ([file]) => read(file),
    onRejected: () => clear(out).append(h('div', { class: 'msg err' }, t('exif.notImage'))),
  });

  async function read(file) {
    clear(out).append(h('p', { class: 'empty' }, t('panel.reading')));
    let data;
    try {
      const mod = await exifr();
      const parse = mod.parse || mod.default?.parse || mod.default;
      data = await parse(file, { gps: true, translateValues: true, reviveValues: true });
    } catch (e) {
      clear(out).append(h('div', { class: 'msg err' }, t('exif.readFailed', { detail: e.message })));
      return;
    }

    clear(out);
    const bmp = await createImageBitmap(file).catch(() => null);
    const basics = h('table', { class: 'kv' });
    for (const [k, v] of [
      [t('exif.name'), file.name],
      [t('exif.size'), formatBytes(file.size)],
      [t('exif.type'), file.type || t('exif.unknown')],
      [t('exif.dimensions'), bmp ? `${bmp.width} × ${bmp.height} px` : '—'],
    ]) basics.append(h('tr', null, h('td', null, k), h('td', { class: 'v' }, v)));
    bmp?.close?.();
    out.append(h('div', { class: 'panel' }, h('h3', null, t('exif.theFile')), basics));

    if (!data || !Object.keys(data).length) {
      out.append(h('div', { class: 'msg ok' }, t('exif.none')));
      return;
    }

    if (data.latitude != null && data.longitude != null) {
      const coords = `${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`;
      out.append(h('div', { class: 'panel' },
        h('h3', null, t('exif.location')),
        h('div', { class: 'msg err' }, t('exif.gpsWarning')),
        h('table', { class: 'kv' },
          h('tr', null, h('td', null, t('exif.coords')), h('td', { class: 'v' }, coords), h('td', { style: { width: '80px' } }, copyBtn(() => coords))),
          data.GPSAltitude != null ? h('tr', null, h('td', null, t('exif.altitude')), h('td', { class: 'v' }, `${Math.round(data.GPSAltitude)} m`)) : null)));
    }

    const usedKeys = new Set();
    for (const [title, keys] of GROUPS) {
      const rows = keys.map((k) => [k, pretty(k, data[k])]).filter(([, v]) => v != null && v !== '');
      if (!rows.length) continue;
      rows.forEach(([k]) => usedKeys.add(k));
      const table = h('table', { class: 'kv' });
      for (const [k, v] of rows) table.append(h('tr', null, h('td', null, k), h('td', { class: 'v' }, v)));
      out.append(h('div', { class: 'panel' }, h('h3', null, t(title)), table));
    }

    const rest = Object.entries(data)
      .filter(([k, v]) => !usedKeys.has(k) && v != null && typeof v !== 'object')
      .sort(([a], [b]) => a.localeCompare(b));
    if (rest.length) {
      const table = h('table', { class: 'kv' });
      for (const [k, v] of rest) table.append(h('tr', null, h('td', null, k), h('td', { class: 'v' }, pretty(k, v))));
      out.append(h('details', { class: 'panel' },
        h('summary', { style: { cursor: 'pointer', color: 'var(--fg-2)', fontSize: '13px' } }, t('exif.rest', { n: rest.length })),
        h('div', { style: { marginTop: '12px' } }, table)));
    }

    const json = JSON.stringify(data, null, 2);
    out.append(h('div', { class: 'actions' }, copyBtn(() => json, t('exif.copyJson'))));
  }

  root.append(h('div', { class: 'panel' }, dz), out);
}

export const runners = {
  'image-watermark': watermark,
  favicons,
  'images-to-gif': toGif,
};

export const mounts = {
  'image-exif': mountExif,
};
