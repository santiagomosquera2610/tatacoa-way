import { useState, lazy, Suspense } from 'react';
import { Map, List, Phone, CheckCircle, Info, ArrowLeft, Star, Check, MapPin, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DescubreView } from './DescubreView';
import { useResenas } from './useResenas';
import { useServicios } from './useServicios';
import { calificacionDe, SIN_CALIFICACIONES } from './ratingUtils';
import { Foto } from './Foto';

// El mapa (Leaflet) se descarga solo al abrir la pestaña Mapa.
const MapaView = lazy(() => import('./MapaView'));

// App pública. Tres pestañas (Descubre, Directorio, Mapa) con una barra
// flotante abajo; la ficha de un servicio se abre encima de todo.
// Las reseñas aprobadas se cargan una vez aquí y se pasan a cada vista.
export default function App() {
  const [activeTab, setActiveTab] = useState('descubre');
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const { agregados } = useResenas();
  const { servicios } = useServicios();

  const renderContent = () => {
    switch (activeTab) {
      case 'directorio': return <DirectorioView onSelect={setItemSeleccionado} resenas={agregados} servicios={servicios} />;
      case 'mapa': return (
        <Suspense fallback={<p className="p-6 text-desert-stone font-medium">Cargando mapa…</p>}>
          <MapaView servicios={servicios} resenas={agregados} onSelect={setItemSeleccionado} />
        </Suspense>
      );
      case 'descubre': return <DescubreView />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex justify-center selection:bg-desert-earth selection:text-white">
      <div className="w-full max-w-md bg-[#FDFBF7] relative overflow-hidden flex flex-col h-[100dvh] shadow-2xl border-x border-desert-sand/30">

        <span className="absolute top-3 right-4 z-[300] bg-white/80 backdrop-blur-sm border border-desert-earth/30 text-desert-earth text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full pointer-events-none">
          Beta
        </span>

        {/* initial={false}: la portada se pinta de una vez, sin arrancar
            invisible (eso retrasaba el LCP). */}
        <AnimatePresence mode="wait" initial={false}>
          {itemSeleccionado ? (
            <DetalleServicioView
              key="detalle"
              servicio={itemSeleccionado}
              onBack={() => setItemSeleccionado(null)}
              resenas={agregados}
            />
          ) : (
            <motion.div 
              key="main"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col h-full relative"
            >
              {/* Encabezado Premium - Oculto solo en Descubre porque tiene su propio hero header */}
              {activeTab !== 'descubre' && (
                <header className="absolute top-0 w-full z-[100] px-6 pt-12 pb-4 bg-gradient-to-b from-[#FDFBF7] via-[#FDFBF7]/90 to-transparent">
                  <h1 className="text-3xl font-black text-desert-night tracking-tight flex items-center gap-2">
                    <MapPin className="text-desert-earth" size={28} strokeWidth={2.5} />
                    Tatacoa Way
                  </h1>
                  <p className="text-desert-stone text-sm font-medium mt-1">Explora sin perderte</p>
                </header>
              )}

              <main className={`flex-1 overflow-hidden relative ${activeTab !== 'descubre' ? 'pt-[110px]' : ''}`}>
                {renderContent()}
              </main>

              {/* Bottom Nav Premium (Floating Dock) */}
              <div className="absolute bottom-8 w-full px-6 z-[200]">
                <nav aria-label="Secciones" className="bg-white/90 backdrop-blur-xl border border-white shadow-desert-lg rounded-full flex justify-between p-1.5 items-center">
                  <button 
                    onClick={() => setActiveTab('descubre')}
                    aria-label="Descubre"
                    aria-current={activeTab === 'descubre' ? 'page' : undefined}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full transition-all duration-300 ${activeTab === 'descubre' ? 'bg-desert-night text-white shadow-md' : 'text-desert-stone hover:text-desert-night hover:bg-black/5'}`}
                  >
                    <Compass size={20} strokeWidth={activeTab === 'descubre' ? 2.5 : 2} />
                    {activeTab === 'descubre' && <span className="text-xs font-bold">Descubre</span>}
                  </button>
                  <button 
                    onClick={() => setActiveTab('directorio')}
                    aria-label="Directorio"
                    aria-current={activeTab === 'directorio' ? 'page' : undefined}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full transition-all duration-300 ${activeTab === 'directorio' ? 'bg-desert-night text-white shadow-md' : 'text-desert-stone hover:text-desert-night hover:bg-black/5'}`}
                  >
                    <List size={20} strokeWidth={activeTab === 'directorio' ? 2.5 : 2} />
                    {activeTab === 'directorio' && <span className="text-xs font-bold">Directorio</span>}
                  </button>
                  <button 
                    onClick={() => setActiveTab('mapa')}
                    aria-label="Mapa"
                    aria-current={activeTab === 'mapa' ? 'page' : undefined}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full transition-all duration-300 ${activeTab === 'mapa' ? 'bg-desert-night text-white shadow-md' : 'text-desert-stone hover:text-desert-night hover:bg-black/5'}`}
                  >
                    <Map size={20} strokeWidth={activeTab === 'mapa' ? 2.5 : 2} />
                    {activeTab === 'mapa' && <span className="text-xs font-bold">Mapa</span>}
                  </button>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

const FILTROS_RATING = [
  { label: 'Todas', min: 0 },
  { label: '4.5+', min: 4.5 },
  { label: '4.8+', min: 4.8 },
];

// Directorio de prestadores con filtros por categoría y calificación.
// Regla 1: el sello verde solo aparece si el semillero marcó el servicio
// como verificado, y la calificación solo si hay reseñas aprobadas.
function DirectorioView({ onSelect, resenas, servicios }) {
  const [filtro, setFiltro] = useState('Todos');
  const [ratingMin, setRatingMin] = useState(0);
  const categorias = ['Todos', 'Guías', 'Transporte', 'Hospedaje', 'Gastronomía'];

  const serviciosFiltrados = servicios
    .filter(s => filtro === 'Todos' || s.categoria === filtro)
    // Sin reseñas aprobadas no hay calificación: no cumplen ningún mínimo.
    .filter(s => ratingMin === 0 || (calificacionDe(s, resenas).valor ?? 0) >= ratingMin);

  return (
    <div className="h-full overflow-y-auto px-6 pb-32 scrollbar-hide">
      
      {/* Banner Informativo Premium */}
      <div className="mb-8 bg-white rounded-2xl p-4 shadow-desert-sm border border-desert-sand/50 flex items-start gap-3">
        <div className="bg-desert-sand/30 p-2 rounded-xl shrink-0">
          <Info className="text-desert-earth" size={20} />
        </div>
        <p className="text-sm text-desert-night leading-relaxed font-medium pt-0.5">
          Conecta con locales sin intermediarios. <span className="text-desert-earth font-bold block">Cero comisiones.</span>
        </p>
      </div>

      <div className="mb-6 sticky top-0 bg-[#FDFBF7]/90 backdrop-blur-md z-10 py-2 -mx-6 px-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${filtro === cat ? 'bg-desert-earth text-white shadow-desert-md' : 'bg-white border border-desert-sand/50 text-desert-stone hover:border-desert-earth/30 hover:text-desert-night shadow-sm'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pt-1 scrollbar-hide">
          {FILTROS_RATING.map(opt => (
            <button
              key={opt.label}
              onClick={() => setRatingMin(opt.min)}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${ratingMin === opt.min ? 'bg-desert-night text-white' : 'bg-transparent border border-desert-stone/30 text-desert-stone hover:border-desert-night/40 hover:text-desert-night'}`}
            >
              <Star size={11} className={ratingMin === opt.min ? 'fill-white' : 'fill-desert-stone/40'} strokeWidth={0} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {serviciosFiltrados.length === 0 && (
        <div className="flex flex-col items-center text-center py-16 px-6">
          <div className="bg-desert-sand/30 p-4 rounded-full mb-4">
            <Star size={24} className="text-desert-earth" />
          </div>
          <p className="text-desert-night font-bold mb-1">
            {ratingMin > 0 ? 'Aún no hay servicios calificados' : 'Nada por aquí todavía'}
          </p>
          <p className="text-desert-stone text-sm font-medium max-w-[260px]">
            {ratingMin > 0
              ? 'Solo cuentan las reseñas reales de turistas, aprobadas por el semillero. Elige "Todas" para ver el directorio completo.'
              : 'Prueba con otra categoría.'}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {serviciosFiltrados.map((servicio, i) => {
          const calificacion = calificacionDe(servicio, resenas);
          return (
          <motion.div
            key={servicio.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onSelect(servicio)}
            className="bg-white rounded-[24px] p-2 shadow-desert-sm border border-white hover:border-desert-sand/80 hover:shadow-desert-md transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex gap-4">
              <div className="w-28 h-32 shrink-0 rounded-[18px] overflow-hidden bg-desert-sand relative">
                <Foto src={servicio.fotoUrl} alt={servicio.nombre} sizes="120px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"></div>
                {calificacion.valor != null && (
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                    <Star size={10} className="text-desert-earth fill-current" aria-hidden="true" />
                    <span className="text-[10px] font-bold text-desert-night">{calificacion.valor}</span>
                    <span className="sr-only">estrellas, {calificacion.detalle}</span>
                  </div>
                )}
              </div>
              <div className="py-2 pr-3 flex-1 flex flex-col justify-center min-w-0">
                <span className="text-[10px] font-bold text-desert-earth uppercase tracking-wider mb-1">
                  {servicio.categoria}
                </span>
                <h2 className="font-black text-desert-night text-lg leading-tight flex items-center gap-1 mb-1">
                  <span className="truncate">{servicio.nombre}</span>
                  {servicio.verificado && <CheckCircle size={14} className="text-[#25D366] shrink-0" aria-label="Verificado por el semillero" />}
                </h2>
                <p className="text-sm text-desert-stone font-medium line-clamp-1 mb-1">
                  {servicio.especialidad}
                </p>
                <p className="text-xs font-semibold text-desert-night/70 mb-3">
                  {calificacion.valor != null ? `★ ${calificacion.valor} · ${calificacion.detalle}` : SIN_CALIFICACIONES}
                </p>
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-desert-sand/40">
                  <span className="text-desert-night font-black text-sm truncate">{servicio.precio}</span>
                  <ArrowLeft size={14} className="rotate-180 text-desert-stone group-hover:text-desert-earth group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </div>
            </div>
          </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Ficha completa de un servicio. El contacto es directo (WhatsApp) y sin
// intermediarios: la app no cobra, no reserva ni procesa pagos.
function DetalleServicioView({ servicio, onBack, resenas }) {
  const calificacion = calificacionDe(servicio, resenas);
  return (
    <motion.div 
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-[500] bg-white overflow-y-auto flex flex-col"
    >
      <button 
        onClick={onBack}
        aria-label="Volver" 
        className="absolute top-12 left-6 z-10 bg-white/50 backdrop-blur-xl p-3 rounded-full shadow-desert-md text-desert-night hover:bg-white transition-colors"
      >
        <ArrowLeft size={22} strokeWidth={2.5} />
      </button>

      <div className="w-full h-[40vh] relative shrink-0">
        <Foto src={servicio.fotoUrl} alt={servicio.nombre} prioridad className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <span className="inline-block mb-3 text-[10px] font-black uppercase tracking-widest text-white bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full">
            {servicio.categoria}
          </span>
          <h1 className="text-3xl font-black text-white flex items-center gap-2 mb-1">
            {servicio.nombre}
            {servicio.verificado && <CheckCircle size={22} className="text-[#25D366]" />}
          </h1>
          <p className="text-white/80 font-medium">{servicio.especialidad}</p>
        </div>
      </div>

      <div className="p-6 flex-1 pb-32">
        {!servicio.verificado && (
          <div className="flex items-center gap-2 bg-desert-sand/30 text-desert-night text-xs font-bold px-4 py-3 rounded-2xl mb-6">
            <Info size={14} className="text-desert-earth shrink-0" />
            Lugar real tomado de mapas abiertos, aún sin verificar por el semillero.
          </div>
        )}

        <div className="flex gap-6 mb-8 pb-8 border-b border-desert-sand/40">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-desert-stone font-medium">Valoración</span>
            {calificacion.valor != null ? (
              <div className="flex items-center text-desert-night font-black text-xl gap-1">
                <Star size={20} className="fill-desert-earth text-desert-earth" /> {calificacion.valor}
              </div>
            ) : (
              <span className="text-desert-night font-black text-sm">{SIN_CALIFICACIONES}</span>
            )}
            {calificacion.esReal && (
              <span className="text-[11px] text-desert-stone font-medium">{calificacion.detalle}</span>
            )}
          </div>
          <div className="w-px bg-desert-sand/50"></div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-desert-stone font-medium">Tarifa aprox.</span>
            <span className="text-desert-earth font-black text-xl">{servicio.precio}</span>
          </div>
        </div>

        <h2 className="text-xl font-black text-desert-night mb-3">Descripción</h2>
        <p className="text-desert-stone leading-relaxed mb-8 font-medium">
          {servicio.descripcion}
        </p>

        {servicio.incluye.length > 0 && (
          <>
            <h2 className="text-xl font-black text-desert-night mb-4">¿Qué incluye?</h2>
            <ul className="space-y-4 mb-6">
              {servicio.incluye.map((item, idx) => (
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.1) }}
                  key={idx}
                  className="flex items-center gap-3 text-desert-night font-medium bg-desert-sand/10 p-4 rounded-2xl border border-desert-sand/30"
                >
                  <div className="bg-[#25D366]/10 p-1.5 rounded-full shrink-0">
                    <Check size={16} className="text-[#25D366]" strokeWidth={3} />
                  </div>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </>
        )}

        <a
          href={`/resena/${servicio.id}`}
          className="flex items-center justify-center gap-2 text-desert-earth font-bold text-sm py-3 border border-desert-sand rounded-2xl hover:bg-desert-sand/10 transition-colors"
        >
          <Star size={15} />
          ¿Ya usaste este servicio? Déjale tu reseña
        </a>
      </div>

      <div className="fixed bottom-0 w-full max-w-md px-6 py-6 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
        {/* El contacto directo solo se muestra en servicios verificados por el
            semillero (PF-09); los no verificados llevan a su ubicación. */}
        {servicio.verificado && servicio.telefono ? (
          <a
            href={`https://wa.me/${servicio.telefono}?text=${encodeURIComponent(`Hola ${servicio.nombre}, vi tu perfil en Tatacoa Way y quiero preguntar por: ${servicio.especialidad}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#15803d] hover:bg-[#166534] text-white py-4 rounded-full flex items-center justify-center gap-2 font-black text-lg shadow-desert-lg pointer-events-auto transition-transform active:scale-[0.98]"
          >
            <Phone size={22} strokeWidth={2.5} />
            Contactar en WhatsApp
          </a>
        ) : servicio.lat != null ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${servicio.lat},${servicio.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-desert-night text-white py-4 rounded-full flex items-center justify-center gap-2 font-black text-lg shadow-desert-lg pointer-events-auto transition-transform active:scale-[0.98]"
          >
            <MapPin size={22} strokeWidth={2.5} />
            Ver ubicación en Google Maps
          </a>
        ) : null}
      </div>

    </motion.div>
  );
}
