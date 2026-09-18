// The two tools that need trained weights: reading text off a picture, and
// telling a subject apart from its background.
//
// Both are opt-in (`node scripts/vendor.mjs --extras`), because together they
// are 25 MB against the 8 MB of everything else. Neither is precached by the
// service worker for the same reason — they are cached once you use them.

import { tesseract, onnx, vendorUrl, pdfLib } from '../core/deps.js';
import { baseName } from '../core/files.js';
import { t } from '../i18n.js';

// --------------------------------------------------------------- OCR

const workers = new Map(); // one Tesseract worker per language combination

async function ocrWorker(lang, onLog) {
  if (!workers.has(lang)) {
    const T = await tesseract();
    workers.set(lang, T.createWorker(lang, 1, {
      workerPath: vendorUrl('tesseract/worker.js'),
      corePath: vendorUrl('tesseract/'),
      langPath: vendorUrl('tesseract/lang'),
      gzip: true,
      logger: (m) => onLog?.(m),
    }).catch((e) => {
      workers.delete(lang);
      // Tesseract rejects with a bare string, so `.message` is not there.
      throw new Error(t('err.ocrStart', { detail: e?.message || String(e) }));
    }));
  }
  return workers.get(lang);
}

/** Every page of the input as a canvas or blob that Tesseract can read. */
async function asPages(input, dpi, say) {
  const isPdf = /pdf$/i.test(input.blob.type) || /\.pdf$/i.test(input.name);
  if (!isPdf) return [input.blob];

  const { openPdf, renderPage, scaleForDpi } = await import('../core/pdfrender.js');
  const doc = await openPdf(input.blob);
  try {
    const pages = [];
    for (let n = 1; n <= doc.numPages; n++) {
      say(t('prog.drawingPage', { i: n, n: doc.numPages }));
      pages.push(await renderPage(doc, n, { scale: scaleForDpi(dpi) }));
    }
    return pages;
  } finally {
    doc.destroy();
  }
}

async function ocr(input, p, ctx = {}) {
  const say = ctx.onProgress || (() => {});
  say(t('prog.engineWarmup'));

  const worker = await ocrWorker(p.lang || 'cat', (m) => {
    if (m.status === 'recognizing text') say(t('prog.ocrReading', { pct: Math.round((m.progress || 0) * 100) }));
    else if (m.status) say(m.status.replace('loading language traineddata', t('prog.loadingLanguage')));
  });

  const pages = await asPages(input, p.dpi, say);
  const wantPdf = p.output === 'pdf';
  const texts = [];
  const pdfs = [];

  for (const [i, page] of pages.entries()) {
    say(t('prog.ocrPage', { i: i + 1, n: pages.length }));
    const { data } = await worker.recognize(page, {}, { text: true, pdf: wantPdf });
    texts.push(data.text || '');
    if (wantPdf && data.pdf) pdfs.push(new Uint8Array(data.pdf));
    if (page instanceof HTMLCanvasElement) page.width = 0; // let the bitmap go
  }

  if (!wantPdf) {
    const body = texts
      .map((page, i) => (p.pageMarks && pages.length > 1 ? `--- ${t('note.pdfPages', { n: i + 1 })} ---\n${page}` : page))
      .join('\n\n')
      .replace(/[ \t]+\n/g, '\n')
      .trim();
    return {
      name: `${baseName(input.name)}.txt`,
      blob: new Blob([body], { type: 'text/plain;charset=utf-8' }),
      note: body ? t('note.ocrText', { pages: pages.length, words: body.split(/\s+/).length }) : t('note.ocrNothing'),
    };
  }

  say(t('prog.buildingPdf'));
  const { PDFDocument } = await pdfLib();
  const merged = await PDFDocument.create();
  for (const bytes of pdfs) {
    const one = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const copied = await merged.copyPages(one, one.getPageIndices());
    for (const page of copied) merged.addPage(page);
  }
  if (!merged.getPageCount()) throw new Error(t('err.ocrNoPages'));
  const bytes = await merged.save({ useObjectStreams: true });
  const words = texts.join(' ').split(/\s+/).filter(Boolean).length;
  return {
    name: `${baseName(input.name)}-cercable.pdf`,
    blob: new Blob([bytes], { type: 'application/pdf' }),
    note: t('note.ocrPdf', { pages: merged.getPageCount(), words }),
  };
}

// ------------------------------------------------------ treure el fons

const MODEL_SIDE = 320;
// The normalisation u2net was trained with (ImageNet statistics).
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

let sessionPromise = null;

async function matteSession() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const ort = await onnx();
      const session = await ort.InferenceSession.create(vendorUrl('onnx/u2netp.onnx'), {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });
      return { ort, session };
    })().catch((e) => { sessionPromise = null; throw e; });
  }
  return sessionPromise;
}

/** Run the saliency model and return a 320×320 mask in [0,1]. */
async function predictMask(bitmap) {
  const { ort, session } = await matteSession();

  const small = new OffscreenCanvas(MODEL_SIDE, MODEL_SIDE);
  const sctx = small.getContext('2d', { willReadFrequently: true });
  sctx.drawImage(bitmap, 0, 0, MODEL_SIDE, MODEL_SIDE);
  const { data } = sctx.getImageData(0, 0, MODEL_SIDE, MODEL_SIDE);

  // NCHW float32, channel by channel, normalised the way the model expects.
  const pixels = MODEL_SIDE * MODEL_SIDE;
  const input = new Float32Array(pixels * 3);
  for (let i = 0; i < pixels; i++) {
    for (let c = 0; c < 3; c++) {
      input[c * pixels + i] = (data[i * 4 + c] / 255 - MEAN[c]) / STD[c];
    }
  }

  const tensor = new ort.Tensor('float32', input, [1, 3, MODEL_SIDE, MODEL_SIDE]);
  const result = await session.run({ [session.inputNames[0]]: tensor });
  const raw = result[session.outputNames[0]].data;

  // u2net's head is unbounded, so the map is rescaled to its own range.
  let min = Infinity;
  let max = -Infinity;
  for (const v of raw) { if (v < min) min = v; if (v > max) max = v; }
  const span = max - min || 1;
  const mask = new Float32Array(pixels);
  for (let i = 0; i < pixels; i++) mask[i] = (raw[i] - min) / span;
  return mask;
}

async function removeBackground(input, p, ctx = {}) {
  const say = ctx.onProgress || (() => {});
  say(t('prog.loadingModel'));
  const bitmap = await createImageBitmap(input.blob);

  let mask;
  try {
    say(t('prog.matting'));
    mask = await predictMask(bitmap);
  } catch (e) {
    bitmap.close?.();
    throw new Error(t('err.modelFailed', { detail: e.message }));
  }

  say(t('prog.compositing'));
  // Paint the mask small, then let the canvas scale it: the smoothing it does
  // is exactly the soft edge we want.
  const maskCanvas = new OffscreenCanvas(MODEL_SIDE, MODEL_SIDE);
  const mctx = maskCanvas.getContext('2d');
  const maskImage = mctx.createImageData(MODEL_SIDE, MODEL_SIDE);
  const hard = p.edge === 'hard';
  const cut = Math.min(0.99, Math.max(0.01, (Number(p.threshold) || 50) / 100));
  for (let i = 0; i < mask.length; i++) {
    let a = mask[i];
    if (hard) a = a >= cut ? 1 : 0;
    const v = Math.round(a * 255);
    maskImage.data[i * 4] = v;
    maskImage.data[i * 4 + 1] = v;
    maskImage.data[i * 4 + 2] = v;
    maskImage.data[i * 4 + 3] = 255;
  }
  mctx.putImageData(maskImage, 0, 0);

  const full = new OffscreenCanvas(bitmap.width, bitmap.height);
  const fctx = full.getContext('2d', { willReadFrequently: true });
  fctx.imageSmoothingQuality = 'high';
  fctx.drawImage(maskCanvas, 0, 0, bitmap.width, bitmap.height);
  const scaled = fctx.getImageData(0, 0, bitmap.width, bitmap.height);

  fctx.clearRect(0, 0, bitmap.width, bitmap.height);
  fctx.drawImage(bitmap, 0, 0);
  bitmap.close?.();
  const pixels = fctx.getImageData(0, 0, full.width, full.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 3] = Math.min(pixels.data[i + 3], scaled.data[i]);
  }
  fctx.putImageData(pixels, 0, 0);

  // A replacement colour goes underneath what is left.
  let outCanvas = full;
  const solid = p.background && p.background !== 'transparent' && p.format !== 'png-alpha';
  if (solid) {
    outCanvas = new OffscreenCanvas(full.width, full.height);
    const octx = outCanvas.getContext('2d');
    octx.fillStyle = p.background;
    octx.fillRect(0, 0, full.width, full.height);
    octx.drawImage(full, 0, 0);
  }

  const png = p.format !== 'webp';
  const blob = await outCanvas.convertToBlob({
    type: png ? 'image/png' : 'image/webp',
    quality: (p.quality ?? 92) / 100,
  });
  return { name: `${baseName(input.name)}-sense-fons.${png ? 'png' : 'webp'}`, blob };
}

export const runners = {
  ocr,
  'remove-background': removeBackground,
};
