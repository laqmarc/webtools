// The single source of truth for what this site can do.
//
// Metadata is eager (the home grid and the search need it); the code that does
// the work is behind `load()`, so opening a PDF tool never downloads the image
// pipeline. Adding a tool = one entry here + one runner in its area module.
//
//   kind 'file'   run(input, params, ctx) -> Output | Output[]      (batched)
//                 with `aggregate: true`, run(inputs, params, ctx) once
//   kind 'text'   run(text, params) -> string
//   kind 'custom' mount(root, tool) -> void
//
//   Input  = { name, blob, file }
//   Output = { name, blob }

const IMAGE = () => import('./tools/image.js');
const VECTOR = () => import('./tools/vector.js');
const PDF = () => import('./tools/pdf.js');
const DATA = () => import('./tools/data.js');
const WEB = () => import('./tools/web.js');
const TEXT = () => import('./tools/text.js');
const HEAVY = () => import('./tools/heavy.js');

export const AREAS = [
  { id: 'image', title: 'Imatge' },
  { id: 'vector', title: 'Imatge vectorial' },
  { id: 'pdf', title: 'PDF' },
  { id: 'data', title: 'Dades' },
  { id: 'web', title: 'Text i web' },
];

// Reused parameter fragments ------------------------------------------------

const outFormat = (def = 'same', label = 'Format de sortida') => ({
  key: 'format', label, type: 'select', def,
  options: [
    { v: 'same', t: 'Mantén l’original' },
    { v: 'webp', t: 'WebP' },
    { v: 'jpeg', t: 'JPEG' },
    { v: 'png', t: 'PNG' },
    { v: 'avif', t: 'AVIF' },
  ],
});

const quality = (def = 82) => ({
  key: 'quality', label: 'Qualitat', type: 'range', min: 1, max: 100, step: 1, def, unit: '%',
  showIf: (p) => p.format !== 'png' && !p.lossless,
  hint: 'Només per a formats amb pèrdua.',
});

export const TOOLS = [
  // ---------------------------------------------------------------- imatge
  {
    id: 'image-convert', slug: 'convertir-imatges', area: 'image', kind: 'file', load: IMAGE,
    title: 'Convertir imatges',
    desc: 'PNG, JPG, WebP i AVIF entre si, en lot.',
    keywords: 'png jpg jpeg webp avif convertir converteix format',
    accepts: ['image/*'],
    params: [
      {
        key: 'format', label: 'Convertir a', type: 'select', def: 'webp',
        options: [
          { v: 'webp', t: 'WebP' }, { v: 'jpeg', t: 'JPEG' },
          { v: 'png', t: 'PNG' }, { v: 'avif', t: 'AVIF' },
        ],
      },
      { key: 'lossless', label: 'Sense pèrdua', type: 'checkbox', def: false, showIf: (p) => p.format === 'webp' },
      quality(82),
      { key: 'background', label: 'Fons per a transparències', type: 'color', def: '#ffffff',
        showIf: (p) => p.format === 'jpeg', hint: 'JPEG no admet canal alfa.' },
    ],
  },
  {
    id: 'image-compress', slug: 'comprimir-imatges', area: 'image', kind: 'file', load: IMAGE,
    title: 'Comprimir imatges',
    desc: 'Baixa el pes per qualitat o fins a una mida objectiu concreta.',
    keywords: 'comprimir compressió reduir pes optimitzar kb mida',
    accepts: ['image/*'],
    presets: [
      { name: 'Per al web', values: { mode: 'quality', quality: 78, format: 'webp', maxWidth: 1920 } },
      { name: 'Per a correu', values: { mode: 'target', targetKB: 500, format: 'jpeg', maxWidth: 1600 } },
      { name: 'Miniatura', values: { mode: 'quality', quality: 72, format: 'webp', maxWidth: 400 } },
    ],
    params: [
      {
        key: 'mode', label: 'Objectiu', type: 'select', def: 'quality',
        options: [
          { v: 'quality', t: 'Qualitat fixa' },
          { v: 'target', t: 'Mida màxima del fitxer' },
        ],
      },
      { ...quality(75), showIf: (p) => p.mode === 'quality' && p.format !== 'png' },
      {
        key: 'targetKB', label: 'Pes màxim', type: 'number', min: 5, max: 20000, step: 5, def: 200, unit: 'kB',
        showIf: (p) => p.mode === 'target',
        hint: 'Cerca binària sobre la qualitat (màxim 95) i, si cal, reducció de mida fins a encaixar-hi.',
      },
      {
        key: 'format', label: 'Format', type: 'select', def: 'webp',
        options: [
          { v: 'webp', t: 'WebP (recomanat)' }, { v: 'jpeg', t: 'JPEG' },
          { v: 'avif', t: 'AVIF (el més petit, més lent)' }, { v: 'same', t: 'Mantén l’original' },
        ],
      },
      { key: 'maxWidth', label: 'Amplada màxima', type: 'number', min: 0, max: 20000, step: 10, def: 0, unit: 'px',
        hint: '0 = no redimensionis.' },
    ],
  },
  {
    id: 'image-resize', slug: 'redimensionar-imatges', area: 'image', kind: 'file', load: IMAGE,
    title: 'Redimensionar imatges',
    desc: 'Amplada i alçada amb control d’ajust i sense ampliar per defecte.',
    keywords: 'redimensionar mida escalar amplada alçada resize',
    accepts: ['image/*'],
    presets: [
      { name: 'Full HD', values: { width: 1920, height: 0, noUpscale: true } },
      { name: 'Instagram', values: { width: 1080, height: 1080, fit: 'cover', noUpscale: false } },
      { name: 'Miniatura 400', values: { width: 400, height: 0, noUpscale: true } },
    ],
    params: [
      { key: 'width', label: 'Amplada', type: 'number', min: 0, max: 20000, step: 1, def: 1200, unit: 'px', hint: '0 = automàtica.' },
      { key: 'height', label: 'Alçada', type: 'number', min: 0, max: 20000, step: 1, def: 0, unit: 'px', hint: '0 = automàtica.' },
      {
        key: 'fit', label: 'Ajust', type: 'select', def: 'contain',
        options: [
          { v: 'contain', t: 'Cap a dins (manté proporció)' },
          { v: 'cover', t: 'Omple i retalla' },
          { v: 'stretch', t: 'Deforma fins a la mida' },
        ],
        showIf: (p) => Number(p.width) > 0 && Number(p.height) > 0,
      },
      { key: 'noUpscale', label: 'No ampliïs imatges petites', type: 'checkbox', def: true },
      outFormat(),
      quality(85),
    ],
  },
  {
    id: 'image-crop', slug: 'retallar-imatges', area: 'image', kind: 'custom', load: IMAGE,
    title: 'Retallar imatges',
    desc: 'Dibuixa el retall damunt de la imatge i aplica’l a tot el lot.',
    keywords: 'retallar crop tallar aspecte quadrat visual ratolí',
  },
  {
    id: 'image-rotate', slug: 'girar-imatges', area: 'image', kind: 'file', load: IMAGE,
    title: 'Girar i reflectir',
    desc: 'Rotació de 90° en 90° i volteig horitzontal o vertical.',
    keywords: 'girar rotar rotate flip mirall voltejar',
    accepts: ['image/*'],
    params: [
      {
        key: 'angle', label: 'Rotació', type: 'select', def: '90',
        options: [{ v: '0', t: 'Cap' }, { v: '90', t: '90° horari' }, { v: '180', t: '180°' }, { v: '270', t: '90° antihorari' }],
      },
      { key: 'flipH', label: 'Reflecteix horitzontalment', type: 'checkbox', def: false },
      { key: 'flipV', label: 'Reflecteix verticalment', type: 'checkbox', def: false },
      outFormat(),
      quality(90),
    ],
  },
  {
    id: 'image-strip', slug: 'treure-metadades-imatge', area: 'image', kind: 'file', load: IMAGE,
    title: 'Treure metadades',
    desc: 'Elimina EXIF, GPS i perfils recodificant la imatge al mateix format.',
    keywords: 'exif metadades gps privacitat netejar strip',
    accepts: ['image/*'],
    params: [
      { key: 'quality', label: 'Qualitat de recodificació', type: 'range', min: 60, max: 100, step: 1, def: 95, unit: '%',
        hint: 'Els PNG es recodifiquen sense pèrdua; això només afecta JPEG, WebP i AVIF.' },
      { key: 'applyOrientation', label: 'Aplica l’orientació EXIF al píxel', type: 'checkbox', def: true,
        hint: 'Evita que la foto surti girada un cop tretes les metadades.' },
    ],
  },

  {
    id: 'image-watermark', slug: 'marca-aigua-imatge', area: 'image', kind: 'file', load: IMAGE,
    title: 'Marca d\u2019aigua en imatges',
    desc: 'Text a sobre, en una cantonada o repetit per tota la foto.',
    keywords: 'marca aigua watermark text copyright signar protegir',
    accepts: ['image/*'],
    params: [
      { key: 'text', label: 'Text', type: 'text', def: '\u00a9 el meu nom', wide: true },
      { key: 'tile', label: 'Repeteix-lo per tota la imatge', type: 'checkbox', def: false },
      {
        key: 'position', label: 'Posició', type: 'select', def: 'bottom-right', showIf: (p) => !p.tile,
        options: [
          { v: 'top-left', t: 'Dalt esquerra' }, { v: 'top', t: 'Dalt' }, { v: 'top-right', t: 'Dalt dreta' },
          { v: 'left', t: 'Esquerra' }, { v: 'center', t: 'Centre' }, { v: 'right', t: 'Dreta' },
          { v: 'bottom-left', t: 'Baix esquerra' }, { v: 'bottom', t: 'Baix' }, { v: 'bottom-right', t: 'Baix dreta' },
        ],
      },
      { key: 'size', label: 'Mida', type: 'range', min: 2, max: 20, step: 0.5, def: 6, unit: '%',
        hint: 'Percentatge del costat curt, perquè surti igual a totes.' },
      { key: 'opacity', label: 'Opacitat', type: 'range', min: 5, max: 100, step: 5, def: 45, unit: '%' },
      { key: 'color', label: 'Color', type: 'color', def: '#ffffff' },
      { key: 'bold', label: 'Negreta', type: 'checkbox', def: true },
      { key: 'shadow', label: 'Ombra (per llegir-la sobre fons clars)', type: 'checkbox', def: true, showIf: (p) => !p.tile },
      { key: 'margin', label: 'Marge', type: 'range', min: 0, max: 15, step: 0.5, def: 3, unit: '%', showIf: (p) => !p.tile },
      outFormat(),
      { key: 'quality', label: 'Qualitat', type: 'range', min: 40, max: 100, step: 1, def: 90, unit: '%' },
    ],
  },
  {
    id: 'image-exif', slug: 'veure-metadades-imatge', area: 'image', kind: 'custom', load: IMAGE,
    title: 'Veure les metadades',
    desc: 'Càmera, exposició, dates i les coordenades GPS si n\u2019hi ha.',
    keywords: 'exif metadades veure gps càmera iso obertura dades foto',
  },
  {
    id: 'favicons', slug: 'generador-de-favicons', area: 'image', kind: 'file', load: IMAGE,
    title: 'Generador de favicons',
    desc: 'D\u2019una imatge a tot el joc d\u2019icones, amb l\u2019.ico i el fragment d\u2019HTML.',
    keywords: 'favicon ico icona web apple touch icon manifest generar',
    accepts: ['image/*'],
    params: [
      { key: 'background', label: 'Fons', type: 'color', def: '#ffffff' },
      { key: 'padding', label: 'Marge interior', type: 'range', min: 0, max: 30, step: 1, def: 0, unit: '%' },
      { key: 'snippet', label: 'Inclou el fragment d\u2019HTML', type: 'checkbox', def: true },
    ],
  },
  {
    id: 'images-to-gif', slug: 'imatges-a-gif', area: 'image', kind: 'file', load: IMAGE, aggregate: true,
    title: 'Imatges a GIF animat',
    desc: 'Un GIF a partir d\u2019una seqüència d\u2019imatges, en l\u2019ordre que hi deixis.',
    keywords: 'gif animat animació seqüència fotogrames imatges',
    accepts: ['image/*'],
    params: [
      { key: 'delay', label: 'Durada de cada fotograma', type: 'number', min: 20, max: 5000, step: 10, def: 120, unit: 'ms' },
      { key: 'maxWidth', label: 'Amplada màxima', type: 'number', min: 0, max: 2000, step: 20, def: 600, unit: 'px', hint: '0 = la de la primera imatge.' },
      { key: 'colors', label: 'Colors de la paleta', type: 'range', min: 8, max: 256, step: 8, def: 256,
        hint: 'Menys colors, menys pes i més gra.' },
      { key: 'pingpong', label: 'Torna enrere en acabar', type: 'checkbox', def: false },
      { key: 'background', label: 'Fons', type: 'color', def: '#ffffff' },
    ],
  },
  {
    id: 'remove-background', slug: 'treure-el-fons', area: 'image', kind: 'file', load: HEAVY,
    title: 'Treure el fons d’una imatge',
    desc: 'Separa el subjecte amb un model que corre al teu ordinador.',
    keywords: 'treure fons remove background retallar subjecte transparent png recortar',
    accepts: ['image/*'],
    params: [
      {
        key: 'background', label: 'Què hi poso al darrere', type: 'select', def: 'transparent',
        options: [{ v: 'transparent', t: 'Res: fons transparent' }, { v: 'color', t: 'Un color sòlid' }],
      },
      { key: 'color', label: 'Color', type: 'color', def: '#ffffff', showIf: (p) => p.background === 'color' },
      {
        key: 'edge', label: 'Vora', type: 'select', def: 'soft',
        options: [{ v: 'soft', t: 'Suau (millor per a cabells i pelatge)' }, { v: 'hard', t: 'Neta (millor per a objectes)' }],
      },
      { key: 'threshold', label: 'Llindar', type: 'range', min: 10, max: 90, step: 5, def: 50, unit: '%', showIf: (p) => p.edge === 'hard' },
      {
        key: 'format', label: 'Format', type: 'select', def: 'png',
        options: [{ v: 'png', t: 'PNG' }, { v: 'webp', t: 'WebP' }],
      },
      { key: 'quality', label: 'Qualitat', type: 'range', min: 40, max: 100, step: 1, def: 92, unit: '%', showIf: (p) => p.format === 'webp' },
    ],
  },
  // ---------------------------------------------------------------- vector
  {
    id: 'svg-optimize', slug: 'optimitzar-svg', area: 'vector', kind: 'file', load: VECTOR,
    title: 'Optimitzar SVG',
    desc: 'SVGO al navegador: treu metadades d’editor i arrodoneix camins.',
    keywords: 'svg optimitzar svgo minificar vector netejar',
    accepts: ['.svg', 'image/svg+xml'],
    params: [
      { key: 'precision', label: 'Decimals als camins', type: 'number', min: 0, max: 8, step: 1, def: 3 },
      { key: 'multipass', label: 'Diverses passades', type: 'checkbox', def: true },
      { key: 'removeDimensions', label: 'Treu width/height (deixa viewBox)', type: 'checkbox', def: false,
        hint: 'Útil per a icones que han d’escalar amb CSS.' },
      { key: 'prefixIds', label: 'Prefixa els id amb el nom del fitxer', type: 'checkbox', def: false,
        hint: 'Evita col·lisions si inserixes diversos SVG a la mateixa pàgina.' },
      { key: 'pretty', label: 'Sortida indentada', type: 'checkbox', def: false },
    ],
  },
  {
    id: 'svg-to-png', slug: 'svg-a-png', area: 'vector', kind: 'file', load: VECTOR,
    title: 'SVG a PNG',
    desc: 'Rasteritza a la mida que vulguis, amb fons transparent o sòlid.',
    keywords: 'svg png rasteritzar exportar bitmap webp',
    accepts: ['.svg', 'image/svg+xml'],
    params: [
      { key: 'width', label: 'Amplada', type: 'number', min: 0, max: 20000, step: 1, def: 0, unit: 'px', hint: '0 = mida del viewBox.' },
      { key: 'scale', label: 'Escala', type: 'number', min: 0.1, max: 20, step: 0.1, def: 2, unit: '×',
        showIf: (p) => !Number(p.width) },
      { key: 'transparent', label: 'Fons transparent', type: 'checkbox', def: true },
      { key: 'background', label: 'Color de fons', type: 'color', def: '#ffffff', showIf: (p) => !p.transparent },
      {
        key: 'format', label: 'Format', type: 'select', def: 'png',
        options: [{ v: 'png', t: 'PNG' }, { v: 'webp', t: 'WebP' }, { v: 'jpeg', t: 'JPEG' }],
      },
      quality(90),
    ],
  },

  {
    id: 'svg-to-pdf', slug: 'svg-a-pdf', area: 'vector', kind: 'file', load: VECTOR,
    title: 'SVG a PDF',
    desc: 'Un PDF d’una pàgina a la mida real del dibuix.',
    keywords: 'svg pdf imprimir vectorial pàgina exportar',
    accepts: ['.svg', 'image/svg+xml'],
    params: [
      { key: 'dpi', label: 'Resolució', type: 'range', min: 72, max: 600, step: 12, def: 150, unit: ' ppp',
        hint: 'El dibuix es rasteritza: més resolució, més pes i més detall.' },
      { key: 'transparent', label: 'Fons transparent', type: 'checkbox', def: false },
      { key: 'background', label: 'Color de fons', type: 'color', def: '#ffffff', showIf: (p) => !p.transparent },
    ],
  },
  {
    id: 'svg-to-css', slug: 'svg-a-css', area: 'vector', kind: 'file', load: VECTOR,
    title: 'SVG a CSS',
    desc: 'El dibuix dins d’un data URI, sense cap petició de més.',
    keywords: 'svg css data uri base64 background incrustar inline',
    accepts: ['.svg', 'image/svg+xml'],
    params: [
      {
        key: 'mode', label: 'Què en vols', type: 'select', def: 'css',
        options: [
          { v: 'css', t: 'Regla CSS amb background-image' },
          { v: 'var', t: 'Variable CSS' },
          { v: 'img', t: 'Etiqueta <img>' },
          { v: 'uri', t: 'Només el data URI' },
        ],
      },
    ],
  },
  {
    id: 'svg-sprite', slug: 'sprite-svg', area: 'vector', kind: 'file', load: VECTOR, aggregate: true,
    title: 'Sprite SVG',
    desc: 'Tot un joc d’icones en un sol fitxer, per fer-lo servir amb <use>.',
    keywords: 'sprite svg symbol use icones joc combinar',
    accepts: ['.svg', 'image/svg+xml'],
    params: [
      { key: 'prefix', label: 'Prefix dels identificadors', type: 'text', def: 'icona',
        hint: 'Deixa-ho buit per fer servir només el nom del fitxer.' },
      { key: 'currentColor', label: 'Colors a currentColor', type: 'checkbox', def: true,
        hint: 'Així el color el decideix el CSS que les faci servir.' },
      { key: 'hidden', label: 'Amagat, per posar-lo al principi del <body>', type: 'checkbox', def: true },
    ],
  },
  {
    id: 'svg-recolour', slug: 'recolorir-svg', area: 'vector', kind: 'file', load: VECTOR,
    title: 'Recolorir SVG',
    desc: 'Canvia els colors d’un joc sencer sense obrir-los d’un en un.',
    keywords: 'svg color recolorir tint fill stroke currentcolor',
    accepts: ['.svg', 'image/svg+xml'],
    params: [
      {
        key: 'mode', label: 'Què vols canviar', type: 'select', def: 'all',
        options: [
          { v: 'all', t: 'Tots els colors, a un de sol' },
          { v: 'one', t: 'Només un color concret' },
          { v: 'current', t: 'Tots, a currentColor' },
        ],
      },
      { key: 'from', label: 'Color que vols canviar', type: 'color', def: '#000000', showIf: (p) => p.mode === 'one' },
      { key: 'to', label: 'Color nou', type: 'color', def: '#b4451f', showIf: (p) => p.mode !== 'current' },
    ],
  },

  // -------------------------------------------------------------------- pdf
  {
    id: 'pdf-compress', slug: 'comprimir-pdf', area: 'pdf', kind: 'file', load: PDF,
    title: 'Comprimir PDF',
    desc: 'Recodifica les imatges de dins sense tocar el text ni l’estructura.',
    keywords: 'pdf comprimir reduir pes mida optimitzar escaneig',
    accepts: ['.pdf', 'application/pdf'],
    presets: [
      { name: 'Per a correu', values: { method: 'images', mode: 'target', targetKB: 5000, maxWidth: 1600 } },
      { name: 'Lleuger per al web', values: { method: 'images', mode: 'quality', quality: 60, maxWidth: 1200 } },
      { name: 'Escaneig de text', values: { method: 'images', mode: 'quality', quality: 55, maxWidth: 1600, grayscale: true } },
    ],
    params: [
      {
        key: 'method', label: 'Mètode', type: 'select', def: 'images',
        options: [
          { v: 'images', t: 'Recodifica les imatges (conserva el text)' },
          { v: 'raster', t: 'Rasteritza les pàgines (el màxim, perd el text)' },
        ],
      },
      {
        key: 'mode', label: 'Objectiu', type: 'select', def: 'quality',
        showIf: (p) => p.method === 'images',
        options: [
          { v: 'quality', t: 'Qualitat fixa' },
          { v: 'target', t: 'Mida màxima del fitxer' },
        ],
      },
      {
        key: 'quality', label: 'Qualitat de les imatges', type: 'range', min: 25, max: 92, step: 1, def: 70, unit: '%',
        showIf: (p) => p.method === 'raster' || p.mode === 'quality',
      },
      {
        key: 'targetKB', label: 'Pes màxim', type: 'number', min: 20, max: 200000, step: 50, def: 1000, unit: 'kB',
        showIf: (p) => p.method === 'images' && p.mode === 'target',
        hint: 'Cerca la qualitat més alta que hi encaixi i, si cal, redueix les imatges.',
      },
      {
        key: 'maxWidth', label: 'Amplada màxima de les imatges', type: 'number', min: 0, max: 10000, step: 100, def: 1600, unit: 'px',
        showIf: (p) => p.method === 'images',
        hint: '0 = conserva la resolució. 1600 px ja imprimeix bé en A4.',
      },
      {
        key: 'dpi', label: 'Resolució', type: 'number', min: 50, max: 400, step: 10, def: 120, unit: 'ppp',
        showIf: (p) => p.method === 'raster',
        hint: '120 ppp es llegeix bé en pantalla; 200 per imprimir.',
      },
      { key: 'grayscale', label: 'Passa-ho a escala de grisos', type: 'checkbox', def: false,
        hint: 'En documents escanejats sol retallar un altre bon tros.' },
    ],
  },
  {
    id: 'pdf-organize', slug: 'organitzar-pdf', area: 'pdf', kind: 'custom', load: PDF,
    title: 'Organitzar pàgines',
    desc: 'Veu totes les pàgines, arrossega-les, gira-les i treu les que sobren.',
    keywords: 'pdf organitzar reordenar ordenar pàgines miniatures moure esborrar',
  },
  {
    id: 'pdf-to-images', slug: 'pdf-a-imatges', area: 'pdf', kind: 'file', load: PDF,
    title: 'PDF a imatges',
    desc: 'Una imatge per pàgina, a la resolució que necessitis.',
    keywords: 'pdf imatge jpg png webp convertir pàgines rasteritzar exportar',
    accepts: ['.pdf', 'application/pdf'],
    params: [
      {
        key: 'format', label: 'Format', type: 'select', def: 'png',
        options: [{ v: 'png', t: 'PNG' }, { v: 'jpeg', t: 'JPEG' }, { v: 'webp', t: 'WebP' }],
      },
      { key: 'dpi', label: 'Resolució', type: 'number', min: 36, max: 600, step: 6, def: 150, unit: 'ppp',
        hint: '150 per llegir, 300 per imprimir.' },
      { key: 'pages', label: 'Pàgines', type: 'text', def: '', hint: 'Buit = totes. Exemple: 1-3, 7' },
      { key: 'transparent', label: 'Fons transparent', type: 'checkbox', def: false, showIf: (p) => p.format === 'png' },
      { key: 'quality', label: 'Qualitat', type: 'range', min: 40, max: 100, step: 1, def: 90, unit: '%',
        showIf: (p) => p.format !== 'png' },
    ],
  },
  {
    id: 'pdf-to-text', slug: 'pdf-a-text', area: 'pdf', kind: 'file', load: PDF,
    title: 'PDF a text',
    desc: 'Extreu la capa de text del document, sense OCR.',
    keywords: 'pdf text extreure copiar contingut txt',
    accepts: ['.pdf', 'application/pdf'],
    params: [
      { key: 'pages', label: 'Pàgines', type: 'text', def: '', hint: 'Buit = totes.' },
      { key: 'joinParagraphs', label: 'Uneix les línies tallades', type: 'checkbox', def: true,
        hint: 'Ajunta els salts de línia que només són del format de la pàgina.' },
      { key: 'pageMarks', label: 'Marca on comença cada pàgina', type: 'checkbox', def: false },
    ],
  },
  {
    id: 'pdf-extract-images', slug: 'extreure-imatges-pdf', area: 'pdf', kind: 'file', load: PDF,
    title: 'Extreure imatges d’un PDF',
    desc: 'Treu les fotos i els gràfics incrustats com a fitxers a part.',
    keywords: 'pdf extreure imatges fotos treure guardar jpg png',
    accepts: ['.pdf', 'application/pdf'],
    params: [
      {
        key: 'format', label: 'Format', type: 'select', def: 'original',
        options: [
          { v: 'original', t: 'Tal com estan al PDF' },
          { v: 'png', t: 'PNG' }, { v: 'jpeg', t: 'JPEG' }, { v: 'webp', t: 'WebP' },
        ],
      },
      { key: 'minWidth', label: 'Amplada mínima', type: 'number', min: 0, max: 5000, step: 10, def: 100, unit: 'px',
        hint: 'Descarta icones i línies decoratives.' },
      { key: 'quality', label: 'Qualitat', type: 'range', min: 40, max: 100, step: 1, def: 92, unit: '%',
        showIf: (p) => p.format === 'jpeg' || p.format === 'webp' },
    ],
  },
  {
    id: 'pdf-merge', slug: 'unir-pdf', area: 'pdf', kind: 'file', load: PDF, aggregate: true,
    title: 'Unir PDF',
    desc: 'Enganxa diversos PDF en un de sol, en l’ordre que vulguis.',
    keywords: 'pdf unir juntar combinar merge',
    accepts: ['.pdf', 'application/pdf'],
    params: [
      {
        key: 'order', label: 'Ordre', type: 'select', def: 'list',
        options: [{ v: 'list', t: 'Com a la llista' }, { v: 'name', t: 'Per nom de fitxer' }],
      },
      { key: 'outName', label: 'Nom del resultat', type: 'text', def: 'unit.pdf' },
    ],
  },
  {
    id: 'pdf-split', slug: 'separar-pdf', area: 'pdf', kind: 'file', load: PDF,
    title: 'Separar PDF',
    desc: 'Una pàgina per fitxer, blocs de N pàgines o rangs a mida.',
    keywords: 'pdf separar dividir split tallar pàgines',
    accepts: ['.pdf', 'application/pdf'],
    params: [
      {
        key: 'mode', label: 'Com', type: 'select', def: 'each',
        options: [
          { v: 'each', t: 'Una pàgina per fitxer' },
          { v: 'every', t: 'Blocs de N pàgines' },
          { v: 'ranges', t: 'Rangs concrets' },
        ],
      },
      { key: 'n', label: 'Pàgines per bloc', type: 'number', min: 1, max: 999, step: 1, def: 10, showIf: (p) => p.mode === 'every' },
      { key: 'ranges', label: 'Rangs', type: 'text', def: '1-3, 4-8', showIf: (p) => p.mode === 'ranges',
        hint: 'Separats per comes. Cada rang surt com un PDF.' },
    ],
  },
  {
    id: 'pdf-rotate', slug: 'girar-pdf', area: 'pdf', kind: 'file', load: PDF,
    title: 'Girar pàgines de PDF',
    desc: 'Rota totes les pàgines o només les que indiquis.',
    keywords: 'pdf girar rotar orientació apaïsat',
    accepts: ['.pdf', 'application/pdf'],
    params: [
      {
        key: 'angle', label: 'Rotació', type: 'select', def: '90',
        options: [{ v: '90', t: '90° horari' }, { v: '180', t: '180°' }, { v: '270', t: '90° antihorari' }],
      },
      { key: 'pages', label: 'Pàgines', type: 'text', def: '', hint: 'Buit = totes. Exemple: 1-3, 7, 10-12' },
    ],
  },
  {
    id: 'pdf-extract', slug: 'extreure-pagines-pdf', area: 'pdf', kind: 'file', load: PDF,
    title: 'Extreure pàgines',
    desc: 'Queda’t només amb unes pàgines, o esborra-les del document.',
    keywords: 'pdf extreure pàgines esborrar eliminar treure',
    accepts: ['.pdf', 'application/pdf'],
    params: [
      { key: 'pages', label: 'Pàgines', type: 'text', def: '1-1', hint: 'Exemple: 1-3, 7, 10-12' },
      { key: 'invert', label: 'Esborra aquestes pàgines (en comptes de quedar-te-les)', type: 'checkbox', def: false },
    ],
  },
  {
    id: 'images-to-pdf', slug: 'imatges-a-pdf', area: 'pdf', kind: 'file', load: PDF, aggregate: true,
    title: 'Imatges a PDF',
    desc: 'Un PDF amb una imatge per pàgina, amb mida i marges controlats.',
    keywords: 'imatges pdf jpg png a pdf àlbum escanejat',
    accepts: ['image/*'],
    params: [
      {
        key: 'pageSize', label: 'Mida de pàgina', type: 'select', def: 'fit',
        options: [
          { v: 'fit', t: 'La de cada imatge' }, { v: 'a4', t: 'A4' },
          { v: 'letter', t: 'Carta' }, { v: 'a3', t: 'A3' }, { v: 'a5', t: 'A5' },
        ],
      },
      {
        key: 'orientation', label: 'Orientació', type: 'select', def: 'auto',
        options: [{ v: 'auto', t: 'Segons la imatge' }, { v: 'portrait', t: 'Vertical' }, { v: 'landscape', t: 'Apaïsada' }],
        showIf: (p) => p.pageSize !== 'fit',
      },
      { key: 'margin', label: 'Marge', type: 'number', min: 0, max: 100, step: 1, def: 0, unit: 'mm', showIf: (p) => p.pageSize !== 'fit' },
      { key: 'outName', label: 'Nom del resultat', type: 'text', def: 'imatges.pdf' },
    ],
  },

  {
    id: 'pdf-watermark', slug: 'marca-aigua-pdf', area: 'pdf', kind: 'file', load: PDF,
    title: 'Marca d\u2019aigua en PDF',
    desc: 'Text a totes les pàgines, en una posició o repetit en diagonal.',
    keywords: 'pdf marca aigua watermark confidencial esborrany segell',
    accepts: ['.pdf', 'application/pdf'],
    params: [
      { key: 'text', label: 'Text', type: 'text', def: 'ESBORRANY', wide: true },
      { key: 'tile', label: 'Repeteix-lo per tota la pàgina', type: 'checkbox', def: false },
      {
        key: 'position', label: 'Posició', type: 'select', def: 'center', showIf: (p) => !p.tile,
        options: [
          { v: 'top-left', t: 'Dalt esquerra' }, { v: 'top', t: 'Dalt' }, { v: 'top-right', t: 'Dalt dreta' },
          { v: 'left', t: 'Esquerra' }, { v: 'center', t: 'Centre' }, { v: 'right', t: 'Dreta' },
          { v: 'bottom-left', t: 'Baix esquerra' }, { v: 'bottom', t: 'Baix' }, { v: 'bottom-right', t: 'Baix dreta' },
        ],
      },
      { key: 'angle', label: 'Inclinació', type: 'range', min: -90, max: 90, step: 5, def: 30, unit: '\u00b0', showIf: (p) => !p.tile },
      { key: 'size', label: 'Mida', type: 'range', min: 2, max: 25, step: 0.5, def: 9, unit: '%' },
      { key: 'opacity', label: 'Opacitat', type: 'range', min: 5, max: 100, step: 5, def: 22, unit: '%' },
      { key: 'color', label: 'Color', type: 'color', def: '#ff0000' },
      { key: 'bold', label: 'Negreta', type: 'checkbox', def: true },
      { key: 'margin', label: 'Marge', type: 'range', min: 0, max: 20, step: 1, def: 5, unit: '%', showIf: (p) => !p.tile },
    ],
  },
  {
    id: 'pdf-page-numbers', slug: 'numerar-pagines-pdf', area: 'pdf', kind: 'file', load: PDF,
    title: 'Numerar pàgines',
    desc: 'Afegeix la numeració, amb el format i la posició que vulguis.',
    keywords: 'pdf numerar pàgines número foliar peu de pàgina',
    accepts: ['.pdf', 'application/pdf'],
    params: [
      {
        key: 'format', label: 'Format', type: 'select', def: '{n}',
        options: [
          { v: '{n}', t: '1' }, { v: '{n} / {total}', t: '1 / 10' },
          { v: 'Pàgina {n}', t: 'Pàgina 1' }, { v: 'Pàgina {n} de {total}', t: 'Pàgina 1 de 10' },
          { v: '- {n} -', t: '- 1 -' },
        ],
      },
      {
        key: 'position', label: 'Posició', type: 'select', def: 'bottom',
        options: [
          { v: 'bottom-left', t: 'Baix esquerra' }, { v: 'bottom', t: 'Baix centrat' }, { v: 'bottom-right', t: 'Baix dreta' },
          { v: 'top-left', t: 'Dalt esquerra' }, { v: 'top', t: 'Dalt centrat' }, { v: 'top-right', t: 'Dalt dreta' },
        ],
      },
      { key: 'start', label: 'Comença a', type: 'number', min: 0, max: 9999, step: 1, def: 1 },
      { key: 'skip', label: 'Salta les primeres', type: 'number', min: 0, max: 50, step: 1, def: 0, unit: 'pàgines',
        hint: 'Per no numerar la portada.' },
      { key: 'size', label: 'Mida de la lletra', type: 'number', min: 5, max: 40, step: 1, def: 10, unit: 'pt' },
      { key: 'margin', label: 'Marge', type: 'number', min: 8, max: 120, step: 2, def: 28, unit: 'pt' },
      { key: 'color', label: 'Color', type: 'color', def: '#444444' },
    ],
  },
  {
    id: 'ocr', slug: 'ocr-imatge-i-pdf', area: 'pdf', kind: 'file', load: HEAVY,
    title: 'OCR: llegir text d’imatges i PDF',
    desc: 'Reconeix el text d’escanejos i fotos, i en fa un PDF cercable.',
    keywords: 'ocr reconeixement text escaneig pdf cercable tesseract llegir foto',
    accepts: ['image/*', '.pdf', 'application/pdf'],
    presets: [
      { name: 'Escaneig en català', values: { lang: 'cat', output: 'pdf', dpi: 200 } },
      { name: 'Només el text', values: { output: 'text' } },
    ],
    params: [
      {
        key: 'lang', label: 'Idioma del document', type: 'select', def: 'cat',
        options: [
          { v: 'cat', t: 'Català' }, { v: 'spa', t: 'Castellà' }, { v: 'eng', t: 'Anglès' },
          { v: 'cat+spa', t: 'Català i castellà' }, { v: 'cat+eng', t: 'Català i anglès' },
          { v: 'spa+eng', t: 'Castellà i anglès' }, { v: 'cat+spa+eng', t: 'Els tres' },
        ],
        hint: 'Com menys idiomes, més ràpid i més encerta.',
      },
      {
        key: 'output', label: 'Resultat', type: 'select', def: 'text',
        options: [
          { v: 'text', t: 'Un fitxer de text' },
          { v: 'pdf', t: 'Un PDF cercable (la imatge amb el text a sota)' },
        ],
      },
      { key: 'dpi', label: 'Resolució en llegir PDF', type: 'number', min: 100, max: 400, step: 20, def: 200, unit: 'ppp',
        hint: 'Per sota de 150 l’OCR comença a fallar.' },
      { key: 'pageMarks', label: 'Marca on comença cada pàgina', type: 'checkbox', def: false, showIf: (p) => p.output === 'text' },
    ],
  },
  // ------------------------------------------------------------------ dades
  {
    id: 'json-to-csv', slug: 'json-a-csv', outExt: 'csv', area: 'data', kind: 'text', load: DATA,
    title: 'JSON a CSV',
    desc: 'Array d’objectes a taula, aplanant els objectes imbricats.',
    keywords: 'json csv taula excel exportar convertir',
    sample: '[\n  { "id": 1, "nom": "Anna", "adreca": { "ciutat": "Girona" } },\n  { "id": 2, "nom": "Pere", "adreca": { "ciutat": "Lleida" } }\n]',
    params: [
      {
        key: 'delimiter', label: 'Separador', type: 'select', def: ',',
        options: [{ v: ',', t: 'Coma' }, { v: ';', t: 'Punt i coma' }, { v: '\t', t: 'Tabulador' }, { v: '|', t: 'Barra' }],
      },
      { key: 'flatten', label: 'Aplana objectes imbricats', type: 'checkbox', def: true },
      { key: 'bom', label: 'Afegeix BOM (per a Excel)', type: 'checkbox', def: false },
    ],
  },
  {
    id: 'csv-to-json', slug: 'csv-a-json', outExt: 'json', area: 'data', kind: 'text', load: DATA,
    title: 'CSV a JSON',
    desc: 'Detecta el separador, respecta les cometes i tipa els valors.',
    keywords: 'csv json convertir taula importar tsv',
    sample: 'id,nom,actiu\n1,Anna,true\n2,"Pere, fill",false',
    params: [
      {
        key: 'delimiter', label: 'Separador', type: 'select', def: 'auto',
        options: [{ v: 'auto', t: 'Detecta’l' }, { v: ',', t: 'Coma' }, { v: ';', t: 'Punt i coma' }, { v: '\t', t: 'Tabulador' }, { v: '|', t: 'Barra' }],
      },
      { key: 'header', label: 'La primera fila són capçaleres', type: 'checkbox', def: true },
      { key: 'typed', label: 'Converteix números i booleans', type: 'checkbox', def: true },
      { key: 'indent', label: 'Indentació', type: 'select', def: '2', options: [{ v: '2', t: '2 espais' }, { v: '4', t: '4 espais' }, { v: '0', t: 'Minificat' }] },
    ],
  },
  {
    id: 'json-to-yaml', slug: 'json-a-yaml', outExt: 'yaml', area: 'data', kind: 'text', load: DATA,
    title: 'JSON a YAML',
    desc: 'Conversió directa mantenint l’ordre de les claus.',
    keywords: 'json yaml yml convertir configuració',
    sample: '{\n  "servei": "api",\n  "ports": [80, 443],\n  "debug": false\n}',
    params: [
      { key: 'indent', label: 'Indentació', type: 'number', min: 1, max: 8, step: 1, def: 2 },
      { key: 'quoteStyle', label: 'Cometes', type: 'select', def: 'auto', options: [{ v: 'auto', t: 'Només quan cal' }, { v: 'single', t: 'Simples' }, { v: 'double', t: 'Dobles' }] },
    ],
  },
  {
    id: 'yaml-to-json', slug: 'yaml-a-json', outExt: 'json', area: 'data', kind: 'text', load: DATA,
    title: 'YAML a JSON',
    desc: 'Accepta diversos documents en un mateix fitxer.',
    keywords: 'yaml yml json convertir configuració',
    sample: 'servei: api\nports:\n  - 80\n  - 443\ndebug: false',
    params: [
      { key: 'indent', label: 'Indentació', type: 'select', def: '2', options: [{ v: '2', t: '2 espais' }, { v: '4', t: '4 espais' }, { v: '0', t: 'Minificat' }] },
    ],
  },
  {
    id: 'json-format', slug: 'formatar-json', outExt: 'json', area: 'data', kind: 'text', load: DATA,
    title: 'Formatar i validar JSON',
    desc: 'Indenta, minifica o ordena claus, i assenyala l’error amb línia i columna.',
    keywords: 'json formatar validar bonic pretty minificar ordenar claus',
    sample: '{"b":2,"a":[1,2,{"c":3}],"d":"text"}',
    params: [
      {
        key: 'indent', label: 'Sortida', type: 'select', def: '2',
        options: [{ v: '2', t: '2 espais' }, { v: '4', t: '4 espais' }, { v: 'tab', t: 'Tabuladors' }, { v: '0', t: 'Minificat' }],
      },
      { key: 'sortKeys', label: 'Ordena les claus alfabèticament', type: 'checkbox', def: false },
    ],
  },
  {
    id: 'jwt-decode', slug: 'descodificar-jwt', area: 'data', kind: 'custom', load: DATA,
    title: 'Descodificar JWT',
    desc: 'Capçalera, càrrega útil i caducitat. La signatura no es verifica.',
    keywords: 'jwt token jose descodificar auth bearer',
  },
  {
    id: 'base64-text', slug: 'base64-text', outExt: 'txt', area: 'data', kind: 'text', load: DATA,
    title: 'Base64 (text)',
    desc: 'Codifica i descodifica text UTF-8, amb variant segura per a URL.',
    keywords: 'base64 codificar descodificar text url safe atob btoa',
    sample: 'Hola, món!',
    params: [
      { key: 'dir', label: 'Direcció', type: 'select', def: 'encode', options: [{ v: 'encode', t: 'Text a Base64' }, { v: 'decode', t: 'Base64 a text' }] },
      { key: 'urlSafe', label: 'Variant segura per a URL', type: 'checkbox', def: false },
      { key: 'wrap', label: 'Talla les línies a 76 caràcters', type: 'checkbox', def: false, showIf: (p) => p.dir === 'encode' },
    ],
  },
  {
    id: 'base64-file', slug: 'fitxer-a-base64', area: 'data', kind: 'file', load: DATA,
    title: 'Fitxer a Base64',
    desc: 'Genera un data URI llest per enganxar a CSS o HTML.',
    keywords: 'base64 data uri fitxer imatge incrustar inline',
    accepts: [],
    params: [
      { key: 'mode', label: 'Sortida', type: 'select', def: 'datauri', options: [{ v: 'datauri', t: 'Data URI complet' }, { v: 'plain', t: 'Només Base64' }] },
      { key: 'wrap', label: 'Talla les línies a 76 caràcters', type: 'checkbox', def: false },
    ],
  },
  {
    id: 'hash', slug: 'hash-md5-sha256', area: 'data', kind: 'custom', load: DATA,
    title: 'Hash i checksum',
    desc: 'MD5, SHA-1, SHA-256, SHA-384 i SHA-512 de text o de fitxers.',
    keywords: 'hash md5 sha1 sha256 sha512 checksum suma verificació',
  },

  // ------------------------------------------------------------- text i web
  {
    id: 'minify-css', slug: 'minificar-css', outExt: 'min.css', area: 'web', kind: 'text', load: WEB,
    title: 'Minificar CSS',
    desc: 'CSSO: reestructura i fusiona regles, no només treu espais.',
    keywords: 'css minificar comprimir minify csso optimitzar',
    sample: '.a {\n  color: #ff0000;\n  margin: 10px 10px 10px 10px;\n}\n.b { color: #ff0000; }',
    params: [
      { key: 'restructure', label: 'Reestructura i fusiona regles', type: 'checkbox', def: true },
      { key: 'comments', label: 'Conserva els comentaris /*! */', type: 'checkbox', def: true },
    ],
  },
  {
    id: 'minify-js', slug: 'minificar-javascript', outExt: 'min.js', area: 'web', kind: 'text', load: WEB,
    title: 'Minificar JavaScript',
    desc: 'Terser al navegador, amb escurçament de noms opcional.',
    keywords: 'js javascript minificar comprimir terser uglify',
    sample: 'function saluda(nom) {\n  // un comentari\n  const missatge = "Hola, " + nom;\n  return missatge;\n}',
    params: [
      { key: 'mangle', label: 'Escurça els noms de variable', type: 'checkbox', def: true },
      { key: 'compress', label: 'Optimitza el codi', type: 'checkbox', def: true },
      { key: 'module', label: 'És un mòdul ES', type: 'checkbox', def: true },
      { key: 'ecma', label: 'Objectiu', type: 'select', def: '2020', options: [{ v: '5', t: 'ES5' }, { v: '2015', t: 'ES2015' }, { v: '2020', t: 'ES2020' }] },
    ],
  },
  {
    id: 'text-count', slug: 'comptar-paraules', area: 'web', kind: 'custom', load: TEXT,
    title: 'Comptar paraules i caràcters',
    desc: 'Recompte en viu, temps de lectura i els límits de cada plataforma.',
    keywords: 'comptar paraules caràcters longitud text límit twitter seo lectura',
  },
  {
    id: 'text-case', outExt: 'txt', slug: 'canviar-majuscules', area: 'web', kind: 'text', load: TEXT,
    title: 'Canviar majúscules i minúscules',
    desc: 'MAJÚSCULES, minúscules, Tipus Títol, camelCase, snake_case i més.',
    keywords: 'majúscules minúscules camelcase snakecase kebabcase títol convertir text',
    sample: 'la casa de les paraules perdudes',
    params: [
      {
        key: 'mode', label: 'Convertir a', type: 'select', def: 'sentence',
        options: [
          { v: 'upper', t: 'MAJÚSCULES' }, { v: 'lower', t: 'minúscules' },
          { v: 'sentence', t: 'Com una frase' }, { v: 'title', t: 'Tipus Títol' },
          { v: 'camel', t: 'camelCase' }, { v: 'pascal', t: 'PascalCase' },
          { v: 'snake', t: 'snake_case' }, { v: 'kebab', t: 'kebab-case' },
          { v: 'constant', t: 'CONSTANT_CASE' }, { v: 'invert', t: 'iNVERTIR' },
        ],
      },
    ],
  },
  {
    id: 'text-lines', outExt: 'txt', slug: 'ordenar-linies', area: 'web', kind: 'text', load: TEXT,
    title: 'Ordenar i netejar línies',
    desc: 'Ordena, treu duplicats i línies buides, numera o inverteix una llista.',
    keywords: 'ordenar línies duplicats deduplicar llista alfabètic numerar netejar',
    sample: 'pera\nplatan\npoma\npera\n\ncirera\n  poma  ',
    params: [
      {
        key: 'sort', label: 'Ordena', type: 'select', def: 'asc',
        options: [
          { v: 'none', t: 'Deixa-ho com està' }, { v: 'asc', t: 'A \u2192 Z' }, { v: 'desc', t: 'Z \u2192 A' },
          { v: 'length', t: 'Per longitud' }, { v: 'shuffle', t: 'A l\u2019atzar' },
        ],
      },
      { key: 'dedupe', label: 'Treu les repetides', type: 'checkbox', def: true },
      { key: 'ignoreCase', label: 'Ignora majúscules en comparar', type: 'checkbox', def: false, showIf: (p) => p.dedupe },
      { key: 'trim', label: 'Treu els espais dels extrems', type: 'checkbox', def: true },
      { key: 'removeEmpty', label: 'Treu les línies buides', type: 'checkbox', def: true },
      { key: 'reverse', label: 'Inverteix el resultat', type: 'checkbox', def: false },
      { key: 'number', label: 'Numera-les', type: 'checkbox', def: false },
    ],
  },
  {
    id: 'url-encode', outExt: 'txt', slug: 'codificar-url', area: 'web', kind: 'text', load: TEXT,
    title: 'Codificar i descodificar URL',
    desc: 'Percent-encoding, per a adreces senceres o només per a un paràmetre.',
    keywords: 'url encode decode percent codificar descodificar adreça paràmetre query',
    sample: 'https://exemple.cat/cerca?q=cafè amb llet&lloc=Girona',
    params: [
      {
        key: 'dir', label: 'Direcció', type: 'select', def: 'encode',
        options: [{ v: 'encode', t: 'Codificar' }, { v: 'decode', t: 'Descodificar' }],
      },
      {
        key: 'scope', label: 'Abast', type: 'select', def: 'component',
        options: [
          { v: 'component', t: 'Un valor solt (codifica / ? & =)' },
          { v: 'full', t: 'Una adreça sencera (respecta / ? & =)' },
        ],
      },
      { key: 'plusSpaces', label: 'Espais com a «+»', type: 'checkbox', def: false, showIf: (p) => p.dir === 'encode' },
    ],
  },
  {
    id: 'html-entities', outExt: 'txt', slug: 'entitats-html', area: 'web', kind: 'text', load: TEXT,
    title: 'Entitats HTML',
    desc: 'Escapa el text per posar-lo dins d\u2019HTML, o desfes-ho.',
    keywords: 'html entitats escapar amp lt gt nbsp codificar descodificar',
    sample: '<a href="x">Codi & «cometes»</a>',
    params: [
      {
        key: 'dir', label: 'Direcció', type: 'select', def: 'encode',
        options: [{ v: 'encode', t: 'Text \u2192 entitats' }, { v: 'decode', t: 'Entitats \u2192 text' }],
      },
      { key: 'all', label: 'Escapa també els accents i símbols', type: 'checkbox', def: false, showIf: (p) => p.dir === 'encode' },
    ],
  },
  {
    id: 'slugify', outExt: 'txt', slug: 'generar-slug', area: 'web', kind: 'text', load: TEXT,
    title: 'Generar slugs per a URL',
    desc: 'Passa un títol a una adreça neta, sense accents ni símbols.',
    keywords: 'slug url amigable seo permalink accents netejar títol',
    sample: 'Com fer una paella de peix i marisc (recepta fàcil!)',
    params: [
      {
        key: 'separator', label: 'Separador', type: 'select', def: 'hyphen',
        options: [{ v: 'hyphen', t: 'Guió -' }, { v: 'underscore', t: 'Guió baix _' }],
      },
      { key: 'lower', label: 'Tot en minúscules', type: 'checkbox', def: true },
      { key: 'maxLength', label: 'Longitud màxima', type: 'number', min: 0, max: 200, step: 5, def: 0, hint: '0 = sense limit.' },
    ],
  },
  {
    id: 'format-html', outExt: 'html', slug: 'formatar-html', area: 'web', kind: 'text', load: TEXT,
    title: 'Formatar HTML',
    desc: 'Indenta i endreça marcatge desordenat o minificat.',
    keywords: 'html formatar indentar bonic pretty beautify endreçar',
    sample: '<div class="a"><p>Hola</p><ul><li>u</li><li>dos</li></ul></div>',
    params: [
      { key: 'indent', label: 'Indentació', type: 'number', min: 1, max: 8, step: 1, def: 2 },
      { key: 'wrap', label: 'Talla les línies a', type: 'number', min: 0, max: 200, step: 10, def: 0, unit: 'car.', hint: '0 = no les tallis.' },
      { key: 'preserveNewlines', label: 'Conserva els salts de línia', type: 'checkbox', def: true },
    ],
  },
  {
    id: 'format-xml', outExt: 'xml', slug: 'formatar-xml', area: 'web', kind: 'text', load: TEXT,
    title: 'Formatar i validar XML',
    desc: 'Indenta el document i avisa si el marcatge no tanca bé.',
    keywords: 'xml formatar indentar validar pretty rss sitemap',
    sample: '<rss version="2.0"><channel><title>Blog</title><item><title>Un apunt</title></item></channel></rss>',
    params: [
      { key: 'indent', label: 'Indentació', type: 'number', min: 1, max: 8, step: 1, def: 2 },
    ],
  },
  {
    id: 'format-sql', outExt: 'sql', slug: 'formatar-sql', area: 'web', kind: 'text', load: TEXT,
    title: 'Formatar SQL',
    desc: 'Consultes llargues en una sola línia, endreçades i llegibles.',
    keywords: 'sql formatar indentar consulta query mysql postgres bonic',
    sample: 'select u.id,u.nom,count(c.id) as total from usuaris u left join comandes c on c.usuari_id=u.id where u.actiu=1 group by u.id order by total desc limit 20;',
    params: [
      {
        key: 'dialect', label: 'Dialecte', type: 'select', def: 'sql',
        options: [
          { v: 'sql', t: 'SQL estàndard' }, { v: 'mysql', t: 'MySQL' }, { v: 'postgresql', t: 'PostgreSQL' },
          { v: 'sqlite', t: 'SQLite' }, { v: 'mariadb', t: 'MariaDB' }, { v: 'bigquery', t: 'BigQuery' },
        ],
      },
      {
        key: 'keywordCase', label: 'Paraules clau', type: 'select', def: 'upper',
        options: [{ v: 'upper', t: 'MAJÚSCULES' }, { v: 'lower', t: 'minúscules' }, { v: 'preserve', t: 'Com estan' }],
      },
      { key: 'indent', label: 'Indentació', type: 'number', min: 1, max: 8, step: 1, def: 2 },
    ],
  },
  {
    id: 'color', slug: 'convertidor-de-colors', area: 'web', kind: 'custom', load: WEB,
    title: 'Colors i contrast',
    desc: 'HEX, RGB, HSL i OKLCH, escala de tons i comprovació WCAG.',
    keywords: 'color hex rgb hsl oklch contrast wcag accessibilitat paleta',
  },
  {
    id: 'regex', slug: 'provador-de-regex', area: 'web', kind: 'custom', load: WEB,
    title: 'Provador d’expressions regulars',
    desc: 'Coincidències ressaltades, grups amb nom i substitució en viu.',
    keywords: 'regex regexp expressions regulars provar test substituir',
  },
  {
    id: 'qr', slug: 'generador-qr', area: 'web', kind: 'custom', load: WEB,
    title: 'Generador de QR',
    desc: 'Descàrrega en SVG vectorial o PNG a la resolució que vulguis.',
    keywords: 'qr codi generar svg png url wifi vcard',
  },
  {
    id: 'diff', slug: 'comparar-textos', area: 'web', kind: 'custom', load: WEB,
    title: 'Comparar textos',
    desc: 'Diferències línia a línia amb els blocs iguals plegats.',
    keywords: 'diff comparar text diferències canvis',
  },
];

// Landing pages that are one tool with some knobs pre-set. They exist because
// people search for "png a webp", not for "convertidor d'imatges" — each gets
// its own URL, its own words and a form that already has the right answer in it.
//
//   tool     the tool it drives          preset  parameter values to force
//   accepts  narrower input filter       lock    parameters to hide (preset wins)
export const VARIANTS = [
  { slug: 'png-a-webp', tool: 'image-convert', from: 'png', to: 'webp' },
  { slug: 'jpg-a-webp', tool: 'image-convert', from: 'jpeg', to: 'webp' },
  { slug: 'png-a-jpg', tool: 'image-convert', from: 'png', to: 'jpeg' },
  { slug: 'jpg-a-png', tool: 'image-convert', from: 'jpeg', to: 'png' },
  { slug: 'webp-a-png', tool: 'image-convert', from: 'webp', to: 'png' },
  { slug: 'webp-a-jpg', tool: 'image-convert', from: 'webp', to: 'jpeg' },
  { slug: 'png-a-avif', tool: 'image-convert', from: 'png', to: 'avif' },
  { slug: 'jpg-a-avif', tool: 'image-convert', from: 'jpeg', to: 'avif' },
  { slug: 'avif-a-png', tool: 'image-convert', from: 'avif', to: 'png' },
  { slug: 'avif-a-jpg', tool: 'image-convert', from: 'avif', to: 'jpeg' },

  {
    slug: 'comprimir-png', tool: 'image-compress', title: 'Comprimir PNG',
    desc: 'Redueix captures i gràfics PNG, sortint en WebP amb transparència.',
    accepts: ['image/png'], preset: { format: 'webp' },
  },
  {
    slug: 'comprimir-jpg', tool: 'image-compress', title: 'Comprimir JPG',
    desc: 'Recodifica fotos JPEG per qualitat o fins a un pes màxim.',
    accepts: ['image/jpeg'], preset: { format: 'jpeg' }, lock: ['format'],
  },
  {
    slug: 'jpg-a-pdf', tool: 'images-to-pdf', title: 'JPG a PDF',
    desc: 'Fotografies JPEG en un sol PDF, una per pàgina.',
    accepts: ['image/jpeg'], preset: { outName: 'fotos.pdf' },
  },
  {
    slug: 'png-a-pdf', tool: 'images-to-pdf', title: 'PNG a PDF',
    desc: 'Captures i gràfics PNG en un sol PDF, una per pàgina.',
    accepts: ['image/png'], preset: { outName: 'captures.pdf' },
  },
];

const FORMAT_LABEL = { png: 'PNG', jpeg: 'JPG', webp: 'WebP', avif: 'AVIF' };
const FORMAT_MIME = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif' };

/** Fill in what a conversion-pair variant can derive from its two formats. */
export function expandVariant(v) {
  const tool = byId[v.tool];
  if (!tool) throw new Error(`La variant «${v.slug}» apunta a una eina inexistent: ${v.tool}`);
  const pair = v.from && v.to;
  return {
    ...v,
    tool,
    title: v.title || `${FORMAT_LABEL[v.from]} a ${FORMAT_LABEL[v.to]}`,
    desc: v.desc || `Converteix imatges ${FORMAT_LABEL[v.from]} a ${FORMAT_LABEL[v.to]} en lot, dins del navegador.`,
    accepts: v.accepts || (pair ? [FORMAT_MIME[v.from]] : tool.accepts),
    preset: v.preset || (pair ? { format: v.to } : {}),
    lock: v.lock || (pair ? ['format'] : []),
  };
}

export const byId = Object.fromEntries(TOOLS.map((t) => [t.id, t]));
export const bySlug = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

export function search(q) {
  const s = q.trim().toLowerCase();
  if (!s) return TOOLS;
  const words = s.split(/\s+/);
  return TOOLS.filter((t) => {
    const hay = `${t.title} ${t.desc} ${t.keywords || ''} ${t.id}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
