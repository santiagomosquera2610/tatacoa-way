// Arranque de React (se carga desde main.jsx). Contiene el enrutamiento y
// el montaje/hidratación de la app.
import { StrictMode, lazy, Suspense } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import { FallbackCarga } from './FallbackCarga.jsx'
// El panel (con el generador de QR) y el formulario de reseña se descargan
// solo cuando se visitan, para que la portada cargue más rápido (1.3).
const ResenaView = lazy(() => import('./ResenaView.jsx').then(m => ({ default: m.ResenaView })))
const AdminView = lazy(() => import('./AdminView.jsx').then(m => ({ default: m.AdminView })))

// Enrutamiento manual (sin librería de rutas): la app solo tiene tres
// vistas. vercel.json sirve app.html (vacío) en /admin y /resena, e
// index.html (con la portada prerenderizada) en el resto, para que todo
// funcione al recargar o al abrir un QR.
//   /            → app pública
//   /resena/:id  → formulario de reseña (se abre desde el QR del prestador)
//   /admin       → panel del semillero. A propósito NO hay ningún enlace a
//                  esta ruta desde la app pública: se entra escribiéndola.
function Root() {
  const path = window.location.pathname;
  const matchResena = path.match(/^\/resena\/(.+)$/);

  if (matchResena) {
    return <ResenaView servicioId={matchResena[1]} />;
  }
  if (path.startsWith('/admin')) {
    return <AdminView />;
  }
  return <App />;
}

const arbol = (
  <StrictMode>
    <Suspense fallback={<FallbackCarga />}>
      <Root />
    </Suspense>
  </StrictMode>
)

// En la portada, index.html ya trae el HTML prerenderizado (ver
// scripts/prerender.mjs): React lo hidrata en vez de redibujarlo, así la
// foto principal se ve desde el primer momento. /admin y /resena reciben
// app.html, vacío, y se montan normalmente.
const contenedor = document.getElementById('root')
if (contenedor.hasChildNodes()) {
  hydrateRoot(contenedor, arbol)
} else {
  createRoot(contenedor).render(arbol)
}
