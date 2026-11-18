import { useState, useEffect } from 'react';
import { Navigation, Star, PersonStanding, Car, Route, X, ChevronRight, Timer } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'motion/react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { CondicionesCielo } from './CondicionesCielo';
import { useRuta } from './useRuta';
import { calificacionDe } from './ratingUtils';
import { PUNTOS_INTERES, ORIGEN_DEFECTO } from './PuntosInteresData';
import { Foto } from './Foto';

// Pestaña Mapa. Vive en su propio archivo y App la carga con React.lazy:
// Leaflet pesa bastante y así no se descarga hasta que el turista abre el
// mapa (corrección 1.3, rendimiento).

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


const CATEGORIAS_MAPA = [
  { id: 'Todos', label: 'Todos' },
  { id: 'atractivo', label: 'Atractivos' },
  { id: 'hospedaje', label: 'Hospedaje' },
  { id: 'restaurante', label: 'Comida' },
  { id: 'servicio', label: 'Servicios' },
];

// Mapa con puntos de interés (PuntosInteresData) y servicios con
// coordenadas. Al tocar un punto se abre una hoja con rutas reales a pie o
// en carro, desde la ubicación del usuario o, si no la comparte, desde el
// parque principal de Villavieja.
export default function MapaView({ servicios, resenas, onSelect }) {
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
        title="Mi ubicación"
        aria-label="Centrar el mapa en mi ubicación"
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
            title={punto.nombre}
            alt={punto.nombre}
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
              title={s.nombre}
              alt={s.nombre}
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
            <button onClick={cerrarSheet} aria-label="Cerrar" className="absolute top-5 right-5 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-desert-night shadow-sm">
              <X size={16} strokeWidth={2.5} />
            </button>

            {(seleccion.foto || seleccion.servicio?.fotoUrl) && (
              <div className="-mx-6 -mt-6 mb-4 h-36 overflow-hidden">
                <Foto src={seleccion.foto ?? seleccion.servicio.fotoUrl} alt={seleccion.nombre} className="w-full h-full object-cover" />
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
    <Marker position={location} icon={userIcon} title="Tu ubicación" alt="Tu ubicación">
      <Popup>
        <div className="text-center font-bold text-blue-600">¡Tú estás aquí!</div>
      </Popup>
    </Marker>
  ) : null;
}
