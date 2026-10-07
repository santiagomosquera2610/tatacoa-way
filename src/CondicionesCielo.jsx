import { useState } from 'react';
import { Moon, Sun, Cloud, CloudSun, CloudRain, X, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCondicionesCielo } from './useCondicionesCielo';

function iconoClima(nubosidad) {
  if (nubosidad == null) return Cloud;
  if (nubosidad < 20) return Sun;
  if (nubosidad < 60) return CloudSun;
  return nubosidad < 85 ? Cloud : CloudRain;
}

function IconoLuna({ iluminacion }) {
  return (
    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-desert-night border border-white/40">
      <div
        className="absolute inset-y-0 left-0 bg-desert-sand transition-all duration-700"
        style={{ width: `${iluminacion}%` }}
      />
    </div>
  );
}

export function CondicionesCielo() {
  const [abierto, setAbierto] = useState(false);
  const { clima, luna, estado, recomendacion } = useCondicionesCielo();
  const IconoClima = iconoClima(clima?.nubosidad);

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="absolute bottom-32 left-6 z-[400] bg-white p-4 rounded-full shadow-xl border-2 border-desert-earth/40 hover:bg-desert-sand/20 transition-all flex items-center justify-center"
        title="Condiciones del cielo"
      >
        <Moon size={26} className="text-desert-earth" />
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[600] bg-black/40 backdrop-blur-sm flex items-end"
            onClick={() => setAbierto(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-[#FDFBF7] rounded-t-[32px] p-6 pb-10 shadow-desert-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-desert-night">Cielo esta noche</h2>
                <button
                  onClick={() => setAbierto(false)}
                  className="p-2 rounded-full bg-desert-sand/40 text-desert-night"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-white rounded-2xl p-4 border border-desert-sand/50 shadow-desert-sm flex items-center gap-3">
                  <IconoClima size={28} className="text-desert-earth shrink-0" />
                  <div>
                    {estado === 'cargando' && (
                      <div className="h-8 w-16 bg-desert-sand/50 rounded-lg animate-pulse" />
                    )}
                    {estado === 'listo' && clima && (
                      <>
                        <div className="text-2xl font-black text-desert-night leading-none">{clima.temperatura}°</div>
                        <div className="text-xs text-desert-stone font-medium mt-1">{clima.condicion}</div>
                      </>
                    )}
                    {estado === 'error' && (
                      <div className="text-xs text-desert-stone font-medium max-w-[140px]">Clima no disponible ahora</div>
                    )}
                  </div>
                </div>

                <div className="flex-1 bg-white rounded-2xl p-4 border border-desert-sand/50 shadow-desert-sm flex items-center gap-3">
                  <IconoLuna iluminacion={luna.iluminacion} />
                  <div>
                    <div className="text-sm font-black text-desert-night leading-tight">{luna.nombre}</div>
                    <div className="text-xs text-desert-stone font-medium mt-1">{luna.iluminacion}% iluminada</div>
                  </div>
                </div>
              </div>

              {estado === 'listo' && clima && (
                <div className="flex items-center gap-2 text-xs text-desert-stone font-medium mb-5">
                  <Droplets size={14} className="text-desert-earth" />
                  Humedad {clima.humedad}% · Nubosidad {clima.nubosidad}%
                </div>
              )}

              {recomendacion && (
                <div className="bg-desert-night rounded-2xl p-4">
                  <p className="text-white/90 text-sm font-medium leading-relaxed">{recomendacion}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
