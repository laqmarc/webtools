// Spanish page prose. Same rule as the Catalan source: every page gets its
// own words. A translated page that reads like a translation is still better
// than a Catalan page with a Spanish heading on top.

export const PAGES = {
  // ------------------------------------------------------------- imagen
  'image-convert': {
    intro: [
      'Convierte PNG, JPG, WebP y AVIF en cualquier dirección, de una en una o cincuenta de golpe. La decodificación y la codificación las hace el propio navegador, así que las imágenes no se suben a ninguna parte y la conversión es prácticamente instantánea.',
      'Cada formato tiene su trabajo: PNG para gráficos con áreas planas de color, JPEG para compatibilidad máxima, WebP como opción por defecto en la web y AVIF cuando el peso importa más que el tiempo de cálculo.',
    ],
    steps: [
      'Arrastra las imágenes a la zona de arriba, o haz clic para elegirlas.',
      'Elige el formato de destino y, si lo tiene, ajusta la calidad.',
      'Pulsa «Procesar» y descarga los resultados uno a uno o todos juntos en un ZIP.',
    ],
    faq: [
      { q: '¿Qué formato debería usar en la web?', a: 'WebP en casi todos los casos. Lo soportan todos los navegadores desde 2020 y pesa entre un 25 y un 35 % menos que un JPEG de calidad equivalente. AVIF todavía es más pequeño, pero tarda mucho más en codificarse.' },
      { q: '¿Se pierde calidad al convertir?', a: 'Depende del destino. PNG y WebP sin pérdida conservan el píxel exacto. JPEG, WebP normal y AVIF recomprimen, y la pérdida se acumula: convierte siempre desde el original, no desde una copia ya comprimida.' },
      { q: '¿Qué pasa con la transparencia?', a: 'PNG, WebP y AVIF la conservan. JPEG no tiene, así que el canal alfa se funde con el color de fondo que elijas antes de codificar.' },
      { q: '¿Hay límite de tamaño o de número de archivos?', a: 'Ninguno artificial. El único límite es la memoria de la pestaña, porque las imágenes se decodifican enteras. Con archivos muy grandes conviene procesarlos por tandas.' },
    ],
  },
  'image-compress': {
    intro: [
      'Reduce el peso de las imágenes de dos maneras. Puedes fijar una calidad y ver qué sale, o bien decir cuánto debe pesar el archivo como máximo y dejar que la página llegue sola.',
      'El segundo modo hace una búsqueda binaria sobre la calidad hasta encontrar la más alta que cabe en el presupuesto y, si ni con la calidad más baja razonable cabe, va reduciendo el tamaño en píxeles en pasos del 20 % hasta conseguirlo.',
    ],
    steps: [
      'Suelta aquí las imágenes que quieres adelgazar.',
      'Elige si fijas la calidad o un peso máximo en kilobytes.',
      'Mira la columna del porcentaje ahorrado y descarga lo que te convenza.',
    ],
    faq: [
      { q: '¿Qué calidad es suficiente?', a: 'Entre 75 y 85 en WebP es donde la mayoría de la gente no distingue el resultado del original. Por debajo de 60 aparecen artefactos visibles en los degradados y en los contornos del texto.' },
      { q: '¿Por qué el peso máximo que pido no se llena del todo?', a: 'Porque la búsqueda no sube de calidad 95. Por encima de ese punto el archivo crece muy rápido sin ninguna mejora que se vea, así que si a 95 ya cabes, se queda ahí.' },
      { q: '¿Puedo comprimir sin cambiar de formato?', a: 'Sí, elige «Mantener el original». Con JPEG y WebP funciona bien; con PNG la ganancia es pequeña, porque es un formato sin pérdida y recodificarlo no libera mucho espacio.' },
      { q: '¿Qué hace la anchura máxima?', a: 'Reduce la imagen antes de comprimirla. Suele ser la palanca más efectiva de todas: servir una foto de 4000 px en un sitio que la muestra a 800 px desperdicia el 96 % de los píxeles.' },
    ],
  },
  'image-resize': {
    intro: [
      'Cambia el tamaño de las imágenes indicando anchura, altura o ambas. Si solo rellenas una de las dos casillas, la otra se calcula sola para mantener la proporción.',
      'Cuando pones las dos medidas puedes decidir qué pasa con la diferencia de proporción: encajar la imagen entera dentro, rellenar el rectángulo recortando lo que sobra, o deformarla hasta el tamaño exacto.',
    ],
    steps: ['Añade las imágenes.', 'Escribe la anchura, la altura o ambas, y elige cómo deben ajustarse.', 'Procesa y descarga.'],
    faq: [
      { q: '¿Por qué no se amplían las imágenes pequeñas?', a: 'Porque está activada la opción de no ampliar. Ampliar no añade detalle, solo interpola píxeles y el resultado sale blando. Desactívala si de verdad necesitas el tamaño mayor.' },
      { q: '¿Qué diferencia hay entre «hacia dentro» y «rellenar y recortar»?', a: '«Hacia dentro» encaja la imagen entera dentro de las medidas que das, de modo que el resultado puede ser más pequeño en uno de los lados. «Rellenar y recortar» cubre todo el rectángulo y corta lo que sobra por los lados.' },
      { q: '¿Se verá borroso?', a: 'El escalado usa el filtro de calidad alta del navegador, que va bien para reducir. Para reducciones muy agresivas, hacer dos pasadas a veces conserva más nitidez.' },
    ],
  },
  'image-crop': {
    intro: [
      'Dibuja el recorte con el ratón sobre la imagen, con la rejilla de los tercios encima y las medidas en píxeles actualizándose mientras arrastras. Puedes partir de cero haciendo un rectángulo nuevo, mover el que hay o estirar sus esquinas.',
      'La gracia, sin embargo, es el lote: si cargas veinte fotos y dejas marcada la casilla, el mismo recorte relativo se aplica a todas. Como se guarda en proporciones y no en píxeles, funciona aunque las imágenes no midan lo mismo.',
    ],
    steps: [
      'Arrastra las imágenes; la primera aparece en el área de trabajo.',
      'Dibuja o ajusta el rectángulo, y si necesitas una proporción concreta, fíjala.',
      'Pulsa «Recortar» y descarga el resultado, en ZIP si hay más de una.',
    ],
    faq: [
      { q: '¿Cómo fijo un cuadrado perfecto?', a: 'Elige 1:1 en la relación de aspecto. A partir de ese momento el rectángulo mantiene la proporción mientras lo estiras, y lo que ya había se ajusta conservando su centro.' },
      { q: 'Mis fotos no miden lo mismo, ¿funciona igual?', a: 'Sí. El recorte se guarda como fracción de cada imagen, así que «el tercio central» es el tercio central de cada una, no un rectángulo de píxeles que en algunas quedaría fuera.' },
      { q: '¿Puedo recortar una distinta del resto?', a: 'Desmarca «Aplicar el mismo recorte a todas» y se recortará solo la que tienes seleccionada en la tira de miniaturas.' },
    ],
  },
  'image-rotate': {
    intro: [
      'Gira imágenes de 90 en 90 grados y refléjalas horizontal o verticalmente. Las dos cosas se pueden combinar en una sola pasada.',
      'A diferencia de girar desde el visor de fotos del sistema, aquí la rotación se aplica a los píxeles de verdad, no a una etiqueta de orientación que luego cada programa interpreta como quiere.',
    ],
    steps: ['Añade las imágenes mal orientadas.', 'Elige el ángulo y, si hace falta, el volteo.', 'Procesa y descarga.'],
    faq: [
      { q: '¿Por qué mis fotos ya salen derechas antes de girarlas?', a: 'Porque la página lee la orientación EXIF de la cámara y la aplica al abrir la imagen. Lo que ves en la miniatura es, por tanto, como se verá en todas partes.' },
      { q: '¿Se pierde calidad al girar?', a: 'Girar múltiplos de 90 grados solo reorganiza píxeles, así que no. La pérdida, si la hay, viene de volver a codificar en un formato con pérdida.' },
      { q: '¿Puedo girar un ángulo cualquiera?', a: 'No. Los ángulos libres obligan a interpolar y a decidir qué hacer con las esquinas vacías, y eso pide una previsualización que esta herramienta no tiene.' },
    ],
  },
  'image-strip': {
    intro: [
      'Las fotos hechas con el móvil llevan escondidas la fecha, el modelo del teléfono, la configuración de la cámara y, a menudo, las coordenadas GPS exactas del lugar donde se hicieron. Nada de eso se ve al abrir la imagen, pero está ahí y viaja con el archivo.',
      'Esta herramienta vuelve a codificar la imagen a partir de los píxeles desnudos, de modo que en el archivo resultante no queda ningún metadato. La orientación EXIF se aplica antes de descartarla, para que la foto no salga tumbada.',
    ],
    steps: ['Añade las fotos que quieras limpiar.', 'Deja la calidad alta si quieres que el resultado sea visualmente idéntico.', 'Procesa y descarga los archivos limpios.'],
    faq: [
      { q: '¿Desaparecen de verdad las coordenadas GPS?', a: 'Sí. El archivo nuevo se construye desde cero a partir de la matriz de píxeles, y ninguno de los campos EXIF, IPTC o XMP del original se copia.' },
      { q: '¿También se quita el perfil de color?', a: 'Sí, y es la contrapartida a tener en cuenta. Si la foto llevaba un perfil amplio como Display P3, el resultado se interpretará como sRGB y los colores muy saturados pueden quedar ligeramente distintos.' },
      { q: '¿Cambiará el peso del archivo?', a: 'Un poco, en cualquier dirección. Se pierden unos kilobytes de metadatos, pero la recodificación puede no coincidir exactamente con la de la cámara. Con calidad 95 la diferencia visual es nula.' },
    ],
  },
  'image-watermark': {
    intro: [
      'Pon una firma o un aviso sobre tus fotos, en una esquina o repetido en diagonal por toda la imagen. Por lotes, que es donde vale la pena: cincuenta fotos de producto con la misma marca cuesta lo mismo que una.',
      'El tamaño se da en porcentaje del lado corto, no en píxeles, de modo que la marca se ve igual de grande en una foto vertical de móvil que en un panorámico de ocho mil píxeles.',
    ],
    steps: ['Arrastra las fotos.', 'Escribe el texto y elige su posición, tamaño y opacidad.', 'Procesa y descárgalas.'],
    faq: [
      { q: '¿Protege de verdad la imagen?', a: 'Disuade, que no es lo mismo. Una marca en la esquina se recorta en un segundo; una repetida por encima de la imagen es mucho más molesta de quitar, pero tampoco es imposible.' },
      { q: '¿Puedo poner un logotipo en vez de texto?', a: 'Todavía no: la marca es de texto. Mientras tanto puedes componer el logotipo con el texto en el editor y tratarlo como una imagen.' },
      { q: '¿Por qué la marca no se lee sobre según qué fotos?', a: 'Porque el color coincide con el del fondo. Deja activada la sombra, que es exactamente para eso, o cambia el color a uno que contraste.' },
    ],
  },
  'image-exif': {
    intro: [
      'Mira todo lo que lleva escondido una fotografía: modelo de cámara y de objetivo, apertura, velocidad, ISO, fechas y, si el móvil tenía la ubicación activada, las coordenadas exactas del lugar donde se hizo.',
      'Es la cara complementaria de «Quitar metadatos»: primero miras qué hay y luego decides si te molesta. Nada sale de la pestaña, cosa que con fotos personales no es un detalle menor.',
    ],
    steps: ['Suelta una foto.', 'Mira los datos agrupados por tema.', 'Si hay GPS, tienes un aviso bien visible.'],
    faq: [
      { q: '¿Por qué mi foto no tiene ningún metadato?', a: 'Porque alguien los ha quitado por el camino. WhatsApp, Instagram y la mayoría de redes los borran al subir la imagen, y una captura de pantalla no tiene nunca.' },
      { q: '¿Qué es exactamente lo que debería preocuparme?', a: 'Las coordenadas GPS, sobre todo en fotos hechas en casa. También la fecha y, en entornos profesionales, el número de serie del cuerpo de la cámara, que identifica el aparato.' },
      { q: '¿Cómo los quito?', a: 'Con «Quitar metadatos», que recodifica la imagen a partir de los píxeles desnudos y no copia ningún campo.' },
    ],
  },
  favicons: {
    intro: [
      'De una sola imagen sale todo el juego: los iconos PNG de 16, 32, 48, 192 y 512 píxeles, el de 180 que pide iOS y un favicon.ico de verdad con tres tamaños dentro.',
      'La imagen se recorta cuadrada desde el centro y se escala con el filtro de calidad alta del navegador. Con el fragmento de HTML incluido, solo tienes que copiar cuatro líneas en tu <head>.',
    ],
    steps: ['Suelta el logotipo, cuanto más cuadrado mejor.', 'Si lo quieres con fondo o con margen, ajústalo.', 'Procesa y descarga el ZIP con todo.'],
    faq: [
      { q: '¿Qué tamaño debe tener la imagen de partida?', a: 'Como mínimo 512 × 512 píxeles, y mejor si es cuadrada. Si es un SVG, conviértelo antes a PNG grande con «SVG a PNG»: así controlas tú la resolución.' },
      { q: '¿Todavía hace falta el .ico?', a: 'Sí, para navegadores y sitios antiguos que lo piden en la raíz por defecto. Pesa muy poco y te ahorras peticiones fallidas en el registro del servidor.' },
      { q: '¿Por qué queda ilegible a 16 píxeles?', a: 'Porque un logotipo con detalle fino no sobrevive a dieciséis píxeles. Para ese tamaño suele hacer falta una versión simplificada, a menudo solo la inicial o el símbolo.' },
    ],
  },
  'images-to-gif': {
    intro: [
      'Haz un GIF animado a partir de una serie de imágenes. El orden es el de la lista, y como las filas se pueden arrastrar, reordenar los fotogramas es cuestión de moverlos.',
      'Los fotogramas se encajan dentro de un lienzo común, centrados y sin deformarse, de modo que mezclar imágenes de tamaños distintos no hace saltar la animación.',
    ],
    steps: ['Arrastra las imágenes en el orden que quieras.', 'Ajusta la duración del fotograma y la anchura.', 'Combina y descarga el GIF.'],
    faq: [
      { q: '¿Por qué pesa tanto?', a: 'Porque el GIF es un formato de los años ochenta: sin pérdida, limitado a 256 colores y sin compresión entre fotogramas. Baja la anchura, recorta la paleta o usa menos fotogramas.' },
      { q: '¿Qué duración de fotograma debo poner?', a: '100 ms son diez imágenes por segundo, que es lo que se ve fluido sin disparar el peso. Por debajo de 20 ms muchos navegadores imponen su propio mínimo igualmente.' },
      { q: '¿Qué hace «volver atrás al acabar»?', a: 'Añade los fotogramas del revés al final, de modo que la animación va y vuelve en vez de dar un salto seco al reiniciarse.' },
    ],
  },
  'remove-background': {
    intro: [
      'Recorta el sujeto de una fotografía y deja el fondo transparente, o cámbialo por un color sólido. Va bien para fotos de producto, retratos y cualquier imagen que tenga que ir encima de otro diseño.',
      'Lo hace una red neuronal (u2netp) que se ejecuta en tu ordenador con ONNX Runtime compilado a WebAssembly. El modelo pesa 4,4 MB y se descarga una vez; a partir de ahí la foto no sale de la pestaña.',
      'No esperes el resultado de una hora de trabajo con máscaras en Photoshop. Sí deberías esperar un recorte limpio y utilizable en pocos segundos, que para la mayoría de casos es exactamente lo que hacía falta.',
    ],
    steps: ['Arrastra las fotos.', 'Elige si el fondo queda transparente o de un color.', 'Borde suave para pelo y pelaje; borde limpio para objetos con contorno definido.'],
    faq: [
      { q: '¿Cuándo funciona bien y cuándo no?', a: 'Muy bien con un sujeto claro sobre un fondo diferenciado: personas, productos, animales. Peor con escenas donde no hay ningún protagonista evidente, con objetos muy finos o cuando el sujeto y el fondo comparten color.' },
      { q: '¿Qué diferencia hay entre borde suave y borde limpio?', a: 'El suave conserva la transparencia parcial de los bordes, que es lo que hace que el pelo no quede como una silueta recortada con tijeras. El limpio decide para cada píxel si está o no, y va mejor con objetos de contorno duro.' },
      { q: '¿Por qué la primera vez tarda tanto?', a: 'Porque hay que descargar y compilar el motor de inferencia y el modelo. A partir de la segunda imagen ya está todo en memoria y va mucho más rápido.' },
    ],
  },

  // ------------------------------------------------------------- vector
  'svg-optimize': {
    intro: [
      'Los SVG que salen de Illustrator, Figma o Inkscape arrastran mucha cosa que el navegador no necesita: comentarios del editor, bloques de metadatos, atributos propietarios, identificadores generados y coordenadas con doce decimales.',
      'Esta página les pasa SVGO con la configuración por defecto más unas cuantas opciones que vale la pena poder tocar. En iconos exportados de un editor es habitual recortar entre el 40 y el 70 % del peso sin que cambie ni un píxel del dibujo.',
    ],
    steps: ['Arrastra los SVG, tantos como quieras.', 'Ajusta los decimales de los trazados si necesitas más o menos precisión.', 'Procesa y mira cuánto ha bajado cada uno antes de descargar.'],
    faq: [
      { q: '¿Cuántos decimales debo dejar en los trazados?', a: 'Tres va bien para casi todo. Con iconos pequeños puedes bajar a uno o dos y ahorrar todavía más; si el dibujo tiene curvas largas y suaves, bajar demasiado puede hacer aparecer ángulos visibles.' },
      { q: '¿Por qué está la opción de quitar width y height?', a: 'Porque un icono que debe escalar con CSS va mejor solo con viewBox: sin medidas fijas, ocupa lo que le diga el contenedor. Si en cambio insertas el SVG suelto en una página, déjalas.' },
      { q: '¿Qué hace el prefijo de los identificadores?', a: 'Añade el nombre del archivo delante. Si pones varios SVG en la misma página y todos tienen un degradado llamado "a", se pisan entre ellos; con el prefijo, cada uno mantiene el suyo.' },
    ],
  },
  'svg-to-png': {
    intro: [
      'Rasteriza un SVG al tamaño que necesites. Como el origen es vectorial, puedes pedir cualquier resolución sin que se vea pixelado: el mismo icono sirve para un favicon de 32 px y para un cartel de 4000.',
      'El tamaño se puede dar en píxeles o como multiplicador del viewBox, que es lo más cómodo para sacar versiones @2x y @3x de un juego de iconos entero de una sola pasada.',
    ],
    steps: ['Añade los SVG.', 'Indica una anchura en píxeles, o déjala a cero y usa la escala.', 'Elige si quieres fondo transparente y procesa.'],
    faq: [
      { q: '¿Por qué me sale de 300×150?', a: 'Es el tamaño por defecto que el navegador asigna a un SVG sin width, height ni viewBox. Añade un viewBox al archivo, o indica aquí una anchura explícita.' },
      { q: 'No se ven las letras, ¿qué pasa?', a: 'Un SVG rasterizado dentro de una página no puede cargar tipografías externas ni archivos de fuera. Convierte los textos a curvas desde tu editor antes de exportar el SVG.' },
      { q: '¿Puedo sacar un WebP en vez de PNG?', a: 'Sí, el selector de formato ofrece PNG, WebP y JPEG. Para iconos con transparencia, PNG y WebP; para ilustraciones con fondo sólido, WebP pesa mucho menos.' },
    ],
  },

  // ---------------------------------------------------------------- pdf
  'pdf-compress': {
    intro: [
      'En un PDF escaneado o hecho de fotos, casi todo el peso son las imágenes de dentro. Esta herramienta las busca una a una, las vuelve a codificar más pequeñas y las devuelve a su sitio, sin tocar nada más del documento.',
      'Eso es lo que la separa de la mayoría de compresores en línea, que aplanan cada página en una fotografía: aquí el texto sigue siendo texto que se puede seleccionar y buscar, los enlaces siguen funcionando y la estructura se mantiene. En un escaneo típico la reducción va del 60 al 90 %.',
      'Las imágenes que no se pueden recodificar con garantías —máscaras de transparencia, JPEG 2000, CMYK, mapas de bits de un solo bit— se dejan exactamente como estaban. Una imagen estropeada en silencio sería mucho peor que un archivo que no ha adelgazado tanto.',
    ],
    steps: ['Suelta el PDF, o unos cuantos.', 'Elige una calidad, o di directamente cuánto quieres que pese como máximo.', 'Descarga el resultado y compruébalo antes de tirar el original.'],
    faq: [
      { q: '¿Se pierde el texto seleccionable?', a: 'No. Solo se reemplazan las imágenes incrustadas; la capa de texto, los marcadores y los enlaces no se tocan. Si el PDF es un escaneo sin OCR, es que ya no tenía.' },
      { q: '¿Cuándo debería usar el modo que rasteriza?', a: 'Cuando el peso importe más que todo lo demás. Redibuja cada página como una fotografía: baja muchísimo, pero el texto deja de poderse seleccionar y buscar, y ya no hay marcha atrás.' },
      { q: 'Mi PDF apenas baja de peso, ¿por qué?', a: 'Porque el peso no está en las imágenes. Un documento de texto y vectores hecho desde un procesador de textos ya es compacto: no hay nada que exprimir, y la herramienta te lo dice junto al resultado.' },
      { q: '¿Sirve de algo la escala de grises?', a: 'Mucho, si el documento es texto escaneado. Quita la información de color, que en un folio blanco con letra negra es sobre todo ruido del sensor, y el resultado a menudo vuelve a bajar a la mitad.' },
    ],
  },
  'pdf-organize': {
    intro: [
      'Las otras herramientas de PDF te piden que escribas «1-3, 7» sobre un documento que no ves. Esta te lo dibuja: todas las páginas en miniatura, para arrastrarlas donde toque, girarlas una a una y quitar las que sobran.',
      'Cuando tienes el resultado a la vista, exportas. El PDF nuevo se construye copiando las páginas originales en el orden que hayas dejado, de modo que el texto, los enlaces y la calidad no se tocan.',
    ],
    steps: ['Suelta el PDF y espera a que se dibujen las miniaturas.', 'Arrastra las páginas, gira las torcidas y quita las que no quieras.', 'Pulsa «Exportar el PDF».'],
    faq: [
      { q: '¿Se puede deshacer?', a: 'El botón «Volver al original» restaura el orden, las rotaciones y las páginas quitadas de una vez. Y mientras no exportes, el archivo de tu disco no se ha tocado.' },
      { q: '¿Por qué tardan en salir las miniaturas?', a: 'Porque cada página se dibuja de verdad con el motor de renderizado, igual que haría un lector de PDF. Con documentos de muchas páginas van apareciendo a medida que se generan.' },
      { q: '¿Se pierde calidad?', a: 'Ninguna. Las miniaturas son solo para mirar; la exportación copia las páginas originales sin redibujarlas.' },
    ],
  },
  'pdf-to-images': {
    intro: [
      'Convierte cada página de un PDF en una imagen, a la resolución que le digas. Va bien para enviar una página por mensajería, ponerla en una presentación o subirla a un sitio que no acepta PDF.',
      'La resolución se pide en puntos por pulgada, que es la manera de decirlo que no depende del tamaño del folio: 150 ppp se lee cómodamente en pantalla y 300 es calidad de impresión.',
    ],
    steps: ['Suelta el PDF.', 'Elige el formato y la resolución, y si quieres solo unas páginas.', 'Procesa y descárgalas una a una o todas en un ZIP.'],
    faq: [
      { q: '¿Qué resolución debo poner?', a: '150 ppp para mirar en pantalla, 300 para imprimir. Por encima de 300 el archivo crece mucho y la mejora es difícil de ver si el origen es texto vectorial.' },
      { q: '¿Qué formato me conviene?', a: 'PNG si la página es texto y gráficos, que es el caso habitual y donde el JPEG deja suciedad alrededor de las letras. JPEG o WebP si la página es sobre todo una fotografía.' },
      { q: '¿Por qué una página muy grande sale más pequeña de lo que he pedido?', a: 'Hay un límite de píxeles por página para no agotar la memoria de la pestaña. Un A0 a 600 ppp serían mil millones de píxeles; en ese caso se rebaja la escala justo lo necesario.' },
    ],
  },
  'pdf-to-text': {
    intro: [
      'Saca el texto de un PDF para copiarlo, buscar en él o pasarlo a otra herramienta. Lee la capa de texto que el documento ya lleva, la misma que seleccionas con el ratón en el lector.',
      'Un PDF no guarda párrafos: guarda trozos de texto con una posición. Aquí se agrupan por su altura en la página, que es lo que más se acerca a lo que lees; cualquier cosa más lista que eso empieza a adivinar columnas y se equivoca.',
    ],
    steps: ['Suelta el PDF.', 'Elige si quieres unir las líneas cortadas.', 'Descarga el .txt o cópialo.'],
    faq: [
      { q: 'No me saca nada, ¿por qué?', a: 'Porque el PDF es un escaneo: páginas que son fotografías, sin ninguna capa de texto. Para leerlas hace falta OCR, que es otra cosa y esta herramienta no hace.' },
      { q: '¿Qué hace unir las líneas cortadas?', a: 'Junta los saltos de línea que solo están ahí porque la página se acababa, y conserva los que separan párrafos de verdad. Desactívalo si quieres el texto exactamente como está maquetado.' },
      { q: '¿Respeta las columnas y las tablas?', a: 'No mucho. El texto sale en el orden en que está en el documento, que en una página a dos columnas a menudo no es el orden de lectura.' },
    ],
  },
  'pdf-extract-images': {
    intro: [
      'Recupera las fotografías y los gráficos que hay dentro de un PDF como archivos separados. No son capturas de pantalla de las páginas: son las imágenes originales, tal como se incrustaron.',
      'Con la opción «tal como están en el PDF», las fotografías en JPEG salen byte a byte como están, sin pasar por ninguna recodificación. El resto se redibujan, porque su formato interno no es un archivo de imagen que se pueda guardar tal cual.',
    ],
    steps: ['Suelta el PDF.', 'Sube la anchura mínima si no quieres iconos ni líneas decorativas.', 'Procesa y descárgalas en un ZIP.'],
    faq: [
      { q: '¿Por qué salen menos de las que veo?', a: 'Dos razones. El filtro de anchura mínima descarta las pequeñas, y las imágenes en formatos que no se pueden leer con garantías se dejan estar en vez de arriesgarse a guardarlas estropeadas.' },
      { q: '¿Salen a la resolución original?', a: 'Sí. Lo que se extrae es la imagen tal como está en el documento, que a menudo tiene mucha más resolución de la que se ve impresa en la página.' },
      { q: '¿Y si lo que quiero son las páginas enteras?', a: 'Entonces lo que buscas es «PDF a imágenes», que dibuja cada página completa con el texto y todo.' },
    ],
  },
  'pdf-merge': {
    intro: [
      'Junta varios PDF en uno solo conservando sus páginas tal como están: el texto sigue siendo texto seleccionable, los enlaces internos siguen funcionando y no hay ninguna recodificación por medio.',
      'El orden es el de la lista, que es el de selección, pero también puedes pedir que se ordenen por el nombre del archivo, que es lo que suele convenir cuando los documentos se llaman 01, 02, 03.',
    ],
    steps: ['Arrastra todos los PDF que quieras unir.', 'Comprueba el orden, o pasa a ordenación por nombre.', 'Pulsa «Combinar» y descarga el documento resultante.'],
    faq: [
      { q: '¿Se pierde calidad?', a: 'Nada. Las páginas se copian enteras de un documento al otro; no se vuelven a dibujar ni se vuelven a comprimir las imágenes que contengan.' },
      { q: '¿Puedo unir PDF protegidos con contraseña?', a: 'Solo los que tienen restricciones de permisos, que se ignoran. Los que piden contraseña para abrirse están cifrados y no se pueden leer sin ella.' },
      { q: '¿Qué pasa con los marcadores y los formularios?', a: 'Los campos de formulario y los marcadores del documento original no se trasladan. Si el PDF es un formulario que debe poder rellenarse, únelo con una herramienta de escritorio.' },
    ],
  },
  'pdf-split': {
    intro: [
      'Parte un PDF de tres maneras: una página por archivo, bloques de un número fijo de páginas, o los rangos concretos que le digas.',
      'El resultado es un archivo por trozo, y cuando hay más de uno se pueden descargar todos juntos dentro de un ZIP con los nombres ya numerados.',
    ],
    steps: ['Añade el PDF.', 'Elige cómo quieres partirlo y, si procede, escribe los rangos.', 'Procesa y descarga los trozos.'],
    faq: [
      { q: '¿Cómo se escriben los rangos?', a: 'Separados por comas, con guion para los intervalos: «1-3, 7, 10-12» genera tres archivos. Cada grupo separado por coma es un documento de salida.' },
      { q: '¿Se pueden solapar los rangos?', a: 'Sí. Nada impide pedir «1-5, 3-8»; la página 3 saldrá en los dos archivos.' },
      { q: '¿Qué pasa si pido una página que no existe?', a: 'Los rangos se recortan a la última página del documento. Si tiene 10 y pides «8-50», obtendrás de la 8 a la 10.' },
    ],
  },
  'pdf-rotate': {
    intro: [
      'Corrige páginas escaneadas de lado o boca abajo. La rotación se acumula sobre la que ya tenga la página, así que el resultado es el que ves en el lector, no una suma que tengas que calcular tú.',
      'Puedes girar todo el documento o solo unas cuantas páginas, que es el caso habitual cuando el escáner ha girado solo los folios apaisados.',
    ],
    steps: ['Añade el PDF.', 'Elige el ángulo y, si no son todas, escribe las páginas.', 'Procesa y descarga.'],
    faq: [
      { q: '¿Cómo indico solo algunas páginas?', a: 'Con la misma notación de los rangos: «1-3, 7, 10-12». Si dejas el campo vacío, se giran todas.' },
      { q: '¿Se vuelve a comprimir el documento?', a: 'No. Girar una página es cambiar un atributo en la estructura del PDF; el contenido no se toca ni pierde calidad.' },
      { q: '¿Por qué mi lector ya me mostraba la página derecha?', a: 'Algunos lectores giran la vista sin guardarlo. Esta herramienta escribe la rotación en el archivo, de modo que ya sale bien en todas partes y al imprimir.' },
    ],
  },
  'pdf-extract': {
    intro: [
      'Quédate solo con las páginas que te interesan, o haz lo contrario y quita del documento las que sobran. Es la misma operación vista desde los dos lados, y el conmutador la cambia.',
      'Va bien para enviar solo el capítulo que hace al caso, para quitar una portada en blanco o para eliminar páginas con datos que no quieres compartir.',
    ],
    steps: ['Añade el PDF.', 'Escribe las páginas, por ejemplo «1-3, 7».', 'Marca la casilla si lo que quieres es borrarlas en vez de conservarlas.'],
    faq: [
      { q: '¿Las páginas borradas se pueden recuperar del archivo nuevo?', a: 'No. El documento de salida se construye copiando solo las páginas que se conservan, de modo que el resto no está de ninguna manera, ni escondido.' },
      { q: '¿Se mantiene el orden que escribo?', a: 'Las páginas salen en orden creciente, no en el orden en que las escribes. Para reordenarlas, usa «Organizar páginas».' },
      { q: '¿Puedo quitar la última página sin saber cuántas hay?', a: 'Escribe un número lo bastante alto para el final de un rango: se recorta solo a la última página existente.' },
    ],
  },
  'images-to-pdf': {
    intro: [
      'Haz un PDF con una imagen por página. Sirve tanto para convertir fotos de documentos hechas con el móvil en un archivo único como para empaquetar un juego de capturas en algo que se pueda enviar e imprimir.',
      'Con el tamaño de página «El de cada imagen», cada página tiene exactamente las dimensiones de su foto y no hay márgenes blancos ni escalados. Con A4 o carta, las imágenes se encajan centradas.',
    ],
    steps: ['Arrastra las imágenes en el orden que quieras que salgan.', 'Elige el tamaño de página, la orientación y el margen.', 'Pulsa «Combinar» y descarga el PDF.'],
    faq: [
      { q: '¿Qué formatos de imagen acepta?', a: 'Cualquiera que el navegador sepa abrir. Los JPEG y los PNG se incrustan directamente; el resto se convierte a PNG antes de añadirlos.' },
      { q: '¿Cómo cambio el orden de las páginas?', a: 'Arrastrando las filas de la lista, que es el orden del resultado.' },
      { q: 'El PDF pesa mucho, ¿qué puedo hacer?', a: 'Comprime o redimensiona las imágenes antes. Una foto de 12 megapíxeles tiene mucha más resolución de la que ninguna impresora aprovechará en un A4.' },
    ],
  },
  'pdf-watermark': {
    intro: [
      'Estampa «BORRADOR», «CONFIDENCIAL» o lo que haga falta en todas las páginas de un PDF. El texto se escribe como texto de verdad en el documento, no como una imagen pegada encima.',
      'Con la opción de repetirlo, la marca cubre la página entera en diagonal, que es el patrón clásico para los documentos que no deben reutilizarse.',
    ],
    steps: ['Suelta el PDF.', 'Escribe el texto y elige la posición, el tamaño y la opacidad.', 'Procesa y descarga.'],
    faq: [
      { q: '¿Se puede quitar la marca?', a: 'Con un editor de PDF decente, sí: el texto es un objeto más del documento. Sirve para marcar la intención, no para impedir nada.' },
      { q: '¿Puedo usar acentos y «ñ»?', a: 'Sí. Lo que no entra son los caracteres de fuera del latín-1, porque las tipografías internas del PDF no los tienen; si pones alguno, te lo dice antes de hacer nada.' },
      { q: '¿Queda por encima o por debajo del contenido?', a: 'Por encima. Con una opacidad baja el texto de debajo se sigue leyendo sin problemas.' },
    ],
  },
  'pdf-page-numbers': {
    intro: [
      'Añade la numeración a un PDF que no la lleva, que es la situación habitual cuando has unido varios documentos o has escaneado un pliego de folios.',
      'Puedes elegir el formato —solo el número, «1 / 10», «Página 1 de 10»—, la posición, el tamaño y desde qué página empieza a contar, para que la portada no se lleve el número uno.',
    ],
    steps: ['Suelta el PDF.', 'Elige el formato y dónde debe ir.', 'Si hay portada, di cuántas páginas hay que saltar.'],
    faq: [
      { q: '¿Cómo hago que la portada no se numere?', a: 'Pon 1 en «saltar las primeras». La numeración empezará en la segunda página, y el número que salga será el que digas en «empezar en».' },
      { q: '¿El número tapa el contenido?', a: 'Puede pasar si el documento ya tiene texto muy abajo. Sube el margen hasta que quede limpio; se mide en puntos, y 28 son un centímetro escaso.' },
      { q: '¿Se puede deshacer?', a: 'No desde aquí, así que conserva el original. El número pasa a ser parte del contenido de la página.' },
    ],
  },
  ocr: {
    intro: [
      'Un escaneo o una foto de un documento son una imagen: el texto que ves no se puede seleccionar, ni buscar, ni copiar. El OCR lo reconoce y te lo devuelve como texto de verdad.',
      'Puedes pedir un archivo de texto plano o, mejor aún, un PDF buscable: la misma imagen de siempre, con una capa de texto invisible debajo. Se ve exactamente igual, pero ahora lo puedes buscar y copiar fragmentos.',
      'El reconocimiento lo hace Tesseract compilado a WebAssembly, corriendo dentro de la pestaña. Un contrato o una factura escaneada no se envía a ningún servicio para leerla, que con esta clase de documentos no es un detalle menor.',
    ],
    steps: ['Suelta el escaneo, la foto o el PDF.', 'Elige el idioma del documento: acertarlo cambia mucho el resultado.', 'Decide si quieres texto plano o un PDF buscable, y procesa.'],
    faq: [
      { q: '¿Por qué tengo que decir el idioma?', a: 'Porque el reconocimiento no va letra a letra: usa un modelo del lenguaje para decidir entre lecturas posibles. Con el idioma equivocado, «palabra» puede acabar siendo «paIabra».' },
      { q: '¿Puedo marcar dos a la vez?', a: 'Sí, para documentos bilingües. Tiene un coste: cada idioma añadido hace el trabajo más lento y añade alguna confusión.' },
      { q: 'El resultado tiene errores, ¿qué puedo hacer?', a: 'El OCR depende sobre todo de la calidad del original. Sube la resolución a 300 ppp, endereza la imagen si está torcida y mira que el contraste sea bueno.' },
      { q: '¿Reconoce escritura a mano?', a: 'Prácticamente no. Tesseract está entrenado con texto impreso; con letra manuscrita los resultados no son aprovechables.' },
    ],
  },

  // -------------------------------------------------------------- datos
  'json-to-csv': {
    intro: [
      'Convierte una lista de objetos JSON en una tabla que Excel, Numbers o Google Sheets abren directamente. Las columnas salen de las claves, y se recogen todas las que aparezcan en cualquiera de los objetos.',
      'Los objetos anidados se aplanan con notación de punto, de modo que {"direccion": {"ciudad": "Girona"}} se convierte en una columna llamada direccion.ciudad.',
    ],
    steps: ['Pega el JSON o abre un archivo.', 'Elige el separador que espere tu hoja de cálculo.', 'Copia el resultado o descárgalo como .csv.'],
    faq: [
      { q: '¿Qué separador debo elegir?', a: 'La coma es el estándar, pero el Excel en configuración española suele esperar punto y coma. Si al abrir el archivo todo te sale en una sola columna, cámbialo.' },
      { q: 'Excel me estropea los acentos, ¿por qué?', a: 'Porque no detecta que el archivo es UTF-8. Marca la casilla del BOM: añade una marca invisible al principio que hace que Excel lo acierte.' },
      { q: '¿Qué pasa con los valores que son listas?', a: 'Se guardan dentro de la celda como texto JSON. Una tabla no tiene manera de representar una lista dentro de una casilla.' },
    ],
  },
  'csv-to-json': {
    intro: [
      'Convierte una tabla en una lista de objetos JSON, con los encabezados como nombres de campo. El separador se detecta solo mirando la primera línea, pero lo puedes forzar si la detección falla.',
      'El lector sigue las reglas del RFC 4180: respeta las comillas, las comillas dobles escapadas dentro de un valor y los saltos de línea en medio de un campo entrecomillado.',
    ],
    steps: ['Pega el CSV o abre el archivo.', 'Comprueba que el separador y la casilla de encabezados sean correctos.', 'Copia el JSON o descárgalo.'],
    faq: [
      { q: '¿Qué hace la opción de convertir números y booleanos?', a: 'Sin ella, todo sale como texto entrecomillado. Con ella, «42» pasa a ser el número 42 y «true» el booleano. Los valores que parecen números pero no lo son exactamente, como un código postal con cero delante, se dejan como texto.' },
      { q: 'Mi CSV no tiene encabezados.', a: 'Desmarca la casilla correspondiente. Cada fila saldrá como una lista de valores en vez de un objeto con nombres de campo.' },
      { q: '¿Qué pasa si dos columnas se llaman igual?', a: 'La segunda gana, porque un objeto JSON no puede tener dos claves iguales. Cambia el nombre de una de las columnas antes de convertir.' },
    ],
  },
  'json-to-yaml': {
    intro: [
      'Pasa un JSON a YAML manteniendo el orden de las claves. Es lo que necesitas cuando tienes que poner una configuración que tienes en JSON dentro de un docker-compose, un manifiesto de Kubernetes o un flujo de trabajo de CI.',
      'El resultado evita las referencias y las anclas, de modo que es legible y se puede pegar tal cual aunque haya estructuras repetidas.',
    ],
    steps: ['Pega el JSON.', 'Ajusta la indentación si tu proyecto usa otra.', 'Copia el YAML.'],
    faq: [
      { q: '¿Qué indentación debo elegir?', a: 'Dos espacios es la convención mayoritaria y la que usan Docker Compose y Kubernetes. El YAML no admite tabuladores en ningún caso.' },
      { q: '¿Por qué algunas cadenas salen entrecomilladas y otras no?', a: 'El YAML solo las necesita cuando el valor podría confundirse con otro tipo: «true», «null», «1.0» o una cadena que empiece con un carácter especial.' },
      { q: '¿Se conserva el orden de las claves?', a: 'Sí, sale el mismo orden que tenía el JSON de entrada.' },
    ],
  },
  'yaml-to-json': {
    intro: [
      'Convierte YAML a JSON para leerlo desde código, validarlo contra un esquema o simplemente ver su estructura sin depender de la indentación.',
      'Acepta archivos con varios documentos separados por «---»: en ese caso el resultado es una lista con un elemento por documento.',
    ],
    steps: ['Pega el YAML o abre el archivo.', 'Elige la indentación de salida.', 'Copia o descarga el JSON.'],
    faq: [
      { q: '¿Por qué me dice que el YAML no es válido?', a: 'Casi siempre es la indentación: un tabulador entre los espacios, o un nivel que no cuadra. El mensaje de error indica la línea donde el lector se ha perdido.' },
      { q: '¿Se pierde información al convertir?', a: 'Sí, la que el JSON no sabe representar: comentarios, anclas y referencias, y la distinción entre estilos de cadena. Los valores están todos.' },
      { q: '¿Qué pasa con las fechas?', a: 'El YAML las reconoce como tipo propio; al pasar a JSON se convierten en cadenas de texto en formato ISO.' },
    ],
  },
  'json-format': {
    intro: [
      'Indenta, minifica u ordena las claves de un JSON, y cuando no es válido te indica la línea, la columna y qué esperaba.',
      'El motor del navegador ya no dice dónde falla, así que cuando el JSON no pasa, la página lo recorre de nuevo con un analizador propio que sí lo puede decir: «sobra una coma antes de }», «se esperaba el nombre de una clave entre comillas dobles», y siempre con la posición exacta.',
    ],
    steps: ['Pega el JSON, tan desordenado como haga falta.', 'Elige si lo quieres indentado, minificado o con las claves ordenadas.', 'Copia el resultado.'],
    faq: [
      { q: '¿Para qué sirve ordenar las claves?', a: 'Para comparar dos JSON que tienen el mismo contenido en distinto orden. Una vez ordenados los dos, un diff de texto solo muestra las diferencias reales.' },
      { q: '¿Se sube el archivo a alguna parte?', a: 'No. Todo pasa dentro de la pestaña, cosa que importa cuando el JSON que pegas contiene claves de API o datos de clientes.' },
      { q: '¿Acepta JSON con comentarios o comas finales?', a: 'No, y te lo dirá con la posición exacta. Eso no es JSON estándar, aunque algunos archivos de configuración lo admitan.' },
    ],
  },
  'jwt-decode': {
    intro: [
      'Abre un JSON Web Token y muestra qué hay dentro: el algoritmo de la cabecera, todos los campos de la carga útil y las fechas de emisión, validez y caducidad convertidas a hora local.',
      'Un JWT no está cifrado, solo codificado en Base64: cualquiera que lo tenga puede leer su contenido. Por eso es importante no poner nunca nada que no quieras que se vea.',
    ],
    steps: ['Pega el token, con o sin el prefijo Bearer.', 'Mira la cabecera y la carga útil.', 'Comprueba la línea de caducidad.'],
    faq: [
      { q: '¿Se verifica la firma?', a: 'No. Para verificarla haría falta la clave secreta o la pública de quien lo ha emitido, y esta herramienta no tiene ninguna. Sirve para ver el contenido, no para decidir si el token es de fiar.' },
      { q: '¿El token llega a algún servidor?', a: 'No. La decodificación es Base64 pura hecha en la pestaña, cosa que importa bastante cuando lo que pegas es un token de sesión vivo.' },
      { q: '¿Qué significa que ha caducado?', a: 'Que el campo exp es anterior al momento actual. Muchos servidores dejan un margen de tolerancia de unos segundos, pero un token caducado normalmente se rechaza.' },
    ],
  },
  'base64-text': {
    intro: [
      'Codifica y decodifica texto en Base64, con soporte completo para UTF-8: los acentos, la eñe y los emoji pasan y vuelven intactos.',
      'La variante segura para URL sustituye los caracteres + y / por - y _, y quita el relleno final, que es lo que piden los JWT y muchos parámetros de consulta.',
    ],
    steps: ['Elige la dirección.', 'Pega el texto o el Base64.', 'Copia el resultado.'],
    faq: [
      { q: '¿Base64 es cifrar?', a: 'No, en absoluto. Es solo una manera de representar datos con caracteres seguros para transporte. Cualquiera lo puede deshacer en un segundo: no sirve para proteger nada.' },
      { q: '¿Por qué mi Base64 no se decodifica?', a: 'Suele ser el relleno. Esta página añade sola los signos «=» que falten y acepta tanto la variante estándar como la segura para URL, así que si aun así falla es que el texto está cortado.' },
      { q: '¿Cuánto crece el texto?', a: 'Un tercio aproximadamente: cada tres bytes se convierten en cuatro caracteres.' },
    ],
  },
  'base64-file': {
    intro: [
      'Convierte un archivo en un data URI listo para pegar dentro de una hoja de estilo, un HTML o un JSON de configuración. Sirve para incrustar un icono pequeño y ahorrarse una petición de red.',
      'Tiene sentido con archivos pequeños. A partir de unos pocos kilobytes, incrustar sale a cuenta perder: el recurso deja de poder cachearse por separado y la hoja de estilo engorda para todo el mundo.',
    ],
    steps: ['Suelta el archivo.', 'Elige si quieres el data URI completo o solo el Base64.', 'Procesa y descarga el .txt.'],
    faq: [
      { q: '¿Hasta qué tamaño vale la pena incrustar?', a: 'Como regla práctica, por debajo de unos 4 kB. Por encima, el crecimiento del 33 % y la pérdida de caché suelen hacer más daño que bien.' },
      { q: '¿Puedo incrustar un SVG?', a: 'Sí, pero para SVG suele ir mejor codificarlo con porcentajes en vez de Base64: ocupa menos y sigue siendo legible dentro del CSS.' },
      { q: '¿El tipo MIME sale bien?', a: 'Se toma del que el sistema operativo indica para el archivo. Si el navegador no sabe el tipo, se pone application/octet-stream y lo puedes corregir a mano.' },
    ],
  },
  hash: {
    intro: [
      'Calcula MD5, SHA-1, SHA-256, SHA-384 y SHA-512 de un texto o de un archivo, los cinco de golpe. El caso de uso habitual es comprobar que una descarga coincide con la suma que publica quien la distribuye.',
      'Los SHA los calcula la WebCrypto del navegador, que es código nativo. El MD5 no está ahí porque ya no se considera seguro, así que esta página lleva una implementación propia: todavía aparece en muchos archivos de comprobación antiguos.',
    ],
    steps: ['Elige la pestaña Texto o Archivo.', 'Escribe el texto o suelta el archivo.', 'Compara el valor con el que te han dado.'],
    faq: [
      { q: '¿Se sube el archivo para calcular el hash?', a: 'No. Se lee en la memoria de la pestaña y se calcula ahí. Con archivos muy grandes ten en cuenta que se carga entero.' },
      { q: '¿Qué hash debo mirar?', a: 'El que publique quien distribuye el archivo. Si puedes elegir, SHA-256. MD5 y SHA-1 valen para detectar una descarga corrompida, pero no para garantizar que nadie la haya manipulado a propósito.' },
      { q: '¿Por qué el hash cambia si el archivo «es el mismo»?', a: 'Porque un solo bit distinto lo cambia del todo. Un salto de línea CRLF en vez de LF, o un metadato añadido, ya dan un resultado completamente distinto.' },
    ],
  },

  // ------------------------------------------------------- texto y web
  'minify-css': {
    intro: [
      'Minifica CSS con CSSO, que hace bastante más que quitar espacios: acorta los colores, reduce las propiedades abreviadas y, si se lo dejas, fusiona reglas que comparten declaraciones.',
      'La reestructuración es lo que da la diferencia de verdad, y también es la que hay que mirar con más atención: cambia el orden de las reglas, y en hojas con mucha especificidad cruzada eso puede alterar el resultado.',
    ],
    steps: ['Pega el CSS.', 'Decide si activas la reestructuración.', 'Copia o descarga el .min.css.'],
    faq: [
      { q: '¿Es seguro activar la reestructuración?', a: 'Lo es en la gran mayoría de hojas, pero comprueba la página después. Si tienes reglas que dependen del orden en que aparecen para ganarse entre ellas, mejor desactivarla.' },
      { q: '¿Qué son los comentarios /*! */?', a: 'La convención para marcar un comentario que no debe quitarse, como una cabecera de licencia. Con la casilla activada se conservan y el resto desaparecen.' },
      { q: '¿Cuánto se suele ahorrar?', a: 'Entre un 15 y un 30 % en una hoja escrita a mano. Si el servidor ya comprime con gzip o brotli, la ganancia final es más modesta, pero se nota igualmente.' },
    ],
  },
  'minify-js': {
    intro: [
      'Minifica JavaScript con Terser, el mismo minificador que hay detrás de la mayoría de herramientas de compilación. Quita comentarios y espacios, acorta los nombres de las variables locales y simplifica el código muerto.',
      'Funciona con sintaxis moderna, incluidos los módulos ES, el encadenamiento opcional y los campos privados de clase.',
    ],
    steps: ['Pega el código.', 'Marca si es un módulo ES y elige el objetivo.', 'Copia o descarga el .min.js.'],
    faq: [
      { q: '¿Por qué tengo que decir si es un módulo ES?', a: 'Porque los módulos van siempre en modo estricto y tienen ámbito propio. Si lo indicas, Terser puede acortar nombres que en un script clásico serían globales y no se podrían tocar.' },
      { q: '¿Acortar los nombres me romperá algo?', a: 'Los nombres locales son seguros. Lo que sí rompe es el código que accede a ellos por cadena, como un framework que inyecta dependencias por el nombre del parámetro.' },
      { q: 'Me da un error de sintaxis que el navegador no me daba.', a: 'Terser analiza el archivo entero antes de nada. A menudo es sintaxis más nueva que el objetivo elegido: sube el objetivo a ES2020 y vuelve a probarlo.' },
    ],
  },
  'text-count': {
    intro: [
      'Cuenta caracteres, palabras, líneas, párrafos y frases mientras escribes, y te dice cuánto se tarda en leerlo y cuánto en decirlo en voz alta.',
      'Debajo están los límites con los que la gente se pelea de verdad: el título y la meta descripción para el buscador, y lo que cabe en una publicación. La barra se pone roja cuando te pasas.',
    ],
    steps: ['Pega o escribe el texto.', 'Mira el recuento, que se actualiza solo.', 'Vigila las barras de límite si escribes para un sitio concreto.'],
    faq: [
      { q: '¿Cómo cuenta las palabras?', a: 'Como secuencias de letras y cifras, de modo que una dirección web cuenta como unas cuantas. Es el mismo criterio que usan la mayoría de contadores.' },
      { q: '¿De dónde sale el tiempo de lectura?', a: 'De 220 palabras por minuto para la lectura en silencio y 130 para la lectura en voz alta, que son las medias habituales para un adulto con texto corriente.' },
      { q: '¿Por qué 158 caracteres en la meta descripción?', a: 'Porque es a partir de ahí que Google suele cortarla en los resultados. No es una regla escrita: depende del dispositivo y de la consulta.' },
    ],
  },
  'text-case': {
    intro: [
      'Pasa un texto a mayúsculas, a minúsculas, a formato de frase o a cualquiera de las convenciones que se usan programando: camelCase, PascalCase, snake_case, kebab-case y CONSTANT_CASE.',
      'El modo «Tipo Título» sigue la convención castellana: deja en minúscula las preposiciones y los artículos cortos, salvo que abran el título.',
    ],
    steps: ['Pega el texto.', 'Elige la convención.', 'Copia el resultado.'],
    faq: [
      { q: '¿Respeta los acentos?', a: 'Sí. «ángel» pasa a «ÁNGEL» y vuelve bien, porque la conversión usa las reglas de Unicode y no una tabla ASCII.' },
      { q: '¿Qué hace exactamente «Como una frase»?', a: 'Lo pasa todo a minúsculas y luego pone en mayúscula la primera letra del texto y la que sigue a un punto, una exclamación o una interrogación.' },
      { q: '¿Para qué sirve CONSTANT_CASE?', a: 'Es la convención para constantes y variables de entorno en muchos lenguajes: palabras en mayúscula separadas por guiones bajos.' },
    ],
  },
  'text-lines': {
    intro: [
      'Ordena una lista, quítale las repeticiones y las líneas vacías, numérala o inviértela. Es el trabajo que se acaba haciendo a mano en un editor de texto y que aquí se resuelve con cuatro casillas.',
      'La ordenación entiende los acentos y los números como toca: «Álex» va antes que «Bernardo», y «archivo10» después de «archivo9», no antes.',
    ],
    steps: ['Pega la lista, una entrada por línea.', 'Marca qué quieres que haga.', 'Copia el resultado.'],
    faq: [
      { q: '¿Por qué «archivo10» sale después de «archivo9»?', a: 'Porque la ordenación es natural: cuando encuentra números dentro del texto los compara como números y no como texto. Es lo que casi siempre se quiere.' },
      { q: '¿Quita los duplicados que solo se diferencian por las mayúsculas?', a: 'Solo si marcas «ignorar mayúsculas al comparar». Por defecto «Manzana» y «manzana» se consideran distintas.' },
      { q: '¿Se conserva el orden original si no ordeno?', a: 'Sí. Con «dejarlo como está», el resto de operaciones se hacen respetando el orden en que has pegado las líneas.' },
    ],
  },
  'url-encode': {
    intro: [
      'Codifica y decodifica el percent-encoding de las direcciones web, que es lo que convierte un espacio en «%20» y una «ñ» en «%C3%B1».',
      'La diferencia entre los dos alcances importa. Para un valor suelto hay que escapar también «/», «?», «&» y «=», porque dentro de un parámetro son texto; para una dirección entera hay que dejarlos tal como están o la rompes.',
    ],
    steps: ['Elige la dirección y el alcance.', 'Pega la dirección o el valor.', 'Copia el resultado.'],
    faq: [
      { q: '¿Qué alcance debo elegir?', a: 'Si lo que codificas es el contenido de un parámetro, «un valor suelto». Si es toda la dirección y solo quieres arreglar sus espacios y acentos, «una dirección entera».' },
      { q: '¿Espacios como «+» o como «%20»?', a: '«+» es la convención de los formularios enviados por GET, y muchos servidores la entienden. Fuera de la cadena de consulta, «%20» es la única forma correcta.' },
      { q: 'Me dice que no se puede decodificar.', a: 'Significa que hay un «%» que no va seguido de dos dígitos hexadecimales válidos. Suele pasar cuando el texto ya estaba decodificado y contenía un porcentaje literal.' },
    ],
  },
  'html-entities': {
    intro: [
      'Convierte «<», «>», «&» y las comillas en sus entidades, que es lo que hay que hacer para enseñar código dentro de una página sin que el navegador se lo trague como marcado.',
      'En sentido inverso, la decodificación la hace el propio analizador del navegador, de modo que entiende todas las entidades con nombre que existen, no una lista corta.',
    ],
    steps: ['Elige la dirección.', 'Pega el texto o el código.', 'Copia el resultado.'],
    faq: [
      { q: '¿Qué caracteres se escapan por defecto?', a: 'Los cinco que tienen significado dentro del marcado —&, <, >, " y \'— más el espacio duro. Con la casilla marcada, también todo lo que pase del código 127.' },
      { q: '¿Hay que escapar los acentos?', a: 'No, si la página declara UTF-8, que debería ser siempre. La opción está para sistemas antiguos y para correos en HTML, que todavía sufren con la codificación.' },
      { q: '¿Basta para evitar inyección de código?', a: 'Escapar para contenido HTML es una pieza, pero dentro de un atributo, de un <script> o de una URL las reglas son distintas. No te fíes de esta herramienta como medida de seguridad.' },
    ],
  },
  slugify: {
    intro: [
      'Convierte un título en una dirección limpia: sin acentos, sin símbolos, sin espacios y en minúsculas. Es lo que hace un gestor de contenidos cuando publicas un artículo.',
      'Trata bien el castellano y el catalán: la eñe pasa a «n», la ce cedilla a «c» y la ele geminada de «col·legi» queda «collegi» y no «col-legi».',
    ],
    steps: ['Pega el título.', 'Elige el separador y, si necesitas una, una longitud máxima.', 'Copia el slug.'],
    faq: [
      { q: '¿Guiones o guiones bajos?', a: 'Guiones. Google los interpreta como separadores de palabra y los guiones bajos no, de modo que para direcciones públicas el guion es siempre la elección.' },
      { q: '¿Qué pasa con la longitud máxima?', a: 'Corta, pero no en medio de una palabra: retrocede hasta el último separador si no queda demasiado corto. Un slug de entre tres y seis palabras suele ser el punto dulce.' },
      { q: '¿Puedo cambiar el slug de un artículo publicado?', a: 'Puedes, pero es una dirección nueva: lo que enlazaba a la antigua deja de funcionar. Si lo haces, deja una redirección 301 desde la antigua.' },
    ],
  },
  'format-html': {
    intro: [
      'Indenta HTML minificado o mal ordenado para que se pueda leer. Va bien para entender el código que te ha escupido una herramienta, para revisar una plantilla o para ver qué hay dentro de un correo en HTML.',
      'Respeta los elementos en línea y no parte el texto en medio de un párrafo, que es lo que hace que una indentación automática sea útil en vez de molesta.',
    ],
    steps: ['Pega el marcado.', 'Ajusta la indentación.', 'Copia o descarga el resultado.'],
    faq: [
      { q: '¿Cambia lo que se ve en la página?', a: 'Con HTML bien formado, no debería. Los espacios entre elementos en línea sí cuentan, así que revísalo si tienes una maquetación delicada con inline-block.' },
      { q: '¿Sirve para JSX o para plantillas?', a: 'Solo a medias. Las llaves de JSX y las etiquetas tipo {{ }} o <?php ?> lo despistan, porque analiza HTML y nada más.' },
      { q: '¿Y para minificarlo?', a: 'Esta herramienta va en el otro sentido. Para adelgazar la página, lo que más cuenta es el CSS y el JavaScript, que tienen sus propias herramientas aquí mismo.' },
    ],
  },
  'format-xml': {
    intro: [
      'Indenta un documento XML y, de paso, comprueba que esté bien formado: si hay una etiqueta sin cerrar o un carácter ilegal, te lo dice antes de tocar nada.',
      'Sirve para canales RSS, mapas del sitio, archivos de configuración y cualquier respuesta de API que llegue en XML en una sola línea inabarcable.',
    ],
    steps: ['Pega el XML.', 'Elige la indentación.', 'Copia el resultado.'],
    faq: [
      { q: '¿Qué significa que no es válido?', a: 'Que no está bien formado: una etiqueta sin cerrar, un «&» suelto que debería ser «&amp;» o dos elementos raíz. El mensaje indica qué esperaba.' },
      { q: '¿Valida contra un esquema?', a: 'No. Comprueba la estructura, no si cumple un XSD o un DTD, que es una comprobación mucho más exigente.' },
      { q: '¿Se conservan los comentarios y las secciones CDATA?', a: 'Sí, están en el resultado. Lo que puede cambiar es la indentación de lo que hay dentro.' },
    ],
  },
  'format-sql': {
    intro: [
      'Ordena una consulta SQL escrita en una sola línea: palabras clave en mayúsculas, cada campo en su línea y los JOIN alineados. Se lee en vez de tener que descifrarla.',
      'Entiende los dialectos de MySQL, PostgreSQL, SQLite, MariaDB y BigQuery, que es lo que evita que te deshaga la sintaxis propia de cada uno.',
    ],
    steps: ['Pega la consulta.', 'Elige el dialecto.', 'Copia el resultado.'],
    faq: [
      { q: '¿Me cambia lo que hace la consulta?', a: 'No. Solo toca los espacios, los saltos de línea y las mayúsculas de las palabras clave; los nombres de tabla y de columna se respetan tal como los has escrito.' },
      { q: '¿Por qué me dice que no la puede analizar?', a: 'Porque hay sintaxis que el dialecto elegido no reconoce. Prueba con el dialecto concreto de tu motor antes que con «SQL estándar».' },
      { q: '¿Puedo formatear varias de golpe?', a: 'Sí, separadas por punto y coma. Salen separadas por una línea en blanco.' },
    ],
  },
  color: {
    intro: [
      'Convierte un color entre HEX, RGB, HSL y OKLCH, genera una escala de once tonos y comprueba su contraste contra blanco y contra negro según los criterios de la WCAG.',
      'OKLCH es el formato que vale la pena conocer: está construido para que una misma luminosidad se perciba igual sea cual sea el tono, cosa que HSL no consigue ni de lejos. Por eso es mucho más fácil hacer escalas que se vean coherentes.',
    ],
    steps: ['Elige un color con el selector o escríbelo en cualquier formato.', 'Copia el formato que necesites.', 'Mira la tabla de contraste antes de usarlo para texto.'],
    faq: [
      { q: '¿Qué contraste necesito?', a: '4,5:1 para texto normal y 3:1 para texto grande o negrita, que es el nivel AA. El AAA pide 7:1. Por debajo de 3:1 el texto cuesta de leer para mucha gente.' },
      { q: '¿Por qué el amarillo y el azul con la misma luminosidad HSL se ven tan distintos?', a: 'Porque HSL no tiene en cuenta cómo percibe la luz el ojo humano, que es mucho más sensible al verde y al amarillo. OKLCH sí lo corrige.' },
      { q: '¿Qué formatos de entrada acepta?', a: 'HEX de tres, cuatro, seis u ocho dígitos, rgb(), hsl() y los nombres de color CSS como «tomato» o «rebeccapurple».' },
    ],
  },
  regex: {
    intro: [
      'Prueba una expresión regular contra un texto y mira sus coincidencias resaltadas, la posición de cada una y el contenido de los grupos, numerados y con nombre.',
      'Si escribes una sustitución, la verás aplicada en vivo, con las referencias $1, $2 y $&. Es el motor de JavaScript el que trabaja, de modo que lo que funciona aquí funciona igual en tu código.',
    ],
    steps: ['Escribe el patrón y marca las banderas.', 'Pega el texto de prueba.', 'Si lo necesitas, escribe la sustitución y mira el resultado.'],
    faq: [
      { q: '¿Qué banderas hay?', a: 'g para encontrarlas todas, i para ignorar mayúsculas, m para que ^ y $ funcionen línea a línea, s para que el punto incluya los saltos de línea, y u para el modo Unicode completo.' },
      { q: '¿Por qué solo me sale una coincidencia?', a: 'Porque la bandera g está desactivada. Sin ella, una expresión regular se para en la primera.' },
      { q: '¿Estas expresiones valen para Python o PHP?', a: 'Las básicas sí, pero los detalles cambian. Los grupos con nombre, las miradas atrás y las clases Unicode tienen sintaxis o soporte distintos según el lenguaje.' },
    ],
  },
  qr: {
    intro: [
      'Genera un código QR y descárgalo en SVG vectorial, que es lo que quieres para imprimir a cualquier tamaño sin que se pixele, o en PNG a la resolución que elijas.',
      'Puedes controlar sus colores y el nivel de corrección de errores. Con corrección alta el código sigue siendo legible aunque una parte quede tapada o dañada, a cambio de tener más módulos y, por tanto, cuadraditos más pequeños.',
    ],
    steps: ['Escribe el texto, la dirección o lo que quieras poner.', 'Ajusta el tamaño, el margen y los colores.', 'Descárgalo en SVG o en PNG.'],
    faq: [
      { q: '¿Qué nivel de corrección debo elegir?', a: 'M para pantalla y para impresiones limpias. Q o H si el código irá en una etiqueta que puede rayarse o mojarse, o si tienes que poner un logotipo en medio.' },
      { q: '¿Por qué no me lo lee el móvil?', a: 'Las tres causas habituales son poco contraste entre los dos colores, margen insuficiente (deja como mínimo cuatro módulos) o el código impreso demasiado pequeño para la cantidad de datos que contiene.' },
      { q: '¿Caduca el código?', a: 'No. No hay ningún servicio por medio: el QR contiene literalmente el texto que escribes. No es un enlace acortado que un día pueda dejar de funcionar.' },
      { q: '¿Puedo poner una red wifi?', a: 'Sí, con el formato WIFI:T:WPA;S:nombre-de-la-red;P:contraseña;; . La mayoría de móviles lo reconocen y ofrecen conectarse directamente.' },
    ],
  },
  diff: {
    intro: [
      'Compara dos textos y mira línea a línea qué se ha añadido y qué se ha quitado. Los bloques largos de líneas idénticas se pliegan para que solo veas lo que ha cambiado y el contexto que lo rodea.',
      'La comparación usa la subsecuencia común más larga, que es el mismo criterio que el diff de toda la vida, de modo que los resultados se parecen a los que verás en tu control de versiones.',
    ],
    steps: ['Pega el texto original a la izquierda.', 'Pega el nuevo a la derecha.', 'Ajusta las líneas de contexto si quieres ver más o menos.'],
    faq: [
      { q: '¿Se sube algo a alguna parte?', a: 'No. La comparación se hace en la pestaña, cosa que lo hace apto para contratos, registros y cualquier texto que no deberías pegar en un servicio en línea.' },
      { q: '¿Por qué me dice que hay demasiadas líneas?', a: 'El algoritmo necesita una tabla proporcional al producto de las dos longitudes. Por encima de unos millones de celdas se para a propósito para no colgar la pestaña.' },
      { q: '¿Detecta los cambios dentro de una línea?', a: 'Todavía no: una línea modificada sale como una línea quitada y una añadida.' },
    ],
  },
};

export const VARIANT_PAGES = {
  'comprimir-png': {
    intro: [
      'PNG comprime sin pérdida, y eso significa que hay un suelo por debajo del cual no puede bajar: si la imagen tiene degradados o ruido fotográfico, el archivo será grande y no hay mucho que hacer sin cambiar de formato.',
      'Por eso esta página está configurada para sacar un WebP. Conserva la transparencia igual que el PNG, y para una captura de pantalla típica el resultado suele ser entre diez y treinta veces más ligero. Si necesitas que la salida siga siendo PNG, cambia el formato a «Mantener el original»: la ganancia será mucho más modesta.',
    ],
    faq: [
      { q: '¿Por qué mi PNG apenas baja de peso si elijo «Mantener el original»?', a: 'Porque el PNG ya estaba comprimido y esta herramienta lo vuelve a codificar con el mismo algoritmo sin pérdida. Recodificar un formato sin pérdida no inventa espacio: lo que hace bajar el peso de verdad es cambiar a WebP o reducir el tamaño en píxeles.' },
      { q: '¿Un WebP sin pérdida es igual de bueno que el PNG?', a: 'Es idéntico píxel a píxel y, de media, un 26 % más pequeño. La diferencia es el soporte: todos los navegadores lo abren, pero algunos programas de escritorio antiguos todavía no.' },
      { q: '¿Cómo puedo bajar mucho el peso sin cambiar de formato?', a: 'Reduciendo el tamaño en píxeles. Una captura de 3000 px de ancho que se mostrará a 800 px tiene nueve veces más píxeles de los necesarios.' },
    ],
  },
  'comprimir-jpg': {
    intro: [
      'Esta página recodifica JPEG a JPEG, que es lo que necesitas cuando el destino no admite nada más: un gestor de contenidos antiguo, una plataforma que solo acepta fotos o un cliente que pide explícitamente .jpg.',
      'Ten presente que cada recompresión acumula pérdida. Parte siempre del original de la cámara, no de una copia que ya haya pasado por WhatsApp o por otro compresor.',
    ],
    faq: [
      { q: '¿Qué calidad debería poner?', a: 'Entre 75 y 85 es donde casi nadie distingue el resultado del original en una pantalla. Por debajo de 60 empiezan a aparecer bloques visibles en los degradados y alrededor del texto.' },
      { q: '¿Puedo decir directamente cuánto quiero que pese?', a: 'Sí. Cambia el objetivo a «Tamaño máximo del archivo» y pon los kilobytes. La página prueba distintas calidades hasta encontrar la más alta que cabe, y si hace falta también reduce la imagen.' },
      { q: '¿Se conservan los datos EXIF?', a: 'No. La recodificación pasa por un lienzo del navegador, que solo trabaja con píxeles, de modo que la fecha, el modelo de cámara y las coordenadas GPS desaparecen por el camino.' },
    ],
  },
  'jpg-a-pdf': {
    intro: [
      'Junta fotografías JPEG en un solo PDF, una por página y en el orden que quieras. Es el camino rápido para convertir fotos de documentos hechas con el móvil en un archivo único que se pueda enviar o imprimir.',
      'Los JPEG se incrustan tal cual, sin recodificar, así que el PDF no pierde calidad respecto de las fotos originales y se genera rápido.',
    ],
    faq: [
      { q: '¿En qué orden salen las páginas?', a: 'En el orden en que aparecen en la lista, que puedes cambiar arrastrando las filas.' },
      { q: '¿Cómo hago que todas las páginas sean A4?', a: 'Cambia el tamaño de página a A4. Cada foto se escalará para caber entera, centrada y manteniendo la proporción, con el margen que indiques.' },
      { q: '¿Puedo mezclar imágenes verticales y apaisadas?', a: 'Sí. Con la orientación en «Según la imagen», cada página toma la de su contenido, de modo que las fotos apaisadas no quedan pequeñas en medio de un folio vertical.' },
    ],
  },
  'png-a-pdf': {
    intro: [
      'Convierte capturas de pantalla, dibujos y diagramas en PNG a un PDF con una imagen por página. Va bien para entregar un juego de capturas como un solo documento, o para imprimir una serie de láminas.',
      'A diferencia de los JPEG, los PNG se vuelven a comprimir al incrustarlos en el PDF, de modo que el resultado suele pesar menos que la suma de los originales.',
    ],
    faq: [
      { q: '¿Se mantiene la transparencia?', a: 'El PDF pinta las zonas transparentes de blanco, que es lo que verás al imprimir. Si necesitas conservar el canal alfa, deja las imágenes en PNG.' },
      { q: 'La captura sale borrosa al imprimir, ¿por qué?', a: 'Porque un PNG de pantalla tiene pocos píxeles para el tamaño de papel. Con el tamaño de página «El de cada imagen» el PDF conserva la resolución original en vez de estirarla hasta un A4.' },
      { q: '¿Puedo añadir márgenes?', a: 'Sí, siempre que elijas un tamaño de página fijo. El margen se mide en milímetros y se aplica por igual a los cuatro lados.' },
    ],
  },
};
