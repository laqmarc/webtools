// Messages the tools themselves produce: failures, refusals and the short
// notes that appear next to a finished file.
//
// They live apart from ui.js because they are a different kind of writing —
// an error has to say what went wrong and, where possible, what to do about
// it — but they share its shape: [català, español, English].

export const ERRORS = {
  // --- loading libraries ----------------------------------------------
  'err.unknownDep': ['Dependència desconeguda: {key}', 'Dependencia desconocida: {key}', 'Unknown dependency: {key}'],
  'err.libMissing': [
    'Falta la llibreria «{key}» a vendor/. Executa «node scripts/vendor.mjs» i torna-ho a provar. ({detail})',
    'Falta la librería «{key}» en vendor/. Ejecuta «node scripts/vendor.mjs» e inténtalo de nuevo. ({detail})',
    'The “{key}” library is missing from vendor/. Run “node scripts/vendor.mjs” and try again. ({detail})',
  ],
  'err.libNoGlobal': [
    'La llibreria «{key}» s’ha carregat però no exposa {global}.',
    'La librería «{key}» se ha cargado pero no expone {global}.',
    'The “{key}” library loaded but does not expose {global}.',
  ],
  'err.libLoadFailed': ['el fitxer no s’ha pogut carregar', 'el archivo no se ha podido cargar', 'the file could not be loaded'],
  'err.extraMissing': [
    'Aquesta eina necessita un extra que no s’ha baixat. Executa «node scripts/vendor.mjs --extras».',
    'Esta herramienta necesita un extra que no se ha descargado. Ejecuta «node scripts/vendor.mjs --extras».',
    'This tool needs an optional extra that has not been downloaded. Run “node scripts/vendor.mjs --extras”.',
  ],
  'err.noWorkers': ['No s’han pogut crear workers.', 'No se han podido crear workers.', 'Workers could not be created.'],
  'err.workerFailed': ['El worker ha fallat', 'El worker ha fallado', 'The worker failed'],

  // --- images ----------------------------------------------------------
  'err.imageUnreadable': [
    'No s’ha pogut llegir la imatge ({type}). {detail}',
    'No se ha podido leer la imagen ({type}). {detail}',
    'The image could not be read ({type}). {detail}',
  ],
  'err.unknownType': ['tipus desconegut', 'tipo desconocido', 'unknown type'],
  'err.cannotWriteFormat': [
    'Aquest navegador no sap escriure {format}.',
    'Este navegador no sabe escribir {format}.',
    'This browser cannot write {format}.',
  ],
  'err.unknownOp': ['Operació desconeguda: {op}', 'Operación desconocida: {op}', 'Unknown operation: {op}'],
  'err.encodeEmpty': [
    'La codificació no ha produït cap resultat.',
    'La codificación no ha producido ningún resultado.',
    'Encoding produced nothing.',
  ],
  'err.encodeTo': [
    'No s’ha pogut codificar a {type}.',
    'No se ha podido codificar a {type}.',
    'Could not encode to {type}.',
  ],
  'err.canvasEncode': [
    'El navegador no ha pogut codificar a {type}.',
    'El navegador no ha podido codificar a {type}.',
    'The browser could not encode to {type}.',
  ],
  'err.watermarkText': [
    'Escriu el text de la marca d’aigua.',
    'Escribe el texto de la marca de agua.',
    'Type the watermark text.',
  ],

  // --- SVG ---------------------------------------------------------------
  'err.svgInvalid': ['SVG no vàlid: {detail}', 'SVG no válido: {detail}', 'Invalid SVG: {detail}'],
  'err.svgInvalidPlain': ['SVG no vàlid.', 'SVG no válido.', 'Invalid SVG.'],
  'err.svgDraw': [
    'El navegador no ha pogut dibuixar aquest SVG. Comprova que no tingui recursos externs.',
    'El navegador no ha podido dibujar este SVG. Comprueba que no tenga recursos externos.',
    'The browser could not draw this SVG. Check that it has no external resources.',
  ],

  // --- PDF ---------------------------------------------------------------
  'err.badRange': [
    'No entenc el rang «{range}». Format: 1-3, 7, 10-12',
    'No entiendo el rango «{range}». Formato: 1-3, 7, 10-12',
    'I cannot read the range “{range}”. Format: 1-3, 7, 10-12',
  ],
  'err.invalidRange': ['Rang invàlid: «{range}».', 'Rango no válido: «{range}».', 'Invalid range: “{range}”.'],
  'err.noPagesSelected': [
    'Cap pàgina seleccionada (el document en té {count}).',
    'Ninguna página seleccionada (el documento tiene {count}).',
    'No pages selected (the document has {count}).',
  ],
  'err.needRange': ['Indica almenys un rang.', 'Indica al menos un rango.', 'Give at least one range.'],
  'err.pdfOpen': [
    'No s’ha pogut obrir el PDF: {detail}',
    'No se ha podido abrir el PDF: {detail}',
    'The PDF could not be opened: {detail}',
  ],
  'err.pdfRead': [
    'No s’ha pogut llegir el PDF: {detail}',
    'No se ha podido leer el PDF: {detail}',
    'The PDF could not be read: {detail}',
  ],
  'err.pdfPassword': [
    'Aquest PDF està protegit amb contrasenya.',
    'Este PDF está protegido con contraseña.',
    'This PDF is password protected.',
  ],
  'err.pdfNoPages': [
    'Els PDF seleccionats no tenen cap pàgina.',
    'Los PDF seleccionados no tienen ninguna página.',
    'The selected PDFs have no pages.',
  ],
  'err.pdfResultEmpty': [
    'El resultat no tindria cap pàgina.',
    'El resultado no tendría ninguna página.',
    'The result would have no pages.',
  ],
  'err.pdfNoImages': [
    'No hi ha cap imatge per posar al PDF.',
    'No hay ninguna imagen que poner en el PDF.',
    'There are no images to put in the PDF.',
  ],
  'err.pdfNonLatin': [
    'El caràcter «{char}» no es pot escriure amb les tipografies internes del PDF. Treu-lo o fes servir només text llatí.',
    'El carácter «{char}» no se puede escribir con las tipografías internas del PDF. Quítalo o usa solo texto latino.',
    'The character “{char}” cannot be written with the PDF’s built-in fonts. Remove it or stick to Latin text.',
  ],
  'err.pdfNoExtracted': [
    'No s’ha pogut extreure cap imatge (el document en declara {count}).',
    'No se ha podido extraer ninguna imagen (el documento declara {count}).',
    'No image could be extracted (the document declares {count}).',
  ],

  // --- OCR and the model -------------------------------------------------
  'err.ocrStart': [
    'No s’ha pogut iniciar l’OCR: {detail}',
    'No se ha podido iniciar el OCR: {detail}',
    'OCR could not be started: {detail}',
  ],
  'err.ocrNoPages': [
    'L’OCR no ha produït cap pàgina.',
    'El OCR no ha producido ninguna página.',
    'OCR produced no pages.',
  ],
  'err.modelFailed': [
    'El model no s’ha pogut executar: {detail}',
    'El modelo no se ha podido ejecutar: {detail}',
    'The model could not run: {detail}',
  ],

  // --- JSON, CSV, YAML, Base64 ------------------------------------------
  'err.jsonAt': [
    'JSON no vàlid a la línia {line}, columna {col}: {why}.',
    'JSON no válido en la línea {line}, columna {col}: {why}.',
    'Invalid JSON at line {line}, column {col}: {why}.',
  ],
  'err.jsonPlain': ['JSON no vàlid: {detail}', 'JSON no válido: {detail}', 'Invalid JSON: {detail}'],
  'json.newlineInString': [
    'un salt de línia dins d’un text (fes servir \\n)',
    'un salto de línea dentro de un texto (usa \\n)',
    'a line break inside a string (use \\n)',
  ],
  'json.badEscape': ['escapada no vàlida «\\{char}»', 'escape no válido «\\{char}»', 'invalid escape “\\{char}”'],
  'json.badUnicode': [
    '«\\u» ha d’anar seguit de 4 dígits hexadecimals',
    '«\\u» debe ir seguido de 4 dígitos hexadecimales',
    '“\\u” must be followed by 4 hex digits',
  ],
  'json.unclosedString': ['falta tancar les cometes', 'falta cerrar las comillas', 'the quotes are not closed'],
  'json.badNumber': ['número no vàlid', 'número no válido', 'invalid number'],
  'json.expectedKey': [
    's’esperava el nom d’una clau entre cometes dobles',
    'se esperaba el nombre de una clave entre comillas dobles',
    'expected a key name in double quotes',
  ],
  'json.expectedColon': [
    's’esperava «:» després de la clau',
    'se esperaba «:» después de la clave',
    'expected “:” after the key',
  ],
  'json.trailingCommaObject': [
    'sobra una coma abans de «}»',
    'sobra una coma antes de «}»',
    'a comma too many before “}”',
  ],
  'json.expectedCommaObject': [
    's’esperava «,» o «}»',
    'se esperaba «,» o «}»',
    'expected “,” or “}”',
  ],
  'json.trailingCommaArray': [
    'sobra una coma abans de «]»',
    'sobra una coma antes de «]»',
    'a comma too many before “]”',
  ],
  'json.expectedCommaArray': [
    's’esperava «,» o «]»',
    'se esperaba «,» o «]»',
    'expected “,” or “]”',
  ],
  'json.truncated': [
    'el text s’acaba abans d’hora',
    'el texto se acaba antes de tiempo',
    'the text ends too soon',
  ],
  'json.singleQuotes': [
    'JSON només admet cometes dobles',
    'JSON solo admite comillas dobles',
    'JSON only allows double quotes',
  ],
  'json.unexpected': ['no s’esperava «{char}»', 'no se esperaba «{char}»', '“{char}” was not expected'],
  'json.trailingContent': [
    'sobra contingut després del valor',
    'sobra contenido después del valor',
    'there is content after the value',
  ],
  'err.csvNeedsArray': [
    'El CSV necessita una llista d’objectes.',
    'El CSV necesita una lista de objetos.',
    'CSV needs a list of objects.',
  ],
  'err.yamlInvalid': ['YAML no vàlid: {detail}', 'YAML no válido: {detail}', 'Invalid YAML: {detail}'],
  'err.base64Invalid': ['Això no és Base64 vàlid.', 'Esto no es Base64 válido.', 'That is not valid Base64.'],

  // --- text and web -------------------------------------------------------
  'err.urlMalformed': [
    'La cadena té seqüències «%» mal formades i no es pot descodificar.',
    'La cadena tiene secuencias «%» mal formadas y no se puede decodificar.',
    'The string has malformed “%” sequences and cannot be decoded.',
  ],
  'err.xmlInvalid': ['XML no vàlid: {detail}', 'XML no válido: {detail}', 'Invalid XML: {detail}'],
  'err.cssoInit': [
    'No s’ha pogut inicialitzar CSSO.',
    'No se ha podido inicializar CSSO.',
    'CSSO could not be initialised.',
  ],
  'err.terserInit': [
    'No s’ha pogut inicialitzar Terser.',
    'No se ha podido inicializar Terser.',
    'Terser could not be initialised.',
  ],
  'err.sqlInit': [
    'No s’ha pogut inicialitzar el formatador SQL.',
    'No se ha podido inicializar el formateador SQL.',
    'The SQL formatter could not be initialised.',
  ],
  'err.cssInvalid': ['CSS no vàlid: {detail}', 'CSS no válido: {detail}', 'Invalid CSS: {detail}'],
  'err.sqlUnparsed': [
    'SQL que no s’ha pogut analitzar: {detail}',
    'SQL que no se ha podido analizar: {detail}',
    'SQL that could not be parsed: {detail}',
  ],
  'err.jsAt': ['{msg} (línia {line}, columna {col})', '{msg} (línea {line}, columna {col})', '{msg} (line {line}, column {col})'],
  'err.qrRaster': [
    'No s’ha pogut rasteritzar el QR.',
    'No se ha podido rasterizar el QR.',
    'The QR code could not be rasterised.',
  ],
  'err.qrTooLong': [
    'El text no hi cap en un codi QR amb aquesta correcció d’errors. {detail}',
    'El texto no cabe en un código QR con esta corrección de errores. {detail}',
    'The text does not fit in a QR code at this error-correction level. {detail}',
  ],
  'err.diffTooBig': [
    'Massa línies per comparar ({n} × {m}). Retalla els textos.',
    'Demasiadas líneas para comparar ({n} × {m}). Recorta los textos.',
    'Too many lines to compare ({n} × {m}). Trim the texts down.',
  ],
  'err.regexInvalid': [
    'Expressió no vàlida: {detail}',
    'Expresión no válida: {detail}',
    'Invalid expression: {detail}',
  ],
  'err.colorUnknown': [
    'No reconec aquest color. Prova amb #6aa8ff, rgb(106 168 255) o "tomato".',
    'No reconozco este color. Prueba con #6aa8ff, rgb(106 168 255) o "tomato".',
    'I do not recognise that colour. Try #6aa8ff, rgb(106 168 255) or "tomato".',
  ],
  'err.jwtParts': [
    'Un JWT té tres parts separades per punts; aquest en té {n}.',
    'Un JWT tiene tres partes separadas por puntos; este tiene {n}.',
    'A JWT has three dot-separated parts; this one has {n}.',
  ],
  'err.jwtHeader': [
    'La capçalera no es pot descodificar.',
    'La cabecera no se puede decodificar.',
    'The header cannot be decoded.',
  ],
  'err.jwtPayload': [
    'La càrrega útil no es pot descodificar.',
    'La carga útil no se puede decodificar.',
    'The payload cannot be decoded.',
  ],

  // --- notes beside a finished file --------------------------------------
  'note.ocrText': [
    '{pages} pàgina(es) · {words} paraules',
    '{pages} página(s) · {words} palabras',
    '{pages} page(s) · {words} words',
  ],
  'note.ocrNothing': [
    'no s’hi ha reconegut cap text',
    'no se ha reconocido ningún texto',
    'no text was recognised',
  ],
  'note.ocrPdf': [
    '{pages} pàgines amb capa de text · {words} paraules',
    '{pages} páginas con capa de texto · {words} palabras',
    '{pages} pages with a text layer · {words} words',
  ],
  'note.gifFrames': ['{n} fotogrames · {w}×{h}', '{n} fotogramas · {w}×{h}', '{n} frames · {w}×{h}'],
  'note.pdfNoEmbedded': [
    'no hi ha imatges incrustades: el pes és text o vectors',
    'no hay imágenes incrustadas: el peso es texto o vectores',
    'no embedded images: the weight is text or vectors',
  ],
  'note.svgRasterised': [
    'rasteritzat a {dpi} ppp ({w}×{h} px); el text de dins ja no és text',
    'rasterizado a {dpi} ppp ({w}×{h} px); el texto de dentro ya no es texto',
    'rasterised at {dpi} dpi ({w}×{h} px); the text inside is no longer text',
  ],
  'note.svgUriBig': [
    '{kb} kB dins del CSS: per a un dibuix així de gran surt més a compte un fitxer a part',
    '{kb} kB dentro del CSS: para un dibujo así de grande sale más a cuenta un archivo aparte',
    '{kb} kB inside the CSS: for a drawing this big a separate file is the better trade',
  ],
  'note.spriteIds': ['identificadors: {ids}', 'identificadores: {ids}', 'ids: {ids}'],
  'note.recolourNone': [
    'cap color escrit al fitxer: aquest SVG hereta el color de qui el mostra',
    'ningún color escrito en el archivo: este SVG hereda el color de quien lo muestra',
    'no colour written in the file: this SVG inherits the colour of whatever shows it',
  ],
  'note.recolourDone': ['{n} colors canviats', '{n} colores cambiados', '{n} colours changed'],
  'note.recolourDone.one': ['un color canviat', 'un color cambiado', 'one colour changed'],
  'err.spriteEmpty': [
    'Cap dels fitxers té res per posar a l’sprite.',
    'Ninguno de los archivos tiene nada que poner en el sprite.',
    'None of the files has anything to put in the sprite.',
  ],
  'note.pdfUnsafeImages.one': [
    'una imatge en un format que no es pot recodificar amb seguretat',
    'una imagen en un formato que no se puede recodificar con seguridad',
    'one image in a format that cannot be re-encoded safely',
  ],
  'note.pdfUnsafeImages': [
    '{n} imatge(s) en formats que no es poden recodificar amb seguretat',
    '{n} imagen(es) en formatos que no se pueden recodificar con seguridad',
    '{n} image(s) in formats that cannot be re-encoded safely',
  ],
  'note.pdfRecoded': [
    '{touched} de {total} imatges recodificades',
    '{touched} de {total} imágenes recodificadas',
    '{touched} of {total} images re-encoded',
  ],
  'note.pdfUntouched': ['{n} intactes', '{n} intactas', '{n} untouched'],
  'note.pdfQuality': ['qualitat {q}', 'calidad {q}', 'quality {q}'],
  'note.pdfQualityScaled': [
    'qualitat {q}, imatges al {scale} %',
    'calidad {q}, imágenes al {scale} %',
    'quality {q}, images at {scale} %',
  ],
  'note.pdfMissedTarget': [
    'no s’ha pogut baixar de {size}',
    'no se ha podido bajar de {size}',
    'could not get below {size}',
  ],
  'note.pdfNoFurther': [
    '{parts} — no s’ha pogut reduir més',
    '{parts} — no se ha podido reducir más',
    '{parts} — could not be reduced further',
  ],
  'note.pdfTextEmpty': [
    'cap text: el PDF és un escaneig sense OCR',
    'ningún texto: el PDF es un escaneo sin OCR',
    'no text: the PDF is a scan with no OCR',
  ],
  'note.pdfPages': ['{n} pàgines', '{n} páginas', '{n} pages'],
  'note.rasterBigger': [
    'rasteritzar-lo el faria més gros ({size}): aquest PDF és text, no imatges',
    'rasterizarlo lo haría más grande ({size}): este PDF es texto, no imágenes',
    'rasterising it would make it bigger ({size}): this PDF is text, not images',
  ],
  'note.rasterDone': [
    '{n} pàgines redibuixades a {dpi} ppp — el text ja no és seleccionable',
    '{n} páginas redibujadas a {dpi} ppp — el texto ya no es seleccionable',
    '{n} pages redrawn at {dpi} dpi — the text is no longer selectable',
  ],
};
