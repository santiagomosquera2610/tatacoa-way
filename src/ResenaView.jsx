import { useState } from 'react';
import { Star, MapPin, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { SERVICIOS_BD } from './ServiciosData';
import { enviarResena } from './useResenas';
import { supabaseHabilitado } from './supabaseClient';

export function ResenaView({ servicioId }) {
  const servicio = SERVICIOS_BD.find(s => String(s.id) === String(servicioId));
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [estado, setEstado] = useState('formulario');

  async function handleSubmit(e) {
    e.preventDefault();
    if (calificacion === 0) return;
    setEstado('enviando');
    const { error } = await enviarResena({ servicioId: servicio.id, calificacion, comentario });
    setEstado(error ? 'error' : 'enviado');
  }

  if (!servicio) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FDFBF7] px-6 text-center">
        <p className="text-desert-night font-bold">No encontramos ese servicio.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] flex justify-center">
      <div className="w-full max-w-md px-6 pt-16 pb-12 flex flex-col">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <MapPin className="text-desert-earth" size={22} strokeWidth={2.5} />
          <span className="font-black text-desert-night text-lg">Tatacoa Way</span>
        </div>

        {estado === 'enviado' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center py-10"
          >
            <div className="bg-[#25D366]/10 p-4 rounded-full mb-5">
              <Check size={32} className="text-[#25D366]" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-black text-desert-night mb-2">Gracias por tu reseña</h1>
            <p className="text-desert-stone font-medium text-sm max-w-[280px]">
              Tu calificación para {servicio.nombre} queda en revisión del semillero antes de publicarse.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="bg-white rounded-3xl p-5 shadow-desert-sm border border-desert-sand/50 flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-desert-sand">
                <img src={servicio.fotoUrl} alt={servicio.nombre} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-black text-desert-night text-lg leading-tight">{servicio.nombre}</h1>
                <p className="text-desert-stone text-sm font-medium">{servicio.especialidad}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <p className="text-desert-night font-bold mb-3 text-center">¿Cómo fue tu experiencia?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setCalificacion(n)}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      className="p-1"
                    >
                      <Star
                        size={36}
                        className={(hover || calificacion) >= n ? 'fill-desert-earth text-desert-earth' : 'fill-desert-sand text-desert-sand'}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="comentario" className="text-sm font-bold text-desert-night">
                  Comentario (opcional)
                </label>
                <textarea
                  id="comentario"
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  rows={4}
                  placeholder="Cuéntanos qué tal te fue"
                  className="w-full rounded-2xl border border-desert-sand/60 bg-white p-4 text-sm text-desert-night font-medium focus:outline-none focus:ring-2 focus:ring-desert-earth/40 resize-none"
                />
              </div>

              {estado === 'error' && (
                <p className="text-sm text-desert-red font-medium text-center">
                  No pudimos enviar tu reseña. Intenta de nuevo en un momento.
                </p>
              )}

              {!supabaseHabilitado && (
                <p className="text-xs text-desert-stone font-medium text-center">
                  El sistema de reseñas todavía no está activo.
                </p>
              )}

              <button
                type="submit"
                disabled={calificacion === 0 || estado === 'enviando'}
                className="w-full bg-desert-earth disabled:opacity-40 text-white py-4 rounded-full font-black text-lg shadow-desert-lg transition-transform active:scale-[0.98]"
              >
                {estado === 'enviando' ? 'Enviando...' : 'Enviar reseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
