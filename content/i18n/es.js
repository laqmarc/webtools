// Spanish edition.

export { TOOLS, VARIANTS } from './es-tools.js';
export { PAGES, VARIANT_PAGES } from './es-pages.js';

export const SITE = {
  tagline: 'Convierte, comprime e inspecciona — sin subir nada',
  description: 'Convierte y comprime imágenes, SVG y PDF, y trabaja con JSON, CSV, YAML y texto. Todo se ejecuta en tu navegador: ningún archivo se envía a ningún servidor.',
};

export const HOME = {
  h1: 'Convierte, comprime e inspecciona — sin subir nada',
  lead: 'Imágenes, SVG, PDF, JSON, CSV y texto. Todas las herramientas se ejecutan dentro de tu navegador: los archivos no salen del ordenador y no hay límites de tamaño ni colas.',
  body: [
    'La mayoría de conversores en línea funcionan igual: subes el archivo, un servidor lo procesa y te lo vuelves a descargar. Eso significa esperar la subida, confiar en quien guarda el archivo y aceptar los límites de tamaño que imponga el servicio.',
    'Aquí no pasa nada de eso. El navegador ya sabe decodificar y codificar PNG, JPEG y WebP, y el resto llega en forma de librerías que se cargan dentro de la página. El archivo no viaja a ningún sitio: se abre, se procesa y se guarda desde la misma pestaña. Puedes incluso desconectar la red una vez cargada la herramienta.',
  ],
};

export const FORMATS = {
  png: {
    name: 'PNG',
    lossless: true,
    alpha: true,
    blurb: 'un formato sin pérdida con transparencia, ideal para capturas, logotipos y dibujos con áreas planas de color',
    weak: 'pesa mucho con fotografías, porque no aprovecha que el ojo no distingue los detalles finos',
  },
  jpeg: {
    name: 'JPEG',
    lossless: false,
    alpha: false,
    blurb: 'el formato fotográfico de toda la vida, con compresión con pérdida y soporte universal',
    weak: 'no tiene transparencia y se degrada un poco cada vez que se vuelve a guardar',
  },
  webp: {
    name: 'WebP',
    lossless: false,
    alpha: true,
    blurb: 'el formato recomendado para la web desde 2020: transparencia, modos con y sin pérdida, y entre un 25 y un 35 % menos de peso que un JPEG equivalente',
    weak: 'los programas de escritorio antiguos todavía no siempre lo abren',
  },
  avif: {
    name: 'AVIF',
    lossless: false,
    alpha: true,
    blurb: 'el más pequeño de los cuatro a igualdad de calidad, a menudo la mitad que un JPEG',
    weak: 'codificarlo es lento y el soporte fuera del navegador todavía es desigual',
  },
};

export const PAIR_ANGLES = {
  'png-a-webp': 'Es la conversión que más se nota en la factura: un PNG de captura de pantalla pasa habitualmente de un megabyte largo a unas pocas decenas de kilobytes, y la transparencia se mantiene intacta.',
  'jpg-a-webp': 'Recomprimir un JPEG nunca sale gratis, pero WebP es lo bastante más eficiente como para que el balance salga a favor: a la misma calidad percibida el archivo suele quedar un tercio más pequeño.',
  'png-a-jpg': 'Tiene sentido cuando el PNG contiene en realidad una fotografía. Recuerda que JPEG no tiene canal alfa: todo lo que sea transparente quedará pintado del color de fondo que elijas.',
  'jpg-a-png': 'Convertir hacia PNG no recupera nada de lo que el JPEG ya perdió y casi siempre engorda el archivo. Sirve cuando un programa concreto solo acepta PNG, no para ganar calidad.',
  'webp-a-png': 'El camino de vuelta para programas de edición antiguos que todavía no abren WebP. El resultado es sin pérdida respecto del WebP de entrada, pero pesará bastante más.',
  'webp-a-jpg': 'Útil cuando hay que enviar la imagen a un sistema que solo traga JPEG. Si el WebP tenía transparencia, se funde con el color de fondo antes de codificar.',
  'png-a-avif': 'AVIF exprime los PNG fotográficos más que ningún otro formato de esta lista, a cambio de unos cuantos segundos de cálculo por imagen.',
  'jpg-a-avif': 'Para galerías de fotos que ya tienes en JPEG, AVIF suele recortar la mitad del peso. Vale la pena servirlo con una alternativa WebP mediante <picture>.',
  'avif-a-png': 'Para que programas que todavía no leen AVIF puedan abrir la imagen. El PNG resultante será mucho más grande: es el precio de volver a un formato sin pérdida.',
  'avif-a-jpg': 'La salida de compatibilidad cuando un sistema antiguo no entiende AVIF y tampoco te conviene un PNG enorme.',
};

export function pairCopy(from, to, angle) {
  return {
    intro: [
      `Convierte imágenes ${from.name} a ${to.name} directamente en el navegador, de una en una o todas de golpe. Ningún archivo se sube a ningún servidor: tu propio ordenador hace la decodificación y la codificación, y por eso la conversión es inmediata y no hay límite de tamaño.`,
      angle,
      `${from.name} es ${from.blurb}. La contrapartida es que ${from.weak}. ${to.name}, en cambio, es ${to.blurb}, aunque ${to.weak}.`,
    ].filter(Boolean),
    faq: [
      {
        q: `¿Se pierde calidad al pasar de ${from.name} a ${to.name}?`,
        a: to.lossless
          ? `No. ${to.name} es sin pérdida, así que el resultado contiene exactamente los mismos píxeles que le llegan. Ahora bien, si el origen ya había perdido calidad, esa no se recupera.`
          : `${to.name} comprime con pérdida, así que sí que pierde un poco, controlable con el control de calidad. Con 80-85 la diferencia no se ve en una pantalla. Parte siempre del original para no acumular recompresiones.`,
      },
      {
        q: '¿Qué pasa con la transparencia?',
        a: from.alpha && to.alpha
          ? `Se conserva: tanto ${from.name} como ${to.name} tienen canal alfa.`
          : from.alpha
            ? `${to.name} no tiene canal alfa, así que las zonas transparentes se pintan con el color de fondo que elijas antes de codificar.`
            : `${from.name} no tiene transparencia, de modo que no hay nada que conservar: el resultado será opaco igualmente.`,
      },
      {
        q: '¿Puedo convertir muchas de golpe?',
        a: 'Sí. Suelta todos los archivos que quieras: se procesan en paralelo aprovechando todos los núcleos del procesador y te los puedes descargar juntos en un ZIP.',
      },
      {
        q: '¿Se envían las imágenes a algún servidor?',
        a: 'No. Todo pasa dentro de esta pestaña. Una vez cargada la página puedes incluso desconectar la red y seguir convirtiendo.',
      },
    ],
  };
}

export const pairLabels = (fromLabel, toLabel) => ({
  title: `${fromLabel} a ${toLabel}`,
  desc: `Convierte imágenes ${fromLabel} a ${toLabel} por lotes, dentro del navegador.`,
});

export const META = {
  toolTitle: (title, site) => `${title} en línea, en el navegador — ${site}`,
  variantTitle: (title, site) => `${title} en línea, gratis y sin subir nada — ${site}`,
  homeTitle: (site, tagline) => `${site} — ${tagline}`,
};
