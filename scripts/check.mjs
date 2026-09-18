// The checks worth failing a build over.
//
// The generator already refuses duplicate slugs and warns about missing copy,
// but a warning scrolls past in CI. This turns the ones that would ship a
// broken page into a non-zero exit.
//
//   node scripts/check.mjs

import { TOOLS, VARIANTS, expandVariant } from '../src/registry.js';
import { LOCALES, DEFAULT_LOCALE } from '../content/i18n/index.js';
import { UI } from '../content/i18n/ui.js';
import { checkVendor } from './vendor.mjs';

const problems = [];
const notes = [];

// --- every tool reachable, with a slug of its own -------------------------
const slugs = new Map();
for (const locale of LOCALES) {
  for (const tool of TOOLS) {
    const slug = locale.content.TOOLS?.[tool.id]?.slug || tool.slug;
    const key = `${locale.dir}${slug}`;
    if (slugs.has(key)) problems.push(`ruta repetida «${key}»: ${slugs.get(key)} i ${tool.id}`);
    slugs.set(key, tool.id);
    if (!/^[a-z0-9-]+$/.test(slug)) problems.push(`slug amb caràcters estranys: ${locale.code} / ${slug}`);
  }
  for (const raw of VARIANTS) {
    const v = expandVariant(raw);
    const slug = locale.content.VARIANTS?.[raw.slug]?.slug || v.slug;
    const key = `${locale.dir}${slug}`;
    if (slugs.has(key)) problems.push(`ruta repetida «${key}»: ${slugs.get(key)} i ${raw.slug}`);
    slugs.set(key, raw.slug);
  }
}

// --- translations ----------------------------------------------------------
for (const locale of LOCALES) {
  if (locale.code === DEFAULT_LOCALE.code) continue;
  const missingNames = TOOLS.filter((t) => !locale.content.TOOLS?.[t.id]).map((t) => t.id);
  const missingPages = TOOLS.filter((t) => !locale.content.PAGES?.[t.id]).map((t) => t.id);
  if (missingNames.length) problems.push(`[${locale.code}] sense nom traduït: ${missingNames.join(', ')}`);
  if (missingPages.length) problems.push(`[${locale.code}] sense text de pàgina: ${missingPages.join(', ')}`);
}

// Every interface string must exist in all three columns.
const langCount = LOCALES.length;
for (const [key, values] of Object.entries(UI)) {
  if (!Array.isArray(values) || values.length !== langCount || values.some((v) => !v)) {
    problems.push(`cadena incompleta: ${key}`);
  }
}

// --- the tools themselves --------------------------------------------------
for (const tool of TOOLS) {
  if (!tool.slug) problems.push(`${tool.id}: sense slug`);
  if (!tool.title || !tool.desc) problems.push(`${tool.id}: sense títol o descripció`);
  if (!DEFAULT_LOCALE.content.PAGES?.[tool.id]) notes.push(`${tool.id}: sense text en català`);
  for (const p of tool.params || []) {
    if (!p.key || !p.label) problems.push(`${tool.id}: paràmetre sense clau o etiqueta`);
    if (p.def === undefined) problems.push(`${tool.id}.${p.key}: sense valor per defecte`);
  }
}

// --- libraries -------------------------------------------------------------
const vendor = await checkVendor();
if (!vendor.ok) problems.push(`vendor/: ${vendor.reason}`);

// --- report ----------------------------------------------------------------
for (const n of notes) console.warn(`avís: ${n}`);

if (problems.length) {
  console.error(`\n${problems.length} problema(es):`);
  for (const p of problems) console.error(`  · ${p}`);
  process.exit(1);
}

console.log(`tot correcte · ${TOOLS.length} eines · ${slugs.size} rutes · ${Object.keys(UI).length} cadenes`
  + (vendor.ok ? ` · vendor ${(vendor.bytes / 1048576).toFixed(1)} MB` : ''));
