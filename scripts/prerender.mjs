// Paso final de `npm run build` (corrección 1.3, rendimiento):
// 1. Guarda una copia vacía de index.html como app.html, que vercel.json
//    sirve en /admin y /resena (esas vistas no deben mostrar la portada).
// 2. Inserta en index.html el HTML prerenderizado de la portada.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = path.resolve('dist');
const plantilla = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const marcador = '<div id="root"></div>';
if (!plantilla.includes(marcador)) throw new Error('No se encontró <div id="root"></div> en dist/index.html');

fs.writeFileSync(path.join(dist, 'app.html'), plantilla);

const { render } = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href);
const html = render();
fs.writeFileSync(path.join(dist, 'index.html'), plantilla.replace(marcador, `<div id="root">${html}</div>`));
console.log(`Portada prerenderizada: ${(html.length / 1024).toFixed(1)} KB de HTML en dist/index.html`);
