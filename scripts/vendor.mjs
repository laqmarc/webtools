// Downloads every third-party library into vendor/ so the site never talks to
// a CDN at runtime.
//
// Three shapes of dependency, three ways of handling them:
//
//   1. jsDelivr's `+esm` bundles, which inline most of their code but still
//      import a few siblings by absolute `/npm/...` path. Those are followed
//      and rewritten to relative paths, recursively.
//   2. Plain single-file browser builds (svgo, terser). Copied as they are.
//   3. @jsquash/avif, which is an Emscripten module plus a 2.6 MB .wasm. Its
//      own encode.js branches on SharedArrayBuffer to pick a multithreaded
//      build that needs COOP/COEP headers a static host will not send, so we
//      take the single-threaded files and write our own small entry point.
//
//   node scripts/vendor.mjs [--force]

import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VENDOR = join(ROOT, 'vendor');
const JSDELIVR = 'https://cdn.jsdelivr.net';

// ---------------------------------------------------------------- what

const ESM_BUNDLES = [
  { out: 'pdf-lib.js', path: '/npm/pdf-lib@1.17.1/+esm' },
  { out: 'fflate.js', path: '/npm/fflate@0.8.2/+esm' },
  { out: 'js-yaml.js', path: '/npm/js-yaml@4.1.0/+esm' },
  { out: 'qrcode-generator.js', path: '/npm/qrcode-generator@1.4.4/+esm' },
  { out: 'csso.js', path: '/npm/csso@5.0.5/+esm' },
];

const PLAIN_FILES = [
  { out: 'svgo.js', path: '/npm/svgo@3.3.2/dist/svgo.browser.js' },
  { out: 'terser.js', path: '/npm/terser@5.31.6/dist/bundle.min.js' },
  { out: 'exifr.js', path: '/npm/exifr@7.1.3/dist/lite.esm.mjs' },
  { out: 'gifenc.js', path: '/npm/gifenc@1.0.3/dist/gifenc.esm.js' },
  { out: 'js-beautify.js', path: '/npm/js-beautify@1.15.1/js/lib/beautifier.min.js' },
  { out: 'sql-formatter.js', path: '/npm/sql-formatter@15.4.2/dist/sql-formatter.min.js' },
];

// pdf.js is the one library we take whole directories from: the renderer needs
// its worker beside it, and the 14 standard PDF fonts to draw documents that
// do not embed their own. Its cmaps (1.1 MB across 169 files) are only for CJK
// text and are deliberately left out.
const PDFJS_VERSION = '4.6.82';
const PDFJS_FILES = [
  { out: 'pdfjs/pdf.mjs', path: `/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs` },
  { out: 'pdfjs/pdf.worker.mjs', path: `/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs` },
];

const AVIF_VERSION = '1.3.0';
const AVIF_FILES = [
  { out: 'jsquash-avif/meta.js', path: `/npm/@jsquash/avif@${AVIF_VERSION}/meta.js` },
  { out: 'jsquash-avif/utils.js', path: `/npm/@jsquash/avif@${AVIF_VERSION}/utils.js` },
  { out: 'jsquash-avif/codec/enc/avif_enc.js', path: `/npm/@jsquash/avif@${AVIF_VERSION}/codec/enc/avif_enc.js` },
  { out: 'jsquash-avif/codec/enc/avif_enc.wasm', path: `/npm/@jsquash/avif@${AVIF_VERSION}/codec/enc/avif_enc.wasm`, binary: true },
];

// Our own entry point, in place of upstream's encode.js: same call signature,
// minus the multithreaded branch we cannot serve. The Emscripten module finds
// its .wasm through `new URL('avif_enc.wasm', import.meta.url)`, so the two
// files only have to stay next to each other.
const AVIF_ENTRY = `// Escrit per scripts/vendor.mjs — no és codi original de @jsquash/avif.
// Equival al seu encode.js sense la branca multifil, que necessita
// SharedArrayBuffer i capçaleres COOP/COEP que un allotjament estàtic no envia.
import { defaultOptions } from './meta.js';
import { initEmscriptenModule } from './utils.js';

let module;

export async function encode(data, options = {}) {
  if (!module) {
    module = import('./codec/enc/avif_enc.js')
      .then((m) => initEmscriptenModule(m.default));
  }
  const mod = await module;
  const out = mod.encode(data.data, data.width, data.height, { ...defaultOptions, ...options });
  if (!out) throw new Error('El còdec AVIF no ha pogut codificar la imatge.');
  return out.buffer;
}

export default encode;
`;

// ---------------------------------------------------------------- extras
//
// Two tools need weights, and weights are heavy. They are opt-in so that a
// clone of this repository stays at eight megabytes instead of forty: run
// `node scripts/vendor.mjs --extras` to add them.
//
// The choice of model matters here. RMBG-1.4 is the better cut-out, but its
// quantised ONNX is 42 MB — five times the whole rest of vendor/. u2netp is
// 4.4 MB and good enough for the job, so it wins on proportion.

const TESSERACT_VERSION = '5.1.1';
const TESSDATA = 'https://cdn.jsdelivr.net/gh/naptha/tessdata@gh-pages/4.0.0_fast';
const ORT_VERSION = '1.19.2';

const EXTRA_CDN_FILES = [
  { out: 'tesseract/tesseract.js', path: `/npm/tesseract.js@${TESSERACT_VERSION}/dist/tesseract.min.js` },
  { out: 'tesseract/worker.js', path: `/npm/tesseract.js@${TESSERACT_VERSION}/dist/worker.min.js` },
  // In the browser Tesseract loads the all-in-one build, with the wasm inlined
  // in the JavaScript, through importScripts. Only the SIMD + LSTM variant is
  // taken: we always ask for OEM 1, and every engine that can run this has
  // SIMD. The other three builds would be 12 MB of files nothing ever asks for.
  { out: 'tesseract/tesseract-core-simd-lstm.wasm.js', path: `/npm/tesseract.js-core@${TESSERACT_VERSION}/tesseract-core-simd-lstm.wasm.js` },
  { out: 'onnx/ort.mjs', path: `/npm/onnxruntime-web@${ORT_VERSION}/dist/ort.bundle.min.mjs` },
  { out: 'onnx/ort-wasm-simd-threaded.wasm', path: `/npm/onnxruntime-web@${ORT_VERSION}/dist/ort-wasm-simd-threaded.wasm`, binary: true },
];

// Not on a package registry, so these are fetched by full URL.
const EXTRA_URLS = [
  { out: 'tesseract/lang/cat.traineddata.gz', url: `${TESSDATA}/cat.traineddata.gz` },
  { out: 'tesseract/lang/spa.traineddata.gz', url: `${TESSDATA}/spa.traineddata.gz` },
  { out: 'tesseract/lang/eng.traineddata.gz', url: `${TESSDATA}/eng.traineddata.gz` },
  { out: 'onnx/u2netp.onnx', url: 'https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx' },
];

async function getAbsolute(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} en ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function vendorExtras() {
  console.log('Extres (OCR i retall de fons):');
  for (const f of EXTRA_CDN_FILES) await put(f.out, await get(f.path, f.binary !== false));
  for (const f of EXTRA_URLS) await put(f.out, await getAbsolute(f.url));
}

/** Which optional tools this installation can actually offer. */
export async function extrasPresent() {
  return {
    ocr: existsSync(join(VENDOR, 'tesseract/tesseract.js')),
    matting: existsSync(join(VENDOR, 'onnx/u2netp.onnx')),
  };
}

// Packages whose licence text we ship alongside the code.
const LICENSED = [
  ['pdf-lib', '1.17.1'], ['@pdf-lib/standard-fonts', '1.0.0'], ['@pdf-lib/upng', '1.0.1'],
  ['pako', '1.0.11'], ['tslib', '1.14.1'], ['fflate', '0.8.2'], ['js-yaml', '4.1.0'],
  ['qrcode-generator', '1.4.4'], ['csso', '5.0.5'], ['css-tree', '2.2.0'],
  ['svgo', '3.3.2'], ['terser', '5.31.6'], ['@jsquash/avif', AVIF_VERSION],
  ['pdfjs-dist', PDFJS_VERSION], ['exifr', '7.1.3'], ['gifenc', '1.0.3'],
  ['js-beautify', '1.15.1'], ['sql-formatter', '15.4.2'],
  ['tesseract.js', TESSERACT_VERSION], ['tesseract.js-core', TESSERACT_VERSION],
  ['onnxruntime-web', ORT_VERSION],
];


// --------------------------------------------------------------- fetch

async function get(path, binary = false) {
  const res = await fetch(JSDELIVR + path);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} en ${path}`);
  return binary ? Buffer.from(await res.arrayBuffer()) : res.text();
}

const sha = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 16);

const written = [];

async function put(out, data) {
  const dest = join(VENDOR, out);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, data);
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  written.push({ file: out, bytes: buf.length, sha256: sha(buf) });
  console.log(`  ${out.padEnd(42)} ${(buf.length / 1024).toFixed(0).padStart(5)} kB`);
}

/** `/npm/@pdf-lib/standard-fonts@1.0.0/+esm` → `pdf-lib-standard-fonts-1.0.0.js` */
function nameFor(npmPath) {
  return `${npmPath.replace(/^\/npm\//, '').replace(/\/\+esm$/, '').replace(/[@/]/g, '-').replace(/^-+/, '')}.js`;
}

/** Follow a +esm bundle's absolute sibling imports and point them at vendor/. */
async function vendorEsm(entry) {
  const queue = [{ path: entry.path, out: entry.out }];
  const done = new Set();

  while (queue.length) {
    const job = queue.shift();
    if (done.has(job.path)) continue;
    done.add(job.path);

    let code = await get(job.path);
    const refs = [...new Set(code.match(/"\/npm\/[^"]+\/\+esm"/g) || [])];
    for (const quoted of refs) {
      const depPath = quoted.slice(1, -1);
      const depOut = nameFor(depPath);
      if (!done.has(depPath)) queue.push({ path: depPath, out: depOut });
      code = code.split(quoted).join(`"./${depOut}"`);
    }

    const leftovers = code.match(/from\s*"(?:https?:)?\/\/[^"]+"/g);
    if (leftovers) throw new Error(`${job.out} encara importa de fora: ${leftovers[0]}`);

    await put(job.out, code);
  }
}

/** Copy a whole directory of a package, listing it from jsDelivr's data API. */
async function vendorDirectory(pkg, version, dir, outPrefix) {
  const res = await fetch(`https://data.jsdelivr.com/v1/packages/npm/${pkg}@${version}`);
  if (!res.ok) throw new Error(`No s’ha pogut llistar ${pkg}@${version}`);
  const tree = await res.json();
  const node = tree.files.find((f) => f.type === 'directory' && f.name === dir);
  if (!node) throw new Error(`${pkg}@${version} no té cap directori «${dir}»`);
  for (const file of node.files) {
    if (file.type !== 'file') continue;
    await put(`${outPrefix}/${file.name}`, await get(`/npm/${pkg}@${version}/${dir}/${file.name}`, true));
  }
}

async function vendorLicenses() {
  const parts = [
    '# Llicències de les llibreries vendoritzades',
    '',
    'Els fitxers de `vendor/` són codi de tercers, copiat tal qual per no dependre',
    "d'un CDN en temps d'execució. Cadascun conserva la llicència del seu projecte.",
    'Aquest fitxer el genera `scripts/vendor.mjs`.',
    '',
  ];
  for (const [pkg, version] of LICENSED) {
    let text = null;
    for (const file of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'LICENCE']) {
      try { text = await get(`/npm/${pkg}@${version}/${file}`); break; } catch { /* try the next name */ }
    }
    parts.push(`## ${pkg} ${version}`, '');
    parts.push(text ? '```\n' + text.trim() + '\n```' : `_No s’ha trobat el fitxer de llicència al paquet. Consulta https://www.npmjs.com/package/${pkg}_`);
    parts.push('');
    console.log(`  llicència ${pkg}@${version}${text ? '' : ' (no trobada)'}`);
  }
  await put('LICENSES.md', parts.join('\n'));
}

// --------------------------------------------------------------- verify

/** Files the site needs at runtime, checked against the manifest. */
export async function checkVendor() {
  const manifestPath = join(VENDOR, 'manifest.json');
  if (!existsSync(manifestPath)) return { ok: false, reason: 'vendor/manifest.json no existeix' };
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const missing = manifest.files
    .filter((f) => !/^(tesseract|onnx)\//.test(f.file))
    .filter((f) => !existsSync(join(VENDOR, f.file)))
    .map((f) => f.file);
  return missing.length
    ? { ok: false, reason: `falten ${missing.length} fitxers: ${missing.slice(0, 3).join(', ')}` }
    : { ok: true, files: manifest.files.length, bytes: manifest.files.reduce((n, f) => n + f.bytes, 0) };
}

export function warnIfNotVendored() {
  return checkVendor().then((r) => {
    if (!r.ok) console.warn(`avís: vendor/ incomplet (${r.reason}). Executa «node scripts/vendor.mjs».`);
    return r.ok;
  });
}

// ---------------------------------------------------------------- main

export async function vendorAll({ force = false, extras = false } = {}) {
  if (force && existsSync(VENDOR)) await rm(VENDOR, { recursive: true, force: true });
  await mkdir(VENDOR, { recursive: true });

  console.log('Paquets ESM (amb les seves dependències):');
  for (const entry of ESM_BUNDLES) await vendorEsm(entry);

  console.log('Builds de navegador:');
  for (const f of PLAIN_FILES) await put(f.out, await get(f.path));

  console.log('pdf.js:');
  for (const f of PDFJS_FILES) await put(f.out, await get(f.path));
  await vendorDirectory('pdfjs-dist', PDFJS_VERSION, 'standard_fonts', 'pdfjs/standard_fonts');

  console.log('Còdec AVIF:');
  for (const f of AVIF_FILES) await put(f.out, await get(f.path, f.binary));
  await put('jsquash-avif/encode.js', AVIF_ENTRY);

  if (extras) await vendorExtras();

  console.log('Llicències:');
  await vendorLicenses();

  // A plain run must not drop extras that a previous --extras run fetched.
  if (!extras && existsSync(join(VENDOR, 'manifest.json'))) {
    const previous = JSON.parse(await readFile(join(VENDOR, 'manifest.json'), 'utf8'));
    const names = new Set(written.map((f) => f.file));
    for (const f of previous.files || []) {
      if (!names.has(f.file) && /^(tesseract|onnx)\//.test(f.file) && existsSync(join(VENDOR, f.file))) written.push(f);
    }
  }

  const total = written.reduce((n, f) => n + f.bytes, 0);
  await writeFile(
    join(VENDOR, 'manifest.json'),
    `${JSON.stringify({ vendored: new Date().toISOString(), source: JSDELIVR, files: written }, null, 2)}\n`,
    'utf8',
  );

  console.log(`\n${written.length} fitxers, ${(total / 1024 / 1024).toFixed(1)} MB a vendor/`);
  console.log('El lloc ja no fa cap petició a cap CDN.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await vendorAll({ force: process.argv.includes('--force'), extras: process.argv.includes('--extras') });
}
