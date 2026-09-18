// Checks that what is committed is what a fresh build produces.
//
// The site is deployed by a git pull into the docroot, which means whatever is
// committed is live within seconds. Edit content/seo.js, push without running
// the build, and the site keeps serving the old text with nobody the wiser.
//
// So: build into a temporary directory and compare it with the repository. Any
// difference means the commit would publish a stale page.
//
// This only works because the build is reproducible — no timestamps anywhere
// in the output. If you ever add one, this check dies with it.
//
//   node scripts/verify-build.mjs [--site https://…]

import { mkdtemp, readdir, readFile, rm, cp, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildPages } from './build-pages.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const site = flag('site', 'https://webtools.quexulo.cat');

async function walk(dir, base = dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, base, out);
    else out.push(relative(base, full).split(sep).join('/'));
  }
  return out;
}

const scratch = await mkdtemp(join(tmpdir(), 'webtools-verify-'));
try {
  // The service worker hashes the shell, so the files it lists that are not
  // generated — the stylesheet and the app code — have to be in place first.
  for (const dir of ['src', 'assets']) {
    await mkdir(join(scratch, dir), { recursive: true });
    await cp(join(ROOT, dir), join(scratch, dir), { recursive: true });
  }

  await buildPages({ out: scratch, site, quiet: true });

  const copied = ['src/', 'assets/'];
  const generated = (await walk(scratch)).filter((f) => !copied.some((d) => f.startsWith(d)));
  const stale = [];
  const absent = [];

  for (const file of generated) {
    const committed = join(ROOT, file);
    if (!existsSync(committed)) { absent.push(file); continue; }
    const [a, b] = await Promise.all([readFile(join(scratch, file)), readFile(committed)]);
    if (!a.equals(b)) stale.push(file);
  }

  if (absent.length || stale.length) {
    console.error('El que hi ha comès no és el que produeix una construcció nova.\n');
    if (absent.length) {
      console.error(`  ${absent.length} fitxer(s) que falten al repositori:`);
      for (const f of absent.slice(0, 10)) console.error(`    · ${f}`);
      if (absent.length > 10) console.error(`    … i ${absent.length - 10} més`);
    }
    if (stale.length) {
      console.error(`  ${stale.length} fitxer(s) desactualitzats:`);
      for (const f of stale.slice(0, 10)) console.error(`    · ${f}`);
      if (stale.length > 10) console.error(`    … i ${stale.length - 10} més`);
    }
    console.error('\nExecuta «npm run build» i comet el resultat.');
    process.exit(1);
  }

  console.log(`el lloc comès està al dia · ${generated.length} fitxers generats · ${site}`);
} finally {
  await rm(scratch, { recursive: true, force: true });
}
