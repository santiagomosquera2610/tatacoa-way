import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import { useServicios } from './useServicios';

// Los QR siempre apuntan a la app publicada, aunque el panel se abra desde
// localhost o desde una vista previa de Vercel: un QR impreso con una
// dirección local no le serviría a ningún turista.
const URL_PUBLICA = import.meta.env.VITE_URL_PUBLICA || 'https://tatacoa-way.vercel.app';

export function QRAdminView() {
  const { servicios } = useServicios();

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 print:hidden">
          <h1 className="text-2xl font-black text-desert-night mb-1">Códigos QR de reseña</h1>
          <p className="text-desert-stone font-medium text-sm">
            Imprime cada tarjeta y entrégala al prestador para que la muestre al final de su servicio.
          </p>
          <button
            onClick={() => window.print()}
            className="mt-4 bg-desert-earth text-white font-bold text-sm px-5 py-2.5 rounded-full"
          >
            Imprimir todo
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map(servicio => (
            <TarjetaQR key={servicio.id} servicio={servicio} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TarjetaQR({ servicio }) {
  const qrRef = useRef(null);
  const [descargando, setDescargando] = useState(false);
  const url = `${URL_PUBLICA}/resena/${servicio.id}`;

  async function descargar() {
    setDescargando(true);
    try {
      await descargarPNG(qrRef.current.querySelector('svg'), servicio);
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-desert-sand/50 shadow-desert-sm flex flex-col items-center text-center break-inside-avoid">
      <span className="text-[10px] font-bold text-desert-earth uppercase tracking-wider mb-2">
        {servicio.categoria}
      </span>
      <h2 className="font-black text-desert-night text-lg">{servicio.nombre}</h2>
      <button
        type="button"
        onClick={descargar}
        disabled={descargando}
        aria-label={`Descargar el código QR de ${servicio.nombre}`}
        className="print:hidden mt-2 mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-desert-red bg-desert-sand/40 px-3.5 py-2 rounded-full active:scale-95 transition-transform disabled:opacity-50"
      >
        <Download size={14} aria-hidden="true" />
        {descargando ? 'Preparando…' : 'Descargar QR'}
      </button>
      <div ref={qrRef} className="bg-white p-3 rounded-2xl border border-desert-sand/40 mb-4 print:mt-4">
        <QRCodeSVG value={url} size={160} level="M" />
      </div>
      <p className="text-desert-stone text-xs font-medium">
        Escanea y califica tu experiencia
      </p>
    </div>
  );
}

// Arma una tarjeta PNG imprimible (categoría, nombre, QR y texto) a partir
// del SVG del QR, sin depender de ningún servicio externo.
async function descargarPNG(svg, servicio) {
  const ancho = 900;
  const alto = 1200;
  const ladoQR = 620;

  const xml = new XMLSerializer().serializeToString(svg);
  const imagen = new Image();
  imagen.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  await imagen.decode();
  await document.fonts?.ready;

  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, ancho, alto);
  ctx.textAlign = 'center';

  ctx.fillStyle = '#9e3d2a';
  ctx.font = "800 30px Outfit, system-ui, sans-serif";
  ctx.fillText(servicio.categoria.toUpperCase(), ancho / 2, 110);

  ctx.fillStyle = '#2a333a';
  ctx.font = "900 56px Outfit, system-ui, sans-serif";
  const lineas = partirTexto(ctx, servicio.nombre, ancho - 120).slice(0, 2);
  lineas.forEach((linea, i) => ctx.fillText(linea, ancho / 2, 190 + i * 66));

  const yQR = 190 + lineas.length * 66 + 20;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(imagen, (ancho - ladoQR) / 2, yQR, ladoQR, ladoQR);

  ctx.fillStyle = '#2a333a';
  ctx.font = "700 36px Outfit, system-ui, sans-serif";
  ctx.fillText('Escanea y califica tu experiencia', ancho / 2, yQR + ladoQR + 80);
  ctx.fillStyle = '#c86343';
  ctx.font = "800 28px Outfit, system-ui, sans-serif";
  ctx.fillText('Tatacoa Way', ancho / 2, alto - 50);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = `qr-resena-${aSlug(servicio.nombre)}.png`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
}

function partirTexto(ctx, texto, anchoMax) {
  const palabras = texto.split(' ');
  const lineas = [];
  let actual = '';
  for (const palabra of palabras) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (ctx.measureText(prueba).width > anchoMax && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

function aSlug(texto) {
  return texto
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
