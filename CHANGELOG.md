# Changelog

## 2026-11-17 (cierre 2026-2)

### Corrección 1.1: sin calificación inicial
- Se eliminó la "calificación inicial" asignada por el semillero. La calificación mostrada sale **solo** del promedio de reseñas reales aprobadas; si no hay, se muestra "Sin calificaciones aún" (tarjeta, ficha y mapa).
- Filtro 4.5+ / 4.8+: los servicios sin reseñas ya no lo cumplen; si ninguno califica, se explica por qué.
- Panel: se quitó el campo "Calificación inicial"; la estadística ahora es el promedio de reseñas aprobadas ("Prom. reseñas"). Un servicio nuevo nace **sin verificar**.
- El botón de WhatsApp solo aparece en servicios verificados (PF-09); los no verificados muestran su ubicación en Google Maps.
- `supabase-setup.md`, bloque 10 (opcional): borra `rating_inicial` de la base de datos.

### Corrección 1.2: accesibilidad (Lighthouse celular: 87 → 100 en el inicio)
- Nombre accesible en todos los botones de solo ícono: barra inferior (Descubre, Directorio, Mapa, con `aria-current`), volver, cerrar, ubicación ("Centrar el mapa en mi ubicación"), luna ("Ver clima y fase lunar"), estrellas de la reseña, editar y eliminar del panel, y los pines del mapa.
- Contraste WCAG AA (≥ 4.5:1): gris de textos secundarios `#9ba09d` → `#5f6563`; terracota `#c86343` → `#a34b2b`; botón de WhatsApp `#25D366` (2.0:1 con texto blanco) → `#15803d`; textos oscuros semitransparentes subidos a 80 %.
- `lang="es"`, título y descripción de la página; `<main>` en el formulario de reseña; orden correcto de títulos en el Directorio.
- Resultado (Lighthouse 13.6, celular): inicio 100, ficha de servicio 100, reseña 100, Directorio 100 en contraste y nombres. Mapa 96 solo por pines muy juntos (`target-size`); agruparlos sería una función nueva, se deja para 2027-1.

### Corrección 1.3: rendimiento
- Fotos en WebP (480, 800 y 1200 px) con `srcset`/`sizes` mediante el componente `Foto`; el JPG queda solo como respaldo. Peso total de la portada: 6,6 MB → 0,7 MB (la foto principal: 921 KB → 90 KB).
- Foto principal (LCP): `fetchpriority="high"`, sin `loading="lazy"`, con `width`/`height`, y precargada desde `index.html` solo en `/`. El resto de imágenes: `loading="lazy"` y `decoding="async"`.
- Fuente Outfit cargada en paralelo y sin bloquear el primer dibujo (antes iba en cadena con `@import` desde el CSS).
- Código dividido: el Mapa (Leaflet), el panel, el formulario de reseña y la librería de Supabase se descargan solo cuando se necesitan. Paquete inicial: 190 → 135 KB comprimidos.
- La portada ya no arranca invisible (la animación de entrada retrasaba el LCP).
- Medición local (Lighthouse 13.6, producción en local): celular 90 → 89–90 con FCP 2,8 → 0,8 s y LCP 2,8 → 3,6–3,8 s en modo simulado; con la red y el CPU lentos aplicados de verdad, LCP 2,5 s y 94 puntos. Escritorio: 100 puntos, LCP 0,6 s. La cifra oficial se toma en PageSpeed tras publicar.

### Corrección 2.2: contenido de Descubre con fuentes
- Verificación de todos los textos contra fuentes oficiales y académicas (Plan de Manejo DRMI La Tatacoa, CAM 2025; *Geodiversitas*; *Frontiers in Earth Science*; *Caldasia*). Se corrigieron datos sin respaldo o falsos: "15 millones de años" (son unos 13), "tortugas del tamaño de un auto", "nula contaminación lumínica", "segundo territorio árido más grande", "88 constelaciones", entre otros.
- "Leer más" en cada tarjeta: hoja con texto ampliado, fuentes enlazadas y crédito de la foto.
- Nueva sección "Más allá del nombre": bosque seco tropical, área protegida (DRMI), La Venta, fósiles del Pleistoceno, museos comunitarios y patrimonio del Huila. Seis fotos nuevas de Wikimedia Commons con licencia libre y crédito.

### Diseño de Descubre
- Narrativa ligada al scroll: el hero se encoge en tarjeta, la línea del tiempo se llena, el fondo cambia de color por época, anochece con estrellas en "Una ventana al universo" y amanece de forma gradual.
- Tarjetas apiladas (efecto "stack") en "Más allá del nombre".
- Todo se apaga con "Reducir movimiento" del sistema.
- El hero ahora dice "Desierto de la Tatacoa".

### Panel de administración
- Nueva pestaña "Vista pública": la app tal como la ve un turista, en un marco de celular.
- Descarga en PNG del QR de cada prestador.
- Los QR siempre apuntan a la dirección publicada (antes podían salir con `localhost`).
- Guardar un servicio ahora avisa si Supabase rechaza el cambio (antes decía "Cambios guardados" igual).
- "Imprimir todo" imprime solo las tarjetas QR.

### Pendiente
- 1.3: confirmar LCP en PageSpeed después de publicar.
- 2.1 Pantalla "Acerca de" (verificación, privacidad, créditos de todas las fotos).
- Antes de la evaluación: quitar o desmarcar los 6 prestadores de ejemplo (Carlos Ramírez, María Gómez, Asoc. Villavieja, TukTuk Tatacoa, Hostal Saturno, Rest. El Oasis). Son datos de prueba, con teléfonos inventados.

## 2026-10-07

### Diseño y pulido
- Auditoría de diseño con el taste skill; conectadas las fotos locales ya descargadas en `public/img/` (timeline de Descubre + hero).
- Arregladas 6 fotos del Directorio que estaban rotas (hotlinks de Wikimedia con hash inválido, error 400).
- Rediseño de las tarjetas del Directorio: precio en vez de un "Disponible hoy" repetido y sin sentido, indicador de "ver más", foto más grande.
- Conectado el botón "Contactar en WhatsApp" (antes no tenía ningún enlace, no hacía nada al tocarlo).
- Fotos del Directorio reemplazadas por fotos reales y acordes a cada servicio (motocarro, chiva, glamping, achiras del Huila) en vez de paisajes genéricos reciclados.
- Filtro por calificación mínima (Todas / 4.5+ / 4.8+) en el Directorio.
- Etiqueta "Beta" visible en toda la app.

### Funciones nuevas del MVP
- **Clima y fase lunar en tiempo real** (Mapa): datos reales de Open-Meteo (sin API key) + fase lunar calculada localmente, con recomendación para observación astronómica.
- **Educación ambiental**: sección de buenas prácticas al final de Descubre.

### Sistema de reseñas reales
- Página pública `/resena/:id` (sin necesidad de cuenta) pensada para abrirse desde un QR físico que el prestador muestra al final de su servicio.
- Backend en Supabase (tabla `resenas`, moderación vía columna `aprobado`).
- El rating que se muestra ahora es honesto: promedio real de reseñas aprobadas si existen, o la calificación inicial del semillero claramente etiquetada como tal si no.

### Panel de administración (`/admin`)
- Protegido con login de Supabase Auth.
- Pestaña **Reseñas**: aprobar/rechazar, con filtro Pendientes/Publicadas/Todas.
- Pestaña **Servicios**: alta, edición y borrado completo (nombre, foto, teléfono, precio, descripción, ubicación, calificación inicial, estado de verificación), con buscador y filtro por categoría.
- Pestaña **Códigos QR**: genera e imprime el QR de reseña de cada servicio.
- Barra de estadísticas (servicios activos, reseñas pendientes, rating promedio).
- Confirmación antes de eliminar/rechazar, notificaciones de éxito/error, motion con resortes físicos (skills `apple-design` + `frontend-design`).
- Los datos de servicios migraron de un archivo estático a la tabla `servicios` de Supabase (editable desde el panel, sin necesitar un deploy).

### Mapa rehecho
- **Ruteo real** (a pie / en carro) que sigue calles y senderos de verdad, vía `routing.openstreetmap.de` (gratis, sin API key), con distancia y tiempo estimado.
- **9 puntos de interés reales** (miradores, el Museo Paleontológico, hospital, farmacia) sacados de OpenStreetMap, con fotos reales.
- Los servicios del Directorio también aparecen como pines en el mapa, con acceso directo a "Cómo llegar" o "Ver detalle".

### Directorio ampliado con lugares reales
- 11 hospedajes y restaurantes reales de la zona (sacados de OpenStreetMap) agregados al Directorio, casi triplicando el tamaño original (6 → 17).
- Marcados `verificado: false` hasta que el semillero los confirme en persona — **sin inventar** teléfono, precio ni calificación que no se conocen: se muestra "Consulta precios en el lugar", "Sin calificar aún", y un enlace a Google Maps en vez de WhatsApp cuando no hay un número real.
- El panel de admin permite marcar/desmarcar la verificación de cada uno.

### Pendiente
- PWA real (manifest.json + ícono instalable + service worker) — evaluado como seguro de implementar, aún no hecho.
- Créditos/atribución de las fotos de Wikimedia Commons con licencia CC BY / CC BY-SA.
