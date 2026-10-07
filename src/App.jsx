import { useState, useEffect } from 'react';
import { Map, List, Phone, CheckCircle, Info, Navigation, ArrowLeft, Star, Clock, Check, MapPin, Compass, PersonStanding, Car, Route, X, ChevronRight, Timer } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'motion/react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DescubreView } from './DescubreView';
import { CondicionesCielo } from './CondicionesCielo';
import { useResenas } from './useResenas';
import { useServicios } from './useServicios';
import { useRuta } from './useRuta';
import { calificacionDe } from './ratingUtils';
import { PUNTOS_INTERES, ORIGEN_DEFECTO } from './PuntosInteresData';

// Arreglar ícono Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícono personalizado GPS
const userIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="relative flex h-8 w-8 items-center justify-center"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60"></span><span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-md"></span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Íconos de categoría para puntos de interés
const COLOR_CATEGORIA = {
  atractivo: '#c86343',
  hospedaje: '#6366f1',
  restaurante: '#f59e0b',
  servicio: '#475569',
};

const LABEL_CATEGORIA = {
  atractivo: 'Atractivo',
  hospedaje: 'Hospedaje',
  restaurante: 'Restaurante',
  servicio: 'Servicio',
};

function crearIconoPoi(color) {
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div style="background:${color}" class="w-5 h-5 rounded-full border-2 border-white shadow-md"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

const ICONOS_CATEGORIA = Object.fromEntries(
  Object.entries(COLOR_CATEGORIA).map(([cat, color]) => [cat, crearIconoPoi(color)])
);

const iconoServicioVerificado = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="w-7 h-7 rounded-full bg-[#25D366] border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs">✓</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 20],
});

// Negocios reales listados pero aún no verificados por el semillero:
// mismo color de categoría, sin el check, para no implicar una garantía
// que todavía no existe.
const iconoServicioSinVerificar = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="w-6 h-6 rounded-full bg-desert-night border-2 border-white shadow-lg flex items-center justify-center text-white font-black" style="font-size:10px">?</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 18],
});

export default function App() {
  const [activeTab, setActiveTab] = useState('descubre');
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const { agregados } = useResenas();
  const { servicios } = useServicios();

  const renderContent = () => {
    switch (activeTab) {
      case 'directorio': return <DirectorioView onSelect={setItemSeleccionado} resenas={agregados} servicios={servicios} />;
      case 'mapa': return <MapaView servicios={servicios} resenas={agregados} onSelect={setItemSeleccionado} />;
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

        <AnimatePresence mode="wait">
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
                <div className="bg-white/90 backdrop-blur-xl border border-white shadow-desert-lg rounded-full flex justify-between p-1.5 items-center">
                  <button 
                    onClick={() => setActiveTab('descubre')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full transition-all duration-300 ${activeTab === 'descubre' ? 'bg-desert-night text-white shadow-md' : 'text-desert-stone hover:text-desert-night hover:bg-black/5'}`}
                  >
                    <Compass size={20} strokeWidth={activeTab === 'descubre' ? 2.5 : 2} />
                    {activeTab === 'descubre' && <span className="text-xs font-bold">Descubre</span>}
                  </button>
                  <button 
                    onClick={() => setActiveTab('directorio')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full transition-all duration-300 ${activeTab === 'directorio' ? 'bg-desert-night text-white shadow-md' : 'text-desert-stone hover:text-desert-night hover:bg-black/5'}`}
                  >
                    <List size={20} strokeWidth={activeTab === 'directorio' ? 2.5 : 2} />
                    {activeTab === 'directorio' && <span className="text-xs font-bold">Directorio</span>}
                  </button>
                  <button 
                    onClick={() => setActiveTab('mapa')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full transition-all duration-300 ${activeTab === 'mapa' ? 'bg-desert-night text-white shadow-md' : 'text-desert-stone hover:text-desert-night hover:bg-black/5'}`}
                  >
                    <Map size={20} strokeWidth={activeTab === 'mapa' ? 2.5 : 2} />
                    {activeTab === 'mapa' && <span className="text-xs font-bold">Mapa</span>}
                  </button>
                </div>
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

function DirectorioView({ onSelect, resenas, servicios }) {
  const [filtro, setFiltro] = useState('Todos');
  const [ratingMin, setRatingMin] = useState(0);
  const categorias = ['Todos', 'Guías', 'Transporte', 'Hospedaje', 'Gastronomía'];

  const serviciosFiltrados = servicios
    .filter(s => filtro === 'Todos' || s.categoria === filtro)
    .filter(s => calificacionDe(s, resenas).valor >= ratingMin);

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
          <p className="text-desert-night font-bold mb-1">Nada por aquí todavía</p>
          <p className="text-desert-stone text-sm font-medium max-w-[240px]">
            Prueba con otra categoría o baja el filtro de calificación mínima.
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
                <img src={servicio.fotoUrl} alt={servicio.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"></div>
                {calificacion.valor != null ? (
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                    <Star size={10} className="text-desert-earth fill-current" />
                    <span className="text-[10px] font-bold text-desert-night">{calificacion.valor}</span>
                  </div>
                ) : (
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm">
                    <span className="text-[10px] font-bold text-desert-stone">Nuevo</span>
                  </div>
                )}
              </div>
              <div className="py-2 pr-3 flex-1 flex flex-col justify-center min-w-0">
                <span className="text-[10px] font-bold text-desert-earth uppercase tracking-wider mb-1">
                  {servicio.categoria}
                </span>
                <h3 className="font-black text-desert-night text-lg leading-tight flex items-center gap-1 mb-1">
                  <span className="truncate">{servicio.nombre}</span>
                  {servicio.verificado && <CheckCircle size={14} className="text-[#25D366] shrink-0" />}
                </h3>
                <p className="text-sm text-desert-stone font-medium line-clamp-1 mb-3">
                  {servicio.especialidad}
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
        className="absolute top-12 left-6 z-10 bg-white/50 backdrop-blur-xl p-3 rounded-full shadow-desert-md text-desert-night hover:bg-white transition-colors"
      >
        <ArrowLeft size={22} strokeWidth={2.5} />
      </button>

      <div className="w-full h-[40vh] relative shrink-0">
        <img src={servicio.fotoUrl} alt={servicio.nombre} className="w-full h-full object-cover" />
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
              <span className="text-desert-night font-black text-sm">Sin calificar</span>
            )}
            <span className="text-[11px] text-desert-stone font-medium">{calificacion.detalle}</span>
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
        {servicio.telefono ? (
          <a
            href={`https://wa.me/${servicio.telefono}?text=${encodeURIComponent(`Hola ${servicio.nombre}, vi tu perfil en Tatacoa Way y quiero preguntar por: ${servicio.especialidad}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-full flex items-center justify-center gap-2 font-black text-lg shadow-desert-lg pointer-events-auto transition-transform active:scale-[0.98]"
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

const CATEGORIAS_MAPA = [
  { id: 'Todos', label: 'Todos' },
  { id: 'atractivo', label: 'Atractivos' },
  { id: 'hospedaje', label: 'Hospedaje' },
  { id: 'restaurante', label: 'Comida' },
  { id: 'servicio', label: 'Servicios' },
];

function MapaView({ servicios, resenas, onSelect }) {
  const tatacoaCenter = [3.2359, -75.1700];
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [filtroMapa, setFiltroMapa] = useState('Todos');
  const [seleccion, setSeleccion] = useState(null);
  const [perfil, setPerfil] = useState('pie');
  const { ruta, cargando: cargandoRuta, error: errorRuta, calcularRuta, limpiarRuta } = useRuta();

  const puntosFiltrados = filtroMapa === 'Todos'
    ? PUNTOS_INTERES
    : PUNTOS_INTERES.filter(p => p.categoria === filtroMapa);

  const origenActual = userLocation
    ? { nombre: 'Tu ubicación', pos: userLocation }
    : ORIGEN_DEFECTO;

  const requestLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          alert("Debes permitir el acceso a tu ubicación en el navegador para usar el GPS.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Tu navegador no soporta geolocalización.");
      setIsLocating(false);
    }
  };

  function abrirPunto(punto) {
    limpiarRuta();
    setSeleccion(punto);
  }

  function cerrarSheet() {
    setSeleccion(null);
    limpiarRuta();
  }

  async function handleComoLlegar(nuevoPerfil) {
    setPerfil(nuevoPerfil);
    await calcularRuta(origenActual.pos, seleccion.pos, nuevoPerfil);
  }

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col relative bg-[#FDFBF7]">
      <div className="absolute top-6 left-0 right-0 z-[400] px-6 flex gap-2 overflow-x-auto scrollbar-hide">
        {CATEGORIAS_MAPA.map(c => (
          <button
            key={c.id}
            onClick={() => setFiltroMapa(c.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-desert-sm transition-all ${filtroMapa === c.id ? 'bg-desert-night text-white' : 'bg-white/90 backdrop-blur-xl text-desert-stone border border-white'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <button
        onClick={requestLocation}
        className={`absolute bottom-32 right-6 z-[400] bg-white p-4 rounded-full shadow-xl border-2 transition-all ${isLocating ? 'border-desert-earth animate-pulse' : 'border-blue-500 hover:bg-blue-50'}`}
        title="Mi Ubicación"
      >
        <Navigation size={26} className={isLocating ? 'text-desert-earth' : 'text-blue-600'} />
      </button>

      <CondicionesCielo />

      <MapContainer
        center={tatacoaCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
          className="desert-map-tiles"
        />

        {puntosFiltrados.map(punto => (
          <Marker
            key={punto.id}
            position={punto.pos}
            icon={ICONOS_CATEGORIA[punto.categoria]}
            eventHandlers={{ click: () => abrirPunto(punto) }}
          />
        ))}

        {servicios
          .filter(s => s.lat != null && s.lon != null)
          .map(s => (
            <Marker
              key={`servicio-${s.id}`}
              position={[s.lat, s.lon]}
              icon={s.verificado ? iconoServicioVerificado : iconoServicioSinVerificar}
              eventHandlers={{ click: () => abrirPunto({ id: `servicio-${s.id}`, nombre: s.nombre, categoria: 'servicio', pos: [s.lat, s.lon], servicio: s }) }}
            />
        ))}

        {ruta && (
          <>
            <Polyline
              positions={ruta.coordenadas}
              pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.85, lineCap: 'round' }}
            />
            <AjustarVistaRuta coordenadas={ruta.coordenadas} />
          </>
        )}

        <UserLocationMarker location={userLocation} />
      </MapContainer>

      <AnimatePresence>
        {seleccion && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="absolute bottom-0 left-0 right-0 z-[500] bg-white rounded-t-[32px] p-6 pb-10 shadow-desert-lg"
          >
            <button onClick={cerrarSheet} className="absolute top-5 right-5 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-desert-night shadow-sm">
              <X size={16} strokeWidth={2.5} />
            </button>

            {(seleccion.foto || seleccion.servicio?.fotoUrl) && (
              <div className="-mx-6 -mt-6 mb-4 h-36 overflow-hidden">
                <img src={seleccion.foto ?? seleccion.servicio.fotoUrl} alt={seleccion.nombre} className="w-full h-full object-cover" />
              </div>
            )}

            <span className="text-[10px] font-black uppercase tracking-wider text-desert-earth block mb-1">
              {seleccion.servicio
                ? (seleccion.servicio.verificado ? 'Verificado · Tatacoa Way' : 'Sin verificar aún')
                : LABEL_CATEGORIA[seleccion.categoria]}
            </span>
            <h2 className="text-xl font-black text-desert-night mb-1 pr-8">{seleccion.nombre}</h2>
            {seleccion.servicio && (() => {
              const calificacion = calificacionDe(seleccion.servicio, resenas);
              return (
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-desert-stone text-sm font-medium">{seleccion.servicio.especialidad}</p>
                  {calificacion.valor != null && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-desert-stone/50"></span>
                      <span className="flex items-center gap-1 text-sm font-bold text-desert-night">
                        <Star size={13} className="fill-desert-earth text-desert-earth" />
                        {calificacion.valor}
                      </span>
                    </>
                  )}
                </div>
              );
            })()}

            {!ruta && !cargandoRuta && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleComoLlegar('pie')}
                  className="flex-1 flex items-center justify-center gap-2 bg-desert-night text-white font-bold py-3 rounded-full active:scale-95 transition-transform"
                >
                  <PersonStanding size={18} /> A pie
                </button>
                <button
                  onClick={() => handleComoLlegar('carro')}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-desert-sand text-desert-night font-bold py-3 rounded-full active:scale-95 transition-transform"
                >
                  <Car size={18} /> En carro
                </button>
              </div>
            )}

            {cargandoRuta && (
              <p className="text-desert-stone text-sm font-medium mt-4">Calculando la mejor ruta...</p>
            )}

            {errorRuta && (
              <p className="text-desert-red text-sm font-medium mt-4">No se pudo calcular la ruta. Intenta de nuevo.</p>
            )}

            {ruta && (
              <div className="mt-4">
                <div className="flex items-center gap-4 bg-desert-sand/20 rounded-2xl p-4 mb-3">
                  <div className="flex items-center gap-1.5 text-desert-night font-black">
                    <Route size={16} className="text-desert-earth" /> {ruta.distanciaKm.toFixed(1)} km
                  </div>
                  <div className="w-px h-4 bg-desert-sand"></div>
                  <div className="flex items-center gap-1.5 text-desert-night font-black">
                    <Timer size={16} className="text-desert-earth" /> {Math.round(ruta.duracionMin)} min
                  </div>
                  <span className="text-desert-stone text-xs font-medium ml-auto">desde {origenActual.nombre}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleComoLlegar('pie')}
                    className={`flex-1 flex items-center justify-center gap-2 font-bold py-2.5 rounded-full text-sm active:scale-95 transition-transform ${perfil === 'pie' ? 'bg-desert-night text-white' : 'bg-white border-2 border-desert-sand text-desert-night'}`}
                  >
                    <PersonStanding size={16} /> A pie
                  </button>
                  <button
                    onClick={() => handleComoLlegar('carro')}
                    className={`flex-1 flex items-center justify-center gap-2 font-bold py-2.5 rounded-full text-sm active:scale-95 transition-transform ${perfil === 'carro' ? 'bg-desert-night text-white' : 'bg-white border-2 border-desert-sand text-desert-night'}`}
                  >
                    <Car size={16} /> En carro
                  </button>
                </div>
              </div>
            )}

            {seleccion.servicio && (
              <button
                onClick={() => onSelect(seleccion.servicio)}
                className="flex items-center justify-center gap-2 w-full mt-3 text-desert-earth font-bold text-sm py-3"
              >
                Ver detalle en el Directorio <ChevronRight size={15} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AjustarVistaRuta({ coordenadas }) {
  const map = useMap();
  useEffect(() => {
    if (coordenadas?.length) {
      map.fitBounds(L.latLngBounds(coordenadas), { padding: [60, 60] });
    }
  }, [coordenadas, map]);
  return null;
}

function UserLocationMarker({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo(location, 14, { animate: true, duration: 1.5 });
    }
  }, [location, map]);

  return location ? (
    <Marker position={location} icon={userIcon}>
      <Popup>
        <div className="text-center font-bold text-blue-600">¡Tú estás aquí!</div>
      </Popup>
    </Marker>
  ) : null;
}
