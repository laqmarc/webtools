// Runtime translation.
//
// The registry and the interface are written in Catalan, which is the source
// language; every other language arrives as a JSON file that the build writes
// from content/i18n/. A page fetches exactly one of them, before anything is
// mounted, and falls back to Catalan for any key that is not there — a missing
// string should degrade to the wrong language, never to an empty button.
//
// This module also runs inside the image worker, which has no DOM but does
// have fetch. The worker is told the language on its first job and loads the
// same file, so an error thrown four layers down still comes back translated.

let dict = { ui: {}, tools: {} };
let active = 'ca';
const loaded = new Map();

export function currentLang() {
  return active;
}

export async function loadLocale(lang = 'ca') {
  if (!loaded.has(lang)) {
    loaded.set(lang, (async () => {
      try {
        const res = await fetch(new URL(`../i18n/${lang}.json`, import.meta.url));
        if (res.ok) return await res.json();
      } catch {
        // Offline before the language file was ever cached: Catalan it is.
      }
      return null;
    })());
  }
  const data = await loaded.get(lang);
  if (data) {
    dict = data;
    active = lang;
  }
  return dict;
}

/** Translate a key, filling {placeholders} from `vars`. */
export function t(key, vars) {
  let s = dict.ui?.[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
  return s;
}

/**
 * Com t(), però amb singular. Català, castellà i anglès comparteixen la
 * mateixa regla —u contra tota la resta— així que amb dues formes n'hi ha
 * prou i no cal arrossegar Intl.PluralRules per a «1 fitxer(s)».
 */
export function tn(key, n, vars) {
  const one = `${key}.one`;
  const pick = n === 1 && dict.ui?.[one] ? one : key;
  return t(pick, { ...vars, n });
}

/** Shorthand for the overwhelmingly common `throw new Error(t(...))`. */
export const fail = (key, vars) => {
  throw new Error(t(key, vars));
};

/**
 * A copy of the tool with its user-facing strings swapped. Structure — keys,
 * types, showIf predicates — always comes from the registry; only the words
 * change, so a missing translation can never break a form.
 */
export function localiseTool(tool) {
  const over = dict.tools?.[tool.id];
  if (!over) return tool;

  const params = tool.params?.map((field) => {
    const f = over.params?.[field.key];
    if (!f) return field;
    const next = { ...field };
    if (f.label) next.label = f.label;
    if (f.hint) next.hint = f.hint;
    if (f.unit) next.unit = f.unit;
    if (f.options && field.options) {
      next.options = field.options.map((o) => ({ ...o, t: f.options[o.v] ?? o.t }));
    }
    return next;
  });

  const presets = tool.presets?.map((preset, i) => ({
    ...preset,
    name: over.presets?.[i] ?? preset.name,
  }));

  return {
    ...tool,
    slug: over.slug || tool.slug,
    title: over.title || tool.title,
    desc: over.desc || tool.desc,
    params: params || tool.params,
    presets: presets || tool.presets,
  };
}

/**
 * Where a tool lives in the language now loaded. The registry slugs are the
 * Catalan ones, so anything that builds a link at runtime — the command
 * palette, the hand-off between tools — has to go through this.
 */
export function toolSlug(tool) {
  return dict.tools?.[tool.id]?.slug || tool.slug;
}
