# WebTools

Un CloudConvert casolà que no puja res enlloc: 50 eines d'imatge, SVG, PDF,
dades i text, totes executades dins del navegador, en català, castellà i anglès.

## Posar-lo en marxa

Un cop, per baixar les llibreries a `vendor/`:

```bash
node scripts/vendor.mjs
```

Afegeix-hi `--extras` si vols l'OCR i el retall de fons, que porten pesos
entrenats (25 MB més):

```bash
node scripts/vendor.mjs --extras
```

I després, cada vegada — genera les pàgines i serveix la carpeta:

```bash
node serve.mjs
```

Obre <http://localhost:5180>.

## Desplegament

El lloc viu a <https://webtools.quexulo.cat/>, en un Plesk que fa `git pull`
del repositori al docroot. Això vol dir una cosa important: **el que commets
surt publicat**. El lloc construït és al repositori a posta i no s'ha de treure
del seguiment.

Abans de fer push:

```bash
npm run preflight
```

Que és `check` + `build` + `verify`:

- **check** — rutes duplicades, traduccions que falten, paràmetres sense valor
  per defecte, `vendor/` incomplet.
- **build** — regenera les 195 pàgines amb la canònica de producció. El domini
  és al `package.json`, no a la línia d'ordres, perquè no s'hagi de recordar.
- **verify** — construeix en un directori temporal i el compara amb el
  repositori. Si editaves un text i no havies reconstruït, això ho atura; sense
  la comprovació, el lloc continuaria servint la versió vella sense que res ho
  digués.

`verify` només funciona perquè **la construcció és reproduïble**: no hi ha cap
data ni cap marca de temps a la sortida. El sitemap no porta `<lastmod>`, entre
altres coses perquè l'únic valor honest seria «avui» a totes les pàgines. Si
algun dia hi afegeixes una data, la comprovació mor amb ella.

`.github/workflows/build.yml` fa les mateixes tres coses a cada push, per si
te'n descuides.

### Això ja ha passat

Tot el lloc va estar publicat amb `canonical`, `hreflang`, el sitemap i el
`robots.txt` apuntant a `http://localhost:5180`. Des del navegador no es veu
res; per a un cercador vol dir que la versió bona de cada pàgina no existeix.
D'aquí ve que el domini estigui escrit al `package.json` i que la CI ho
comprovi explícitament.

### El repositori és el docroot

Tot el que hi ha al repo es pot descarregar del web: `scripts/`, `content/`, el
`README`. No hi ha res secret —és un projecte MIT públic— i `.git/` sí que està
bloquejat pel Plesk, comprovat. El `robots.txt` generat els exclou de la
indexació perquè no té sentit que un cercador es miri el generador ni un fitxer
de 76 kB amb el mateix text que ja és a les pàgines.

## Tres idiomes, una URL per eina i per idioma

`scripts/build-pages.mjs` escriu **195 pàgines HTML de veritat**: 65 per idioma
(portada + 50 eines + 14 conversions). El català viu a l'arrel, el castellà a
`/es/` i l'anglès a `/en/`, cadascun amb els seus propis slugs:

```
/comprimir-imatges/      /es/comprimir-imagenes/      /en/compress-images/
/png-a-webp/             /es/png-a-webp/              /en/png-to-webp/
/organitzar-pdf/         /es/organizar-pdf/           /en/organise-pdf-pages/
```

Totes tres es referencien entre elles amb `hreflang` i `x-default`, i el
selector d'idioma de la barra superior porta a la *mateixa* eina, no a la
portada. El títol, la descripció, el text i les preguntes freqüents són al
marcatge abans que s'executi cap script; el JavaScript només munta la part
interactiva dins d'un `<div id="tool">` buit.

**El català és l'idioma font.** El registre està escrit en català i les altres
llengües hi van a sobre com a capes (`content/i18n/`). Si falta una traducció,
el generador ho diu per consola i la pàgina cau al català en comptes de quedar
en blanc. La interfície en viu es tradueix amb un JSON per idioma
(`i18n/es.json`) que la pàgina carrega abans de muntar res.

Això inclou **tot** el que es veu: els noms i les etiquetes (`*-tools.js`), el
text de les pàgines (`*-pages.js`), la closca (`ui.js`), els missatges d'error
dels runners (`errors.js`) i les eines a mida amb els seus avisos de progrés
(`panels.js`). El worker d'imatge rep l'idioma amb cada feina, de manera que un
error llançat a dins també torna traduït.

També s'escriuen `sitemap.xml` amb les 195 URL, `robots.txt`, un
`manifest.webmanifest` per idioma i un `.pages-manifest.json` per esborrar les
carpetes d'slugs que ja no existeixen.

## Les eines

| Àrea | Eines |
|---|---|
| **Imatge** | convertir · comprimir · redimensionar · retallar (visual) · girar · treure metadades · veure metadades (EXIF) · marca d'aigua · favicons · GIF animat · treure el fons |
| **Vector** | optimitzar SVG · SVG a PNG |
| **PDF** | comprimir · organitzar pàgines (miniatures) · unir · separar · girar · extreure pàgines · imatges a PDF · PDF a imatges · PDF a text · extreure imatges · marca d'aigua · numerar pàgines · OCR |
| **Dades** | JSON↔CSV · JSON↔YAML · formatar JSON · JWT · Base64 (text i fitxer) · hash |
| **Text i web** | minificar CSS i JS · comptar paraules · majúscules · ordenar línies · codificar URL · entitats HTML · slugs · formatar HTML, XML i SQL · colors · regex · QR · comparar textos |

Més 14 pàgines de conversió directa (`/png-a-webp/`, `/comprimir-jpg/`…) que
són la mateixa eina amb paràmetres ja triats i amagats.

## Sense connexió

Dues peces, i les dues calen.

**`vendor/`** conté totes les llibreries, copiades del registre npm per
`scripts/vendor.mjs`. En temps d'execució no es fa cap petició a cap CDN: un cop
la pàgina és oberta pots desendollar la xarxa i tot continua funcionant.
`src/core/deps.js` és l'únic lloc que en sap les rutes.

**`assets/fonts/`** són les dues tipografies, Play als titulars i Google Sans
al text, baixades de Google Fonts per `scripts/fonts.mjs` i servides des d'aquí.
Una webfont remota seria l'única petició a fora que faria el lloc, i a més
diria a Google qui llegeix cada eina. Totes dues són OFL 1.1, que permet
allotjar-les un mateix; la llicència va al costat dels fitxers.

**`sw.js`** és el que permet *obrir* el lloc sense xarxa. Precacheja la closca
—les 195 pàgines, el CSS, les icones, els JSON d'idioma i tot el JavaScript— i
cacheja `vendor/` a mesura que es fa servir, perquè precarregar 30 MB de models
a algú que només ve a formatar un JSON seria una grolleria.

El worker **no s'activa a localhost**: `?sw=1` per provar-lo, `?sw=0` per
treure'l amb la cache inclosa.

## Instal·lable

`manifest.webmanifest` i les icones també els genera el build, un manifest per
idioma. **Les icones es dibuixen al build sense cap dependència**
(`scripts/icons.mjs`): el glif ◩ rasteritzat amb supermostreig 4×4 i escrit com
a PNG a mà — signatura, IHDR, un IDAT deflatat amb `node:zlib`, IEND — més una
versió SVG. Surten 192, 512, una 512 *maskable* i una de 180 opaca per a iOS, 18
kB en total.

**`file_handlers` és el motiu per instal·lar-la.** «Obre amb → WebTools» en un
`.png` obre el convertidor amb la imatge ja a la llista, un `.pdf` va a unir-los
i un `.svg` a l'optimitzador. Ho recull `src/ui/filetool.js` des de
`launchQueue`.

## Com està fet

```
.github/workflows/       construeix i publica a Pages a cada push
scripts/dist.mjs         munta dist/: el que es desplega, i res més
scripts/verify-build.mjs comprova que el build comès sigui el d'ara
scripts/check.mjs        el que val la pena que faci fallar una construcció
scripts/build-pages.mjs  genera les 195 pàgines, sw.js, manifests, sitemap
scripts/icons.mjs        dibuixa les icones i escriu els PNG, sense deps
scripts/vendor.mjs       baixa les llibreries (+ --extras per a OCR i model)
scripts/fonts.mjs        baixa Play i Google Sans a assets/fonts/
content/seo.js           text català de cada pàgina (font)
content/i18n/            ui.js, errors.js, panels.js + ca/es/en
vendor/                  llibreries de tercers + llicències + manifest
assets/styles.css        tot l'estil, amb variables i mode clar/fosc
assets/fonts/            Play i Google Sans en woff2, latin i latin-ext
src/main.js              arrenca segons el que declari window.__PAGE__
src/i18n.js              carrega l'idioma i tradueix les eines en viu
src/registry.js          ← el fitxer important: totes les eines i variants
src/core/                dom, fitxers, ZIP, pool de workers, pdf.js, llibreries
src/ui/                  pàgines genèriques + retallador + organitzador de PDF
src/tools/               la feina de debò, un mòdul per àrea
src/workers/             worker d'imatge (OffscreenCanvas)
<slug>/  es/  en/        generats — no els editis
```

### Afegir una eina

1. Una entrada a `src/registry.js` amb el `slug`, el `kind`, els paràmetres i el
   mòdul que la conté.
2. Un *runner* al mòdul d'àrea, exportat dins de `runners` (o `mounts` si és
   `custom`).
3. El text català a `content/seo.js`, i les traduccions a
   `content/i18n/{es,en}-tools.js` i `-pages.js`.

Els tres tipus d'eina:

| `kind`   | signatura                          | la UI et dóna                                  |
|----------|------------------------------------|------------------------------------------------|
| `file`   | `run(input, params, ctx) → Output\|Output[]` | zona d'arrossegar, llista reordenable, lot, progrés, ZIP, comparador |
| `text`   | `run(text, params) → string`       | dues caixes, recàlcul en viu, copiar i baixar   |
| `custom` | `mount(root, tool)`                | res: la pàgina és teva                          |

`ctx.onProgress(text)` escriu a la fila del fitxer: fes-lo servir a les eines
lentes. El formulari de paràmetres es genera sol de l'esquema, recorda l'última
configuració, amaga camps amb `showIf` i accepta `presets`.

### Afegir una pàgina de conversió

Una línia a `VARIANTS`. Per a una parella de formats d'imatge n'hi ha prou amb
els dos extrems: títol, filtre, paràmetres i text es deriven de la taula
`FORMATS` de cada idioma, i només cal la frase pròpia de la parella a
`PAIR_ANGLES`.

```js
{ slug: 'png-a-webp', tool: 'image-convert', from: 'png', to: 'webp' }
```

### Decisions que val la pena conèixer

- **Les imatges van en un pool de workers**, un per nucli menys un, amb el
  mateix codi (`src/tools/image-core.js`) com a recanvi al fil principal.
- **Canvas fa l'encoding** de PNG, JPEG i WebP. L'AVIF no: cap navegador no en
  sap escriure des d'un llenç —Chrome et torna un PNG sense dir res— així que hi
  va el còdec WASM vendoritzat.
- **«Pes màxim» fa cerca binària** sobre la qualitat i, si cal, redueix la mida.
  Al PDF l'escala s'estima amb `sqrt(pressupost / bytes_a_qualitat_mínima)` en
  comptes de baixar a cegues, que és el que fa que encerti el número.
- **Comprimir PDF reemplaça les imatges, no rasteritza.** El flux de contingut
  de la pàgina queda idèntic byte a byte, de manera que el text sobreviu.
- **pdf-lib i pdf.js conviuen**: el primer edita l'estructura, el segon dibuixa.
  Cadascun fa la meitat que sap fer.
- **JSON: el parser natiu primer.** Quan falla, un escàner propi recorre el text
  per dir línia, columna i motiu, perquè V8 ja no dóna la posició.
- **Mai un fitxer pitjor.** Si el resultat és més gros que l'original, es torna
  l'original amb una nota que ho explica.

## Límits coneguts

- **El compressor de PDF deixa intactes** les imatges amb màscara de
  transparència, CMYK, JPEG 2000, CCITT, mapes d'un sol bit i els fluxos Flate
  amb predictor o paleta. Ho diu al costat del resultat.
- **Els PDF xifrats** s'obren amb `ignoreEncryption`, cosa que val per als que
  només tenen restriccions de permisos, no per als que demanen contrasenya.
- **pdf.js va sense cmaps** (1,1 MB en 169 fitxers): el text CJK no es
  renderitzarà bé. Afegir-los és una línia a `scripts/vendor.mjs`.
- **El detall que ve de fora no es tradueix.** La nostra frase sí («No s'ha
  pogut llegir la imatge…»), però el motiu que hi afegeix el navegador o la
  llibreria es cita tal com arriba, en anglès. Inventar-ne una traducció seria
  pitjor que citar-lo.
- **L'OCR no llegeix escriptura a mà** i el retall de fons falla amb escenes
  sense un subjecte clar. Tots dos avisen quan no hi ha l'extra baixat.
- **Tot passa en memòria**, així que un PDF de centenars de MB pot fer petar la
  pestanya.

## Llicència

MIT, al fitxer `LICENSE`. El contingut de `vendor/` és codi de tercers
redistribuït sense modificar sota les seves pròpies llicències, reproduïdes a
`vendor/LICENSES.md`. Les tipografies d'`assets/fonts/` són SIL Open Font
License 1.1; el text és a `assets/fonts/LICENSE.txt`.

## Per on continuar

- Més pàgines de conversió: el cost marginal és una línia i una frase.
- Una imatge Open Graph per pàgina, generada al mateix pas de build.
- `pdf.js` amb cmaps si mai cal CJK.
