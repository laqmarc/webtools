// The custom tools' own interfaces, and the progress lines the slow runners
// write into the file row.
//
// These are not errors, but they are just as visible: leaving them in Catalan
// on a Spanish page would put the seam right in the middle of the panel.

export const PANELS = {
  // --- progress --------------------------------------------------------
  'prog.saving': ['desant…', 'guardando…', 'saving…'],
  'prog.pdfOpening': ['obrint el document…', 'abriendo el documento…', 'opening the document…'],
  'prog.pdfReadingImage': ['llegint imatge {i}/{n}…', 'leyendo imagen {i}/{n}…', 'reading image {i}/{n}…'],
  'prog.pdfSearchQuality': ['buscant la qualitat per a {size}…', 'buscando la calidad para {size}…', 'finding the quality for {size}…'],
  'prog.pdfScaling': ['reduint les imatges al {pct} %…', 'reduciendo las imágenes al {pct} %…', 'shrinking the images to {pct} %…'],
  'prog.pdfRecoding': ['recodificant {i}/{n}…', 'recodificando {i}/{n}…', 're-encoding {i}/{n}…'],
  'prog.drawingPage': ['dibuixant pàgina {i}/{n}…', 'dibujando página {i}/{n}…', 'drawing page {i}/{n}…'],
  'prog.readingPage': ['llegint pàgina {i}/{n}…', 'leyendo página {i}/{n}…', 'reading page {i}/{n}…'],
  'prog.extracting': ['extraient {i}/{n}…', 'extrayendo {i}/{n}…', 'extracting {i}/{n}…'],
  'prog.rasterising': ['rasteritzant {i}/{n}…', 'rasterizando {i}/{n}…', 'rasterising {i}/{n}…'],
  'prog.buildingPdf': ['muntant el PDF…', 'montando el PDF…', 'assembling the PDF…'],
  'prog.engineWarmup': ['preparant el motor…', 'preparando el motor…', 'warming up the engine…'],
  'prog.ocrReading': ['llegint… {pct} %', 'leyendo… {pct} %', 'reading… {pct} %'],
  'prog.loadingLanguage': ['carregant l’idioma', 'cargando el idioma', 'loading the language'],
  'prog.ocrPage': ['llegint {i}/{n}…', 'leyendo {i}/{n}…', 'reading {i}/{n}…'],
  'prog.loadingModel': ['carregant el model…', 'cargando el modelo…', 'loading the model…'],
  'prog.matting': ['separant el subjecte…', 'separando el sujeto…', 'separating the subject…'],
  'prog.compositing': ['component…', 'componiendo…', 'compositing…'],

  // --- shared panel furniture -------------------------------------------
  'panel.text': ['Text', 'Texto', 'Text'],
  'panel.file': ['Fitxer', 'Archivo', 'File'],
  'panel.results': ['Resultats', 'Resultados', 'Results'],
  'panel.options': ['Opcions', 'Opciones', 'Options'],
  'panel.colour': ['Color', 'Color', 'Colour'],
  'panel.background': ['Fons', 'Fondo', 'Background'],
  'panel.reading': ['Llegint…', 'Leyendo…', 'Reading…'],
  'panel.writePlaceholder': ['Escriu o enganxa un text…', 'Escribe o pega un texto…', 'Type or paste some text…'],

  // --- hash --------------------------------------------------------------
  'hash.drop': [
    'Arrossega un fitxer per calcular-ne les sumes',
    'Arrastra un archivo para calcular sus sumas',
    'Drop a file to compute its sums',
  ],
  'hash.dropHint': [
    'es llegeix en memòria, no s’envia enlloc',
    'se lee en memoria, no se envía a ninguna parte',
    'read into memory, sent nowhere',
  ],

  // --- JWT ---------------------------------------------------------------
  'jwt.token': ['Token', 'Token', 'Token'],
  'jwt.header': ['Capçalera', 'Cabecera', 'Header'],
  'jwt.payload': ['Càrrega útil', 'Carga útil', 'Payload'],
  'jwt.full': ['JSON complet', 'JSON completo', 'Full JSON'],
  'jwt.expiredFlag': ['CADUCAT', 'CADUCADO', 'EXPIRED'],
  'jwt.validFlag': ['vigent', 'vigente', 'valid'],
  'jwt.notYet': ['encara no vàlid', 'todavía no válido', 'not valid yet'],
  'jwt.ok': [
    'Format correcte. La signatura no es comprova: no confiïs en aquest token només per això.',
    'Formato correcto. La firma no se comprueba: no te fíes de este token solo por esto.',
    'The format checks out. The signature is not verified: do not trust this token on that basis alone.',
  ],
  'jwt.expiredAt': [
    'Aquest token va caducar el {when}.',
    'Este token caducó el {when}.',
    'This token expired on {when}.',
  ],

  // --- EXIF ---------------------------------------------------------------
  'exif.drop': [
    'Arrossega una foto per veure què porta a dins',
    'Arrastra una foto para ver qué lleva dentro',
    'Drop a photo to see what it is carrying',
  ],
  'exif.dropHint': [
    'no s’envia enlloc: es llegeix aquí mateix',
    'no se envía a ninguna parte: se lee aquí mismo',
    'sent nowhere: it is read right here',
  ],
  'exif.notImage': ['Això no és una imatge.', 'Esto no es una imagen.', 'That is not an image.'],
  'exif.readFailed': [
    'No s’ha pogut llegir: {detail}',
    'No se ha podido leer: {detail}',
    'Could not read it: {detail}',
  ],
  'exif.theFile': ['El fitxer', 'El archivo', 'The file'],
  'exif.name': ['Fitxer', 'Archivo', 'File'],
  'exif.size': ['Mida', 'Tamaño', 'Size'],
  'exif.type': ['Tipus', 'Tipo', 'Type'],
  'exif.dimensions': ['Dimensions', 'Dimensiones', 'Dimensions'],
  'exif.unknown': ['desconegut', 'desconocido', 'unknown'],
  'exif.none': [
    'Aquesta imatge no porta cap metadada EXIF. Si t’esperaves que en tingués, potser ja l’ha netejada alguna aplicació pel camí.',
    'Esta imagen no lleva ningún metadato EXIF. Si esperabas que tuviera, quizá ya la ha limpiado alguna aplicación por el camino.',
    'This image carries no EXIF metadata. If you expected some, something has probably stripped it along the way.',
  ],
  'exif.location': ['Ubicació', 'Ubicación', 'Location'],
  'exif.gpsWarning': [
    'Aquesta foto porta les coordenades exactes del lloc on es va fer. Si l’has de publicar, passa-la abans per «Treure metadades».',
    'Esta foto lleva las coordenadas exactas del lugar donde se hizo. Si la vas a publicar, pásala antes por «Quitar metadatos».',
    'This photo carries the exact coordinates of where it was taken. If you are publishing it, run it through “Strip metadata” first.',
  ],
  'exif.coords': ['Coordenades', 'Coordenadas', 'Coordinates'],
  'exif.altitude': ['Altitud', 'Altitud', 'Altitude'],
  'exif.camera': ['Càmera', 'Cámara', 'Camera'],
  'exif.exposure': ['Exposició', 'Exposición', 'Exposure'],
  'exif.image': ['Imatge', 'Imagen', 'Image'],
  'exif.dates': ['Dates', 'Fechas', 'Dates'],
  'exif.authorship': ['Autoria', 'Autoría', 'Authorship'],
  'exif.rest': ['La resta ({n} camps)', 'El resto ({n} campos)', 'The rest ({n} fields)'],
  'exif.copyJson': ['Copia-ho tot com a JSON', 'Copiarlo todo como JSON', 'Copy it all as JSON'],

  // --- colour -------------------------------------------------------------
  'color.formats': ['Formats', 'Formatos', 'Formats'],
  'color.contrast': ['Contrast WCAG', 'Contraste WCAG', 'WCAG contrast'],
  'color.onWhite': ['Sobre blanc', 'Sobre blanco', 'On white'],
  'color.onBlack': ['Sobre negre', 'Sobre negro', 'On black'],
  'color.aaLarge': ['AA gran', 'AA grande', 'AA large'],
  'color.fail': ['insuficient', 'insuficiente', 'not enough'],
  'color.scaleNote': [
    'Escala del 0 % (blanc) al 100 % (negre). Fes clic en un to per copiar-lo.',
    'Escala del 0 % (blanco) al 100 % (negro). Haz clic en un tono para copiarlo.',
    'A scale from 0 % (white) to 100 % (black). Click a tone to copy it.',
  ],
  'color.sample': [
    'Text de mostra sobre el color, amb el millor dels dos contrastos.',
    'Texto de muestra sobre el color, con el mejor de los dos contrastes.',
    'Sample text over the colour, using whichever contrast is better.',
  ],

  // --- regex ---------------------------------------------------------------
  'regex.expression': ['Expressió', 'Expresión', 'Expression'],
  'regex.pattern': ['Patró', 'Patrón', 'Pattern'],
  'regex.replacement': ['Substitució (opcional)', 'Sustitución (opcional)', 'Replacement (optional)'],
  'regex.subject': ['Text de prova', 'Texto de prueba', 'Test text'],
  'regex.sample': [
    'Escriu a anna@example.com o a pere@correu.cat si tens dubtes.',
    'Escribe a ana@example.com o a pedro@correo.es si tienes dudas.',
    'Write to anna@example.com or to peter@mail.co.uk if you have questions.',
  ],
  'regex.noMatches': ['Cap coincidència.', 'Ninguna coincidencia.', 'No matches.'],
  'regex.matches': ['{n} coincidències', '{n} coincidencias', '{n} matches'],
  'regex.matchOne': ['1 coincidència', '1 coincidencia', '1 match'],
  'regex.detail': ['Detall', 'Detalle', 'Detail'],
  'regex.substitution': ['Substitució', 'Sustitución', 'Replacement'],
  'regex.andMore': ['…i {n} coincidències més.', '…y {n} coincidencias más.', '…and {n} more matches.'],
  'regex.flag.g': ['global', 'global', 'global'],
  'regex.flag.i': ['ignora majúscules', 'ignora mayúsculas', 'ignore case'],
  'regex.flag.m': ['multilínia', 'multilínea', 'multiline'],
  'regex.flag.s': ['el punt inclou salts', 'el punto incluye saltos', 'dot matches newlines'],
  'regex.flag.u': ['unicode', 'unicode', 'unicode'],

  // --- QR -------------------------------------------------------------------
  'qr.content': ['Contingut', 'Contenido', 'Content'],
  'qr.ecc': ['Correcció d’errors', 'Corrección de errores', 'Error correction'],
  'qr.size': ['Mida (px)', 'Tamaño (px)', 'Size (px)'],
  'qr.margin': ['Marge (mòduls)', 'Margen (módulos)', 'Quiet zone (modules)'],
  'qr.downloadPng': ['Baixa PNG {px}×{px}', 'Descargar PNG {px}×{px}', 'Download PNG {px}×{px}'],
  'qr.downloadSvg': ['Baixa SVG', 'Descargar SVG', 'Download SVG'],
  'qr.copySvg': ['Copia l’SVG', 'Copiar el SVG', 'Copy the SVG'],
  'qr.stats': [
    '{n}×{n} mòduls · {chars} caràcters',
    '{n}×{n} módulos · {chars} caracteres',
    '{n}×{n} modules · {chars} characters',
  ],

  // --- diff -------------------------------------------------------------------
  'diff.context': ['Línies de context', 'Líneas de contexto', 'Context lines'],
  'diff.trimWs': ['Ignora espais al final', 'Ignorar espacios al final', 'Ignore trailing whitespace'],
  'diff.original': ['Original', 'Original', 'Original'],
  'diff.new': ['Nou', 'Nuevo', 'New'],
  'diff.summary': ['{added} afegides · {removed} tretes', '{added} añadidas · {removed} quitadas', '{added} added · {removed} removed'],
  'diff.identical': ['Els dos textos són idèntics', 'Los dos textos son idénticos', 'The two texts are identical'],
  'diff.folded': ['⋯ {n} línies iguals', '⋯ {n} líneas iguales', '⋯ {n} identical lines'],

  // --- word counter --------------------------------------------------------------
  'count.placeholder': ['Escriu o enganxa el text…', 'Escribe o pega el texto…', 'Type or paste the text…'],
  'count.chars': ['Caràcters', 'Caracteres', 'Characters'],
  'count.charsNoSpaces': ['Caràcters sense espais', 'Caracteres sin espacios', 'Characters without spaces'],
  'count.words': ['Paraules', 'Palabras', 'Words'],
  'count.lines': ['Línies', 'Líneas', 'Lines'],
  'count.paragraphs': ['Paràgrafs', 'Párrafos', 'Paragraphs'],
  'count.sentences': ['Frases', 'Frases', 'Sentences'],
  'count.readingTime': ['Temps de lectura', 'Tiempo de lectura', 'Reading time'],
  'count.speakingTime': [
    'Temps si ho llegeixes en veu alta',
    'Tiempo si lo lees en voz alta',
    'Time if you read it aloud',
  ],
  'count.title': ['Recompte', 'Recuento', 'Count'],
  'count.limits': ['Límits habituals', 'Límites habituales', 'Common limits'],
  'count.copyText': ['Copia el text', 'Copiar el texto', 'Copy the text'],
  'count.seoTitle': ['Títol SEO', 'Título SEO', 'SEO title'],
  'count.metaDesc': ['Meta descripció', 'Meta descripción', 'Meta description'],
};
