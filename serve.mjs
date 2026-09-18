// Zero-dependency static server for development. Regenerates the per-tool
// pages on start, then serves the folder; modules and workers need http://.
//
//   node serve.mjs [port]
//
// For deployment run `node scripts/build-pages.mjs --site https://…` and upload
// the folder to any static host.

import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

import { buildPages, reportMissingCopy } from './scripts/build-pages.mjs';
import { warnIfNotVendored } from './scripts/vendor.mjs';

const ROOT = resolve(import.meta.dirname);
const PORT = Number(process.argv[2]) || 5180;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

reportMissingCopy();
await warnIfNotVendored();
await buildPages({ out: ROOT, site: `http://localhost:${PORT}` });

createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const rel = normalize(url).replace(/^(\.\.[/\\])+/, '');
  let file = join(ROOT, rel === '/' || rel === '\\' ? 'index.html' : rel);

  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    if (statSync(file).isDirectory()) file = join(file, 'index.html');
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404');
    return;
  }

  res.writeHead(200, {
    'content-type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`WebTools a http://localhost:${PORT}`);
});
