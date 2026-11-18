// Prerenderizado de la portada (corrección 1.3, rendimiento).
// Se ejecuta solo al compilar (npm run build), nunca en el navegador:
// genera el HTML de la app pública para que la foto principal y los textos
// aparezcan sin esperar al JavaScript. main.jsx luego "hidrata" ese HTML.
// El árbol debe ser idéntico al que monta main.jsx en la ruta "/".
import { StrictMode, Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import { FallbackCarga } from './FallbackCarga.jsx';

export function render() {
  return renderToString(
    <StrictMode>
      <Suspense fallback={<FallbackCarga />}>
        <App />
      </Suspense>
    </StrictMode>,
  );
}
