// Prose for the generated pages. Only `scripts/build-pages.mjs` imports this,
// so none of it ships to the browser. Keyed by tool id (and by variant slug for
// the format-pair pages).
//
// Every page needs its own words: forty identical pages with a swapped noun are
// worth less than none. Keep answers factual and specific to the tool.

export const SITE = {
  name: 'WebTools',
  lang: 'ca',
  url: 'https://webtools.example',
  tagline: 'Converteix, comprimeix i inspecciona — sense pujar res',
  description: 'Converteix i comprimeix imatges, SVG i PDF, i treballa amb JSON, CSV, YAML i text. Tot s’executa al teu navegador: cap fitxer no s’envia a cap servidor.',
};

export const HOME = {
  h1: 'Converteix, comprimeix i inspecciona — sense pujar res',
  lead: 'Imatges, SVG, PDF, JSON, CSV i text. Totes les eines s’executen dins del teu navegador: els fitxers no surten de l’ordinador i no hi ha límits de mida ni cues.',
  body: [
    'La majoria de convertidors en línia funcionen igual: puges el fitxer, un servidor el processa i te’l tornes a baixar. Això vol dir esperar la pujada, confiar en qui guarda el fitxer i acceptar els límits de mida que imposi el servei.',
    'Aquí no passa res d’això. El navegador ja sap descodificar i codificar PNG, JPEG i WebP, i la resta arriba en forma de llibreries que es carreguen dins de la pàgina. El fitxer no viatja enlloc: s’obre, es processa i es desa des de la mateixa pestanya. Pots fins i tot desconnectar la xarxa un cop carregada l’eina.',
  ],
};

// Format facts, reused to compose the conversion-pair pages.
export const FORMATS = {
  png: {
    name: 'PNG',
    lossless: true,
    alpha: true,
    // Each blurb carries its own article: the sentence is `${name} és ${blurb}`.
    blurb: 'un format sense pèrdua amb transparència, ideal per a captures, logotips i dibuixos amb àrees planes de color',
    weak: 'pesa molt amb fotografies, perquè no aprofita que l’ull no distingeix els detalls fins',
  },
  jpeg: {
    name: 'JPEG',
    lossless: false,
    alpha: false,
    blurb: 'el format fotogràfic de tota la vida, amb compressió amb pèrdua i suport universal',
    weak: 'no té transparència i es degrada una mica cada vegada que es torna a desar',
  },
  webp: {
    name: 'WebP',
    lossless: false,
    alpha: true,
    blurb: 'el format recomanat per al web des del 2020: transparència, modes amb i sense pèrdua, i un 25-35 % menys de pes que un JPEG equivalent',
    weak: 'els programes d’escriptori antics encara no sempre l’obren',
  },
  avif: {
    name: 'AVIF',
    lossless: false,
    alpha: true,
    blurb: 'el més petit dels quatre a igualtat de qualitat, sovint la meitat que un JPEG',
    weak: 'codificar-lo és lent i el suport fora del navegador encara és desigual',
  },
};

// Hand-written angle per pair: the one sentence that makes each page its own.
export const PAIR_ANGLES = {
  'png-a-webp': 'És la conversió que més pesa a la butxaca: un PNG de captura de pantalla passa habitualment d’un megabyte llarg a unes poques desenes de kilobytes, i la transparència es manté intacta.',
  'jpg-a-webp': 'Recomprimir un JPEG mai és gratis, però WebP és prou més eficient perquè el balanç surti a favor: a la mateixa qualitat percebuda el fitxer sol quedar un terç més petit.',
  'png-a-jpg': 'Té sentit quan el PNG conté en realitat una fotografia. Recorda que JPEG no té canal alfa: tot el que sigui transparent quedarà pintat del color de fons que triïs.',
  'jpg-a-png': 'Convertir cap a PNG no recupera res del que el JPEG ja va perdre i gairebé sempre engreixa el fitxer. Serveix quan un programa concret només accepta PNG, no per guanyar qualitat.',
  'webp-a-png': 'El camí de tornada per a programes d’edició antics que encara no obren WebP. El resultat és sense pèrdua respecte del WebP d’entrada, però pesarà bastant més.',
  'webp-a-jpg': 'Útil quan cal enviar la imatge a un sistema que només empassa JPEG. Si el WebP tenia transparència, es fon amb el color de fons abans de codificar.',
  'png-a-avif': 'AVIF exprimeix els PNG fotogràfics més que cap altre format d’aquesta llista, a canvi d’uns quants segons de càlcul per imatge.',
  'jpg-a-avif': 'Per a galeries de fotos que ja tens en JPEG, AVIF sol retallar la meitat del pes. Val la pena servir-lo amb una alternativa WebP amb <picture>.',
  'avif-a-png': 'Perquè programes que encara no llegeixen AVIF puguin obrir la imatge. El PNG resultant serà molt més gros: és el preu de tornar a un format sense pèrdua.',
  'avif-a-jpg': 'La sortida de compatibilitat quan un sistema antic no entén AVIF i tampoc et convé un PNG enorme.',
};

export const VARIANT_PAGES = {
  'comprimir-png': {
    intro: [
      'PNG comprimeix sense pèrdua, i això vol dir que hi ha un terra per sota del qual no pot baixar: si la imatge té degradats o soroll fotogràfic, el fitxer serà gros i no hi ha gaire res a fer sense canviar de format.',
      'Per això aquesta pàgina està configurada per treure un WebP. Conserva la transparència igual que el PNG, i per a una captura de pantalla típica el resultat acostuma a ser entre deu i trenta vegades més lleuger. Si necessites que la sortida continuï sent PNG, canvia el format a «Mantén l’original»: el guany serà molt més modest.',
    ],
    faq: [
      { q: 'Per què el meu PNG amb prou feines baixa de pes si trio «Mantén l’original»?', a: 'Perquè el PNG ja estava comprimit i aquesta eina el torna a codificar amb el mateix algorisme sense pèrdua. Recodificar un format sense pèrdua no inventa espai: el que fa baixar el pes de debò és canviar a WebP o reduir la mida en píxels.' },
      { q: 'Un WebP sense pèrdua és igual de bo que el PNG?', a: 'És idèntic píxel a píxel i, de mitjana, un 26 % més petit. La diferència és el suport: tots els navegadors l’obren, però alguns programes d’escriptori antics encara no.' },
      { q: 'Com puc baixar molt el pes sense canviar de format?', a: 'Reduint la mida en píxels. Una captura de 3000 px d’amplada que es mostrarà a 800 px té nou vegades més píxels dels necessaris: fixa l’amplada màxima i el fitxer cau en picat.' },
    ],
  },
  'comprimir-jpg': {
    intro: [
      'Aquesta pàgina recodifica JPEG a JPEG, que és el que necessites quan el destí no admet res més: un gestor de continguts antic, una plataforma que només accepta fotos o un client que demana explícitament .jpg.',
      'Tingues present que cada recompressió acumula pèrdua. Parteix sempre de l’original de la càmera, no d’una còpia que ja hagi passat per WhatsApp o per un altre compressor.',
    ],
    faq: [
      { q: 'Quina qualitat hauria de posar?', a: 'Entre 75 i 85 és on gairebé ningú distingeix el resultat de l’original en una pantalla. Per sota de 60 comencen a aparèixer blocs visibles als degradats i al voltant del text.' },
      { q: 'Puc dir directament quant vull que pesi?', a: 'Sí. Canvia l’objectiu a «Mida màxima del fitxer» i posa-hi els kilobytes. La pàgina prova diverses qualitats fins a trobar la més alta que hi encaixa, i si cal també redueix la imatge.' },
      { q: 'Es conserven les dades EXIF?', a: 'No. La recodificació passa per un llenç del navegador, que només treballa amb píxels, de manera que la data, el model de càmera i les coordenades GPS desapareixen pel camí.' },
    ],
  },
  'jpg-a-pdf': {
    intro: [
      'Ajunta fotografies JPEG en un sol PDF, una per pàgina i en l’ordre que vulguis. És el camí ràpid per convertir fotos de documents fetes amb el mòbil en un fitxer únic que es pugui enviar o imprimir.',
      'Els JPEG s’incrusten tal qual, sense recodificar, així que el PDF no perd qualitat respecte de les fotos originals i es genera de pressa.',
    ],
    faq: [
      { q: 'En quin ordre surten les pàgines?', a: 'En l’ordre en què apareixen a la llista, que és el de selecció. Si tries els fitxers des del diàleg del sistema, l’ordre sol ser l’alfabètic dels noms.' },
      { q: 'Com faig que totes les pàgines siguin A4?', a: 'Canvia la mida de pàgina a A4. Cada foto s’escalarà per encabir-s’hi sencera, centrada i mantenint la proporció, amb el marge que hi indiquis.' },
      { q: 'Puc barrejar-hi imatges verticals i apaïsades?', a: 'Sí. Amb l’orientació en «Segons la imatge», cada pàgina agafa la del seu contingut, de manera que les fotos apaïsades no queden petites enmig d’un full vertical.' },
    ],
  },
  'png-a-pdf': {
    intro: [
      'Converteix captures de pantalla, dibuixos i diagrames en PNG a un PDF amb una imatge per pàgina. Va bé per lliurar un joc de captures com un sol document, o per imprimir una sèrie de làmines.',
      'A diferència dels JPEG, els PNG es tornen a comprimir en incrustar-los al PDF, de manera que el resultat sol pesar menys que la suma dels originals.',
    ],
    faq: [
      { q: 'Es manté la transparència?', a: 'El PDF pinta les zones transparents de blanc, que és el que veuràs en imprimir. Si necessites conservar el canal alfa, deixa les imatges en PNG.' },
      { q: 'La captura surt borrosa en imprimir, per què?', a: 'Perquè un PNG de pantalla té pocs píxels per a la mida de paper. Amb la mida de pàgina «La de cada imatge» el PDF conserva la resolució original en comptes d’estirar-la fins a un A4.' },
      { q: 'Puc afegir-hi marges?', a: 'Sí, sempre que triïs una mida de pàgina fixa. El marge es mesura en mil·límetres i s’aplica per igual als quatre costats.' },
    ],
  },
};

export const PAGES = {
  // ------------------------------------------------------------------ imatge
  'image-convert': {
    intro: [
      'Converteix PNG, JPG, WebP i AVIF en qualsevol direcció, d’un en un o cinquanta de cop. La descodificació i la codificació les fa el mateix navegador, de manera que les imatges no es pugen enlloc i la conversió és pràcticament instantània.',
      'Cada format té la seva feina: PNG per a gràfics amb àrees planes de color, JPEG per a compatibilitat màxima, WebP com a opció per defecte al web i AVIF quan el pes importa més que el temps de càlcul.',
    ],
    steps: [
      'Arrossega les imatges a la zona de dalt, o fes clic per triar-les.',
      'Tria el format de destinació i, si en té, ajusta la qualitat.',
      'Prem «Processa» i baixa els resultats d’un en un o tots junts en un ZIP.',
    ],
    faq: [
      { q: 'Quin format hauria de fer servir al web?', a: 'WebP en gairebé tots els casos. El suporten tots els navegadors des del 2020 i pesa entre un 25 i un 35 % menys que un JPEG de qualitat equivalent. AVIF encara és més petit, però triga molt més a codificar-se.' },
      { q: 'Es perd qualitat en convertir?', a: 'Depèn del destí. PNG i WebP sense pèrdua conserven el píxel exacte. JPEG, WebP normal i AVIF recomprimeixen, i la pèrdua s’acumula: converteix sempre des de l’original, no des d’una còpia ja comprimida.' },
      { q: 'Què passa amb la transparència?', a: 'PNG, WebP i AVIF la conserven. JPEG no en té, així que el canal alfa es fon amb el color de fons que triïs abans de codificar.' },
      { q: 'Hi ha límit de mida o de nombre de fitxers?', a: 'No n’hi ha cap d’artificial. L’únic límit és la memòria de la pestanya, perquè les imatges es descodifiquen senceres. Amb fitxers molt grossos convé processar-los en tandes.' },
    ],
  },

  'image-compress': {
    intro: [
      'Redueix el pes de les imatges de dues maneres. Pots fixar una qualitat i veure què surt, o bé dir quant ha de pesar el fitxer com a màxim i deixar que la pàgina hi arribi sola.',
      'El segon mode fa una cerca binària sobre la qualitat fins a trobar la més alta que encaixa dins del pressupost i, si ni amb la qualitat més baixa raonable hi cap, va reduint la mida en píxels en passos del 20 % fins a aconseguir-ho.',
    ],
    steps: [
      'Deixa-hi les imatges que vols aprimar.',
      'Tria si vols fixar la qualitat o un pes màxim en kilobytes.',
      'Comprova la columna del percentatge estalviat i baixa el que et convenci.',
    ],
    faq: [
      { q: 'Quina qualitat és prou bona?', a: 'Entre 75 i 85 en WebP és on la majoria de gent no distingeix el resultat de l’original. Per sota de 60 apareixen artefactes visibles als degradats i als contorns del text.' },
      { q: 'Per què el pes màxim que demano no s’omple del tot?', a: 'Perquè la cerca no puja de qualitat 95. Per sobre d’aquest punt el fitxer creix molt de pressa sense cap millora que es vegi, així que si a 95 ja hi caps, es queda allà.' },
      { q: 'Puc comprimir sense canviar de format?', a: 'Sí, tria «Mantén l’original». Amb JPEG i WebP funciona bé; amb PNG el guany és petit, perquè és un format sense pèrdua i recodificar-lo no allibera gaire espai.' },
      { q: 'Què fa l’amplada màxima?', a: 'Redueix la imatge abans de comprimir-la. Sol ser la palanca més efectiva de totes: servir una foto de 4000 px en un lloc que la mostra a 800 px malgasta el 96 % dels píxels.' },
    ],
  },

  'image-resize': {
    intro: [
      'Canvia la mida de les imatges indicant amplada, alçada o totes dues. Si només omples una de les dues caselles, l’altra es calcula sola per mantenir la proporció.',
      'Quan hi poses les dues mides pots decidir què passa amb la diferència de proporció: encabir la imatge sencera a dins, omplir el rectangle retallant el que sobra, o deformar-la fins a la mida exacta.',
    ],
    steps: [
      'Afegeix-hi les imatges.',
      'Escriu l’amplada, l’alçada o totes dues, i tria com vols que s’ajustin.',
      'Processa i descarrega.',
    ],
    faq: [
      { q: 'Per què no s’amplien les imatges petites?', a: 'Perquè hi ha activada l’opció de no ampliar. Ampliar no afegeix detall, només interpola píxels i el resultat surt tou. Desactiva-la si de debò necessites la mida més gran.' },
      { q: 'Quina diferència hi ha entre «cap a dins» i «omple i retalla»?', a: '«Cap a dins» encabeix la imatge sencera dins de les mides que dones, de manera que el resultat pot ser més petit en un dels costats. «Omple i retalla» cobreix tot el rectangle i talla el sobrant pels costats.' },
      { q: 'Es veurà borrós?', a: 'L’escalat fa servir el filtre de qualitat alta del navegador, que va bé per reduir. Per a reduccions molt agressives, fer dues passes (per exemple a la meitat i després a la mida final) de vegades conserva més nitidesa.' },
    ],
  },

  'image-crop': {
    intro: [
      'Dibuixa el retall amb el ratolí damunt de la imatge, amb la graella dels terços a sobre i les mides en píxels actualitzant-se mentre arrossegues. Pots partir de zero fent un rectangle nou, moure el que hi ha o estirar-ne les cantonades.',
      'La gràcia, però, és el lot: si carregues vint fotos i deixes marcada la casella, el mateix retall relatiu s’aplica a totes. Com que es guarda en proporcions i no en píxels, funciona encara que les imatges no facin la mateixa mida.',
    ],
    steps: [
      'Arrossega-hi les imatges; la primera apareix a l’àrea de treball.',
      'Dibuixa o ajusta el rectangle, i si en necessites una de concreta, fixa la relació d’aspecte.',
      'Prem «Retalla» i baixa el resultat, en ZIP si n’hi ha més d’una.',
    ],
    faq: [
      { q: 'Com fixo un quadrat perfecte?', a: 'Tria 1:1 a la relació d’aspecte. A partir d’aquell moment el rectangle manté la proporció mentre l’estires, i el que ja hi havia s’hi ajusta conservant-ne el centre.' },
      { q: 'Les meves fotos no fan la mateixa mida, funciona igual?', a: 'Sí. El retall es guarda com a fracció de cada imatge, de manera que «el terç central» és el terç central de cadascuna, no un rectangle de píxels que en unes quedaria fora.' },
      { q: 'Puc retallar-ne una de diferent de la resta?', a: 'Desmarca «Aplica el mateix retall a totes» i es retallarà només la que tens seleccionada a la tira de miniatures.' },
      { q: 'Es perd qualitat en retallar?', a: 'El retall en si no en perd cap. El que pot fer-ho és tornar a codificar: deixa «Mantén l’original» amb una qualitat alta si l’origen era PNG o un JPEG bo.' },
    ],
  },

  'image-rotate': {
    intro: [
      'Gira imatges de 90 en 90 graus i reflecteix-les horitzontalment o verticalment. Les dues coses es poden combinar en una sola passada.',
      'A diferència de girar des del visor de fotos del sistema, aquí la rotació s’aplica als píxels de debò, no a una etiqueta d’orientació que després cada programa interpreta com vol.',
    ],
    steps: [
      'Afegeix-hi les imatges mal orientades.',
      'Tria l’angle i, si cal, el volteig.',
      'Processa i descarrega.',
    ],
    faq: [
      { q: 'Per què les meves fotos ja surten dretes abans de girar-les?', a: 'Perquè la pàgina llegeix l’orientació EXIF de la càmera i l’aplica en obrir la imatge. El que veus a la miniatura és, doncs, com es veurà a tot arreu.' },
      { q: 'Es perd qualitat en girar?', a: 'Girar múltiples de 90 graus només reorganitza píxels, així que no. La pèrdua, si n’hi ha, ve de tornar a codificar en un format amb pèrdua; tria PNG o una qualitat alta per evitar-la.' },
      { q: 'Puc girar-ne un angle qualsevol?', a: 'No. Els angles lliures obliguen a interpolar i a decidir què fer amb les cantonades buides, i això demana una previsualització que aquesta eina no té.' },
    ],
  },

  'image-strip': {
    intro: [
      'Les fotos fetes amb el mòbil porten amagades la data, el model del telèfon, la configuració de la càmera i, sovint, les coordenades GPS exactes del lloc on es van fer. Res d’això es veu en obrir la imatge, però hi és, i viatja amb el fitxer.',
      'Aquesta eina torna a codificar la imatge a partir dels píxels nus, de manera que al fitxer resultant no hi queda cap metadada. L’orientació EXIF s’aplica abans de descartar-la, perquè la foto no surti tombada un cop treta.',
    ],
    steps: [
      'Afegeix-hi les fotos que vulguis netejar.',
      'Deixa la qualitat alta si vols que el resultat sigui visualment idèntic.',
      'Processa i baixa els fitxers nets.',
    ],
    faq: [
      { q: 'Realment desapareixen les coordenades GPS?', a: 'Sí. El fitxer nou es construeix des de zero a partir de la matriu de píxels, i cap dels camps EXIF, IPTC o XMP de l’original s’hi copia.' },
      { q: 'També es treu el perfil de color?', a: 'Sí, i és la contrapartida a tenir en compte. Si la foto portava un perfil ampli com el Display P3, el resultat s’interpretarà com a sRGB i els colors molt saturats poden quedar lleugerament diferents.' },
      { q: 'Canviarà el pes del fitxer?', a: 'Una mica, en qualsevol direcció. Es perden uns quants kilobytes de metadades, però la recodificació pot no coincidir exactament amb la de la càmera. Amb qualitat 95 la diferència visual és nul·la.' },
    ],
  },

  // ------------------------------------------------------------------ vector
  'svg-optimize': {
    intro: [
      'Els SVG que surten d’Illustrator, Figma o Inkscape arrosseguen molta cosa que el navegador no necessita: comentaris de l’editor, blocs de metadades, atributs propietaris, identificadors generats i coordenades amb dotze decimals.',
      'Aquesta pàgina hi passa SVGO amb la configuració per defecte més unes quantes opcions que val la pena poder tocar. En icones exportades d’un editor és habitual retallar entre el 40 i el 70 % del pes sense que canviï ni un píxel del dibuix.',
    ],
    steps: [
      'Arrossega-hi els SVG, tants com vulguis.',
      'Ajusta els decimals dels camins si necessites més o menys precisió.',
      'Processa i mira quant ha baixat cadascun abans de descarregar.',
    ],
    faq: [
      { q: 'Quants decimals he de deixar als camins?', a: 'Tres va bé per a gairebé tot. Amb icones petites pots baixar a un o dos i estalviar encara més; si el dibuix té corbes llargues i suaus, baixar-hi massa pot fer aparèixer angles visibles.' },
      { q: 'Per què hi ha l’opció de treure width i height?', a: 'Perquè una icona que ha d’escalar amb CSS va millor només amb viewBox: sense mides fixes, ocupa el que li digui el contenidor. Si en canvi inserixes l’SVG solt en una pàgina, deixa-les.' },
      { q: 'Què fa el prefix dels identificadors?', a: 'Hi afegeix el nom del fitxer al davant. Si poses diversos SVG a la mateixa pàgina i tots tenen un degradat anomenat "a", es trepitgen entre ells; amb el prefix, cadascun manté el seu.' },
      { q: 'Es pot desfer?', a: 'No des d’aquí, així que conserva els originals. L’optimització no és destructiva per al dibuix, però sí per a l’estructura editable amb què treballa el teu programa de disseny.' },
    ],
  },

  'svg-to-png': {
    intro: [
      'Rasteritza un SVG a la mida que necessitis. Com que l’origen és vectorial, pots demanar-ne qualsevol resolució sense que es vegi pixelat: la mateixa icona serveix per a un favicon de 32 px i per a un cartell de 4000.',
      'La mida es pot donar en píxels o com a multiplicador del viewBox, que és el més còmode per treure versions @2x i @3x d’un joc d’icones sencer d’una sola passada.',
    ],
    steps: [
      'Afegeix-hi els SVG.',
      'Indica una amplada en píxels, o deixa-la a zero i fes servir l’escala.',
      'Tria si vols fons transparent i processa.',
    ],
    faq: [
      { q: 'Per què em surt de 300×150?', a: 'És la mida per defecte que el navegador assigna a un SVG sense width, height ni viewBox. Afegeix un viewBox al fitxer, o indica aquí una amplada explícita.' },
      { q: 'No es veuen les lletres, què passa?', a: 'Un SVG rasteritzat dins d’una pàgina no pot carregar tipografies externes ni fitxers de fora. Converteix els textos a corbes des del teu editor abans d’exportar l’SVG.' },
      { q: 'Puc treure’n un WebP en comptes de PNG?', a: 'Sí, el selector de format ofereix PNG, WebP i JPEG. Per a icones amb transparència, PNG i WebP; per a il·lustracions amb fons sòlid, WebP pesa molt menys.' },
    ],
  },

  'svg-to-pdf': {
    intro: [
      'Un SVG és un dibuix, no un document: si el vols enviar a impremta, adjuntar a un correu o firmar, el que et demanaran és un PDF. Això en fa un d’una pàgina, amb la pàgina exactament a la mida del dibuix.',
      'La conversió rasteritza. Traduïr un SVG a instruccions de pintura d’un PDF —gradients, màscares, retallats, text amb tipografia— seria escriure un motor de renderitzat sencer dins del navegador, i el resultat encara seria pitjor en els casos rars. Així que el dibuix entra com a imatge a la resolució que demanis, i la pàgina queda a la mida bona en punts.',
    ],
    steps: [
      'Deixa-hi els SVG.',
      'Tria la resolució: 150 ppp per a pantalla, 300 per imprimir.',
      'Digues si el fons ha de ser transparent i processa.',
    ],
    faq: [
      { q: 'El text del PDF es podrà seleccionar?', a: 'No. El dibuix hi entra com a imatge, o sigui que el text que hi hagi dins de l’SVG deixa de ser text. Si el que vols és un PDF amb text de veritat, exporta’l des del programa on has fet el dibuix.' },
      { q: 'Quina resolució he de posar?', a: '150 ppp va bé per a qualsevol cosa que es miri en pantalla. Per imprimir, 300. Per sobre de 300 el fitxer creix de pressa i gairebé ningú no en veurà la diferència.' },
      { q: 'Per què la pàgina no és A4?', a: 'Perquè un logotip de 200×80 px dins d’un A4 és sobretot paper buit. La pàgina surt de la mida del dibuix; si el necessites en A4, col·loca’l des del programa de maquetació.' },
    ],
  },

  'svg-to-css': {
    intro: [
      'Una icona petita dins del full d’estil s’estalvia una petició sencera, i sobretot s’estalvia el moment en què la pàgina ja es veu però les icones encara no hi són. Això et torna l’SVG ja embolicat en la regla que has d’enganxar.',
      'La codificació és amb percentatges, no amb base64. Un SVG és text: passar-lo a base64 l’engreixa un terç llarg a canvi de res. Només s’escapen els caractèrs que trencarien un url(), així que el resultat queda curt i encara es pot llegir.',
    ],
    steps: [
      'Afegeix-hi les icones.',
      'Tria si vols una regla, una variable CSS, una etiqueta <img> o només el data URI.',
      'Processa i enganxa el resultat al teu full d’estil.',
    ],
    faq: [
      { q: 'Quan val la pena i quan no?', a: 'Per sota d’uns 3 kB gairebé sempre sí. Per sobre, el data URI viatja dins del CSS a cada càrrega i ja no es pot cachejar per separat: un fitxer a part surt més a compte.' },
      { q: 'Puc canviar-ne el color des del CSS?', a: 'Només el que sigui fons o màscara. Un data URI dins de background-image és una imatge i currentColor no hi arriba. Si el vols pintar amb CSS, fes servir un sprite amb <use>, o mask-image.' },
      { q: 'Per què les cometes són simples a dins?', a: 'Perquè la regla les fa servir dobles per fora. Canviar les de dins és la manera més curta de no haver d’escapar res més.' },
    ],
  },

  'svg-sprite': {
    intro: [
      'Vint icones són vint peticions, i al navegador cadascuna li costa més del que pesa. Un sprite les posa totes en un sol fitxer com a <symbol>, i després cada una es fa servir amb <use href="#icona-fletxa">.',
      'De passada, si deixes marcada l’opció de currentColor, els colors de dins desapareixen i el color el decideix el CSS que les mostri: la mateixa icona serveix per a un botó clar i per a un de fosc sense duplicar-la.',
    ],
    steps: [
      'Deixa-hi totes les icones alhora.',
      'Posa-hi un prefix si vols que els identificadors no xoquin amb res.',
      'Processa: en surt un sol sprite.svg.',
    ],
    faq: [
      { q: 'Com el faig servir?', a: 'Enganxa el contingut al principi del <body> i després crida cada icona amb <svg><use href="#el-seu-id"></use></svg>. Si el deixes com a fitxer a part, la referència ha de ser sprite.svg#el-seu-id.' },
      { q: 'D’on surten els identificadors?', a: 'Del nom de cada fitxer, en minúscules i amb guions, amb el prefix al davant. Si dos fitxers acaben amb el mateix nom, al segon se li afegeix un número.' },
      { q: 'Per què les meves icones surten negres?', a: 'Perquè amb currentColor marcat hereten el color del text. Posa-hi un color al CSS de qui les fa servir, o desmarca l’opció per conservar els colors originals.' },
    ],
  },

  'svg-recolour': {
    intro: [
      'Un joc d’icones descarregat mai no ve del color que et va bé. Obrir-les d’una en una per canviar un #000000 és la mena de feina que hauria de fer una màquina.',
      'Es poden canviar tots els colors a un de sol, només un color concret, o tots a currentColor perquè el decideixi el CSS. Es miren els atributs i també el que hi hagi dins d’un style=””, que és on els deixen bona part dels exportadors.',
    ],
    steps: [
      'Deixa-hi el joc d’icones sencer.',
      'Tria si canvies tots els colors, només un, o els passes a currentColor.',
      'Tria el color nou i processa.',
    ],
    faq: [
      { q: 'Què és currentColor?', a: 'És dir-li a l’SVG que agafi el color del text de l’element que el conté. Així la icona canvia de color sola quan canvia el botó on viu, sense haver-ne de guardar una versió per color.' },
      { q: 'No m’ha canviat res, per què?', a: 'Segurament el fitxer no té cap color escrit: un SVG sense fill es pinta de negre per defecte. En aquest cas et tornem l’original amb un avís, en comptes de fer veure que s’ha fet alguna cosa.' },
      { q: 'Toca els colors que hi ha dins d’un <style>?', a: 'No. Per a això caldria entendre CSS de debo, i és més honest deixar-ho al cercar-i-substituir del teu editor que endevinar-ho a mitges.' },
    ],
  },

  ocr: {
    intro: [
      'Un escaneig o una foto d’un document són una imatge: el text que hi veus no es pot seleccionar, ni cercar, ni copiar. L’OCR el reconeix i te’l torna com a text de veritat.',
      'Pots demanar-ne un fitxer de text pla o, millor encara, un PDF cercable: la mateixa imatge de sempre, amb una capa de text invisible a sota. Es veu exactament igual, però ara el pots cercar i copiar-ne fragments.',
      'El reconeixement el fa Tesseract compilat a WebAssembly, corrent dins de la pestanya. Un contracte o una factura escanejada no s’envia a cap servei per llegir-la, que amb aquesta mena de documents no és un detall menor.',
    ],
    steps: [
      'Deixa-hi l’escaneig, la foto o el PDF.',
      'Tria l’idioma del document: encertar-lo canvia molt el resultat.',
      'Decideix si vols text pla o un PDF cercable, i processa.',
    ],
    faq: [
      { q: 'Per què he de dir l’idioma?', a: 'Perquè el reconeixement no va lletra a lletra: fa servir un model del llenguatge per decidir entre lectures possibles. Amb l’idioma equivocat, «paraula» pot acabar sent «parauIa».' },
      { q: 'Puc marcar-ne dos alhora?', a: 'Sí, per a documents bilingües. Té un cost: cada idioma afegit fa la feina més lenta i afegeix alguna confusió, així que no els posis tots per si de cas.' },
      { q: 'El resultat té errors, què puc fer?', a: 'L’OCR depèn sobretot de la qualitat de l’original. Puja la resolució a 300 ppp, endreça la imatge si està torta i mira que el contrast sigui bo. Un escaneig gris i tort no el salva cap motor.' },
      { q: 'Què és exactament un PDF cercable?', a: 'El document original amb el text reconegut posat a sobre en tinta invisible, alineat amb les paraules de la imatge. El lector el pot cercar i seleccionar; tu continues veient l’escaneig.' },
      { q: 'Reconeix escriptura a mà?', a: 'Pràcticament no. Tesseract està entrenat amb text imprès; amb lletra manuscrita els resultats no són aprofitables.' },
    ],
  },

  'remove-background': {
    intro: [
      'Retalla el subjecte d’una fotografia i deixa el fons transparent, o canvia’l per un color sòlid. Va bé per a fotos de producte, retrats i qualsevol imatge que hagi d’anar damunt d’un altre disseny.',
      'Ho fa una xarxa neuronal (u2netp) que s’executa al teu ordinador amb ONNX Runtime compilat a WebAssembly. El model pesa 4,4 MB i es baixa un cop; a partir d’aquí la foto no surt de la pestanya.',
      'No esperis el resultat d’una hora de feina amb màscares a Photoshop. Sí que hauries d’esperar un retall net i utilitzable en pocs segons, que per a la majoria de casos és exactament el que calia.',
    ],
    steps: [
      'Arrossega-hi les fotos.',
      'Tria si el fons queda transparent o d’un color.',
      'Vora suau per a cabells i pelatge; vora neta per a objectes amb contorn definit.',
    ],
    faq: [
      { q: 'Quan funciona bé i quan no?', a: 'Molt bé amb un subjecte clar sobre un fons diferenciat: persones, productes, animals. Pitjor amb escenes on no hi ha cap protagonista evident, amb objectes molt fins o quan el subjecte i el fons tenen el mateix color.' },
      { q: 'Quina diferència hi ha entre vora suau i vora neta?', a: 'La suau conserva la transparència parcial de les vores, que és el que fa que els cabells no quedin com una silueta retallada amb tisores. La neta decideix per a cada píxel si hi és o no, i va millor amb objectes de contorn dur.' },
      { q: 'Es puja la foto a algun servidor?', a: 'No. El model és un fitxer estàtic que es baixa com qualsevol altre recurs de la pàgina; la inferència passa dins del navegador.' },
      { q: 'Per què el primer cop triga tant?', a: 'Perquè s’ha de baixar i compilar el motor d’inferència i el model. A partir de la segona imatge ja està tot a la memòria i va molt més de pressa.' },
      { q: 'Puc fer-ne moltes de cop?', a: 'Sí, però es processen d’una en una: el model ocupa prou memòria perquè fer-les en paral·lel no compensi.' },
    ],
  },

  // --------------------------------------------------------------------- pdf
  'pdf-compress': {
    intro: [
      'En un PDF escanejat o fet de fotografies, gairebé tot el pes són les imatges de dins. Aquesta eina les busca una per una, les torna a codificar més petites i les torna a posar al seu lloc, sense tocar res més del document.',
      'Això és el que la separa de la majoria de compressors en línia, que aplanen cada pàgina en una fotografia: aquí el text continua sent text que es pot seleccionar i cercar, els enllaços segueixen funcionant i l’estructura es manté. En un escaneig típic la reducció va del 60 al 90 %.',
      'Les imatges que no es poden recodificar amb garanties —màscares de transparència, JPEG 2000, CMYK, mapes de bits d’un sol bit— es deixen exactament com estaven. Una imatge malmesa en silenci seria molt pitjor que un fitxer que no ha aprimat tant.',
    ],
    steps: [
      'Deixa-hi el PDF, o uns quants.',
      'Tria una qualitat, o digues directament quant vols que pesi com a màxim.',
      'Baixa el resultat i comprova’l abans de llençar l’original.',
    ],
    faq: [
      { q: 'Es perd el text seleccionable?', a: 'No. Només es reemplacen les imatges incrustades; la capa de text, els marcadors i els enllaços no es toquen. Si el PDF és un escaneig sense OCR, és que ja no en tenia abans.' },
      { q: 'Quan hauria de fer servir el mode que rasteritza?', a: 'Quan el pes importi més que tota la resta. Redibuixa cada pàgina com una fotografia: baixa moltíssim, però el text deixa de poder-se seleccionar i cercar, i ja no hi ha marxa enrere. Prova primer el mode normal.' },
      { q: 'El meu PDF amb prou feines baixa de pes, per què?', a: 'Perquè el pes no és a les imatges. Un document de text i vectors fet des d’un processador de textos ja és compacte: no hi ha res a esprémer, i l’eina t’ho diu al costat del resultat.' },
      { q: 'Què fa l’amplada màxima?', a: 'Redimensiona les imatges abans de comprimir-les, i sol ser la palanca més forta de totes. Un escàner a 600 ppp genera imatges de 5000 px que cap pantalla ni cap impressora domèstica aprofitarà; amb 1600 px un A4 s’imprimeix bé.' },
      { q: 'Serveix de res l’escala de grisos?', a: 'Molt, si el document és text escanejat. Treu la informació de color, que en un full blanc amb lletra negra és sobretot soroll del sensor, i el resultat sovint torna a baixar a la meitat.' },
      { q: 'Es puja el document a algun servidor?', a: 'No. Tot passa dins de la pestanya, cosa que importa quan el que comprimeixes és un contracte, una factura o un informe mèdic.' },
    ],
  },
  'pdf-organize': {
    intro: [
      'Les altres eines de PDF et demanen que escriguis «1-3, 7» sobre un document que no veus. Aquesta te’l dibuixa: totes les pàgines en miniatura, per arrossegar-les on toqui, girar-les una per una i treure les que sobren.',
      'Quan tens el resultat a la vista, exportes. El PDF nou es construeix copiant les pàgines originals en l’ordre que hagis deixat, de manera que el text, els enllaços i la qualitat no es toquen.',
    ],
    steps: [
      'Deixa-hi el PDF i espera que es dibuixin les miniatures.',
      'Arrossega les pàgines, gira les tortes i treu les que no vulguis.',
      'Prem «Exporta el PDF».',
    ],
    faq: [
      { q: 'Es pot desfer?', a: 'El botó «Torna a l’original» restaura l’ordre, les rotacions i les pàgines tretes d’una tirada. I mentre no exportis, el fitxer del teu disc no s’ha tocat.' },
      { q: 'Per què triguen a sortir les miniatures?', a: 'Perquè cada pàgina es dibuixa de debò amb el motor de renderització, igual que faria un lector de PDF. Amb documents de moltes pàgines van apareixent a mesura que es generen.' },
      { q: 'Es perd qualitat?', a: 'Cap. Les miniatures són només per mirar; l’exportació copia les pàgines originals sense redibuixar-les.' },
      { q: 'Puc barrejar-hi pàgines de dos PDF?', a: 'Encara no: aquesta eina treballa amb un document. Uneix-los abans amb «Unir PDF» i després organitza el resultat.' },
    ],
  },

  'pdf-to-images': {
    intro: [
      'Converteix cada pàgina d’un PDF en una imatge, a la resolució que li diguis. Va bé per enviar una pàgina per missatgeria, posar-la en una presentació o pujar-la a un lloc que no accepta PDF.',
      'La resolució es demana en punts per polzada, que és la manera de dir-ho que no depèn de la mida del full: 150 ppp es llegeix còmodament en pantalla i 300 és qualitat d’impressió.',
    ],
    steps: [
      'Deixa-hi el PDF.',
      'Tria el format i la resolució, i si vols només unes pàgines.',
      'Processa i baixa-les d’una en una o totes en un ZIP.',
    ],
    faq: [
      { q: 'Quina resolució he de posar?', a: '150 ppp per mirar en pantalla, 300 per imprimir. Per sobre de 300 el fitxer creix molt i la millora és difícil de veure si l’origen és text vectorial.' },
      { q: 'Quin format em convé?', a: 'PNG si la pàgina és text i gràfics, que és el cas habitual i on el JPEG deixa brutícia al voltant de les lletres. JPEG o WebP si la pàgina és sobretot una fotografia.' },
      { q: 'Puc treure el fons blanc?', a: 'Amb PNG sí, marcant la casella de fons transparent. Tingues present que un PDF sol tenir el blanc pintat de debò en moltes pàgines, i llavors no hi ha res a treure.' },
      { q: 'Per què una pàgina molt gran surt més petita del que he demanat?', a: 'Hi ha un límit de píxels per pàgina per no esgotar la memòria de la pestanya. Un A0 a 600 ppp serien mil milions de píxels; en aquest cas es rebaixa l’escala tot just el necessari.' },
    ],
  },

  'pdf-to-text': {
    intro: [
      'Treu el text d’un PDF per copiar-lo, cercar-hi o passar-lo a una altra eina. Llegeix la capa de text que el document ja porta, la mateixa que selecciones amb el ratolí al lector.',
      'Un PDF no guarda paràgrafs: guarda trossos de text amb una posició. Aquí s’agrupen per la seva alçada a la pàgina, que és el que s’acosta més al que llegeixes; qualsevol cosa més llesta que això comença a endevinar columnes i s’equivoca.',
    ],
    steps: ['Deixa-hi el PDF.', 'Tria si vols unir les línies tallades.', 'Baixa el .txt o copia’l.'],
    faq: [
      { q: 'No em treu res, per què?', a: 'Perquè el PDF és un escaneig: pàgines que són fotografies, sense cap capa de text. Per llegir-les caldria OCR, que és una altra cosa i aquesta eina no en fa.' },
      { q: 'Què fa unir les línies tallades?', a: 'Ajunta els salts de línia que només hi són perquè la pàgina s’acabava, i conserva els que separen paràgrafs de debò. Desactiva-ho si vols el text exactament com està maquetat.' },
      { q: 'Respecta les columnes i les taules?', a: 'No gaire. El text surt en l’ordre en què és al document, que en una pàgina a dues columnes sovint no és l’ordre de lectura. Per a taules va millor extreure-les a mà.' },
    ],
  },

  'pdf-extract-images': {
    intro: [
      'Recupera les fotografies i els gràfics que hi ha dins d’un PDF com a fitxers separats. No són captures de pantalla de les pàgines: són les imatges originals, tal com es van incrustar.',
      'Amb l’opció «tal com estan al PDF», les fotografies en JPEG surten byte a byte com hi són, sense passar per cap recodificació. La resta es redibuixen, perquè el seu format intern no és un fitxer d’imatge que es pugui desar tal qual.',
    ],
    steps: [
      'Deixa-hi el PDF.',
      'Puja l’amplada mínima si no vols icones ni línies decoratives.',
      'Processa i baixa-les en un ZIP.',
    ],
    faq: [
      { q: 'Per què en surten menys de les que veig?', a: 'Dues raons. El filtre d’amplada mínima en descarta les petites, i les imatges en formats que no es poden llegir amb garanties —JPEG 2000, CMYK, alguns mapes de bits— es deixen estar en comptes d’arriscar-se a desar-les malmeses.' },
      { q: 'Surten a la resolució original?', a: 'Sí. El que s’extreu és la imatge tal com és al document, que sovint té molta més resolució de la que es veu impresa a la pàgina.' },
      { q: 'I si el que vull són les pàgines senceres?', a: 'Llavors el que busques és «PDF a imatges», que dibuixa cada pàgina completa amb el text i tot.' },
    ],
  },

  'pdf-merge': {
    intro: [
      'Ajunta diversos PDF en un de sol conservant-ne les pàgines tal com estan: el text continua sent text seleccionable, els enllaços interns segueixen funcionant i no hi ha cap recodificació pel mig.',
      'L’ordre és el de la llista, que és el de selecció, però també pots demanar que s’ordenin pel nom del fitxer, que és el que sol convenir quan els documents es diuen 01, 02, 03.',
    ],
    steps: [
      'Arrossega-hi tots els PDF que vulguis unir.',
      'Comprova l’ordre, o passa a ordenació per nom.',
      'Prem «Combina» i descarrega el document resultant.',
    ],
    faq: [
      { q: 'Es perd qualitat?', a: 'Gens. Les pàgines es copien senceres d’un document a l’altre; no es tornen a dibuixar ni es tornen a comprimir les imatges que continguin.' },
      { q: 'Puc unir PDF protegits amb contrasenya?', a: 'Només els que tenen restriccions de permisos, que s’ignoren. Els que demanen contrasenya per obrir-se estan xifrats i no es poden llegir sense ella.' },
      { q: 'Què passa amb els marcadors i els formularis?', a: 'Els camps de formulari i els marcadors del document original no es traslladen. Si el PDF és un formulari que s’ha de poder omplir, uneix-lo amb una eina d’escriptori.' },
    ],
  },

  'pdf-split': {
    intro: [
      'Parteix un PDF de tres maneres: una pàgina per fitxer, blocs d’un nombre fix de pàgines, o els rangs concrets que li diguis.',
      'El resultat és un fitxer per tros, i quan n’hi ha més d’un es poden baixar tots junts dins d’un ZIP amb els noms ja numerats.',
    ],
    steps: [
      'Afegeix-hi el PDF.',
      'Tria com vols partir-lo i, si escau, escriu els rangs.',
      'Processa i baixa els trossos, d’un en un o en un ZIP.',
    ],
    faq: [
      { q: 'Com s’escriuen els rangs?', a: 'Separats per comes, amb guió per als intervals: «1-3, 7, 10-12» genera tres fitxers. Cada grup separat per coma és un document de sortida.' },
      { q: 'Es poden solapar els rangs?', a: 'Sí. Res no impedeix demanar «1-5, 3-8»; la pàgina 3 sortirà en tots dos fitxers.' },
      { q: 'Què passa si demano una pàgina que no existeix?', a: 'Els rangs es retallen a l’última pàgina del document. Si en té 10 i demanes «8-50», obtindràs de la 8 a la 10.' },
    ],
  },

  'pdf-rotate': {
    intro: [
      'Corregeix pàgines escanejades de costat o de cap per avall. La rotació s’acumula sobre la que ja tingui la pàgina, així que el resultat és el que veus al lector, no una suma que hagis de calcular tu.',
      'Pots girar tot el document o només unes quantes pàgines, que és el cas habitual quan l’escàner ha girat només els fulls apaïsats.',
    ],
    steps: [
      'Afegeix-hi el PDF.',
      'Tria l’angle i, si no són totes, escriu les pàgines.',
      'Processa i descarrega.',
    ],
    faq: [
      { q: 'Com indico només algunes pàgines?', a: 'Amb la mateixa notació dels rangs: «1-3, 7, 10-12». Si deixes el camp buit, es giren totes.' },
      { q: 'Es torna a comprimir el document?', a: 'No. Girar una pàgina és canviar un atribut a l’estructura del PDF; el contingut no es toca ni perd qualitat.' },
      { q: 'Per què el meu lector ja em mostrava la pàgina dreta?', a: 'Alguns lectors giren la vista sense desar-ho. Aquesta eina escriu la rotació al fitxer, de manera que ja surt bé a tot arreu i en imprimir.' },
    ],
  },

  'pdf-extract': {
    intro: [
      'Queda’t només amb les pàgines que t’interessen, o fes el contrari i treu del document les que sobren. És la mateixa operació vista des dels dos costats, i el commutador la canvia.',
      'Va bé per enviar només el capítol que fa al cas, per treure una portada en blanc o per eliminar pàgines amb dades que no vols compartir.',
    ],
    steps: [
      'Afegeix-hi el PDF.',
      'Escriu les pàgines, per exemple «1-3, 7».',
      'Marca la casella si el que vols és esborrar-les en comptes de conservar-les.',
    ],
    faq: [
      { q: 'Les pàgines esborrades es poden recuperar del fitxer nou?', a: 'No. El document de sortida es construeix copiant-hi només les pàgines que es conserven, de manera que la resta no hi és de cap manera, ni amagada.' },
      { q: 'Es manté l’ordre que escric?', a: 'Les pàgines surten en ordre creixent, no en l’ordre en què les escrius. Per reordenar-les, parteix el document i torna’l a unir en l’ordre que vulguis.' },
      { q: 'Puc treure la darrera pàgina sense saber quantes n’hi ha?', a: 'Escriu un número prou alt per al final d’un rang: es retalla sol a l’última pàgina existent.' },
    ],
  },

  'images-to-pdf': {
    intro: [
      'Fes un PDF amb una imatge per pàgina. Serveix tant per convertir fotos de documents fetes amb el mòbil en un fitxer únic com per empaquetar un joc de captures de pantalla en alguna cosa que es pugui enviar i imprimir.',
      'Amb la mida de pàgina «La de cada imatge», cada pàgina té exactament les dimensions de la seva foto i no hi ha marges blancs ni escalats. Amb A4 o carta, les imatges s’hi encabeixen centrades.',
    ],
    steps: [
      'Arrossega-hi les imatges en l’ordre que vulguis que surtin.',
      'Tria la mida de pàgina, l’orientació i el marge.',
      'Prem «Combina» i baixa el PDF.',
    ],
    faq: [
      { q: 'Quins formats d’imatge accepta?', a: 'Qualsevol que el navegador sàpiga obrir. Els JPEG i els PNG s’incrusten directament; la resta es converteix a PNG abans d’afegir-los.' },
      { q: 'Com canvio l’ordre de les pàgines?', a: 'L’ordre és el de la llista. Si no és el que vols, treu els fitxers i torna’ls a afegir en l’ordre correcte, o anomena’ls 01, 02, 03 abans de seleccionar-los.' },
      { q: 'El PDF pesa molt, què puc fer?', a: 'Comprimeix o redimensiona les imatges abans. Una foto de 12 megapíxels té molta més resolució de la que cap impressora aprofitarà en un A4.' },
    ],
  },

  // ------------------------------------------------------------------- dades
  'json-to-csv': {
    intro: [
      'Converteix una llista d’objectes JSON en una taula que Excel, Numbers o Google Sheets obren directament. Les columnes surten de les claus, i es recullen totes les que apareguin en qualsevol dels objectes.',
      'Els objectes imbricats s’aplanen amb notació de punt, de manera que {"adreca": {"ciutat": "Girona"}} es converteix en una columna anomenada adreca.ciutat.',
    ],
    steps: [
      'Enganxa el JSON o obre un fitxer.',
      'Tria el separador que esperi el teu full de càlcul.',
      'Copia el resultat o baixa’l com a .csv.',
    ],
    faq: [
      { q: 'Quin separador he de triar?', a: 'La coma és l’estàndard, però l’Excel en configuració catalana o espanyola sol esperar punt i coma. Si en obrir el fitxer tot et surt en una sola columna, canvia-ho.' },
      { q: 'L’Excel em fa malbé els accents, per què?', a: 'Perquè no detecta que el fitxer és UTF-8. Marca la casella del BOM: hi afegeix una marca invisible al principi que fa que l’Excel ho encerti.' },
      { q: 'Què passa amb els valors que són llistes?', a: 'Es desen dins de la cel·la com a text JSON. Una taula no té manera de representar una llista dins d’una casella, així que el més honest és deixar-la visible.' },
      { q: 'El meu JSON no és una llista, és un objecte.', a: 'Si conté una llista a dins, es fa servir la primera que hi hagi. Si no, es tracta l’objecte com una fila única.' },
    ],
  },

  'csv-to-json': {
    intro: [
      'Converteix una taula en una llista d’objectes JSON, amb les capçaleres com a noms de camp. El separador es detecta sol mirant la primera línia, però el pots forçar si la detecció falla.',
      'El lector segueix les regles de l’RFC 4180: respecta les cometes, les cometes dobles escapades a dins d’un valor i els salts de línia enmig d’un camp entre cometes.',
    ],
    steps: [
      'Enganxa el CSV o obre el fitxer.',
      'Comprova que el separador i la casella de capçaleres siguin correctes.',
      'Copia el JSON o baixa’l.',
    ],
    faq: [
      { q: 'Què fa l’opció de convertir números i booleans?', a: 'Sense ella, tot surt com a text entre cometes. Amb ella, «42» passa a ser el número 42 i «true» el booleà. Els valors que semblen números però no ho són exactament, com un codi postal amb zero al davant, es deixen com a text.' },
      { q: 'El meu CSV no té capçaleres.', a: 'Desmarca la casella corresponent. Cada fila sortirà com una llista de valors en comptes d’un objecte amb noms de camp.' },
      { q: 'Què passa si dues columnes es diuen igual?', a: 'La segona guanya, perquè un objecte JSON no pot tenir dues claus iguals. Canvia el nom d’una de les columnes abans de convertir.' },
    ],
  },

  'json-to-yaml': {
    intro: [
      'Passa un JSON a YAML mantenint l’ordre de les claus. És el que necessites quan has de posar una configuració que tens en JSON dins d’un docker-compose, un manifest de Kubernetes o un flux de treball de CI.',
      'El resultat evita les referències i les àncores, de manera que és llegible i es pot enganxar tal qual encara que hi hagi estructures repetides.',
    ],
    steps: ['Enganxa el JSON.', 'Ajusta la indentació si el teu projecte n’usa una altra.', 'Copia el YAML.'],
    faq: [
      { q: 'Quina indentació he de triar?', a: 'Dos espais és la convenció majoritària i la que fan servir Docker Compose i Kubernetes. El YAML no admet tabuladors en cap cas.' },
      { q: 'Per què algunes cadenes surten entre cometes i altres no?', a: 'El YAML només les necessita quan el valor es podria confondre amb un altre tipus: «true», «null», «1.0» o una cadena que comenci amb un caràcter especial. Amb l’opció automàtica només se’n posen on calen.' },
      { q: 'Es conserva l’ordre de les claus?', a: 'Sí, surt el mateix ordre que tenia el JSON d’entrada.' },
    ],
  },

  'yaml-to-json': {
    intro: [
      'Converteix YAML a JSON per llegir-lo des de codi, validar-lo contra un esquema o simplement veure’n l’estructura sense dependre de la indentació.',
      'Accepta fitxers amb diversos documents separats per «---»: en aquest cas el resultat és una llista amb un element per document.',
    ],
    steps: ['Enganxa el YAML o obre el fitxer.', 'Tria la indentació de sortida.', 'Copia o baixa el JSON.'],
    faq: [
      { q: 'Per què em diu que el YAML no és vàlid?', a: 'Gairebé sempre és la indentació: un tabulador enmig dels espais, o un nivell que no quadra. El missatge d’error indica la línia on el lector s’ha perdut.' },
      { q: 'Es perd informació en convertir?', a: 'Sí, la que el JSON no sap representar: comentaris, àncores i referències, i la distinció entre estils de cadena. Els valors hi són tots.' },
      { q: 'Què passa amb les dates?', a: 'El YAML les reconeix com a tipus propi; en passar a JSON es converteixen en cadenes de text en format ISO.' },
    ],
  },

  'json-format': {
    intro: [
      'Indenta, minifica o ordena les claus d’un JSON, i quan no és vàlid t’indica la línia, la columna i què hi esperava.',
      'El motor del navegador ja no diu on falla, així que quan el JSON no passa la pàgina el torna a recórrer amb un analitzador propi que sí que ho pot dir: «sobra una coma abans de }», «s’esperava el nom d’una clau entre cometes dobles», i sempre amb la posició exacta.',
    ],
    steps: [
      'Enganxa el JSON, tan desordenat com calgui.',
      'Tria si el vols indentat, minificat o amb les claus ordenades.',
      'Copia el resultat.',
    ],
    faq: [
      { q: 'Per a què serveix ordenar les claus?', a: 'Per comparar dos JSON que tenen el mateix contingut en diferent ordre. Un cop ordenats tots dos, un diff de text només mostra les diferències reals.' },
      { q: 'S’hi puja el fitxer enlloc?', a: 'No. Tot passa dins de la pestanya, cosa que importa quan el JSON que enganxes conté claus d’API o dades de clients.' },
      { q: 'Accepta JSON amb comentaris o comes finals?', a: 'No, i t’ho dirà amb la posició exacta. Això no és JSON estàndard, encara que alguns fitxers de configuració ho admetin.' },
    ],
  },

  'jwt-decode': {
    intro: [
      'Obre un JSON Web Token i mostra què hi ha dins: l’algorisme de la capçalera, tots els camps de la càrrega útil i les dates d’emissió, validesa i caducitat convertides a hora local.',
      'Un JWT no està xifrat, només codificat en Base64: qualsevol que el tingui en pot llegir el contingut. Per això és important no posar-hi mai res que no vulguis que es vegi.',
    ],
    steps: ['Enganxa el token, amb o sense el prefix Bearer.', 'Mira la capçalera i la càrrega útil.', 'Comprova la línia de caducitat.'],
    faq: [
      { q: 'Es verifica la signatura?', a: 'No. Per verificar-la caldria la clau secreta o la pública de qui l’ha emès, i aquesta eina no en té cap. Serveix per veure el contingut, no per decidir si el token és de fiar.' },
      { q: 'El token arriba a algun servidor?', a: 'No. La descodificació és Base64 pura feta a la pestanya, cosa que importa força quan el que enganxes és un token de sessió viu.' },
      { q: 'Què vol dir que ha caducat?', a: 'Que el camp exp és anterior al moment actual. Molts servidors deixen un marge de tolerància d’uns segons, però un token caducat normalment es rebutja.' },
    ],
  },

  'base64-text': {
    intro: [
      'Codifica i descodifica text en Base64, amb suport complet per a UTF-8: els accents, la ce trencada i els emoji passen i tornen intactes.',
      'La variant segura per a URL substitueix els caràcters + i / per - i _, i treu el farciment final, que és el que demanen els JWT i molts paràmetres de consulta.',
    ],
    steps: ['Tria la direcció.', 'Enganxa el text o el Base64.', 'Copia el resultat.'],
    faq: [
      { q: 'Base64 és xifrar?', a: 'No, en absolut. És només una manera de representar dades amb caràcters segurs per a transport. Qualsevol el pot desfer en un segon: no serveix per protegir res.' },
      { q: 'Per què el meu Base64 no es descodifica?', a: 'Sol ser el farciment. Aquesta pàgina afegeix sola els signes «=» que faltin i accepta tant la variant estàndard com la segura per a URL, així que si tot i això falla és que el text està tallat.' },
      { q: 'Quant creix el text?', a: 'Un terç aproximadament: cada tres bytes es converteixen en quatre caràcters.' },
    ],
  },

  'base64-file': {
    intro: [
      'Converteix un fitxer en un data URI llest per enganxar dins d’un full d’estil, un HTML o un JSON de configuració. Serveix per incrustar una icona petita i estalviar-se una petició de xarxa.',
      'Té sentit amb fitxers petits. A partir d’uns pocs kilobytes, incrustar surt a compte perdre: el recurs deixa de poder-se cachejar per separat i el full d’estil engreixa per a tothom.',
    ],
    steps: ['Deixa-hi el fitxer.', 'Tria si vols el data URI complet o només el Base64.', 'Processa i baixa el .txt.'],
    faq: [
      { q: 'Fins a quina mida val la pena incrustar?', a: 'Com a regla pràctica, per sota d’uns 4 kB. Per sobre, el creixement del 33 % i la pèrdua de caché acostumen a fer més mal que bé.' },
      { q: 'Puc incrustar un SVG?', a: 'Sí, però per a SVG sol anar millor codificar-lo amb percentatges en comptes de Base64: ocupa menys i continua sent llegible dins del CSS.' },
      { q: 'El tipus MIME surt bé?', a: 'S’agafa del que el sistema operatiu indica per al fitxer. Si el navegador no en sap el tipus, es posa application/octet-stream i el pots corregir a mà.' },
    ],
  },

  hash: {
    intro: [
      'Calcula MD5, SHA-1, SHA-256, SHA-384 i SHA-512 d’un text o d’un fitxer, tots cinc de cop. El cas d’ús habitual és comprovar que una descàrrega coincideix amb la suma que publica qui la distribueix.',
      'Els SHA els calcula la WebCrypto del navegador, que és codi natiu. L’MD5 no hi és perquè ja no es considera segur, així que aquesta pàgina en porta una implementació pròpia: encara apareix a molts fitxers de comprovació antics.',
    ],
    steps: ['Tria la pestanya Text o Fitxer.', 'Escriu el text o deixa-hi el fitxer.', 'Compara el valor amb el que t’han donat.'],
    faq: [
      { q: 'Es puja el fitxer per calcular-ne el hash?', a: 'No. Es llegeix a la memòria de la pestanya i s’hi calcula. Amb fitxers molt grossos tingues present que es carrega sencer.' },
      { q: 'Quin hash he de mirar?', a: 'El que publiqui qui distribueix el fitxer. Si pots triar, SHA-256. MD5 i SHA-1 valen per detectar una descàrrega corrompuda, però no per garantir que ningú no l’hagi manipulat expressament.' },
      { q: 'Per què el hash canvia si el fitxer «és el mateix»?', a: 'Perquè un sol bit diferent el canvia del tot. Un salt de línia CRLF en comptes de LF, o una metadada afegida, ja donen un resultat completament distint.' },
    ],
  },

  'image-watermark': {
    intro: [
      'Posa una firma o un avís damunt de les teves fotos, en una cantonada o repetit en diagonal per tota la imatge. En lot, que és on val la pena: cinquanta fotos de producte amb la mateixa marca costa igual que una.',
      'La mida es dona en percentatge del costat curt, no en píxels, de manera que la marca es veu igual de gran en una foto vertical de mòbil que en un panoràmic de vuit mil píxels.',
    ],
    steps: ['Arrossega-hi les fotos.', 'Escriu el text i tria-li la posició, la mida i l’opacitat.', 'Processa i baixa-les.'],
    faq: [
      { q: 'Protegeix de debò la imatge?', a: 'Dissuadeix, que no és el mateix. Una marca a la cantonada es retalla en un segon; una de repetida per sobre la imatge és molt més empipadora de treure, però tampoc no és impossible.' },
      { q: 'Puc posar-hi un logotip en comptes de text?', a: 'Encara no: la marca és de text. Mentrestant pots compondre el logotip amb el text a l’editor i tractar-ho com una imatge.' },
      { q: 'Per què la marca no es llegeix sobre segons quines fotos?', a: 'Perquè el color coincideix amb el del fons. Deixa activada l’ombra, que és exactament per a això, o canvia el color a un que contrasti.' },
    ],
  },

  'image-exif': {
    intro: [
      'Mira tot el que porta amagat una fotografia: model de càmera i d’objectiu, obertura, velocitat, ISO, dates i, si el mòbil tenia la ubicació activada, les coordenades exactes del lloc on es va fer.',
      'És la cara complementària de «Treure metadades»: primer mires què hi ha i després decideixes si et molesta. Res no surt de la pestanya, cosa que amb fotos personals no és un detall menor.',
    ],
    steps: ['Deixa-hi una foto.', 'Mira les dades agrupades per tema.', 'Si hi ha GPS, tens un avís ben visible.'],
    faq: [
      { q: 'Per què la meva foto no té cap metadada?', a: 'Perquè algú les ha tretes pel camí. WhatsApp, Instagram i la majoria de xarxes les esborren en pujar la imatge, i una captura de pantalla no en té mai.' },
      { q: 'Què és exactament el que hauria de preocupar-me?', a: 'Les coordenades GPS, sobretot en fotos fetes a casa. També la data i, en entorns professionals, el número de sèrie del cos de la càmera, que identifica l’aparell.' },
      { q: 'Com les trec?', a: 'Amb «Treure metadades», que recodifica la imatge a partir dels píxels nus i no hi copia cap camp.' },
    ],
  },

  favicons: {
    intro: [
      'D’una sola imatge en surt tot el joc: les icones PNG de 16, 32, 48, 192 i 512 píxels, la de 180 que demana iOS i un favicon.ico de debò amb tres mides a dins.',
      'La imatge es retalla quadrada des del centre i s’escala amb el filtre de qualitat alta del navegador. Amb el fragment d’HTML inclòs, només has de copiar quatre línies al teu <head>.',
    ],
    steps: ['Deixa-hi el logotip, com més quadrat millor.', 'Si el vols amb fons o amb marge, ajusta-ho.', 'Processa i baixa el ZIP amb tot.'],
    faq: [
      { q: 'Quina mida ha de tenir la imatge de partida?', a: 'Com a mínim 512 × 512 píxels, i millor si és quadrada. Si és un SVG, converteix-lo abans a PNG gran amb «SVG a PNG»: així controles tu la resolució.' },
      { q: 'Encara cal el .ico?', a: 'Sí, per a navegadors i llocs antics que el demanen a l’arrel per defecte. Pesa molt poc i t’estalvies peticions fallides al registre del servidor.' },
      { q: 'Per què queda il·legible a 16 píxels?', a: 'Perquè un logotip amb detall fi no sobreviu a setze píxels. Per aquesta mida acostuma a caldre una versió simplificada, sovint només la inicial o el símbol.' },
    ],
  },

  'images-to-gif': {
    intro: [
      'Fes un GIF animat a partir d’una sèrie d’imatges. L’ordre és el de la llista, i com que les files es poden arrossegar, reordenar els fotogrames és qüestió de moure’ls.',
      'Els fotogrames s’encaixen dins d’un llenç comú, centrats i sense deformar-se, de manera que barrejar imatges de mides diferents no fa saltar l’animació.',
    ],
    steps: ['Arrossega-hi les imatges en l’ordre que vulguis.', 'Ajusta la durada del fotograma i l’amplada.', 'Combina i baixa el GIF.'],
    faq: [
      { q: 'Per què pesa tant?', a: 'Perquè el GIF és un format dels anys vuitanta: sense pèrdua, limitat a 256 colors i sense compressió entre fotogrames. Baixa l’amplada, retalla la paleta o fes servir menys fotogrames.' },
      { q: 'Quina durada de fotograma he de posar?', a: '100 ms són deu imatges per segon, que és el que es veu fluid sense disparar el pes. Per sota de 20 ms molts navegadors imposen el seu propi mínim igualment.' },
      { q: 'Què fa «torna enrere en acabar»?', a: 'Afegeix els fotogrames del revés al final, de manera que l’animació va i torna en comptes de fer un salt sec en reiniciar-se.' },
    ],
  },

  'pdf-watermark': {
    intro: [
      'Estampa «ESBORRANY», «CONFIDENCIAL» o el que calgui a totes les pàgines d’un PDF. El text s’escriu com a text de veritat al document, no com una imatge enganxada a sobre.',
      'Amb l’opció de repetir-lo, la marca cobreix la pàgina sencera en diagonal, que és el patró clàssic per als documents que no s’han de reutilitzar.',
    ],
    steps: ['Deixa-hi el PDF.', 'Escriu el text i tria la posició, la mida i l’opacitat.', 'Processa i baixa.'],
    faq: [
      { q: 'Es pot treure la marca?', a: 'Amb un editor de PDF decent, sí: el text és un objecte més del document. Serveix per marcar la intenció, no per impedir res.' },
      { q: 'Puc fer servir accents i «ç»?', a: 'Sí. El que no entra són els caràcters de fora del llatí-1, perquè les tipografies internes del PDF no els tenen; si n’hi poses cap, t’ho diu abans de fer res.' },
      { q: 'Queda per damunt o per sota del contingut?', a: 'Per damunt. Amb una opacitat baixa el text de sota es continua llegint sense problemes.' },
    ],
  },

  'pdf-page-numbers': {
    intro: [
      'Afegeix la numeració a un PDF que no en porta, que és la situació habitual quan has unit diversos documents o has escanejat un plec de fulls.',
      'Pots triar el format —només el número, «1 / 10», «Pàgina 1 de 10»—, la posició, la mida i des de quina pàgina comença a comptar, perquè la portada no s’endugui el número u.',
    ],
    steps: ['Deixa-hi el PDF.', 'Tria el format i on ha d’anar.', 'Si hi ha portada, digues quantes pàgines s’han de saltar.'],
    faq: [
      { q: 'Com faig que la portada no es numeri?', a: 'Posa 1 a «salta les primeres». La numeració començarà a la segona pàgina, i el número que hi surti serà el que diguis a «comença a».' },
      { q: 'El número tapa el contingut?', a: 'Pot passar si el document ja té text molt avall. Puja el marge fins que quedi net; es mesura en punts, i 28 són un centímetre escàs.' },
      { q: 'Es pot desfer?', a: 'No des d’aquí, així que conserva l’original. El número passa a ser part del contingut de la pàgina.' },
    ],
  },

  'text-count': {
    intro: [
      'Compta caràcters, paraules, línies, paràgrafs i frases mentre escrius, i et diu quant es triga a llegir-ho i quant a dir-ho en veu alta.',
      'A sota hi ha els límits amb què la gent es baralla de debò: el títol i la meta descripció per al cercador, i el que caben en una publicació. La barra es posa vermella quan te’n passes.',
    ],
    steps: ['Enganxa o escriu el text.', 'Mira el recompte, que s’actualitza sol.', 'Vigila les barres de límit si escrius per a un lloc concret.'],
    faq: [
      { q: 'Com compta les paraules?', a: 'Com a seqüències de lletres i xifres, de manera que «vint-i-un» compta com tres i una adreça web com unes quantes. És el mateix criteri que fan servir la majoria de comptadors.' },
      { q: 'D’on surt el temps de lectura?', a: 'De 220 paraules per minut per a la lectura en silenci i 130 per a la lectura en veu alta, que són les mitjanes habituals per a un adult amb text corrent.' },
      { q: 'Per què 158 caràcters a la meta descripció?', a: 'Perquè és a partir d’aquí que Google acostuma a tallar-la als resultats. No és una regla escrita: depèn del dispositiu i de la consulta.' },
    ],
  },

  'text-case': {
    intro: [
      'Passa un text a majúscules, a minúscules, a format de frase o a qualsevol de les convencions que es fan servir programant: camelCase, PascalCase, snake_case, kebab-case i CONSTANT_CASE.',
      'El mode «Tipus Títol» segueix la convenció catalana i castellana: deixa en minúscula les preposicions i els articles curts, tret que obrin el títol.',
    ],
    steps: ['Enganxa el text.', 'Tria la convenció.', 'Copia el resultat.'],
    faq: [
      { q: 'Respecta els accents?', a: 'Sí. «àngel» passa a «ÀNGEL» i torna bé, perquè la conversió fa servir les regles d’Unicode i no una taula ASCII.' },
      { q: 'Què fa exactament «Com una frase»?', a: 'Ho passa tot a minúscules i després posa en majúscula la primera lletra del text i la que segueix un punt, una exclamació o una interrogació.' },
      { q: 'Per a què serveix CONSTANT_CASE?', a: 'És la convenció per a constants i variables d’entorn en molts llenguatges: paraules en majúscula separades per guions baixos.' },
    ],
  },

  'text-lines': {
    intro: [
      'Ordena una llista, treu-ne les repeticions i les línies buides, numera-la o inverteix-la. És la feina que s’acaba fent a mà en un editor de text i que aquí es resol amb quatre caselles.',
      'L’ordenació entén els accents i els números com cal: «Àlex» va abans que «Bernat», i «fitxer10» després de «fitxer9», no abans.',
    ],
    steps: ['Enganxa la llista, una entrada per línia.', 'Marca què vols que hi faci.', 'Copia el resultat.'],
    faq: [
      { q: 'Per què «fitxer10» surt després de «fitxer9»?', a: 'Perquè l’ordenació és natural: quan troba números dins del text els compara com a números i no com a text. És el que gairebé sempre es vol.' },
      { q: 'Treu els duplicats que només es diferencien per les majúscules?', a: 'Només si marques «ignora majúscules en comparar». Per defecte «Poma» i «poma» es consideren diferents.' },
      { q: 'Es conserva l’ordre original si no ordeno?', a: 'Sí. Amb «deixa-ho com està», la resta d’operacions es fan respectant l’ordre en què has enganxat les línies.' },
    ],
  },

  'url-encode': {
    intro: [
      'Codifica i descodifica el percent-encoding de les adreces web, que és el que converteix un espai en «%20» i una «ç» en «%C3%A7».',
      'La diferència entre els dos abasts importa. Per a un valor solt cal escapar també «/», «?», «&» i «=», perquè dins d’un paràmetre són text; per a una adreça sencera s’han de deixar tal com són o la trenques.',
    ],
    steps: ['Tria la direcció i l’abast.', 'Enganxa l’adreça o el valor.', 'Copia el resultat.'],
    faq: [
      { q: 'Quin abast he de triar?', a: 'Si el que codifiques és el contingut d’un paràmetre, «un valor solt». Si és tota l’adreça i només vols arreglar-ne els espais i els accents, «una adreça sencera».' },
      { q: 'Espais com a «+» o com a «%20»?', a: '«+» és la convenció dels formularis enviats per GET, i molts servidors l’entenen. Fora de la cadena de consulta, «%20» és l’única forma correcta.' },
      { q: 'Em diu que no es pot descodificar.', a: 'Vol dir que hi ha un «%» que no va seguit de dos dígits hexadecimals vàlids. Sol passar quan el text ja estava descodificat i contenia un percentatge literal.' },
    ],
  },

  'html-entities': {
    intro: [
      'Converteix «<», «>», «&» i les cometes en les seves entitats, que és el que cal fer per ensenyar codi dins d’una pàgina sense que el navegador se l’empassi com a marcatge.',
      'En sentit invers, la descodificació la fa el mateix analitzador del navegador, de manera que entén totes les entitats amb nom que existeixen, no una llista curta.',
    ],
    steps: ['Tria la direcció.', 'Enganxa el text o el codi.', 'Copia el resultat.'],
    faq: [
      { q: 'Quins caràcters s’escapen per defecte?', a: 'Els cinc que tenen significat dins del marcatge —&, <, >, " i \'— més l’espai dur. Amb la casella marcada, també tot el que passi del codi 127.' },
      { q: 'Cal escapar els accents?', a: 'No, si la pàgina declara UTF-8, que hauria de ser sempre. L’opció hi és per a sistemes antics i per a correus en HTML, que encara pateixen amb la codificació.' },
      { q: 'És prou per evitar injecció de codi?', a: 'Escapar per a contingut HTML és una peça, però dins d’un atribut, d’un <script> o d’una URL les regles són diferents. No et refiïs d’aquesta eina com a mesura de seguretat.' },
    ],
  },

  slugify: {
    intro: [
      'Converteix un títol en una adreça neta: sense accents, sense símbols, sense espais i en minúscules. És el que fa un gestor de continguts quan publiques un article.',
      'Tracta bé el català: la ela geminada de «col·legi» queda «collegi» i no «col-legi», i la «ç» passa a «c» en comptes de desaparèixer.',
    ],
    steps: ['Enganxa el títol.', 'Tria el separador i, si en necessites, una longitud màxima.', 'Copia el slug.'],
    faq: [
      { q: 'Guions o guions baixos?', a: 'Guions. Google els interpreta com a separadors de paraula i els guions baixos no, de manera que per a adreces públiques el guió és sempre la tria.' },
      { q: 'Què passa amb la longitud màxima?', a: 'Talla, però no enmig d’una paraula: retrocedeix fins a l’últim separador si no queda massa curt. Un slug d’entre tres i sis paraules acostuma a ser el punt dolç.' },
      { q: 'Puc canviar el slug d’un article publicat?', a: 'Pots, però és una adreça nova: el que hi enllaçava deixa de funcionar. Si ho fas, deixa una redirecció 301 des de l’antic.' },
    ],
  },

  'format-html': {
    intro: [
      'Indenta HTML minificat o mal endreçat perquè es pugui llegir. Va bé per entendre el codi que t’ha escopit una eina, per revisar una plantilla o per veure què hi ha dins d’un correu en HTML.',
      'Respecta els elements en línia i no parteix el text enmig d’un paràgraf, que és el que fa que una indentació automàtica sigui útil en comptes de molesta.',
    ],
    steps: ['Enganxa el marcatge.', 'Ajusta la indentació.', 'Copia o baixa el resultat.'],
    faq: [
      { q: 'Canvia el que es veu a la pàgina?', a: 'Amb HTML ben format, no hauria de fer-ho. Els espais entre elements en línia sí que compten, així que revisa-ho si tens una maquetació delicada amb inline-block.' },
      { q: 'Serveix per a JSX o per a plantilles?', a: 'Només a mitges. Les claus de JSX i les etiquetes tipus {{ }} o <?php ?> el despisten, perquè analitza HTML i prou.' },
      { q: 'I per minificar-lo?', a: 'Aquesta eina va en l’altre sentit. Per aprimar la pàgina, el que més compta és el CSS i el JavaScript, que tenen les seves eines aquí mateix.' },
    ],
  },

  'format-xml': {
    intro: [
      'Indenta un document XML i, de passada, comprova que estigui ben format: si hi ha una etiqueta sense tancar o un caràcter il·legal, t’ho diu abans de tocar res.',
      'Serveix per a canals RSS, mapes del lloc, fitxers de configuració i qualsevol resposta d’API que arribi en XML en una sola línia inabastable.',
    ],
    steps: ['Enganxa l’XML.', 'Tria la indentació.', 'Copia el resultat.'],
    faq: [
      { q: 'Què vol dir que no és vàlid?', a: 'Que no està ben format: una etiqueta sense tancar, un «&» solt que hauria de ser «&amp;» o dos elements arrel. El missatge indica què hi esperava.' },
      { q: 'Valida contra un esquema?', a: 'No. Comprova l’estructura, no si compleix un XSD o un DTD, que és una comprovació molt més exigent.' },
      { q: 'Es conserven els comentaris i les seccions CDATA?', a: 'Sí, hi són al resultat. El que pot canviar és la indentació del que hi ha a dins.' },
    ],
  },

  'format-sql': {
    intro: [
      'Endreça una consulta SQL escrita en una sola línia: paraules clau en majúscules, cada camp a la seva línia i els JOIN alineats. Es llegeix en comptes d’haver-la de desxifrar.',
      'Entén els dialectes de MySQL, PostgreSQL, SQLite, MariaDB i BigQuery, que és el que evita que et desfaci la sintaxi pròpia de cadascun.',
    ],
    steps: ['Enganxa la consulta.', 'Tria el dialecte.', 'Copia el resultat.'],
    faq: [
      { q: 'Em canvia el que fa la consulta?', a: 'No. Només toca els espais, els salts de línia i les majúscules de les paraules clau; els noms de taula i de columna es respecten tal com els has escrit.' },
      { q: 'Per què em diu que no la pot analitzar?', a: 'Perquè hi ha sintaxi que el dialecte triat no reconeix. Prova amb el dialecte concret del teu motor abans que amb «SQL estàndard».' },
      { q: 'Puc formatar-ne diverses de cop?', a: 'Sí, separades per punt i coma. Surten separades per una línia en blanc.' },
    ],
  },

  // -------------------------------------------------------------- text i web
  'minify-css': {
    intro: [
      'Minifica CSS amb CSSO, que fa bastant més que treure espais: escurça els colors, redueix les propietats abreujades i, si l’hi deixes, fusiona regles que comparteixen declaracions.',
      'La reestructuració és el que dona la diferència de debò, i també és la que cal mirar amb més atenció: canvia l’ordre de les regles, i en fulls amb molta especificitat encreuada això pot alterar el resultat.',
    ],
    steps: ['Enganxa el CSS.', 'Decideix si actives la reestructuració.', 'Copia o baixa el .min.css.'],
    faq: [
      { q: 'És segur activar la reestructuració?', a: 'Ho és en la gran majoria de fulls, però comprova la pàgina després. Si tens regles que depenen de l’ordre en què apareixen per guanyar-se entre elles, val més desactivar-la.' },
      { q: 'Què són els comentaris /*! */?', a: 'La convenció per marcar un comentari que no s’ha de treure, com una capçalera de llicència. Amb la casella activada es conserven i la resta desapareixen.' },
      { q: 'Quant se sol estalviar?', a: 'Entre un 15 i un 30 % en un full escrit a mà. Si el servidor ja comprimeix amb gzip o brotli, el guany final és més modest, però es nota igualment.' },
    ],
  },

  'minify-js': {
    intro: [
      'Minifica JavaScript amb Terser, el mateix minificador que hi ha darrere de la majoria d’eines de compilació. Treu comentaris i espais, escurça els noms de les variables locals i simplifica el codi mort.',
      'Funciona amb sintaxi moderna, inclosos els mòduls ES, l’encadenament opcional i els camps privats de classe.',
    ],
    steps: ['Enganxa el codi.', 'Marca si és un mòdul ES i tria l’objectiu.', 'Copia o baixa el .min.js.'],
    faq: [
      { q: 'Per què he de dir si és un mòdul ES?', a: 'Perquè els mòduls van sempre en mode estricte i tenen àmbit propi. Si ho indiques, Terser pot escurçar noms que en un script clàssic serien globals i no es podrien tocar.' },
      { q: 'Escurçar els noms em trencarà res?', a: 'Els noms locals són segurs. El que sí que trenca és el codi que hi accedeix per cadena, com un framework que injecta dependències pel nom del paràmetre: en aquest cas, desactiva-ho.' },
      { q: 'Em dona un error de sintaxi que el navegador no em donava.', a: 'Terser analitza el fitxer sencer abans de res. Sovint és sintaxi més nova que l’objectiu triat: puja l’objectiu a ES2020 i torna-ho a provar.' },
    ],
  },

  color: {
    intro: [
      'Converteix un color entre HEX, RGB, HSL i OKLCH, en genera una escala d’onze tons i en comprova el contrast contra blanc i contra negre segons els criteris de la WCAG.',
      'OKLCH és el format que val la pena conèixer: està construït perquè una mateixa lluminositat es percebi igual sigui quin sigui el to, cosa que HSL no aconsegueix ni de bon tros. Per això és tan més fàcil fer-hi escales que es vegin coherents.',
    ],
    steps: ['Tria un color amb el selector o escriu-lo en qualsevol format.', 'Copia el format que et calgui.', 'Mira la taula de contrast abans de fer-lo servir per a text.'],
    faq: [
      { q: 'Quin contrast necessito?', a: '4,5:1 per a text normal i 3:1 per a text gran o negreta, que és el nivell AA. El AAA demana 7:1. Per sota de 3:1 el text costa de llegir per a molta gent.' },
      { q: 'Per què el groc i el blau amb la mateixa lluminositat HSL es veuen tan diferents?', a: 'Perquè HSL no té en compte com percep la llum l’ull humà, que és molt més sensible al verd i al groc. OKLCH sí que ho corregeix, i per això la seva lluminositat és de fiar.' },
      { q: 'Quins formats d’entrada accepta?', a: 'HEX de tres, quatre, sis o vuit dígits, rgb(), hsl() i els noms de color CSS com «tomato» o «rebeccapurple».' },
    ],
  },

  regex: {
    intro: [
      'Prova una expressió regular contra un text i mira’n les coincidències ressaltades, la posició de cadascuna i el contingut dels grups, numerats i amb nom.',
      'Si hi escrius una substitució, la veuràs aplicada en viu, amb les referències $1, $2 i $&. És el motor de JavaScript el que hi treballa, de manera que el que funciona aquí funciona igual al teu codi.',
    ],
    steps: ['Escriu el patró i marca les banderes.', 'Enganxa el text de prova.', 'Si et cal, escriu la substitució i mira el resultat.'],
    faq: [
      { q: 'Quines banderes hi ha?', a: 'g per trobar-les totes, i per ignorar majúscules, m perquè ^ i $ funcionin línia a línia, s perquè el punt inclogui els salts de línia, i u per al mode Unicode complet.' },
      { q: 'Per què només em surt una coincidència?', a: 'Perquè la bandera g està desactivada. Sense ella, una expressió regular s’atura a la primera.' },
      { q: 'Aquestes expressions valen per a Python o PHP?', a: 'Les bàsiques sí, però els detalls canvien. Els grups amb nom, les mirades enrere i les classes Unicode tenen sintaxi o suport diferents segons el llenguatge.' },
    ],
  },

  qr: {
    intro: [
      'Genera un codi QR i baixa’l en SVG vectorial, que és el que vols per imprimir a qualsevol mida sense que es pixeli, o en PNG a la resolució que triïs.',
      'Pots controlar-ne els colors i el nivell de correcció d’errors. Amb correcció alta el codi continua sent llegible encara que una part quedi tapada o malmesa, a canvi de tenir més mòduls i, per tant, quadrets més petits.',
    ],
    steps: ['Escriu el text, l’adreça o el que hi vulguis posar.', 'Ajusta la mida, el marge i els colors.', 'Baixa’l en SVG o en PNG.'],
    faq: [
      { q: 'Quin nivell de correcció he de triar?', a: 'M per a pantalla i per a impressions netes. Q o H si el codi anirà en una etiqueta que es pot ratllar o mullar, o si hi has de posar un logotip al mig.' },
      { q: 'Per què no me’l llegeix el mòbil?', a: 'Les tres causes habituals són poc contrast entre els dos colors, marge insuficient (deixa-hi com a mínim quatre mòduls) o el codi imprès massa petit per a la quantitat de dades que conté.' },
      { q: 'Caduca el codi?', a: 'No. No hi ha cap servei pel mig: el QR conté literalment el text que hi escrius. No és cap enllaç escurçat que un dia pugui deixar de funcionar.' },
      { q: 'Puc posar-hi una xarxa Wi-Fi?', a: 'Sí, amb el format WIFI:T:WPA;S:nom-de-la-xarxa;P:contrasenya;; . La majoria de mòbils el reconeixen i ofereixen connectar-s’hi directament.' },
    ],
  },

  diff: {
    intro: [
      'Compara dos textos i mira línia a línia què s’ha afegit i què s’ha tret. Els blocs llargs de línies idèntiques es pleguen perquè només vegis el que ha canviat i el context que l’envolta.',
      'La comparació fa servir la subseqüència comuna més llarga, que és el mateix criteri que el diff de tota la vida, de manera que els resultats s’assemblen als que veuràs al teu control de versions.',
    ],
    steps: ['Enganxa el text original a l’esquerra.', 'Enganxa el nou a la dreta.', 'Ajusta les línies de context si en vols veure més o menys.'],
    faq: [
      { q: 'Es puja res enlloc?', a: 'No. La comparació es fa a la pestanya, cosa que el fa apte per a contractes, registres i qualsevol text que no hauries d’enganxar en un servei en línia.' },
      { q: 'Per què em diu que hi ha massa línies?', a: 'L’algorisme necessita una taula proporcional al producte de les dues longituds. Per damunt d’uns quants milions de cel·les s’atura expressament per no penjar la pestanya: compara’n trossos.' },
      { q: 'Detecta els canvis dins d’una línia?', a: 'Encara no: una línia modificada surt com una línia treta i una d’afegida. Per veure diferències de paraula dins d’una línia va millor una eina de diff de codi.' },
    ],
  },
};
