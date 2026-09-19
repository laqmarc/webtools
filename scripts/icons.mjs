// Draws the app icons and writes them as PNG, with no dependencies.
//
// A PWA is not installable without a 192 and a 512 icon, and iOS wants an
// opaque apple-touch-icon on top of that. Pulling in an image library to
// produce four flat-coloured squares would be a poor trade for a project whose
// whole point is not needing a toolchain, and the mark is simple enough to
// rasterise by hand: a rounded panel with the ◩ brand glyph on it, which is a
// square outline whose left half is filled.
//
// PNG itself is a short format to write when you do not care about filtering:
// signature, IHDR, one IDAT of zlib-deflated scanlines each prefixed with a
// zero filter byte, IEND. node:zlib does the only hard part.

import { deflateSync } from 'node:zlib';

const BG = [0x1c, 0x1a, 0x16]; // --bg-2 fosc, el color del panell
const FG = [0xf0, 0x8a, 0x5d]; // --accent
const hex = (c) => `#${c.map((n) => n.toString(16).padStart(2, '0')).join('')}`;

// Geometry, all as fractions so every size comes out identical.
const LOGO = 0.62; // side of the glyph box, normal icon
const LOGO_MASKABLE = 0.50; // smaller, to sit inside Android's safe circle
const STROKE = 0.115; // outline thickness, fraction of the glyph box
const RADIUS = 0.22; // corner radius, fraction of the canvas

// ------------------------------------------------------------------- PNG

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

export function encodePng(size, rgba, height = size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // truecolour with alpha
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ------------------------------------------------------------------ draw

function insideRounded(x, y, size, r) {
  if (r <= 0) return x >= 0 && y >= 0 && x <= size && y <= size;
  const cx = Math.min(Math.max(x, r), size - r);
  const cy = Math.min(Math.max(y, r), size - r);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

/** 4×4 supersampling: no filtering, no libraries, edges that still look right. */
export function renderIcon(size, { maskable = false, opaque = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const SS = 4;
  const samples = SS * SS;
  const radius = maskable || opaque ? 0 : size * RADIUS;
  const box = size * (maskable ? LOGO_MASKABLE : LOGO);
  const origin = (size - box) / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bg = 0;
      let fg = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;
          if (!insideRounded(px, py, size, radius)) continue;
          bg++;
          const lx = (px - origin) / box;
          const ly = (py - origin) / box;
          if (lx < 0 || lx > 1 || ly < 0 || ly > 1) continue;
          const onOutline = lx < STROKE || lx > 1 - STROKE || ly < STROKE || ly > 1 - STROKE;
          if (onOutline || lx < 0.5) fg++;
        }
      }

      const i = (y * size + x) * 4;
      if (!bg) continue; // outside the rounded corner: leave it transparent
      const coverage = bg / samples;
      const mark = fg / bg; // the glyph never spills past the panel
      for (let c = 0; c < 3; c++) rgba[i + c] = Math.round(BG[c] + (FG[c] - BG[c]) * mark);
      rgba[i + 3] = opaque ? 255 : Math.round(coverage * 255);
    }
  }
  return rgba;
}

/** The same drawing as vectors, for the browser tab. */
export function renderSvg() {
  const S = 64;
  const box = S * LOGO;
  const o = (S - box) / 2;
  const t = box * STROKE;
  const fmt = (n) => Number(n.toFixed(2));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="WebTools">
  <rect width="${S}" height="${S}" rx="${fmt(S * RADIUS)}" fill="${hex(BG)}"/>
  <rect x="${fmt(o + t / 2)}" y="${fmt(o + t / 2)}" width="${fmt(box - t)}" height="${fmt(box - t)}" fill="none" stroke="${hex(FG)}" stroke-width="${fmt(t)}"/>
  <rect x="${fmt(o + t)}" y="${fmt(o + t)}" width="${fmt(box / 2 - t)}" height="${fmt(box - t * 2)}" fill="${hex(FG)}"/>
</svg>
`;
}

// ------------------------------------------------------- targeta social
//
// Sense aquesta imatge, cada enllaç compartit a un xat surt com una fitxa
// buida. No hi va text: rasteritzar una tipografia dins de Node voldria dir
// desfer la transformació glyf d'un woff2 a mà, i qui comparteix l'enllaç ja
// veu el títol i la descripció al costat de la imatge. O sigui que el que hi
// ha de fer la imatge és una cosa: que es reconegui d'una ullada.

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const OG_BG = [0x14, 0x12, 0x0f];   // --bg fosc
const OG_LINE = [0x4a, 0x44, 0x37]; // --line-2 fosc

/** El mateix ◩ de la icona, gran i centrat, dins d'un marc rovell. */
export function renderOgCard(W = OG_WIDTH, H = OG_HEIGHT) {
  const rgba = Buffer.alloc(W * H * 4);
  const SS = 3;
  const samples = SS * SS;

  const box = Math.round(H * 0.42);        // costat del glif
  const ox = (W - box) / 2;
  const oy = (H - box) / 2 - H * 0.02;     // una mica amunt: pesa millor
  const inset = Math.round(H * 0.055);     // marge del marc
  const frame = Math.max(2, Math.round(H * 0.006));
  const rule = { y: H - inset - Math.round(H * 0.12), w: Math.round(W * 0.18), t: frame * 2 };

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let mark = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;

          // El glif: quadrat amb la meitat esquerra plena.
          const lx = (px - ox) / box;
          const ly = (py - oy) / box;
          if (lx >= 0 && lx <= 1 && ly >= 0 && ly <= 1) {
            const onOutline = lx < STROKE || lx > 1 - STROKE || ly < STROKE || ly > 1 - STROKE;
            if (onOutline || lx < 0.5) { mark++; continue; }
          }

          // El marc.
          const inFrame = px >= inset && px <= W - inset && py >= inset && py <= H - inset;
          const inInner = px >= inset + frame && px <= W - inset - frame
            && py >= inset + frame && py <= H - inset - frame;
          if (inFrame && !inInner) { mark++; continue; }

          // Un pal curt a sota del glif, que trenca la simetria.
          if (py >= rule.y && py <= rule.y + rule.t
            && px >= (W - rule.w) / 2 && px <= (W + rule.w) / 2) mark++;
        }
      }

      const i = (y * W + x) * 4;
      const a = mark / samples;
      for (let c = 0; c < 3; c++) rgba[i + c] = Math.round(OG_BG[c] + (FG[c] - OG_BG[c]) * a);
      rgba[i + 3] = 255;
    }
  }

  // Una vora d'un píxel, perquè la targeta no es fongui amb el fons fosc del
  // client de xat que la mostri.
  for (let x = 0; x < W; x++) {
    for (const y of [0, H - 1]) {
      const i = (y * W + x) * 4;
      for (let c = 0; c < 3; c++) rgba[i + c] = OG_LINE[c];
    }
  }
  for (let y = 0; y < H; y++) {
    for (const x of [0, W - 1]) {
      const i = (y * W + x) * 4;
      for (let c = 0; c < 3; c++) rgba[i + c] = OG_LINE[c];
    }
  }
  return rgba;
}

// ------------------------------------------------------------------- ICO
//
// Un SVG de favicon el llegeixen els navegadors d'ara, pero qui demana
// /favicon.ico a seques —Safari vell, lectors de RSS, la miniatura d'un xat,
// el rastrejador que en vol una per als resultats— es troba un 404. Un .ico
// es un index de mides amb les imatges a darrere, i des de Vista cada imatge
// pot ser un PNG tal qual, o sigui que aqui nomes cal empaquetar els que ja
// sabem dibuixar.
const ICO_SIZES = [16, 32, 48];

export function encodeIco(sizes = ICO_SIZES) {
  const pngs = sizes.map((size) => encodePng(size, renderIcon(size)));
  const dir = Buffer.alloc(6 + sizes.length * 16);
  dir.writeUInt16LE(0, 0); // reservat
  dir.writeUInt16LE(1, 2); // 1 = icona, 2 = cursor
  dir.writeUInt16LE(sizes.length, 4);

  let offset = dir.length;
  sizes.forEach((size, i) => {
    const at = 6 + i * 16;
    dir[at] = size >= 256 ? 0 : size; // 0 vol dir 256
    dir[at + 1] = size >= 256 ? 0 : size;
    dir[at + 2] = 0; // colors de la paleta: cap, es truecolour
    dir[at + 3] = 0; // reservat
    dir.writeUInt16LE(1, at + 4); // plans
    dir.writeUInt16LE(32, at + 6); // bits per pixel
    dir.writeUInt32LE(pngs[i].length, at + 8);
    dir.writeUInt32LE(offset, at + 12);
    offset += pngs[i].length;
  });

  return Buffer.concat([dir, ...pngs]);
}

export const ICO_FILE = 'favicon.ico';

/**
 * Every icon file the manifest and the page heads point at.
 *
 * Sota assets/ i no a icons/ a l'arrel, i no es cap manic: l'Apache del Plesk
 * porta actiu l'alies classic `Alias /icons/ "/usr/share/apache2/icons/"` per
 * als llistats de directori, o sigui que /icons/ mai no arriba al docroot.
 * Els fitxers hi eren, pujats i tot, i cada URL donava 404 —i sense un icon de
 * 192 i un de 512 que es puguin baixar, el Chrome no considera el lloc
 * instal·lable i no dispara mai beforeinstallprompt. Comprovat: /icons/back.gif
 * servia una icona del sistema. No els tornis a moure alla.
 */
export const ICON_FILES = [
  { file: 'assets/icons/icon-192.png', size: 192, opts: {} },
  { file: 'assets/icons/icon-512.png', size: 512, opts: {} },
  { file: 'assets/icons/maskable-512.png', size: 512, opts: { maskable: true, opaque: true } },
  { file: 'assets/icons/apple-touch-icon.png', size: 180, opts: { opaque: true } },
];

export const OG_FILE = 'assets/icons/og.png';

export function buildIcons() {
  return [
    ...ICON_FILES.map(({ file, size, opts }) => ({ file, data: encodePng(size, renderIcon(size, opts)) })),
    { file: 'assets/icons/icon.svg', data: Buffer.from(renderSvg(), 'utf8') },
    { file: ICO_FILE, data: encodeIco() },
    { file: OG_FILE, data: encodePng(OG_WIDTH, renderOgCard(), OG_HEIGHT) },
  ];
}
