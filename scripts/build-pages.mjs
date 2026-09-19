// Writes one real HTML file per tool, in every language.
//
// Why bother, when the app already ran fine from a single page: a crawler that
// asks for /png-a-webp/ has to get a document that already says what the page
// is for. Rendering that from JavaScript after the fact is a bet on the
// crawler's patience, and it is a bet you do not need to take when the content
// is known at build time.
//
// So each page ships its heading, its prose and its FAQ as markup, and the
// script only mounts the interactive part into an empty <div id="tool">.
//
// Catalan lives at the root; the other languages get a directory each, with
// their own slugs, their own manifest and hreflang links between the three.
//
//   node scripts/build-pages.mjs [--site https://example.com] [--out .]

import { mkdir, writeFile, rm, readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Script } from 'node:vm';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOOLS, AREAS, VARIANTS, expandVariant, byId } from '../src/registry.js';
import { SITE as SITE_BASE } from '../content/seo.js';
import { LOCALES, DEFAULT_LOCALE, toolStrings, pageCopy } from '../content/i18n/index.js';
import { UI, uiFor } from '../content/i18n/ui.js';
import { buildIcons, ICON_FILES, ICO_FILE, OG_FILE, OG_WIDTH, OG_HEIGHT } from './icons.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = '.pages-manifest.json';

let SITE_URL = SITE_BASE.url;

// --------------------------------------------------------------- helpers

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
const ld = (obj) => JSON.stringify(obj, null, 2).replace(/</g, '\\u003c');

/** Clip to a sane meta-description length without cutting mid-word. */
function clip(text, max = 158) {
  const s = String(text).replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  return `${s.slice(0, s.lastIndexOf(' ', max - 1))}…`;
}

// Els noms d'àrea són a content/i18n/ui.js, no aquí: el navegador també els
// necessita per a la paleta d'ordres i per al menú d'encadenar.
const areaName = (areaId, locale) => uiFor(locale.code)[`area.${areaId}`] || areaId;

// ------------------------------------------------------------ page model

const FORMAT_LABEL = { png: 'PNG', jpeg: 'JPG', webp: 'WebP', avif: 'AVIF' };

/** Every page of one language edition, with its prose already resolved. */
function collectPages(locale) {
  const C = locale.content;
  const pages = [];

  for (const tool of TOOLS) {
    const strings = toolStrings(locale, tool);
    const copy = pageCopy(locale, tool.id);
    pages.push({
      type: 'tool',
      id: tool.id,
      slug: strings.slug,
      tool,
      area: tool.area,
      h1: strings.title,
      lead: strings.desc,
      search: `${strings.title} ${strings.desc} ${strings.keywords || ''} ${strings.slug}`.toLowerCase(),
      metaTitle: C.META.toolTitle(strings.title, SITE_BASE.name),
      metaDesc: clip(copy.intro?.[0] || strings.desc),
      intro: copy.intro || [strings.desc],
      steps: copy.steps || [],
      faq: copy.faq || [],
      boot: { kind: 'tool', tool: tool.id, slug: strings.slug, lang: locale.code },
    });
  }

  for (const raw of VARIANTS) {
    const v = expandVariant(raw);
    const over = C.VARIANTS?.[raw.slug] || {};
    const custom = C.VARIANT_PAGES?.[raw.slug];
    const pair = raw.from && raw.to;

    const labels = pair
      ? C.pairLabels(FORMAT_LABEL[raw.from], FORMAT_LABEL[raw.to])
      : { title: v.title, desc: v.desc };
    const title = over.title || labels.title;
    const desc = over.desc || labels.desc;
    const copy = custom || (pair
      ? C.pairCopy(C.FORMATS[raw.from], C.FORMATS[raw.to], C.PAIR_ANGLES?.[raw.slug] || '')
      : { intro: [desc], faq: [] });

    pages.push({
      type: 'variant',
      id: raw.slug,
      slug: over.slug || v.slug,
      tool: v.tool,
      area: v.tool.area,
      h1: title,
      lead: desc,
      search: `${title} ${desc} ${over.slug || v.slug}`.toLowerCase(),
      metaTitle: C.META.variantTitle(title, SITE_BASE.name),
      metaDesc: clip(copy.intro[0]),
      intro: copy.intro,
      steps: copy.steps || pageCopy(locale, v.tool.id).steps || [],
      faq: copy.faq || [],
      boot: {
        kind: 'tool',
        tool: v.tool.id,
        slug: over.slug || v.slug,
        lang: locale.code,
        accepts: v.accepts,
        preset: v.preset,
        lock: v.lock,
      },
    });
  }

  return pages;
}

/** page id -> { localeCode: slug }, so every page can link to its siblings. */
function buildAlternates(editions) {
  const map = new Map();
  for (const { locale, pages } of editions) {
    for (const page of pages) {
      if (!map.has(page.id)) map.set(page.id, {});
      map.get(page.id)[locale.code] = page.slug;
    }
  }
  return map;
}

const absolute = (locale, slug) => `${SITE_URL}/${locale.dir}${slug ? `${slug}/` : ''}`;

// -------------------------------------------------------------- fragments

function hreflangs(alternates, pageId) {
  const rows = [];
  for (const locale of LOCALES) {
    const slug = pageId == null ? '' : alternates.get(pageId)?.[locale.code];
    if (pageId != null && !slug) continue;
    rows.push(`<link rel="alternate" hreflang="${locale.htmlLang}" href="${esc(absolute(locale, slug))}">`);
  }
  const def = pageId == null ? '' : alternates.get(pageId)?.[DEFAULT_LOCALE.code];
  if (pageId == null || def) {
    rows.push(`<link rel="alternate" hreflang="x-default" href="${esc(absolute(DEFAULT_LOCALE, def))}">`);
  }
  return rows.join('\n');
}

function languageNav(locale, alternates, pageId, up) {
  const links = LOCALES.map((other) => {
    if (other.code === locale.code) {
      return `<span class="lang on" aria-current="true">${esc(other.name)}</span>`;
    }
    const slug = pageId == null ? '' : alternates.get(pageId)?.[other.code];
    if (pageId != null && !slug) return '';
    // From /es/foo/ the root is two levels up, from /foo/ it is one.
    const href = `${up}${other.dir}${slug ? `${slug}/` : ''}`;
    return `<a class="lang" href="${esc(href)}" hreflang="${other.htmlLang}">${esc(other.name)}</a>`;
  }).filter(Boolean);
  return `<nav class="langs" aria-label="${esc(UI['shell.language'][LOCALES.indexOf(locale)])}">${links.join('')}</nav>`;
}

function shell({ locale, depth, title, desc, canonical, jsonld, body, boot, alternates, pageId }) {
  // Two different roots, and mixing them up sends every asset into the
  // language directory: `toRoot` is the site root (shared assets, the script,
  // the language switcher), `toLang` is this language's home (brand link,
  // search, its own manifest).
  const toRoot = '../'.repeat(depth);
  const toLang = '../'.repeat(depth - (locale.dir ? 1 : 0));
  const T = uiFor(locale.code);

  return `<!DOCTYPE html>
<html lang="${locale.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
${hreflangs(alternates, pageId)}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE_BASE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:locale" content="${locale.ogLocale}">
<meta property="og:image" content="${esc(`${SITE_URL}/${OG_FILE}`)}">
<meta property="og:image:width" content="${OG_WIDTH}">
<meta property="og:image:height" content="${OG_HEIGHT}">
<meta property="og:image:alt" content="${esc(SITE_BASE.name)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="${toRoot}assets/styles.css">
<!-- Les dues cares que surten a tot arreu. El navegador no les descobriria
     fins a haver llegit el CSS, i el titular apareixeria un instant amb la
     serif del sistema. Els subconjunts latin-ext els demana només qui els
     necessita, via unicode-range. -->
<link rel="preload" as="font" type="font/woff2" crossorigin href="${toRoot}assets/fonts/play-700-latin.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="${toRoot}assets/fonts/google-sans-latin.woff2">
<link rel="icon" href="${toRoot}${ICO_FILE}" sizes="32x32">
<link rel="icon" href="${toRoot}assets/icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${toRoot}assets/icons/apple-touch-icon.png">
<link rel="manifest" href="${toLang}manifest.webmanifest">
<!-- beforeinstallprompt no es repeteix: si quan arriba no hi ha ningu escoltant,
     s'ha perdut fins a la navegacio seguent. src/main.js es un modul diferit i a
     mes espera les traduccions abans d'arribar-hi, o sigui que pot trigar mes
     d'un segon a estar-hi a temps. Aixo nomes el guarda; el boto el fa servir. -->
<script>window.__installPrompt=null;addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__installPrompt=e;dispatchEvent(new Event('webtools:installable'))});addEventListener('appinstalled',function(){window.__installPrompt=null});</script>
<meta name="theme-color" content="#14120f" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f6f3ec" media="(prefers-color-scheme: light)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${esc(SITE_BASE.name)}">
<script type="application/ld+json">
${jsonld}
</script>
</head>
<body>
<header class="topbar">
  <a class="brand" href="${toLang}"><span class="brand-mark">◩</span> ${esc(SITE_BASE.name)}</a>
  <input id="search" class="search" type="search" placeholder="${esc(T['shell.search'])}" autocomplete="off" spellcheck="false" data-home="${toLang}">
  <span class="grow"></span>
  ${languageNav(locale, alternates, pageId, toRoot)}
  <button id="install" class="btn ghost sm" hidden>${esc(T['shell.install'])}</button>
  <button id="theme" class="icon-btn" title="${esc(T['shell.theme'])}" aria-label="${esc(T['shell.theme'])}">◐</button>
</header>

<main class="app">
${body}
</main>

<footer class="foot">
  <p><strong>${esc(T['shell.footerLead'])}</strong> ${esc(T['shell.footer'])}</p>
</footer>

<script>window.__PAGE__=${ld({ ...boot, home: toLang }).replace(/\n\s*/g, '')};</script>
<script type="module" src="${toRoot}src/main.js"></script>
</body>
</html>
`;
}

function cardHtml(href, title, desc, search) {
  return `      <a class="card" href="${esc(href)}" data-search="${esc(search)}">`
    + `<b>${esc(title)}</b><span>${esc(desc)}</span></a>`;
}

function proseHtml(page, related, T) {
  const parts = ['  <article class="prose">'];
  for (const p of page.intro) parts.push(`    <p>${esc(p)}</p>`);

  if (page.steps.length) {
    parts.push(`    <h2>${esc(T['shell.howto'])}</h2>`, '    <ol>');
    for (const s of page.steps) parts.push(`      <li>${esc(s)}</li>`);
    parts.push('    </ol>');
  }

  if (page.faq.length) {
    parts.push(`    <h2>${esc(T['shell.faq'])}</h2>`, '    <dl class="faq">');
    for (const { q, a } of page.faq) parts.push(`      <dt>${esc(q)}</dt>`, `      <dd>${esc(a)}</dd>`);
    parts.push('    </dl>');
  }

  if (related.length) {
    parts.push(`    <h2>${esc(T['shell.related'])}</h2>`, '    <div class="grid">');
    for (const r of related) parts.push(cardHtml(`../${r.slug}/`, r.title, r.desc, r.search));
    parts.push('    </div>');
  }

  parts.push('  </article>');
  return parts.join('\n');
}

// ---------------------------------------------------------------- render

function renderTool(page, allPages, locale, alternates) {
  const canonical = absolute(locale, page.slug);
  const related = relatedFor(page, allPages);
  const T = uiFor(locale.code);

  const graph = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_BASE.name, item: absolute(locale, '') },
        { '@type': 'ListItem', position: 2, name: page.h1, item: canonical },
      ],
    },
    {
      '@type': 'WebApplication',
      name: page.h1,
      url: canonical,
      description: page.metaDesc,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any modern browser',
      browserRequirements: 'Requires JavaScript',
      inLanguage: locale.htmlLang,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    },
  ];
  if (page.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faq.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
  }

  const body = [
    `  <nav class="crumb"><a href="../">${esc(T['shell.allTools'])}</a> / ${esc(areaName(page.area, locale))}</nav>`,
    '  <header class="tool-head">',
    `    <h1>${esc(page.h1)}</h1>`,
    `    <p>${esc(page.lead)}</p>`,
    '  </header>',
    '  <div id="tool"></div>',
    `  <noscript><div class="msg err">${esc(T['shell.noscript'])}</div></noscript>`,
    proseHtml(page, related, T),
  ].join('\n');

  return shell({
    locale,
    depth: locale.dir ? 2 : 1,
    title: page.metaTitle,
    desc: page.metaDesc,
    canonical,
    jsonld: ld({ '@context': 'https://schema.org', '@graph': graph }),
    body,
    boot: page.boot,
    alternates,
    pageId: page.id,
  });
}

/** Siblings first for variants, then the rest of the area. */
function relatedFor(page, allPages) {
  const out = [];
  const seen = new Set([page.slug]);
  const push = (p) => {
    if (p && !seen.has(p.slug)) { seen.add(p.slug); out.push({ slug: p.slug, title: p.h1, desc: p.lead, search: p.search }); }
  };

  if (page.type === 'variant') {
    push(allPages.find((p) => p.type === 'tool' && p.tool.id === page.tool.id));
    for (const p of allPages) {
      if (out.length >= 5) break;
      if (p.type === 'variant' && p.tool.id === page.tool.id) push(p);
    }
  }
  for (const p of allPages) {
    if (out.length >= 5) break;
    if (p.type === 'tool' && p.area === page.area) push(p);
  }
  return out.slice(0, 5);
}

function renderHome(allPages, locale, alternates) {
  const C = locale.content;
  const T = uiFor(locale.code);
  const toolPages = allPages.filter((p) => p.type === 'tool');
  const variantPages = allPages.filter((p) => p.type === 'variant');
  const home = { ...DEFAULT_LOCALE.content.HOME, ...(C.HOME || {}) };
  const site = { ...SITE_BASE, ...(C.SITE || {}) };

  const sections = [];
  for (const area of AREAS) {
    const inArea = toolPages.filter((p) => p.area === area.id);
    if (!inArea.length) continue;
    sections.push(
      '    <section class="area">',
      `      <h2>${esc(areaName(area.id, locale))}</h2>`,
      '      <div class="grid">',
      ...inArea.map((p) => cardHtml(`${p.slug}/`, p.h1, p.lead, p.search)),
      '      </div>',
      '    </section>',
    );
  }
  sections.push(
    '    <section class="area">',
    `      <h2>${esc(T['shell.directConversions'])}</h2>`,
    '      <div class="grid">',
    ...variantPages.map((p) => cardHtml(`${p.slug}/`, p.h1, p.lead, p.search)),
    '      </div>',
    '    </section>',
  );

  const body = [
    '  <div class="hero">',
    `    <h1>${esc(home.h1)}</h1>`,
    `    <p>${esc(home.lead)}</p>`,
    '  </div>',
    '  <div id="tools">',
    ...sections,
    '  </div>',
    '  <p class="empty" id="no-results" hidden></p>',
    '  <article class="prose">',
    `    <h2>${esc(T['shell.whyBrowser'])}</h2>`,
    ...home.body.map((p) => `    <p>${esc(p)}</p>`),
    '  </article>',
  ].join('\n');

  const graph = [
    {
      '@type': 'WebSite',
      name: SITE_BASE.name,
      url: absolute(locale, ''),
      description: site.description,
      inLanguage: locale.htmlLang,
    },
    {
      '@type': 'ItemList',
      name: 'Tools',
      itemListElement: allPages.map((p, i) => ({
        '@type': 'ListItem', position: i + 1, name: p.h1, url: absolute(locale, p.slug),
      })),
    },
  ];

  return shell({
    locale,
    depth: locale.dir ? 1 : 0,
    title: C.META.homeTitle(SITE_BASE.name, site.tagline),
    desc: site.description,
    canonical: absolute(locale, ''),
    jsonld: ld({ '@context': 'https://schema.org', '@graph': graph }),
    body,
    boot: { kind: 'home', lang: locale.code },
    alternates,
    pageId: null,
  });
}

function renderManifest(allPages, locale) {
  const C = locale.content;
  const site = { ...SITE_BASE, ...(C.SITE || {}) };
  const find = (id) => allPages.find((p) => p.id === id);
  const shortcut = (id) => {
    const p = find(id);
    return p && { name: p.h1, short_name: p.h1, description: clip(p.lead, 100), url: `./${p.slug}/` };
  };
  const slugOf = (id) => find(id)?.slug;

  return `${JSON.stringify({
    name: `${SITE_BASE.name} — ${site.tagline}`,
    short_name: SITE_BASE.name,
    description: site.description,
    lang: locale.htmlLang,
    dir: 'ltr',
    start_url: './',
    scope: './',
    display: 'standalone',
    orientation: 'any',
    background_color: '#f6f3ec',
    theme_color: '#f6f3ec',
    categories: ['utilities', 'productivity', 'photo'],
    icons: [
      { src: `${locale.dir ? '../' : './'}assets/icons/icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: `${locale.dir ? '../' : './'}assets/icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${locale.dir ? '../' : './'}assets/icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: `${locale.dir ? '../' : './'}assets/icons/maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: ['image-compress', 'png-a-webp', 'pdf-merge', 'json-format'].map(shortcut).filter(Boolean),
    file_handlers: [
      {
        action: `./${slugOf('image-convert')}/`,
        accept: {
          'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'],
          'image/webp': ['.webp'], 'image/avif': ['.avif'],
        },
      },
      { action: `./${slugOf('svg-optimize')}/`, accept: { 'image/svg+xml': ['.svg'] } },
      { action: `./${slugOf('pdf-merge')}/`, accept: { 'application/pdf': ['.pdf'] } },
    ],
    // «Compartir → WebTools» des de la galeria o des del gestor de fitxers.
    // No és cap pàgina: el service worker intercepta el POST, desa el que
    // arribi i et deixa a la portada perquè triïs l'eina. L'adreça és igual
    // en tots tres idiomes perquè ningú no l'escriu mai.
    share_target: {
      action: './share-target',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
        files: [{
          name: 'files',
          accept: ['image/*', 'application/pdf', 'text/*', '.svg', '.json', '.csv', '.yaml', '.yml', '.xml'],
        }],
      },
    },
  }, null, 2)}\n`;
}

/**
 * No <lastmod>. We do not track when each page's text last changed, so the
 * only honest value would be "today" — which tells a crawler every page
 * changed on every build, and makes the output differ from one run to the
 * next, which is exactly what stops CI from checking that the committed build
 * is current. An absent lastmod beats a wrong one.
 */
function renderSitemap(editions) {
  const rows = [];
  for (const { locale, pages } of editions) {
    rows.push({ loc: absolute(locale, ''), priority: locale.dir ? '0.9' : '1.0' });
    for (const p of pages) rows.push({ loc: absolute(locale, p.slug), priority: p.type === 'tool' ? '0.8' : '0.7' });
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.map((r) => `  <url>\n    <loc>${r.loc}</loc>\n    <priority>${r.priority}</priority>\n  </url>`).join('\n')}
</urlset>
`;
}

/** What the runtime needs: interface strings plus the translated tool labels. */
function renderLocaleJson(locale) {
  const tools = {};
  for (const tool of TOOLS) {
    const over = locale.content.TOOLS?.[tool.id] || {};
    // El slug hi va sempre, fins i tot en català i fins i tot quan no hi ha
    // res més traduït: és l'única manera que el JavaScript pugui construir un
    // enllaç a una altra eina sense saber en quin idioma és la pàgina.
    const entry = { slug: toolStrings(locale, tool).slug, area: tool.area };
    if (tool.accepts) entry.accepts = tool.accepts;
    if (over.title) entry.title = over.title;
    if (over.desc) entry.desc = over.desc;
    if (over.params) entry.params = over.params;
    if (over.presets) entry.presets = over.presets;
    tools[tool.id] = entry;
  }
  return `${JSON.stringify({ lang: locale.code, ui: uiFor(locale.code), tools }, null, 2)}\n`;
}

// --------------------------------------------------------- service worker

async function jsFilesUnder(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await jsFilesUnder(full, base));
    else if (entry.name.endsWith('.js')) out.push(full.slice(base.length + 1).replace(/\\/g, '/'));
  }
  return out;
}

// Les tipografies formen part de l'esquelet: sense elles una pàgina oberta
// sense connexió canviaria de cara. Ordenades, perquè la llista entra al
// hash de la versió del service worker i la construcció ha de ser repetible.
async function fontFiles(out) {
  const dir = join(out, 'assets', 'fonts');
  if (!existsSync(dir)) return [];
  return (await readdir(dir)).filter((f) => f.endsWith('.woff2')).sort();
}

/**
 * Vendoring means the tools keep working once a page is open. Opening the site
 * with no network at all needs the documents cached too, which is this.
 *
 * The shell (pages, CSS, app code) is precached on install: it is small and it
 * is what a cold offline start needs. vendor/ is cached on first use instead —
 * precaching 30 MB, most of it models nobody asked for, would be rude.
 */
async function renderServiceWorker(out, editions) {
  const shell = [
    './',
    'assets/styles.css',
    ...(await fontFiles(out)).map((f) => `assets/fonts/${f}`),
    'manifest.webmanifest',
    'assets/icons/icon.svg',
    ICO_FILE,
    ...ICON_FILES.map((i) => i.file),
    OG_FILE,
    ...LOCALES.map((l) => `i18n/${l.code}.json`),
    ...(await jsFilesUnder(join(out, 'src'))).map((f) => `src/${f}`),
  ];
  for (const { locale, pages } of editions) {
    if (locale.dir) shell.push(`${locale.dir}`, `${locale.dir}manifest.webmanifest`);
    for (const p of pages) shell.push(`${locale.dir}${p.slug}/`);
  }

  // The version only moves when the app code does, so a rebuild that changed
  // nothing does not throw away everyone's cache.
  const hash = createHash('sha256');
  for (const f of shell) {
    if (f.endsWith('/')) continue;
    hash.update(await readFile(join(out, f)));
  }
  const version = hash.digest('hex').slice(0, 12);

  return `// Generat per scripts/build-pages.mjs. No l'editis.
const VERSION = '${version}';
const SHELL_CACHE = 'webtools-shell-' + VERSION;
const LIB_CACHE = 'webtools-vendor-v1';
const SHELL = ${JSON.stringify(shell, null, 2)};

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
  const home = url.pathname.replace(/share-target\\/?$/, '');
  try {
    const form = await e.request.formData();
    const files = form.getAll('files').filter((f) => f && typeof f === 'object' && 'size' in f);
    // Compartir un enllaç o un tros de text també és compartir: entra com a
    // fitxer de text i les eines de text l'accepten igual.
    const words = [form.get('text'), form.get('url')].filter(Boolean).join('\\n').trim();
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
      && /\\/share-target\\/?$/.test(shared.pathname)) {
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
`;
}

// ------------------------------------------------------------------ build

export async function buildPages({ out = ROOT, site = SITE_BASE.url, quiet = false } = {}) {
  SITE_URL = site.replace(/\/+$/, '');

  const editions = LOCALES.map((locale) => ({ locale, pages: collectPages(locale) }));
  const alternates = buildAlternates(editions);

  // A duplicate path in one language would silently overwrite a page.
  for (const { locale, pages } of editions) {
    const seen = new Set();
    for (const p of pages) {
      const key = `${locale.dir}${p.slug}`;
      if (seen.has(key)) throw new Error(`Ruta repetida a «${locale.code}»: ${key}`);
      seen.add(key);
    }
  }

  const livePaths = new Set();
  for (const { locale, pages } of editions) for (const p of pages) livePaths.add(`${locale.dir}${p.slug}`);

  // Remove directories from a previous build whose slug no longer exists,
  // so renaming a page does not leave a ghost in the sitemap's shadow.
  const manifestPath = join(out, MANIFEST);
  if (existsSync(manifestPath)) {
    const old = JSON.parse(await readFile(manifestPath, 'utf8'));
    for (const slug of old.slugs || []) {
      if (!livePaths.has(slug) && existsSync(join(out, slug))) {
        await rm(join(out, slug), { recursive: true, force: true });
        if (!quiet) console.log(`  − ${slug}/ (obsoleta)`);
      }
    }
  }

  // La carpeta surt del camí de cada fitxer i no d'una constant: així tornar a
  // moure les icones no torna a trencar la construcció.
  for (const icon of buildIcons()) {
    const target = join(out, icon.file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, icon.data);
  }

  await mkdir(join(out, 'i18n'), { recursive: true });
  for (const locale of LOCALES) {
    await writeFile(join(out, 'i18n', `${locale.code}.json`), renderLocaleJson(locale), 'utf8');
  }

  for (const { locale, pages } of editions) {
    const base = join(out, locale.dir);
    await mkdir(base, { recursive: true });
    for (const page of pages) {
      const dir = join(base, page.slug);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, 'index.html'), renderTool(page, pages, locale, alternates), 'utf8');
    }
    await writeFile(join(base, 'index.html'), renderHome(pages, locale, alternates), 'utf8');
    await writeFile(join(base, 'manifest.webmanifest'), renderManifest(pages, locale), 'utf8');
  }

  // El service worker s'escriu des de dins d'una plantilla de cadena, i una
  // barra invertida mal comptada hi passa desapercebuda: el fitxer surt, es
  // publica, i el navegador el rebutja en silenci amb un «script evaluation
  // failed» que no veu ningú. Això el parseja abans de desar-lo.
  const worker = await renderServiceWorker(out, editions);
  try {
    new Script(worker, { filename: 'sw.js' });
  } catch (e) {
    throw new Error(`sw.js generat amb un error de sintaxi: ${e.message}`);
  }
  await writeFile(join(out, 'sw.js'), worker, 'utf8');
  await writeFile(join(out, 'sitemap.xml'), renderSitemap(editions), 'utf8');
  // The deployment is a git pull into the docroot, so the build system is
  // served alongside the site. There is nothing secret in it, but there is no
  // reason for a crawler to index the generator, or a 76 kB file holding the
  // same prose that is already on the pages.
  await writeFile(join(out, 'robots.txt'), [
    'User-agent: *',
    'Allow: /',
    'Disallow: /scripts/',
    'Disallow: /content/',
    'Disallow: /tests/',
    'Disallow: /.github/',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n'), 'utf8');
  await writeFile(
    manifestPath,
    `${JSON.stringify({ site: SITE_URL, slugs: [...livePaths].sort() }, null, 2)}\n`,
    'utf8',
  );

  if (!quiet) {
    const total = editions.reduce((n, e) => n + e.pages.length + 1, 0);
    console.log(`${total} pàgines en ${LOCALES.length} idiomes (${editions.map((e) => `${e.locale.code}: ${e.pages.length + 1}`).join(', ')})`);
    console.log('+ sw.js + manifests + icones + i18n + sitemap.xml + robots.txt');
    console.log(`Canonicals sobre ${SITE_URL}`);
  }
  return editions;
}

/** Missing copy is not fatal, but it is worth shouting about. */
export function reportMissingCopy() {
  for (const locale of LOCALES) {
    const missingTools = TOOLS.filter((t) => locale.code !== 'ca' && !locale.content.TOOLS?.[t.id]).map((t) => t.id);
    const missingPages = TOOLS.filter((t) => !locale.content.PAGES?.[t.id]).map((t) => t.id);
    if (missingTools.length) console.warn(`avís [${locale.code}]: sense noms traduïts → ${missingTools.join(', ')}`);
    if (missingPages.length) console.warn(`avís [${locale.code}]: sense text de pàgina → ${missingPages.join(', ')}`);
  }
  const orphans = Object.keys(DEFAULT_LOCALE.content.PAGES).filter((id) => !byId[id]);
  if (orphans.length) console.warn(`avís: text per a eines que ja no existeixen → ${orphans.join(', ')}`);
}

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  reportMissingCopy();
  await buildPages({ out: resolve(flag('out', ROOT)), site: flag('site', SITE_BASE.url) });
}
