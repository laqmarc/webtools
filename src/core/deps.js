// Every third-party library, behind a memoised lazy loader.
//
// The files live in vendor/, copied there by scripts/vendor.mjs, so a loaded
// page never reaches out to a CDN: pull the network cable after the tool has
// opened and everything still works. Nothing is fetched until a tool that
// needs it actually runs, so the shell stays a few kB.
//
// Paths resolve against this module, not against the document, because the
// document lives one directory deep (/png-a-webp/index.html) and the site has
// to survive being deployed inside a subdirectory.

import { t } from '../i18n.js';

const V = '../../vendor';

export const URLS = {
  pdfLib: `${V}/pdf-lib.js`,
  fflate: `${V}/fflate.js`,
  jsYaml: `${V}/js-yaml.js`,
  svgo: `${V}/svgo.js`,
  qr: `${V}/qrcode-generator.js`,
  terser: `${V}/terser.js`, // UMD: no usable ESM build exists
  csso: `${V}/csso.js`,
  avifEnc: `${V}/jsquash-avif/encode.js`,
  pdfjs: `${V}/pdfjs/pdf.mjs`,
  pdfjsWorker: `${V}/pdfjs/pdf.worker.mjs`,
  exifr: `${V}/exifr.js`,
  gifenc: `${V}/gifenc.js`,
  beautify: `${V}/js-beautify.js`, // UMD
  sqlFormatter: `${V}/sql-formatter.js`, // UMD
  // Opt-in extras: only present after `node scripts/vendor.mjs --extras`.
  tesseract: `${V}/tesseract/tesseract.js`, // UMD
  onnx: `${V}/onnx/ort.mjs`,
};

const cache = new Map();

const absolute = (key) => {
  const url = URLS[key];
  if (!url) throw new Error(t('err.unknownDep', { key }));
  return new URL(url, import.meta.url).href;
};

const missing = (key, detail) => new Error(t('err.libMissing', { key, detail }));

/** Load an ES module once; concurrent callers share the same promise. */
export function dep(key) {
  if (!cache.has(key)) {
    cache.set(key, import(/* @vite-ignore */ absolute(key)).catch((e) => {
      cache.delete(key);
      throw missing(key, e.message);
    }));
  }
  return cache.get(key);
}

/** Load a classic UMD bundle via <script> and hand back its global. */
export function depScript(key, globalName) {
  const cacheKey = `script:${key}`;
  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, new Promise((resolve, reject) => {
      if (window[globalName]) { resolve(window[globalName]); return; }
      const s = document.createElement('script');
      s.src = absolute(key);
      s.onload = () => (window[globalName]
        ? resolve(window[globalName])
        : reject(new Error(t('err.libNoGlobal', { key, global: globalName }))));
      s.onerror = () => {
        cache.delete(cacheKey);
        s.remove();
        reject(missing(key, t('err.libLoadFailed')));
      };
      document.head.append(s);
    }));
  }
  return cache.get(cacheKey);
}

export const pdfLib = () => dep('pdfLib');
export const fflate = () => dep('fflate');
export const jsYaml = () => dep('jsYaml');
export const svgo = () => dep('svgo');
export const qrgen = () => dep('qr');
export const terser = () => depScript('terser', 'Terser');
export const csso = () => dep('csso');
export const avifEnc = () => dep('avifEnc');
export const exifr = () => dep('exifr');
export const gifenc = () => dep('gifenc');
export const beautify = () => depScript('beautify', 'beautifier');
export const sqlFormatter = () => depScript('sqlFormatter', 'sqlFormatter');

// --- optional extras -------------------------------------------------
// These carry weights, so they are not part of a plain vendoring run. The
// error has to say that out loud rather than look like a network glitch.

export const vendorUrl = (relative) => new URL(`${V}/${relative}`, import.meta.url).href;

export async function tesseract() {
  try {
    return await depScript('tesseract', 'Tesseract');
  } catch {
    throw new Error(t('err.extraMissing'));
  }
}

export async function onnx() {
  const mod = await dep('onnx').catch(() => { throw new Error(t('err.extraMissing')); });
  const ort = mod.default?.InferenceSession ? mod.default : mod;
  ort.env.wasm.wasmPaths = vendorUrl('onnx/');
  // A static host sends no COOP/COEP, so there is no SharedArrayBuffer and
  // no point pretending we have threads.
  ort.env.wasm.numThreads = 1;
  ort.env.logLevel = 'error';
  return ort;
}

/** Where pdf.js should look for the 14 standard PDF fonts. */
export const PDFJS_FONT_DIR = new URL(`${V}/pdfjs/standard_fonts/`, import.meta.url).href;

/**
 * pdf.js needs its worker wired up before first use, and the URL has to be
 * absolute because the worker is constructed from the library's own code.
 */
let pdfjsReady = null;
export function pdfjs() {
  if (!pdfjsReady) {
    pdfjsReady = dep('pdfjs').then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = absolute('pdfjsWorker');
      return mod;
    }).catch((e) => { pdfjsReady = null; throw e; });
  }
  return pdfjsReady;
}
