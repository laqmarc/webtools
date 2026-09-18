// Baixa les dues tipografies i les deixa a assets/fonts/.
//
// El lloc no fa ni una sola petició a fora, i una webfont servida des de
// fonts.gstatic.com seria exactament la petició que trencaria això: sense
// xarxa la pàgina es quedaria amb la serif del sistema, i amb xarxa Google
// sabria qui llegeix cada eina. Així que les tipografies es vendoren igual
// que la resta de llibreries i viuen dins del repositori.
//
// Totes dues són SIL Open Font License 1.1, que permet explícitament
// allotjar-les un mateix. La llicència va al costat dels fitxers.
//
//   node scripts/fonts.mjs [--force]

import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'assets', 'fonts');

// Un user agent de Chrome: l'API de Google torna woff2 només si creu que el
// navegador el suporta, i amb el de Node torna ttf.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

// Vietnamita i ciríl·lic fora: el lloc és en català, castellà i anglès, i
// cada subconjunt que no es fa servir són vint kB que algú acaba baixant.
const WANTED = new Set(['latin', 'latin-ext']);

/** Trosseja el CSS de Google en blocs {família, estil, subconjunt, url}. */
function parseFaces(css) {
  const faces = [];
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  for (const [, subset, body] of css.matchAll(re)) {
    const family = /font-family:\s*'([^']+)'/.exec(body)?.[1];
    const style = /font-style:\s*(\w+)/.exec(body)?.[1] ?? 'normal';
    const weight = /font-weight:\s*([\d\s]+)/.exec(body)?.[1].trim() ?? '400';
    const url = /src:\s*url\(([^)]+)\)/.exec(body)?.[1];
    const range = /unicode-range:\s*([^;]+);/.exec(body)?.[1].trim();
    if (family && url) faces.push({ family, style, weight, subset, url, range });
  }
  return faces;
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function buildFonts({ force = false, quiet = false } = {}) {
  const query = 'family=Play:wght@400;700'
    + '&family=Google+Sans:ital,wght@0,400..700;1,400..700';
  const res = await fetch(`https://fonts.googleapis.com/css2?${query}&display=swap`, {
    headers: { 'user-agent': UA },
  });
  if (!res.ok) throw new Error(`Google Fonts ha respost ${res.status}`);

  const faces = parseFaces(await res.text()).filter((f) => WANTED.has(f.subset));
  if (!faces.length) throw new Error('El CSS de Google no ha portat cap woff2 utilitzable.');

  await mkdir(DIR, { recursive: true });
  let downloaded = 0;
  let bytes = 0;

  for (const face of faces) {
    const w = face.weight.includes(' ') ? '' : `-${face.weight}`;
    face.file = `${slug(face.family)}${w}${face.style === 'italic' ? '-italic' : ''}-${face.subset}.woff2`;
    const target = join(DIR, face.file);
    const have = await access(target).then(() => true, () => false);
    if (have && !force) {
      bytes += (await readFile(target)).length;
      continue;
    }
    const font = await fetch(face.url, { headers: { 'user-agent': UA } });
    if (!font.ok) throw new Error(`${face.file}: ${font.status}`);
    const buf = Buffer.from(await font.arrayBuffer());
    await writeFile(target, buf);
    downloaded++;
    bytes += buf.length;
  }

  await writeFile(join(DIR, 'LICENSE.txt'), LICENCIA, 'utf8');

  if (!quiet) {
    const kb = Math.round(bytes / 1024);
    console.log(`${faces.length} fitxers de tipografia · ${downloaded} baixats · ${kb} kB a assets/fonts/`);
  }
  return faces;
}

const LICENCIA = `Play — Copyright 2011 Jonas Hecksher, Playtype
  https://fonts.google.com/specimen/Play

Google Sans — Copyright 2025 Google LLC
  https://fonts.google.com/specimen/Google+Sans

Totes dues es distribueixen sota la SIL Open Font License, versió 1.1:
  https://openfontlicense.org

La llicència permet fer servir, estudiar, modificar i redistribuir les
tipografies, també allotjant-les en un servidor propi com fa aquest lloc. El
que no permet és vendre-les soles ni fer servir els noms reservats per a
versions modificades.
`;

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildFonts({ force: process.argv.includes('--force') });
}
