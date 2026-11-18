// Punto de entrada (corrección 1.3, rendimiento).
//
// La portada llega prerenderizada en el HTML (scripts/prerender.mjs). Para
// que la foto principal se pinte lo antes posible, React (arranque.jsx) se
// descarga y se ejecuta DESPUÉS de que esa foto termina de cargar: así el
// JavaScript no compite con ella ni retrasa su pintado (LCP). Mientras
// tanto la portada ya se ve completa. En /admin y /resena (HTML vacío)
// React arranca de inmediato.
import './index.css'

let iniciado = false
function arrancar() {
  if (iniciado) return
  iniciado = true
  import('./arranque.jsx')
}

const contenedor = document.getElementById('root')
const fotoPrincipal = contenedor.hasChildNodes()
  ? contenedor.querySelector('img[fetchpriority="high"]')
  : null

if (fotoPrincipal && !fotoPrincipal.complete) {
  const despuesDePintar = () => requestAnimationFrame(() => setTimeout(arrancar, 0))
  fotoPrincipal.addEventListener('load', despuesDePintar, { once: true })
  fotoPrincipal.addEventListener('error', arrancar, { once: true })
  setTimeout(arrancar, 3000) // respaldo por si el evento nunca llega
} else {
  arrancar()
}
