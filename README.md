# Tatacoa Way

Aplicativo web sin ánimo de lucro del semillero de investigación **Quantum – FET** (programa de Ingeniería de Software, Fundación Escuela Tecnológica de Neiva). Centraliza la información turística del Desierto de la Tatacoa (Villavieja, Huila) y conecta a turistas con prestadores locales de forma directa (WhatsApp o llamada), **sin pagos, reservas ni comisiones**.

Publicado en https://tatacoa-way.vercel.app

## Reglas del proyecto

1. **Honestidad de la información:** nada se muestra como verificado, calificado o real si no lo es. Todo dato de Descubre tiene fuente (`src/FuentesData.js`) y toda foto, su crédito.
2. **Cero fricción:** sin registro ni descargas; se entra por enlace o QR.
3. **Modelo informativo peer-to-peer:** sin pagos, reservas ni comisiones.
4. **Mobile first:** pensado para celular, en exteriores y con poca señal.

## Stack

- React 19 + Vite + Tailwind CSS 4
- `motion` (animaciones ligadas al scroll), `lucide-react` (íconos)
- Leaflet + OpenStreetMap (mapa), `routing.openstreetmap.de` (rutas a pie y en carro), Open-Meteo (clima)
- Supabase (base de datos de servicios y reseñas, y login del panel)
- Vercel (despliegue automático al hacer push a `main`)

## Rutas

El enrutamiento es manual en `src/arranque.jsx` (sin router). `vercel.json` sirve `app.html` en `/admin` y `/resena`, e `index.html` (con la portada prerenderizada) en el resto.

| Ruta | Qué es |
|---|---|
| `/` | App pública: Descubre, Directorio y Mapa |
| `/resena/:id` | Formulario público de reseña (sin cuenta), pensado para abrirse desde el QR del prestador |
| `/admin` | Panel del semillero (login con Supabase Auth). **No hay ningún enlace a él desde la app pública:** se entra escribiendo la dirección |

## Estructura de `src/`

| Archivo | Responsabilidad |
|---|---|
| `main.jsx` | Punto de entrada: espera a que se pinte la foto de portada y luego carga React |
| `arranque.jsx` | Elige la vista según la ruta; hidrata la portada prerenderizada |
| `entry-server.jsx` | Render de la portada al compilar (prerenderizado) |
| `Foto.jsx` | Imágenes WebP responsive (480/800/1200 px) con JPG de respaldo |
| `MapaView.jsx` | Pestaña Mapa (Leaflet), cargada bajo demanda |
| `App.jsx` | Shell de la app pública, barra inferior, Directorio, ficha de servicio y Mapa |
| `DescubreView.jsx` | Narrativa con scroll: hero, línea del tiempo con cambio de color por época, sección "Más allá del nombre" (tarjetas apiladas), hoja "Leer más" y educación ambiental |
| `HistoriaData.js` | Épocas de la línea del tiempo (texto, detalle ampliado, fuentes, foto, tono de fondo) |
| `ContextoData.js` | Tarjetas de ecosistema, conservación, paleontología y cultura, con foto y crédito |
| `EducacionData.js` | Buenas prácticas de "Cuida lo que ves" |
| `FuentesData.js` | Catálogo único de fuentes verificadas (reutilizable en "Acerca de") |
| `CondicionesCielo.jsx`, `useCondicionesCielo.js` | Módulo "Cielo esta noche" (clima y fase lunar) |
| `PuntosInteresData.js` | Puntos informativos del mapa (miradores, museo, salud) tomados de OpenStreetMap |
| `ServiciosData.js` | Copia de respaldo del directorio, usada solo si no hay credenciales de Supabase |
| `useServicios.js` | Lectura y escritura de la tabla `servicios` |
| `useResenas.js` | Reseñas: envío público, promedios de las aprobadas, moderación |
| `ratingUtils.js` | Calificación mostrada: **solo** el promedio de reseñas reales aprobadas; si no hay, "Sin calificaciones aún" |
| `useRuta.js` | Cálculo de rutas reales para el mapa |
| `AdminView.jsx` | Panel: Reseñas, Servicios, Códigos QR y Vista pública |
| `QRAdminView.jsx` | Generación, impresión y descarga en PNG de los QR de reseña |
| `useAuth.js`, `supabaseClient.js` | Sesión del panel y cliente de Supabase |

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y completa las dos variables de Supabase
npm run dev
```

Variables (también configuradas en Vercel):

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`: sin ellas la app funciona en modo de respaldo con `ServiciosData.js`.
- `VITE_URL_PUBLICA` (opcional): dirección a la que apuntan los QR. Por defecto, `https://tatacoa-way.vercel.app`.

Otros comandos: `npm run build` y `npm run lint` (oxlint).

`npm run build` hace tres pasos: compila la app, compila `src/entry-server.jsx` para el servidor y ejecuta `scripts/prerender.mjs`, que escribe el HTML de la portada dentro de `dist/index.html` (React lo hidrata en el navegador) y deja `dist/app.html` vacío para `/admin` y `/resena`. Si agregas algo a la portada que dependa de `window` durante el render, el prerenderizado fallará: muévelo a un `useEffect`.

## Base de datos

Todo el SQL aplicado está en `supabase-setup.md`, en bloques numerados. Los cambios de esquema se agregan ahí como un bloque nuevo y se ejecutan a mano en el SQL Editor de Supabase. La seguridad (RLS) permite leer servicios y enviar reseñas sin cuenta; crear, editar, aprobar o borrar exige sesión en el panel.

## Historial

Ver `CHANGELOG.md`.
