# Changelog

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
