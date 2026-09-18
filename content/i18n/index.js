// The three language editions of the site.
//
// Catalan is the source: the registry is written in it, and it is what every
// other language falls back to, key by key, when something has not been
// translated yet. The build prints what is missing instead of shipping an
// empty string or a silently English page.

import * as ca from './ca.js';
import * as es from './es.js';
import * as en from './en.js';

export const LOCALES = [
  { code: 'ca', htmlLang: 'ca', ogLocale: 'ca_ES', name: 'Català', dir: '', content: ca },
  { code: 'es', htmlLang: 'es', ogLocale: 'es_ES', name: 'Español', dir: 'es/', content: es },
  { code: 'en', htmlLang: 'en', ogLocale: 'en_GB', name: 'English', dir: 'en/', content: en },
];

export const DEFAULT_LOCALE = LOCALES[0];

export const localeByCode = Object.fromEntries(LOCALES.map((l) => [l.code, l]));

/**
 * What the build should use for a tool in a given language: the Catalan
 * registry entry, with any translated string laid over it.
 */
export function toolStrings(locale, tool) {
  const over = locale.content.TOOLS?.[tool.id] || {};
  return {
    slug: over.slug || tool.slug,
    title: over.title || tool.title,
    desc: over.desc || tool.desc,
    keywords: over.keywords || tool.keywords,
    translated: Boolean(over.title),
  };
}

/** Page prose, falling back to Catalan whole-section by whole-section. */
export function pageCopy(locale, toolId) {
  const mine = locale.content.PAGES?.[toolId];
  const base = DEFAULT_LOCALE.content.PAGES?.[toolId] || {};
  if (!mine) return { ...base, translated: locale.code === 'ca' };
  return {
    intro: mine.intro || base.intro,
    steps: mine.steps || base.steps,
    faq: mine.faq || base.faq,
    translated: true,
  };
}
