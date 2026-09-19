// Interface strings, by language.
//
// The Catalan column is the source: it is what the code falls back to, and it
// is the one that is always complete. `scripts/build-pages.mjs` writes each
// language out as a small JSON file that the page fetches only when it is not
// Catalan, so the default language pays nothing for the other two.

import { ERRORS } from './errors.js';
import { PANELS } from './panels.js';

export const UI = {
  ...ERRORS,
  ...PANELS,

  // --- àrees -----------------------------------------------------------
  // Viuen aquí i no al registre perquè les necessiten totes dues bandes: el
  // generador per als títols de secció i el navegador per a la paleta i per
  // al menú d'encadenar eines.
  'area.image': ['Imatge', 'Imagen', 'Images'],
  'area.vector': ['Imatge vectorial', 'Imagen vectorial', 'Vector images'],
  'area.pdf': ['PDF', 'PDF', 'PDF'],
  'area.data': ['Dades', 'Datos', 'Data'],
  'area.web': ['Text i web', 'Texto y web', 'Text and web'],

  // --- paleta d'ordres --------------------------------------------------
  'palette.title': ['Totes les eines', 'Todas las herramientas', 'All tools'],
  'palette.placeholder': ['Vés a una eina…', 'Ve a una herramienta…', 'Jump to a tool…'],
  'palette.hint': [
    '↑↓ per moure’t · Retorn per obrir · Esc per tancar',
    '↑↓ para moverte · Intro para abrir · Esc para cerrar',
    '↑↓ to move · Enter to open · Esc to close',
  ],
  'palette.open': ['Totes les eines (Ctrl+K)', 'Todas las herramientas (Ctrl+K)', 'All tools (Ctrl+K)'],

  // --- encadenar eines --------------------------------------------------
  'chain.send': ['Envia el resultat a una altra eina', 'Envía el resultado a otra herramienta', 'Send the result to another tool'],
  'chain.sendAll': ['Envia-ho a una altra eina', 'Enviarlo a otra herramienta', 'Send to another tool'],
  'chain.title': ['Envia el resultat a…', 'Envía el resultado a…', 'Send the result to…'],
  'chain.heading.one': ['On va aquest fitxer?', '¿Adónde va este archivo?', 'Where does this file go?'],
  'chain.heading': [
    'On van aquests {n} fitxers?',
    '¿Adónde van estos {n} archivos?',
    'Where do these {n} files go?',
  ],
  'chain.hint': [
    'Només hi surten les eines que accepten aquests fitxers · Esc per tancar',
    'Solo aparecen las herramientas que aceptan estos archivos · Esc para cerrar',
    'Only tools that accept these files are listed · Esc to close',
  ],
  'chain.none': [
    'Cap altra eina no accepta aquests fitxers.',
    'Ninguna otra herramienta acepta estos archivos.',
    'No other tool accepts these files.',
  ],
  'chain.handing': ['Passant els fitxers…', 'Pasando los archivos…', 'Handing the files over…'],
  'chain.failed': [
    'El navegador no deixa desar els fitxers per passar-los. Descarrega’ls i torna a arrossegar-los.',
    'El navegador no deja guardar los archivos para pasarlos. Descárgalos y vuelve a arrastrarlos.',
    'The browser will not let us stash the files to hand them over. Download them and drop them again.',
  ],
  'chain.received.one': [
    'Un fitxer rebut de l’eina anterior.',
    'Un archivo recibido de la herramienta anterior.',
    'One file received from the previous tool.',
  ],
  'chain.received': [
    '{n} fitxer(s) rebuts de l’eina anterior.',
    '{n} archivo(s) recibidos de la herramienta anterior.',
    '{n} file(s) received from the previous tool.',
  ],
  'chain.wrongKind.one': [
    'El fitxer que arribava no serveix per a aquesta eina.',
    'El archivo que llegaba no sirve para esta herramienta.',
    'The file that arrived is not what this tool takes.',
  ],
  'chain.wrongKind': [
    'Els {n} fitxers que arribaven no serveixen per a aquesta eina.',
    'Los {n} archivos que llegaban no sirven para esta herramienta.',
    'The {n} files that arrived are not what this tool takes.',
  ],

  // --- shell -----------------------------------------------------------
  'shell.search': ['Cerca una eina…', 'Busca una herramienta…', 'Search for a tool…'],
  'shell.theme': ['Canvia el tema', 'Cambia el tema', 'Toggle theme'],
  'shell.install': ['Instal·la', 'Instalar', 'Install'],
  'shell.allTools': ['Totes les eines', 'Todas las herramientas', 'All tools'],
  'shell.footer': ['Tot el processament passa dins d’aquesta pestanya.', 'Todo el procesamiento ocurre dentro de esta pestaña.', 'All the work happens inside this tab.'],
  'shell.footerLead': ['Res no puja a cap servidor.', 'No se sube nada a ningún servidor.', 'Nothing is uploaded anywhere.'],
  'shell.noscript': [
    'Aquesta eina necessita JavaScript, perquè és el teu navegador qui processa els fitxers: no hi ha cap servidor que ho pugui fer al seu lloc.',
    'Esta herramienta necesita JavaScript, porque es tu navegador quien procesa los archivos: no hay ningún servidor que pueda hacerlo en su lugar.',
    'This tool needs JavaScript, because your browser is what processes the files: there is no server to do it instead.',
  ],
  'shell.noResults': ['Cap eina per a «{q}». Prova amb «webp», «pdf» o «json».', 'Ninguna herramienta para «{q}». Prueba con «webp», «pdf» o «json».', 'No tool matches “{q}”. Try “webp”, “pdf” or “json”.'],
  'shell.loading': ['Carregant l’eina…', 'Cargando la herramienta…', 'Loading the tool…'],
  'shell.loadFailed': ['No s’ha pogut carregar l’eina: {msg}', 'No se ha podido cargar la herramienta: {msg}', 'The tool could not be loaded: {msg}'],
  'shell.bootFailed': ['L’eina ha fallat en arrencar: {msg}', 'La herramienta ha fallado al arrancar: {msg}', 'The tool failed to start: {msg}'],
  'shell.related': ['Eines relacionades', 'Herramientas relacionadas', 'Related tools'],
  'shell.howto': ['Com es fa servir', 'Cómo se usa', 'How to use it'],
  'shell.faq': ['Preguntes freqüents', 'Preguntas frecuentes', 'Frequently asked questions'],
  'shell.directConversions': ['Conversions directes', 'Conversiones directas', 'Direct conversions'],
  'shell.whyBrowser': ['Per què al navegador i no al servidor', 'Por qué en el navegador y no en el servidor', 'Why in the browser and not on a server'],
  'shell.language': ['Idioma', 'Idioma', 'Language'],

  // --- file tool -------------------------------------------------------
  'file.drop': ['Arrossega els fitxers aquí', 'Arrastra los archivos aquí', 'Drop your files here'],
  'file.dropCombine': ['Arrossega els fitxers a combinar', 'Arrastra los archivos a combinar', 'Drop the files to combine'],
  'file.orClick': ['o fes clic per triar-los', 'o haz clic para elegirlos', 'or click to pick them'],
  'file.anyFile': ['Qualsevol fitxer', 'Cualquier archivo', 'Any file'],
  'file.anyImage': ['Imatges', 'Imágenes', 'Images'],
  'file.process': ['Processa', 'Procesar', 'Process'],
  'file.combine': ['Combina', 'Combinar', 'Combine'],
  'file.processing': ['Processant…', 'Procesando…', 'Working…'],
  'file.clear': ['Buida la llista', 'Vaciar la lista', 'Clear the list'],
  'file.defaults': ['Opcions per defecte', 'Opciones por defecto', 'Reset options'],
  'file.downloadAll': ['Descarrega-ho tot ({n}) .zip', 'Descargarlo todo ({n}) .zip', 'Download all ({n}) .zip'],
  'file.download': ['Descarrega', 'Descargar', 'Download'],
  'file.remove': ['Treu de la llista', 'Quitar de la lista', 'Remove from the list'],
  'file.compare': ['Compara amb l’original', 'Comparar con el original', 'Compare with the original'],
  'file.count': ['{n} fitxers', '{n} archivos', '{n} files'],
  'file.countOne': ['1 fitxer', '1 archivo', '1 file'],
  'file.done': ['{n} fets', '{n} hechos', '{n} done'],
  'file.failed': ['{n} amb error', '{n} con error', '{n} failed'],
  'file.included': ['inclòs', 'incluido', 'included'],
  'file.error': ['Error', 'Error', 'Error'],
  'file.combinedResult': ['resultat combinat', 'resultado combinado', 'combined result'],
  'file.rejected.one': ['Un fitxer amb un format que aquesta eina no accepta: {names}', 'Un archivo con un formato que esta herramienta no acepta: {names}', 'One file in a format this tool does not take: {names}'],
  'file.rejected': ['{n} fitxer(s) amb un format que aquesta eina no accepta: {names}', '{n} archivo(s) con un formato que esta herramienta no acepta: {names}', '{n} file(s) in a format this tool does not take: {names}'],
  'file.pasted.one': ['Un fitxer enganxat del porta-retalls.', 'Un archivo pegado del portapapeles.', 'One file pasted from the clipboard.'],
  'file.pasted': ['{n} fitxer(s) enganxat(s) del porta-retalls.', '{n} archivo(s) pegado(s) del portapapeles.', '{n} file(s) pasted from the clipboard.'],
  'file.openedExternally.one': ['Un fitxer obert des del sistema que aquesta eina no accepta.', 'Un archivo abierto desde el sistema que esta herramienta no acepta.', 'One file opened from the system that this tool does not take.'],
  'file.openedExternally': ['{n} fitxer(s) obert(s) des del sistema que aquesta eina no accepta.', '{n} archivo(s) abierto(s) desde el sistema que esta herramienta no acepta.', '{n} file(s) opened from the system that this tool does not take.'],
  'file.dragToReorder': ['Arrossega les files per canviar-ne l’ordre', 'Arrastra las filas para cambiar el orden', 'Drag the rows to reorder them'],
  'file.plainFile': ['fitxer', 'archivo', 'file'],

  // --- compare ---------------------------------------------------------
  'cmp.close': ['Tanca', 'Cerrar', 'Close'],
  'cmp.hint': ['Esquerra: original. Dreta: resultat. Arrossega el control per comparar.', 'Izquierda: original. Derecha: resultado. Arrastra el control para comparar.', 'Left: original. Right: result. Drag the handle to compare.'],

  // --- text tool -------------------------------------------------------
  'text.input': ['Entrada', 'Entrada', 'Input'],
  'text.output': ['Resultat', 'Resultado', 'Result'],
  'text.placeholder': ['Enganxa-hi el contingut…', 'Pega aquí el contenido…', 'Paste your content here…'],
  'text.outPlaceholder': ['El resultat apareixerà aquí.', 'El resultado aparecerá aquí.', 'The result will appear here.'],
  'text.openFile': ['Obre un fitxer', 'Abrir un archivo', 'Open a file'],
  'text.sample': ['Exemple', 'Ejemplo', 'Example'],
  'text.empty': ['Buida', 'Vaciar', 'Clear'],
  'text.save': ['Baixa', 'Descargar', 'Save'],
  'text.chars': ['{a} → {b} car. ({d}%)', '{a} → {b} car. ({d}%)', '{a} → {b} chars ({d}%)'],

  // --- params ----------------------------------------------------------
  'params.title': ['Opcions', 'Opciones', 'Options'],
  'params.quick': ['Ràpid:', 'Rápido:', 'Quick:'],
  'copy': ['Copia', 'Copiar', 'Copy'],
  'copied': ['Copiat', 'Copiado', 'Copied'],
  'copyFailed': ['No s’ha pogut copiar', 'No se ha podido copiar', 'Could not copy'],

  // --- crop editor -----------------------------------------------------
  'crop.drop': ['Arrossega les imatges a retallar', 'Arrastra las imágenes a recortar', 'Drop the images to crop'],
  'crop.dropHint': ['les veuràs i hi dibuixaràs el retall · o fes clic per triar-les', 'las verás y dibujarás el recorte · o haz clic para elegirlas', 'you will see them and draw the crop · or click to pick them'],
  'crop.title': ['Retall', 'Recorte', 'Crop'],
  'crop.ratio': ['Relació d’aspecte', 'Relación de aspecto', 'Aspect ratio'],
  'crop.free': ['Lliure', 'Libre', 'Free'],
  'crop.format': ['Format', 'Formato', 'Format'],
  'crop.keep': ['Mantén l’original', 'Mantener el original', 'Keep the original'],
  'crop.quality': ['Qualitat', 'Calidad', 'Quality'],
  'crop.applyAll': ['Aplica el mateix retall a totes', 'Aplicar el mismo recorte a todas', 'Apply the same crop to all'],
  'crop.run': ['Retalla', 'Recortar', 'Crop'],
  'crop.running': ['Retallant…', 'Recortando…', 'Cropping…'],
  'crop.whole': ['Tota la imatge', 'Toda la imagen', 'Whole image'],
  'crop.removeThis': ['Treu aquesta', 'Quitar esta', 'Remove this one'],
  'crop.readout': ['{w} × {h} px · des de ({x}, {y}) · original {ow} × {oh}', '{w} × {h} px · desde ({x}, {y}) · original {ow} × {oh}', '{w} × {h} px · from ({x}, {y}) · original {ow} × {oh}'],
  'crop.done.one': ['Una imatge · {size} — descarregada.', 'Una imagen · {size} — descargada.', 'One image · {size} — downloaded.'],
  'crop.done': ['{n} imatge(s) · {size} — descarregat.', '{n} imagen(es) · {size} — descargado.', '{n} image(s) · {size} — downloaded.'],
  'crop.notImages.one': ['Un fitxer que no és una imatge.', 'Un archivo que no es una imagen.', 'One file that is not an image.'],
  'crop.notImages': ['{n} fitxer(s) que no són imatges.', '{n} archivo(s) que no son imágenes.', '{n} file(s) that are not images.'],
  'crop.cannotOpen': ['No s’ha pogut obrir {name}.', 'No se ha podido abrir {name}.', 'Could not open {name}.'],

  // --- pdf organiser ---------------------------------------------------
  'org.drop': ['Arrossega un PDF per organitzar-lo', 'Arrastra un PDF para organizarlo', 'Drop a PDF to organise it'],
  'org.dropHint': ['en veuràs totes les pàgines · o fes clic per triar-lo', 'verás todas sus páginas · o haz clic para elegirlo', 'you will see every page · or click to pick one'],
  'org.notPdf': ['Això no és un PDF.', 'Esto no es un PDF.', 'That is not a PDF.'],
  'org.drawing': ['Dibuixant les pàgines…', 'Dibujando las páginas…', 'Drawing the pages…'],
  'org.summary': ['{name} — {kept} de {total} pàgines', '{name} — {kept} de {total} páginas', '{name} — {kept} of {total} pages'],
  'org.wasPage': ['era la {n}', 'era la {n}', 'was {n}'],
  'org.rotate': ['Gira 90°', 'Girar 90°', 'Rotate 90°'],
  'org.drop90': ['Treu-la', 'Quitarla', 'Drop it'],
  'org.restore': ['Recupera', 'Recuperar', 'Restore'],
  'org.export': ['Exporta el PDF', 'Exportar el PDF', 'Export the PDF'],
  'org.reset': ['Torna a l’original', 'Volver al original', 'Back to the original'],
  'org.reverse': ['Inverteix l’ordre', 'Invertir el orden', 'Reverse the order'],
  'org.dragHint': ['Arrossega les pàgines per reordenar-les', 'Arrastra las páginas para reordenarlas', 'Drag the pages to reorder them'],
  'org.noPages': ['No queda cap pàgina.', 'No queda ninguna página.', 'No pages left.'],
  'org.exported': ['{n} pàgines · {size} — descarregat.', '{n} páginas · {size} — descargado.', '{n} pages · {size} — downloaded.'],
  'org.buildFailed': ['No s’ha pogut construir el PDF: {msg}', 'No se ha podido construir el PDF: {msg}', 'The PDF could not be built: {msg}'],
};

export const LANG_INDEX = { ca: 0, es: 1, en: 2 };

/** Flat { key: string } for one language, with Catalan filling any gap. */
export function uiFor(lang) {
  const i = LANG_INDEX[lang] ?? 0;
  return Object.fromEntries(Object.entries(UI).map(([k, v]) => [k, v[i] || v[0]]));
}
