// Catalan: the source language. The prose already lives in content/seo.js —
// this module just gives it the same shape the other languages have, so the
// build can treat all three identically.

export { SITE, HOME, PAGES, VARIANT_PAGES, PAIR_ANGLES, FORMATS } from '../seo.js';

// Nothing to override: the registry is already Catalan.
export const TOOLS = {};

export const VARIANT_TITLES = {};

/**
 * Prose for a format-pair page, composed from the two formats and the
 * hand-written sentence that belongs to that pair.
 */
export function pairCopy(from, to, angle) {
  return {
    intro: [
      `Converteix imatges ${from.name} a ${to.name} directament al navegador, d’una en una o totes de cop. Cap fitxer no es puja a cap servidor: el teu propi ordinador fa la descodificació i la codificació, i per això la conversió és immediata i no hi ha límit de mida.`,
      angle,
      `${from.name} és ${from.blurb}. La contrapartida és que ${from.weak}. ${to.name}, en canvi, és ${to.blurb}, tot i que ${to.weak}.`,
    ].filter(Boolean),
    faq: [
      {
        q: `Es perd qualitat en passar de ${from.name} a ${to.name}?`,
        a: to.lossless
          ? `No. ${to.name} és sense pèrdua, així que el resultat conté exactament els mateixos píxels que li arriben. Ara bé, si l’origen ja havia perdut qualitat, aquesta no es recupera.`
          : `${to.name} comprimeix amb pèrdua, de manera que sí que en perd una mica, controlable amb el control de qualitat. Amb 80-85 la diferència no es veu en una pantalla. Parteix sempre de l’original per no acumular recompressions.`,
      },
      {
        q: 'Què passa amb la transparència?',
        a: from.alpha && to.alpha
          ? `Es conserva: tant ${from.name} com ${to.name} tenen canal alfa.`
          : from.alpha
            ? `${to.name} no té canal alfa, així que les zones transparents es pinten amb el color de fons que triïs abans de codificar.`
            : `${from.name} no té transparència, de manera que no hi ha res a conservar: el resultat serà opac igualment.`,
      },
      {
        q: 'Puc convertir-ne moltes de cop?',
        a: 'Sí. Deixa-hi tots els fitxers que vulguis, es processen en paral·lel aprofitant tots els nuclis del processador i te’ls pots baixar junts en un ZIP.',
      },
      {
        q: 'S’envien les imatges a algun servidor?',
        a: 'No. Tot passa dins d’aquesta pestanya. Un cop la pàgina s’ha carregat pots fins i tot desconnectar la xarxa i continuar convertint.',
      },
    ],
  };
}

/** Title and description of a pair page, when the variant does not set them. */
export const pairLabels = (fromLabel, toLabel) => ({
  title: `${fromLabel} a ${toLabel}`,
  desc: `Converteix imatges ${fromLabel} a ${toLabel} en lot, dins del navegador.`,
});

export const META = {
  toolTitle: (title, site) => `${title} en línia, al navegador — ${site}`,
  variantTitle: (title, site) => `${title} en línia, gratis i sense pujar res — ${site}`,
  homeTitle: (site, tagline) => `${site} — ${tagline}`,
};
