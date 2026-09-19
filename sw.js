// Generat per scripts/build-pages.mjs. No l'editis.
const VERSION = '9a67d9379ac0';
const SHELL_CACHE = 'webtools-shell-' + VERSION;
const LIB_CACHE = 'webtools-vendor-v1';
const SHELL = [
  "./",
  "assets/styles.css",
  "assets/fonts/google-sans-italic-latin-ext.woff2",
  "assets/fonts/google-sans-italic-latin.woff2",
  "assets/fonts/google-sans-latin-ext.woff2",
  "assets/fonts/google-sans-latin.woff2",
  "assets/fonts/play-400-latin-ext.woff2",
  "assets/fonts/play-400-latin.woff2",
  "assets/fonts/play-700-latin-ext.woff2",
  "assets/fonts/play-700-latin.woff2",
  "manifest.webmanifest",
  "icons/icon.svg",
  "favicon.ico",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png",
  "icons/og.png",
  "i18n/ca.json",
  "i18n/es.json",
  "i18n/en.json",
  "src/core/deps.js",
  "src/core/dom.js",
  "src/core/files.js",
  "src/core/handoff.js",
  "src/core/pdfrender.js",
  "src/core/pool.js",
  "src/i18n.js",
  "src/main.js",
  "src/registry.js",
  "src/tools/data.js",
  "src/tools/heavy.js",
  "src/tools/image-core.js",
  "src/tools/image.js",
  "src/tools/imagetools.js",
  "src/tools/pdf.js",
  "src/tools/text.js",
  "src/tools/vector.js",
  "src/tools/web.js",
  "src/ui/cropeditor.js",
  "src/ui/dropzone.js",
  "src/ui/filetool.js",
  "src/ui/palette.js",
  "src/ui/params.js",
  "src/ui/pdforganize.js",
  "src/ui/sendto.js",
  "src/ui/texttool.js",
  "src/workers/image.worker.js",
  "convertir-imatges/",
  "comprimir-imatges/",
  "redimensionar-imatges/",
  "retallar-imatges/",
  "girar-imatges/",
  "treure-metadades-imatge/",
  "marca-aigua-imatge/",
  "veure-metadades-imatge/",
  "generador-de-favicons/",
  "imatges-a-gif/",
  "treure-el-fons/",
  "optimitzar-svg/",
  "svg-a-png/",
  "svg-a-pdf/",
  "svg-a-css/",
  "sprite-svg/",
  "recolorir-svg/",
  "comprimir-pdf/",
  "organitzar-pdf/",
  "pdf-a-imatges/",
  "pdf-a-text/",
  "extreure-imatges-pdf/",
  "unir-pdf/",
  "separar-pdf/",
  "girar-pdf/",
  "extreure-pagines-pdf/",
  "imatges-a-pdf/",
  "marca-aigua-pdf/",
  "numerar-pagines-pdf/",
  "ocr-imatge-i-pdf/",
  "json-a-csv/",
  "csv-a-json/",
  "json-a-yaml/",
  "yaml-a-json/",
  "formatar-json/",
  "descodificar-jwt/",
  "base64-text/",
  "fitxer-a-base64/",
  "hash-md5-sha256/",
  "minificar-css/",
  "minificar-javascript/",
  "comptar-paraules/",
  "canviar-majuscules/",
  "ordenar-linies/",
  "codificar-url/",
  "entitats-html/",
  "generar-slug/",
  "formatar-html/",
  "formatar-xml/",
  "formatar-sql/",
  "convertidor-de-colors/",
  "provador-de-regex/",
  "generador-qr/",
  "comparar-textos/",
  "png-a-webp/",
  "jpg-a-webp/",
  "png-a-jpg/",
  "jpg-a-png/",
  "webp-a-png/",
  "webp-a-jpg/",
  "png-a-avif/",
  "jpg-a-avif/",
  "avif-a-png/",
  "avif-a-jpg/",
  "comprimir-png/",
  "comprimir-jpg/",
  "jpg-a-pdf/",
  "png-a-pdf/",
  "es/",
  "es/manifest.webmanifest",
  "es/convertir-imagenes/",
  "es/comprimir-imagenes/",
  "es/redimensionar-imagenes/",
  "es/recortar-imagenes/",
  "es/girar-imagenes/",
  "es/quitar-metadatos-imagen/",
  "es/marca-de-agua-imagen/",
  "es/ver-metadatos-imagen/",
  "es/generador-de-favicons/",
  "es/imagenes-a-gif/",
  "es/quitar-el-fondo/",
  "es/optimizar-svg/",
  "es/svg-a-png/",
  "es/svg-a-pdf/",
  "es/svg-a-css/",
  "es/sprite-svg/",
  "es/recolorear-svg/",
  "es/comprimir-pdf/",
  "es/organizar-pdf/",
  "es/pdf-a-imagenes/",
  "es/pdf-a-texto/",
  "es/extraer-imagenes-pdf/",
  "es/unir-pdf/",
  "es/separar-pdf/",
  "es/girar-pdf/",
  "es/extraer-paginas-pdf/",
  "es/imagenes-a-pdf/",
  "es/marca-de-agua-pdf/",
  "es/numerar-paginas-pdf/",
  "es/ocr-imagen-y-pdf/",
  "es/json-a-csv/",
  "es/csv-a-json/",
  "es/json-a-yaml/",
  "es/yaml-a-json/",
  "es/formatear-json/",
  "es/decodificar-jwt/",
  "es/base64-texto/",
  "es/archivo-a-base64/",
  "es/hash-md5-sha256/",
  "es/minificar-css/",
  "es/minificar-javascript/",
  "es/contar-palabras/",
  "es/cambiar-mayusculas/",
  "es/ordenar-lineas/",
  "es/codificar-url/",
  "es/entidades-html/",
  "es/generar-slug/",
  "es/formatear-html/",
  "es/formatear-xml/",
  "es/formatear-sql/",
  "es/convertidor-de-colores/",
  "es/probador-de-regex/",
  "es/generador-qr/",
  "es/comparar-textos/",
  "es/png-a-webp/",
  "es/jpg-a-webp/",
  "es/png-a-jpg/",
  "es/jpg-a-png/",
  "es/webp-a-png/",
  "es/webp-a-jpg/",
  "es/png-a-avif/",
  "es/jpg-a-avif/",
  "es/avif-a-png/",
  "es/avif-a-jpg/",
  "es/comprimir-png/",
  "es/comprimir-jpg/",
  "es/jpg-a-pdf/",
  "es/png-a-pdf/",
  "en/",
  "en/manifest.webmanifest",
  "en/convert-images/",
  "en/compress-images/",
  "en/resize-images/",
  "en/crop-images/",
  "en/rotate-images/",
  "en/strip-image-metadata/",
  "en/watermark-images/",
  "en/view-image-metadata/",
  "en/favicon-generator/",
  "en/images-to-gif/",
  "en/remove-background/",
  "en/optimise-svg/",
  "en/svg-to-png/",
  "en/svg-to-pdf/",
  "en/svg-to-css/",
  "en/svg-sprite/",
  "en/recolour-svg/",
  "en/compress-pdf/",
  "en/organise-pdf-pages/",
  "en/pdf-to-images/",
  "en/pdf-to-text/",
  "en/extract-images-from-pdf/",
  "en/merge-pdf/",
  "en/split-pdf/",
  "en/rotate-pdf/",
  "en/extract-pdf-pages/",
  "en/images-to-pdf/",
  "en/watermark-pdf/",
  "en/number-pdf-pages/",
  "en/ocr-images-and-pdf/",
  "en/json-to-csv/",
  "en/csv-to-json/",
  "en/json-to-yaml/",
  "en/yaml-to-json/",
  "en/format-json/",
  "en/decode-jwt/",
  "en/base64-text/",
  "en/file-to-base64/",
  "en/hash-md5-sha256/",
  "en/minify-css/",
  "en/minify-javascript/",
  "en/word-counter/",
  "en/change-case/",
  "en/sort-lines/",
  "en/url-encode/",
  "en/html-entities/",
  "en/slug-generator/",
  "en/format-html/",
  "en/format-xml/",
  "en/format-sql/",
  "en/colour-converter/",
  "en/regex-tester/",
  "en/qr-code-generator/",
  "en/compare-text/",
  "en/png-to-webp/",
  "en/jpg-to-webp/",
  "en/png-to-jpg/",
  "en/jpg-to-png/",
  "en/webp-to-png/",
  "en/webp-to-jpg/",
  "en/png-to-avif/",
  "en/jpg-to-avif/",
  "en/avif-to-png/",
  "en/avif-to-jpg/",
  "en/compress-png/",
  "en/compress-jpg/",
  "en/jpg-to-pdf/",
  "en/png-to-pdf/"
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // One bad URL must not fail the whole install, so they go in one by one.
    await Promise.all(SHELL.map((p) => cache.add(new Request(p, { cache: 'reload' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('webtools-shell-') && key !== SHELL_CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  if (e.data === 'unregister') {
    self.registration.unregister().then(() => caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k)))));
  }
});

// Compartir des del sistema. Android envia un POST amb multipart/form-data a
// l'adreça que diu el manifest; això no és una pàgina, és un lliurament. Els
// fitxers van a la mateixa taula d'IndexedDB que fa servir «envia-ho a una
// altra eina», i el navegador acaba a la portada amb ?from=, que ja sap
// recollir-los i preguntar on van.
const HANDOFF_DB = 'webtools';
const HANDOFF_STORE = 'handoff';

function stashShared(files) {
  return new Promise((resolve) => {
    const id = Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
    let req;
    try { req = indexedDB.open(HANDOFF_DB, 1); } catch { resolve(null); return; }
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(HANDOFF_STORE)) {
        req.result.createObjectStore(HANDOFF_STORE, { keyPath: 'id' });
      }
    };
    req.onerror = () => resolve(null);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(HANDOFF_STORE, 'readwrite');
      tx.objectStore(HANDOFF_STORE).put({
        id,
        at: Date.now(),
        files: files.map((f) => ({ name: f.name || 'compartit', blob: f })),
      });
      tx.oncomplete = () => { db.close(); resolve(id); };
      tx.onerror = () => { db.close(); resolve(null); };
    };
  });
}

async function receiveShare(e, url) {
  const home = url.pathname.replace(/share-target\/?$/, '');
  try {
    const form = await e.request.formData();
    const files = form.getAll('files').filter((f) => f && typeof f === 'object' && 'size' in f);
    // Compartir un enllaç o un tros de text també és compartir: entra com a
    // fitxer de text i les eines de text l'accepten igual.
    const words = [form.get('text'), form.get('url')].filter(Boolean).join('\n').trim();
    if (!files.length && words) {
      files.push(new File([words], 'compartit.txt', { type: 'text/plain' }));
    }
    const id = files.length ? await stashShared(files) : null;
    return Response.redirect(id ? home + '?from=' + id : home, 303);
  } catch {
    return Response.redirect(home, 303);
  }
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const shared = new URL(req.url);
  if (req.method === 'POST' && shared.origin === self.location.origin
      && /\/share-target\/?$/.test(shared.pathname)) {
    e.respondWith(receiveShare(e, shared));
    return;
  }
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Libraries and models never change under a given URL: serve from cache.
  if (url.pathname.includes('/vendor/')) {
    e.respondWith((async () => {
      const cache = await caches.open(LIB_CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    })());
    return;
  }

  // Documents: network first, so a new deploy is visible on the next visit,
  // with the cached copy as the answer when there is no network.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) (await caches.open(SHELL_CACHE)).put(req, res.clone());
        return res;
      } catch {
        return (await caches.match(req)) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Everything else: cached copy now, refreshed in the background.
  e.respondWith((async () => {
    const cache = await caches.open(SHELL_CACHE);
    const hit = await cache.match(req);
    const network = fetch(req).then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => hit || Response.error());
    return hit || network;
  })());
});
