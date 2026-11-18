import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// El panel (con el generador de QR) y el formulario de reseña se descargan
// solo cuando se visitan, para que la portada cargue más rápido (1.3).
const ResenaView = lazy(() => import('./ResenaView.jsx').then(m => ({ default: m.ResenaView })))
const AdminView = lazy(() => import('./AdminView.jsx').then(m => ({ default: m.AdminView })))

// Enrutamiento manual (sin librería de rutas): la app solo tiene tres
// vistas. vercel.json redirige cualquier ruta a index.html para que esto
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#FDFBF7]" />}>
      <Root />
    </Suspense>
  </StrictMode>,
)
