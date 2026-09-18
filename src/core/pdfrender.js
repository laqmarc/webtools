// Everything that needs to *draw* a PDF, as opposed to rearranging one.
//
// pdf-lib edits the object graph but has no renderer; pdf.js renders but is a
// poor editor. So the two live side by side: this module is the pdf.js half,
// and it is imported only by the tools that genuinely need pixels or text,
// because it pulls in 1.6 MB of library and worker.

import { pdfjs, PDFJS_FONT_DIR } from './deps.js';
import { t } from '../i18n.js';

/** Open a document for rendering. Remember to call `.destroy()` when done. */
export async function openPdf(blob) {
  const lib = await pdfjs();
  try {
    return await lib.getDocument({
      data: new Uint8Array(await blob.arrayBuffer()),
      standardFontDataUrl: PDFJS_FONT_DIR,
      isEvalSupported: false, // no CSP surprises for a font-hinting optimisation
      useSystemFonts: true,
    }).promise;
  } catch (e) {
    if (/password/i.test(e.message || '')) throw new Error(t('err.pdfPassword'));
    throw new Error(t('err.pdfRead', { detail: e.message }));
  }
}

/** PDF user space is 1/72 inch, so the scale is just the DPI over 72. */
export const scaleForDpi = (dpi) => Math.max(0.05, (Number(dpi) || 150) / 72);

export async function renderPage(doc, pageNumber, { scale = 1, background = '#ffffff', maxPixels = 40e6 } = {}) {
  const page = await doc.getPage(pageNumber);
  let viewport = page.getViewport({ scale });

  // A 600-dpi A0 page would be a gigapixel; clamp before allocating anything.
  const pixels = viewport.width * viewport.height;
  if (pixels > maxPixels) viewport = page.getViewport({ scale: scale * Math.sqrt(maxPixels / pixels) });

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext('2d', { alpha: !background });
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  await page.render({ canvasContext: ctx, viewport }).promise;
  page.cleanup();
  return canvas;
}

/**
 * Text in a PDF is a bag of positioned runs, not lines. Group the runs by the
 * vertical position of their transform and you get something close to what a
 * reader sees; anything cleverer starts guessing at columns.
 */
export async function pageText(doc, pageNumber, { joinParagraphs = false } = {}) {
  const page = await doc.getPage(pageNumber);
  const content = await page.getTextContent();
  const lines = [];
  let current = null;

  for (const item of content.items) {
    if (typeof item.str !== 'string') continue;
    const y = Math.round(item.transform[5]);
    if (!current || Math.abs(current.y - y) > 2) {
      current = { y, parts: [] };
      lines.push(current);
    }
    current.parts.push(item.str);
    if (item.hasEOL) current = null;
  }
  page.cleanup();

  const text = lines.map((l) => l.parts.join('').replace(/\s+$/, '')).join('\n');
  if (!joinParagraphs) return text;
  // Re-flow: a line that does not end a sentence belongs with the next one.
  return text.replace(/([^\n.!?:;])\n(?=\S)/g, '$1 ');
}

export const canvasToBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
  canvas.toBlob(
    (b) => (b ? resolve(b) : reject(new Error(t('err.canvasEncode', { type })))),
    type,
    quality,
  );
});
