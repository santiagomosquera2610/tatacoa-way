import { QRCodeSVG } from 'qrcode.react';
import { SERVICIOS_BD } from './ServiciosData';

export function QRAdminView() {
  const origen = window.location.origin;

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
          {SERVICIOS_BD.map(servicio => (
            <div
              key={servicio.id}
              className="bg-white rounded-3xl p-6 border border-desert-sand/50 shadow-desert-sm flex flex-col items-center text-center break-inside-avoid"
            >
              <span className="text-[10px] font-bold text-desert-earth uppercase tracking-wider mb-2">
                {servicio.categoria}
              </span>
              <h2 className="font-black text-desert-night text-lg mb-4">{servicio.nombre}</h2>
              <div className="bg-white p-3 rounded-2xl border border-desert-sand/40 mb-4">
                <QRCodeSVG value={`${origen}/resena/${servicio.id}`} size={160} />
              </div>
              <p className="text-desert-stone text-xs font-medium">
                Escanea y califica tu experiencia
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
