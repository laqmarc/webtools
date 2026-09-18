// Assembles a folder that is exactly what gets deployed.
//
// The repository currently doubles as the deployed site, which works but makes
// it impossible to see at a glance what ships. This builds the same thing into
// dist/ instead, so CI can upload one directory and you can preview locally
// what the server will actually hold.
//
//   node scripts/dist.mjs --site https://webtools.quexulo.cat

import { cp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildPages, reportMissingCopy } from './build-pages.mjs';
import { checkVendor } from './vendor.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Copied verbatim; everything else in dist/ is generated.
const STATIC = ['assets', 'src', 'vendor'];
const FILES = [];

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};

const site = flag('site', 'https://webtools.quexulo.cat');
const out = resolve(flag('out', join(ROOT, 'dist')));

const vendor = await checkVendor();
if (!vendor.ok) {
  console.error(`vendor/ incomplet (${vendor.reason}). Executa «node scripts/vendor.mjs --extras».`);
  process.exit(1);
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const dir of STATIC) {
  if (!existsSync(join(ROOT, dir))) continue;
  await cp(join(ROOT, dir), join(out, dir), { recursive: true });
}
for (const file of FILES) {
  if (existsSync(join(ROOT, file))) await writeFile(join(out, file), await readFile(join(ROOT, file)));
}

reportMissingCopy();
await buildPages({ out, site });

console.log(`\ndist/ llest per pujar · ${site}`);
