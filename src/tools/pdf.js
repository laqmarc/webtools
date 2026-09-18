import { pdfLib, fflate } from '../core/deps.js';
import { baseName, formatBytes } from '../core/files.js';
import { t as tr } from '../i18n.js';

const PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792], a3: [841.89, 1190.55], a5: [419.53, 595.28] };
const MM = 72 / 25.4;

/** "1-3, 7, 10-12" -> zero-based indices, clamped to the document. Empty = all. */
export function parseRanges(spec, count) {
  const s = String(spec || '').trim();
  if (!s) return [...Array(count).keys()];
  const out = [];
  for (const part of s.split(',')) {
    const t = part.trim();
    if (!t) continue;
    const m = t.match(/^(\d+)\s*(?:[-–:]\s*(\d+|fi|end))?$/i);
    if (!m) throw new Error(tr('err.badRange', { range: part.trim() }));
    const from = parseInt(m[1], 10);
    const to = !m[2] ? from : (/^\d+$/.test(m[2]) ? parseInt(m[2], 10) : count);
    if (from < 1 || to < from) throw new Error(tr('err.invalidRange', { range: part.trim() }));
    for (let i = from; i <= Math.min(to, count); i++) out.push(i - 1);
  }
  if (!out.length) throw new Error(tr('err.noPagesSelected', { count }));
  return [...new Set(out)];
}

/** Same as parseRanges but keeps the comma groups separate. */
function rangeGroups(spec, count) {
  const groups = [];
  for (const part of String(spec).split(',')) {
    if (part.trim()) groups.push(parseRanges(part, count));
  }
  if (!groups.length) throw new Error(tr('err.needRange'));
  return groups;
}

async function load(blob) {
  const { PDFDocument } = await pdfLib();
  try {
    return await PDFDocument.load(await blob.arrayBuffer(), { ignoreEncryption: true });
  } catch (e) {
    throw new Error(tr('err.pdfOpen', { detail: e.message }));
  }
}

const out = (doc, name) => doc.save().then((bytes) => ({ name, blob: new Blob([bytes], { type: 'application/pdf' }) }));

async function newDoc() {
  const { PDFDocument } = await pdfLib();
  return PDFDocument.create();
}

/** Build a document from a subset of another's pages. */
async function subset(src, indices) {
  const doc = await newDoc();
  const pages = await doc.copyPages(src, indices);
  for (const p of pages) doc.addPage(p);
  return doc;
}

// -------------------------------------------------------------- runners

async function merge(inputs, p) {
  const list = p.order === 'name'
    ? [...inputs].sort((a, b) => a.name.localeCompare(b.name, 'ca', { numeric: true }))
    : inputs;
  const doc = await newDoc();
  for (const input of list) {
    const src = await load(input.blob);
    const pages = await doc.copyPages(src, src.getPageIndices());
    for (const page of pages) doc.addPage(page);
  }
  if (!doc.getPageCount()) throw new Error(tr('err.pdfNoPages'));
  return out(doc, (p.outName || 'unit.pdf').replace(/(\.pdf)?$/i, '.pdf'));
}

async function split(input, p) {
  const src = await load(input.blob);
  const count = src.getPageCount();
  const base = baseName(input.name);

  let groups;
  if (p.mode === 'ranges') groups = rangeGroups(p.ranges, count);
  else {
    const size = p.mode === 'every' ? Math.max(1, Number(p.n) || 1) : 1;
    groups = [];
    for (let i = 0; i < count; i += size) {
      groups.push([...Array(Math.min(size, count - i)).keys()].map((k) => i + k));
    }
  }

  const results = [];
  for (const g of groups) {
    const doc = await subset(src, g);
    const label = g.length === 1 ? `${g[0] + 1}` : `${g[0] + 1}-${g[g.length - 1] + 1}`;
    results.push(await out(doc, `${base}-p${label}.pdf`));
  }
  return results;
}

async function rotate(input, p) {
  const { degrees } = await pdfLib();
  const doc = await load(input.blob);
  const pages = doc.getPages();
  const idx = new Set(parseRanges(p.pages, pages.length));
  const delta = Number(p.angle) || 90;
  for (const [i, page] of pages.entries()) {
    if (!idx.has(i)) continue;
    page.setRotation(degrees((page.getRotation().angle + delta) % 360));
  }
  return out(doc, `${baseName(input.name)}-girat.pdf`);
}

async function extract(input, p) {
  const src = await load(input.blob);
  const count = src.getPageCount();
  const picked = new Set(parseRanges(p.pages, count));
  const keep = p.invert
    ? [...Array(count).keys()].filter((i) => !picked.has(i))
    : [...picked].sort((a, b) => a - b);
  if (!keep.length) throw new Error(tr('err.pdfResultEmpty'));
  const doc = await subset(src, keep);
  return out(doc, `${baseName(input.name)}-${p.invert ? 'retallat' : 'pagines'}.pdf`);
}

/** pdf-lib only embeds PNG and JPEG, so anything else is re-encoded first. */
async function asEmbeddable(blob) {
  const type = (blob.type || '').toLowerCase();
  if (type === 'image/png' || type === 'image/jpeg') return { blob, kind: type };
  const bmp = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bmp.width, bmp.height);
  canvas.getContext('2d').drawImage(bmp, 0, 0);
  bmp.close?.();
  return { blob: await canvas.convertToBlob({ type: 'image/png' }), kind: 'image/png' };
}

async function imagesToPdf(inputs, p) {
  const doc = await newDoc();
  const margin = (Number(p.margin) || 0) * MM;

  for (const input of inputs) {
    const { blob, kind } = await asEmbeddable(input.blob);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const img = kind === 'image/png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);

    if (p.pageSize === 'fit') {
      const page = doc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      continue;
    }

    let [pw, ph] = PAGE_SIZES[p.pageSize] || PAGE_SIZES.a4;
    const wantLandscape = p.orientation === 'landscape'
      || (p.orientation === 'auto' && img.width > img.height);
    if (wantLandscape) [pw, ph] = [ph, pw];

    const page = doc.addPage([pw, ph]);
    const boxW = Math.max(1, pw - margin * 2);
    const boxH = Math.max(1, ph - margin * 2);
    const k = Math.min(boxW / img.width, boxH / img.height);
    const w = img.width * k;
    const h = img.height * k;
    page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
  }

  if (!doc.getPageCount()) throw new Error(tr('err.pdfNoImages'));
  return out(doc, (p.outName || 'imatges.pdf').replace(/(\.pdf)?$/i, '.pdf'));
}

// ---------------------------------------------------------- comprimir
//
// Almost all the weight of a scanned or photographed PDF is in its embedded
// images, and pdf-lib hands us the object graph, so they can be swapped out
// one by one. The page structure, the text layer and the links are untouched:
// only the pixels are re-encoded, which is the difference between this and the
// services that flatten every page into a picture.
//
// Anything we cannot re-encode with confidence is left exactly as it was. A
// silently garbled image would be far worse than a file that did not shrink.

const MIN_WORTH_TOUCHING = 8 * 1024; // below this, the risk outweighs the bytes
const Q_FLOOR = 25;
const Q_CEIL = 92;

const num = (v) => (v == null ? undefined : (typeof v.asNumber === 'function' ? v.asNumber() : v.numberValue));

function imageStreams(L, doc) {
  const found = [];
  for (const [ref, obj] of doc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof L.PDFRawStream)) continue;
    const dict = obj.dict;
    if (String(dict.lookup(L.PDFName.of('Subtype'))) !== '/Image') continue;
    found.push({ ref, dict, stream: obj });
  }
  return found;
}

/**
 * Turn an embedded image into a canvas, or return null when we are not sure
 * enough about its encoding. JPEG streams are literally a JPEG file, so the
 * browser decodes them; Flate streams are raw samples we only accept in the
 * two unambiguous layouts.
 */
async function decodeEmbedded(L, { dict, stream }) {
  const name = (k) => L.PDFName.of(k);
  if (dict.lookup(name('SMask')) || dict.lookup(name('Mask'))) return null; // transparency we would flatten
  const imageMask = dict.lookup(name('ImageMask'));
  if (imageMask && String(imageMask) === 'true') return null; // 1-bit stencil
  if (dict.lookup(name('Decode'))) return null; // inverted or remapped samples

  const filter = String(dict.lookup(name('Filter')) ?? '');
  const width = num(dict.lookup(name('Width')));
  const height = num(dict.lookup(name('Height')));
  if (!width || !height) return null;

  if (filter === '/DCTDecode') {
    const space = String(dict.lookup(name('ColorSpace')) ?? '');
    if (space === '/DeviceCMYK') return null; // browsers disagree about Adobe CMYK
    try {
      return await createImageBitmap(new Blob([stream.contents], { type: 'image/jpeg' }));
    } catch {
      return null;
    }
  }

  if (filter === '/FlateDecode') {
    const space = String(dict.lookup(name('ColorSpace')) ?? '');
    const bpc = num(dict.lookup(name('BitsPerComponent')));
    const parms = dict.lookup(name('DecodeParms'));
    const predictor = parms?.lookup?.(name('Predictor'));
    if (bpc !== 8) return null;
    if (predictor && num(predictor) > 1) return null;
    const channels = space === '/DeviceRGB' ? 3 : space === '/DeviceGray' ? 1 : 0;
    if (!channels) return null;

    const { unzlibSync, inflateSync } = await fflate();
    let raw;
    try { raw = unzlibSync(stream.contents); } catch {
      try { raw = inflateSync(stream.contents); } catch { return null; }
    }
    if (raw.length < width * height * channels) return null;

    const data = new ImageData(width, height);
    for (let i = 0, n = width * height; i < n; i++) {
      const s = i * channels;
      const d = i * 4;
      data.data[d] = raw[s];
      data.data[d + 1] = channels === 3 ? raw[s + 1] : raw[s];
      data.data[d + 2] = channels === 3 ? raw[s + 2] : raw[s];
      data.data[d + 3] = 255;
    }
    const canvas = new OffscreenCanvas(width, height);
    canvas.getContext('2d').putImageData(data, 0, 0);
    return canvas;
  }

  return null; // JPX, CCITT, LZW, filter chains…
}

/** Draw the decoded source at the working size, optionally desaturated. */
function stage(source, maxWidth, grayscale, extraScale = 1) {
  const sw = source.width;
  const sh = source.height;
  const cap = maxWidth > 0 ? Math.min(sw, maxWidth) : sw;
  const w = Math.max(1, Math.round(cap * extraScale));
  const h = Math.max(1, Math.round(sh * (w / sw)));
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  if (grayscale) ctx.filter = 'grayscale(1)';
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

const encodeJpeg = (canvas, quality) => canvas
  .convertToBlob({ type: 'image/jpeg', quality: Math.min(1, Math.max(0.05, quality / 100)) })
  .then((b) => b.arrayBuffer())
  .then((b) => new Uint8Array(b));

async function compress(input, p, ctx = {}) {
  const L = await pdfLib();
  const say = ctx.onProgress || (() => {});
  const original = new Uint8Array(await input.blob.arrayBuffer());

  say(tr('prog.pdfOpening'));
  const doc = await load(input.blob);
  const entries = imageStreams(L, doc);
  if (!entries.length) {
    return { name: input.name, blob: input.blob, note: tr('note.pdfNoEmbedded') };
  }

  // Decode once, re-encode many times: the search over quality must not pay
  // for decoding a 12-megapixel scan on every iteration.
  const jobs = [];
  let skipped = 0;
  for (const [i, entry] of entries.entries()) {
    say(tr('prog.pdfReadingImage', { i: i + 1, n: entries.length }));
    if (entry.stream.contents.length < MIN_WORTH_TOUCHING) { skipped++; continue; }
    const source = await decodeEmbedded(L, entry);
    if (!source) { skipped++; continue; }
    jobs.push({ ...entry, source, originalBytes: entry.stream.contents.length });
  }

  if (!jobs.length) {
    return {
      name: input.name,
      blob: input.blob,
      note: tr('note.pdfUnsafeImages', { n: entries.length }),
    };
  }

  const maxWidth = Number(p.maxWidth) || 0;
  const grayscale = !!p.grayscale;
  let scale = 1;
  let quality = Number(p.quality) || 70;

  let targetBytes = 0;
  if (p.mode === 'target') {
    targetBytes = Math.max(1, Number(p.targetKB) || 500) * 1024;
    // Everything that is not an image — text, fonts, structure — is a floor we
    // cannot go below, so the search only has the image bytes to play with.
    const overhead = original.length - jobs.reduce((n, j) => n + j.originalBytes, 0);
    const budget = targetBytes - overhead;

    const imageBytesAt = async (q, s) => {
      const sizes = await Promise.all(
        jobs.map((j) => encodeJpeg(stage(j.source, maxWidth, grayscale, s), q).then((b) => b.length)),
      );
      return sizes.reduce((a, b) => a + b, 0);
    };

    /** Highest quality that fits at this scale, or null if even the floor is too big. */
    const bestQualityAt = async (s) => {
      if (await imageBytesAt(Q_CEIL, s) <= budget) return Q_CEIL;
      if (await imageBytesAt(Q_FLOOR, s) > budget) return null;
      let lo = Q_FLOOR;
      let hi = Q_CEIL;
      while (hi - lo > 2) {
        const mid = Math.round((lo + hi) / 2);
        if (await imageBytesAt(mid, s) <= budget) lo = mid; else hi = mid;
      }
      return lo;
    };

    say(tr('prog.pdfSearchQuality', { size: formatBytes(targetBytes) }));
    let found = budget > 0 ? await bestQualityAt(1) : null;

    if (found == null && budget > 0) {
      // Quality alone will not get there. JPEG size tracks pixel count closely
      // enough to jump straight to a plausible scale instead of creeping down
      // in fixed steps and running out of them.
      const atFloor = await imageBytesAt(Q_FLOOR, 1);
      let s = Math.sqrt(budget / atFloor) * 0.95;
      for (let attempt = 0; attempt < 4 && found == null; attempt++) {
        s = Math.max(0.05, Math.min(0.95, s));
        say(tr('prog.pdfScaling', { pct: Math.round(s * 100) }));
        found = await bestQualityAt(s);
        if (found == null) s *= 0.7;
      }
      scale = s;
    }

    quality = found ?? Q_FLOOR;
    if (found == null && budget > 0) scale = Math.max(0.05, scale * 0.7);
    if (budget <= 0) { quality = Q_FLOOR; scale = 0.15; }
  }

  let touched = 0;
  for (const [i, job] of jobs.entries()) {
    say(tr('prog.pdfRecoding', { i: i + 1, n: jobs.length }));
    const canvas = stage(job.source, maxWidth, grayscale, scale);
    const bytes = await encodeJpeg(canvas, quality);
    job.source.close?.();
    if (bytes.length >= job.originalBytes) continue; // leave it alone

    const name = (k) => L.PDFName.of(k);
    job.dict.set(name('Width'), doc.context.obj(canvas.width));
    job.dict.set(name('Height'), doc.context.obj(canvas.height));
    job.dict.set(name('Length'), doc.context.obj(bytes.length));
    job.dict.set(name('Filter'), name('DCTDecode'));
    job.dict.set(name('ColorSpace'), name('DeviceRGB'));
    job.dict.set(name('BitsPerComponent'), doc.context.obj(8));
    job.dict.delete(name('DecodeParms'));
    doc.context.assign(job.ref, L.PDFRawStream.of(job.dict, bytes));
    touched++;
  }

  say(tr('prog.saving'));
  const bytes = await doc.save({ useObjectStreams: true });
  const parts = [tr('note.pdfRecoded', { touched, total: entries.length })];
  if (skipped) parts.push(tr('note.pdfUntouched', { n: skipped }));
  if (p.mode === 'target') {
    parts.push(scale < 1
      ? tr('note.pdfQualityScaled', { q: quality, scale: Math.round(scale * 100) })
      : tr('note.pdfQuality', { q: quality }));
    // Saying "done" about a file that missed the budget would be a lie the
    // user only discovers when the upload is rejected.
    if (bytes.length > targetBytes) parts.push(tr('note.pdfMissedTarget', { size: formatBytes(targetBytes) }));
  }

  // Object streams alone can make a small file bigger; never hand back worse.
  if (bytes.length >= original.length) {
    return { name: input.name, blob: input.blob, note: tr('note.pdfNoFurther', { parts: parts.join(' · ') }) };
  }
  return {
    name: `${baseName(input.name)}-comprimit.pdf`,
    blob: new Blob([bytes], { type: 'application/pdf' }),
    note: parts.join(' · '),
  };
}

// ------------------------------------------- escriure damunt les pàgines

const ANCHORS = {
  'top-left': [0, 1], top: [0.5, 1], 'top-right': [1, 1],
  left: [0, 0.5], center: [0.5, 0.5], right: [1, 0.5],
  'bottom-left': [0, 0], bottom: [0.5, 0], 'bottom-right': [1, 0],
};

const hexToRgb = (L, hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return L.rgb(0.5, 0.5, 0.5);
  const n = parseInt(m[1], 16);
  return L.rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

/**
 * The 14 built-in PDF fonts are WinAnsi, which covers Catalan and Spanish but
 * not much beyond Latin-1. Saying so beats a stack trace from deep inside the
 * encoder.
 */
function assertWritable(text) {
  const bad = [...text].find((c) => c.codePointAt(0) > 0xff);
  if (bad) {
    throw new Error(tr('err.pdfNonLatin', { char: bad }));
  }
}

async function watermarkPdf(input, p) {
  const L = await pdfLib();
  const { StandardFonts, degrees } = L;
  const text = String(p.text || '').trim();
  if (!text) throw new Error(tr('err.watermarkText'));
  assertWritable(text);

  const doc = await load(input.blob);
  const font = await doc.embedFont(p.bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);
  const color = hexToRgb(L, p.color);
  const opacity = Math.min(1, Math.max(0.02, (Number(p.opacity) || 25) / 100));
  const angle = Number(p.angle) || 0;

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const size = Math.max(6, (Math.min(width, height) * (Number(p.size) || 8)) / 100);
    const textWidth = font.widthOfTextAtSize(text, size);

    if (p.tile) {
      const stepX = textWidth + size * 2;
      const stepY = size * 3.2;
      for (let y = -height; y < height * 2; y += stepY) {
        for (let x = -width; x < width * 2; x += stepX) {
          page.drawText(text, { x, y, size, font, color, opacity, rotate: degrees(-30) });
        }
      }
      continue;
    }

    const [fx, fy] = ANCHORS[p.position] || ANCHORS.center;
    const margin = (Math.min(width, height) * (Number(p.margin) || 5)) / 100;
    page.drawText(text, {
      x: margin + fx * (width - textWidth - margin * 2),
      y: margin + fy * (height - size - margin * 2),
      size,
      font,
      color,
      opacity,
      rotate: degrees(angle),
    });
  }

  return out(doc, `${baseName(input.name)}-marca.pdf`);
}

async function pageNumbers(input, p) {
  const L = await pdfLib();
  const { StandardFonts } = L;
  const doc = await load(input.blob);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const color = hexToRgb(L, p.color);
  const pages = doc.getPages();
  const skip = Math.max(0, Number(p.skip) || 0);
  const start = Number(p.start) || 1;
  const size = Math.max(5, Number(p.size) || 10);
  const numbered = pages.length - skip;

  for (const [i, page] of pages.entries()) {
    if (i < skip) continue;
    const n = start + i - skip;
    const label = (p.format || '{n}')
      .replace('{n}', String(n))
      .replace('{total}', String(start + numbered - 1));
    assertWritable(label);

    const { width, height } = page.getSize();
    const [fx, fy] = ANCHORS[p.position] || ANCHORS.bottom;
    const margin = Number(p.margin) || 28;
    const textWidth = font.widthOfTextAtSize(label, size);
    page.drawText(label, {
      x: margin + fx * (width - textWidth - margin * 2),
      y: margin + fy * (height - size - margin * 2),
      size,
      font,
      color,
    });
  }

  return out(doc, `${baseName(input.name)}-numerat.pdf`);
}

// ------------------------------------------------- rasteritzar i llegir
//
// These are the pdf.js half. They are the only runners that pull in the
// renderer, which is why the import lives inside them.

const IMAGE_TYPES = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' };
const IMAGE_EXT = { png: 'png', jpeg: 'jpg', webp: 'webp' };

async function withRendered(blob, fn) {
  const { openPdf } = await import('../core/pdfrender.js');
  const doc = await openPdf(blob);
  try {
    return await fn(doc);
  } finally {
    doc.destroy();
  }
}

async function toImages(input, p, ctx = {}) {
  const say = ctx.onProgress || (() => {});
  const { renderPage, scaleForDpi, canvasToBlob } = await import('../core/pdfrender.js');
  return withRendered(input.blob, async (doc) => {
    const pages = parseRanges(p.pages, doc.numPages);
    const scale = scaleForDpi(p.dpi);
    const fmt = IMAGE_TYPES[p.format] ? p.format : 'png';
    const base = baseName(input.name);
    const pad = String(doc.numPages).length;
    const results = [];
    for (const [i, index] of pages.entries()) {
      say(tr('prog.drawingPage', { i: i + 1, n: pages.length }));
      const canvas = await renderPage(doc, index + 1, {
        scale,
        background: fmt === 'png' && p.transparent ? null : '#ffffff',
      });
      const blob = await canvasToBlob(canvas, IMAGE_TYPES[fmt], (p.quality ?? 90) / 100);
      results.push({ name: `${base}-p${String(index + 1).padStart(pad, '0')}.${IMAGE_EXT[fmt]}`, blob });
    }
    return results;
  });
}

async function toText(input, p, ctx = {}) {
  const say = ctx.onProgress || (() => {});
  const { pageText } = await import('../core/pdfrender.js');
  return withRendered(input.blob, async (doc) => {
    const pages = parseRanges(p.pages, doc.numPages);
    const chunks = [];
    for (const [i, index] of pages.entries()) {
      say(tr('prog.readingPage', { i: i + 1, n: pages.length }));
      const text = await pageText(doc, index + 1, { joinParagraphs: !!p.joinParagraphs });
      chunks.push(p.pageMarks ? `--- ${tr('note.pdfPages', { n: index + 1 })} ---\n${text}` : text);
    }
    const body = chunks.join('\n\n');
    const empty = !body.replace(/\s/g, '');
    return {
      name: `${baseName(input.name)}.txt`,
      blob: new Blob([body], { type: 'text/plain;charset=utf-8' }),
      note: empty ? tr('note.pdfTextEmpty') : tr('note.pdfPages', { n: pages.length }),
    };
  });
}

/** Pull the embedded images out as files, reusing the compressor's decoder. */
async function extractImages(input, p, ctx = {}) {
  const say = ctx.onProgress || (() => {});
  const L = await pdfLib();
  const doc = await load(input.blob);
  const base = baseName(input.name);
  const type = IMAGE_TYPES[p.format] ? p.format : 'png';
  const entries = imageStreams(L, doc);
  const min = Math.max(0, Number(p.minWidth) || 0);
  const results = [];

  for (const [i, entry] of entries.entries()) {
    say(tr('prog.extracting', { i: i + 1, n: entries.length }));
    const width = num(entry.dict.lookup(L.PDFName.of('Width'))) || 0;
    if (width < min) continue;

    // A JPEG stream can be written out untouched; anything else is redrawn.
    const filter = String(entry.dict.lookup(L.PDFName.of('Filter')) ?? '');
    if (p.format === 'original' && filter === '/DCTDecode') {
      results.push({
        name: `${base}-img${i + 1}.jpg`,
        blob: new Blob([entry.stream.contents], { type: 'image/jpeg' }),
      });
      continue;
    }
    const source = await decodeEmbedded(L, entry);
    if (!source) continue;
    const canvas = stage(source, 0, false, 1);
    source.close?.();
    const fmt = p.format === 'original' ? 'png' : type;
    const blob = await canvas.convertToBlob({ type: IMAGE_TYPES[fmt], quality: (p.quality ?? 92) / 100 });
    results.push({ name: `${base}-img${i + 1}.${IMAGE_EXT[fmt]}`, blob });
  }

  if (!results.length) throw new Error(tr('err.pdfNoExtracted', { count: entries.length }));
  return results;
}

/** The aggressive mode: redraw every page and rebuild the document from them. */
async function rasterise(input, p, ctx = {}) {
  const say = ctx.onProgress || (() => {});
  const { renderPage, scaleForDpi, canvasToBlob } = await import('../core/pdfrender.js');
  const { PDFDocument } = await pdfLib();

  return withRendered(input.blob, async (src) => {
    const outDoc = await PDFDocument.create();
    const scale = scaleForDpi(p.dpi);
    const quality = Math.min(1, Math.max(0.05, (Number(p.quality) || 65) / 100));

    for (let n = 1; n <= src.numPages; n++) {
      say(tr('prog.rasterising', { i: n, n: src.numPages }));
      const page = await src.getPage(n);
      const size = page.getViewport({ scale: 1 });
      page.cleanup();

      const canvas = await renderPage(src, n, { scale, background: '#ffffff' });
      if (p.grayscale) {
        const flat = document.createElement('canvas');
        flat.width = canvas.width;
        flat.height = canvas.height;
        const fx = flat.getContext('2d');
        fx.filter = 'grayscale(1)';
        fx.drawImage(canvas, 0, 0);
        canvas.width = 0;
        const jpeg = await canvasToBlob(flat, 'image/jpeg', quality);
        const img = await outDoc.embedJpg(new Uint8Array(await jpeg.arrayBuffer()));
        outDoc.addPage([size.width, size.height]).drawImage(img, { x: 0, y: 0, width: size.width, height: size.height });
        continue;
      }
      const jpeg = await canvasToBlob(canvas, 'image/jpeg', quality);
      const img = await outDoc.embedJpg(new Uint8Array(await jpeg.arrayBuffer()));
      outDoc.addPage([size.width, size.height]).drawImage(img, { x: 0, y: 0, width: size.width, height: size.height });
    }

    say(tr('prog.saving'));
    const bytes = await outDoc.save({ useObjectStreams: true });
    // Rasterising a text document always costs more than it saves. Handing
    // back a bigger file that has also lost its text would be the worst of
    // both worlds, so in that case nothing changes.
    if (bytes.length >= input.blob.size) {
      return {
        name: input.name,
        blob: input.blob,
        note: tr('note.rasterBigger', { size: formatBytes(bytes.length) }),
      };
    }
    return {
      name: `${baseName(input.name)}-rasteritzat.pdf`,
      blob: new Blob([bytes], { type: 'application/pdf' }),
      note: tr('note.rasterDone', { n: src.numPages, dpi: p.dpi }),
    };
  });
}

/** Route between the two compression strategies. */
const compressRouter = (input, p, ctx) => (p.method === 'raster'
  ? rasterise(input, p, ctx)
  : compress(input, p, ctx));

export const mounts = {
  'pdf-organize': (root, tool) => import('../ui/pdforganize.js').then((m) => m.mount(root, tool)),
};

export const runners = {
  'pdf-compress': compressRouter,
  'pdf-watermark': watermarkPdf,
  'pdf-page-numbers': pageNumbers,
  'pdf-to-images': toImages,
  'pdf-to-text': toText,
  'pdf-extract-images': extractImages,
  'pdf-merge': merge,
  'pdf-split': split,
  'pdf-rotate': rotate,
  'pdf-extract': extract,
  'images-to-pdf': imagesToPdf,
};
