import { useState, useEffect } from 'react';
import { Map, List, Phone, CheckCircle, Info, Navigation, ArrowLeft, Star, Clock, Check, MapPin, Compass } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'motion/react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DescubreView } from './DescubreView';

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

// BASE DE DATOS MOCK
const SERVICIOS_BD = [
  { 
    id: 1, nombre: "Carlos Ramírez", especialidad: "Tour Astronómico", verificado: true, categoria: "Guías",
    fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/B%C3%B3veda_celeste_profunda_en_el_desierto_de_la_Tatacoa.jpg/800px-B%C3%B3veda_celeste_profunda_en_el_desierto_de_la_Tatacoa.jpg",
    descripcion: "Guía local certificado por el observatorio. Conmigo aprenderás a leer las estrellas y constelaciones aprovechando los cielos despejados de la Tatacoa. Incluye uso de telescopio profesional.",
    precio: "$40.000 COP / pers",
    incluye: ["Charla astronómica de 2 horas", "Telescopio profesional", "Fotografía estelar con celular"],
    rating: 4.9
  },
  { 
    id: 2, nombre: "María Gómez", especialidad: "Ruta del Cuzco", verificado: true, categoria: "Guías",
    fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Desierto_de_la_Tatacoa_-_camilogaleano%28com%29.jpg/800px-Desierto_de_la_Tatacoa_-_camilogaleano%28com%29.jpg",
    descripcion: "Recorrido inmersivo por el laberinto del Desierto Rojo (Cuzco). Te contaré la historia geológica y te mostraré las formaciones más impresionantes para tus fotos.",
    precio: "$35.000 COP / grupo",
    incluye: ["Recorrido guiado de 2.5h", "Hidratación básica", "Paradas fotográficas"],
    rating: 4.8
  },
  { 
    id: 3, nombre: "Asoc. Villavieja", especialidad: "Transporte Neiva", verificado: true, categoria: "Transporte",
    fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Atardecer_en_el_Desierto_de_la_Tatacoa.JPG/800px-Atardecer_en_el_Desierto_de_la_Tatacoa.JPG",
    descripcion: "Cooperativa oficial de transporte. Te recogemos en el terminal de Neiva o el aeropuerto y te llevamos directo a tu hostal en el desierto con total seguridad.",
    precio: "$25.000 COP / tray",
    incluye: ["Aire acondicionado", "Seguro de viaje", "Conductor local"],
    rating: 4.7
  },
  { 
    id: 4, nombre: "TukTuk Tatacoa", especialidad: "Movilidad desierto", verificado: true, categoria: "Transporte",
    fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Afternoon_Tatacoa.jpg/800px-Afternoon_Tatacoa.jpg",
    descripcion: "El transporte más divertido para moverte entre Los Hoyos y El Cuzco. Disfruta de la brisa mientras te llevamos.",
    precio: "$15.000 COP / viaje",
    incluye: ["Capacidad 3 personas", "Paseo panorámico", "Música a bordo"],
    rating: 4.9
  },
  { 
    id: 5, nombre: "Hostal Saturno", especialidad: "Camping y Cabañas", verificado: true, categoria: "Hospedaje",
    fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Atardecer_Parque_Natural_Regional_La_Tatacoa.jpg/800px-Atardecer_Parque_Natural_Regional_La_Tatacoa.jpg",
    descripcion: "Descansa bajo las estrellas. Ofrecemos cabañas ecológicas y alquiler de carpas listas para usar. Tenemos piscina para refrescarte del calor del mediodía.",
    precio: "Desde $30.000",
    incluye: ["Acceso a piscina", "Baños compartidos", "Restaurante local"],
    rating: 4.5
  },
  { 
    id: 6, nombre: "Rest. El Oasis", especialidad: "Platos típicos", verificado: true, categoria: "Gastronomía",
    fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Apaciguamiento_en_el_Desierto_de_la_Tatacoa.jpg/800px-Apaciguamiento_en_el_Desierto_de_la_Tatacoa.jpg",
    descripcion: "Parada obligatoria para almorzar. Nuestro plato estrella es el estofado de chivo tradicional de la región, acompañado de jugo de cactus local.",
    precio: "Desde $25.000",
    incluye: ["Comida típica", "Opciones vegetarianas", "Refrescos helados"],
    rating: 4.8
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('descubre');
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'directorio': return <DirectorioView onSelect={setItemSeleccionado} />;
      case 'mapa': return <MapaView />;
      case 'descubre': return <DescubreView />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex justify-center selection:bg-desert-earth selection:text-white">
      <div className="w-full max-w-md bg-[#FDFBF7] relative overflow-hidden flex flex-col h-[100dvh] shadow-2xl border-x border-desert-sand/30">
        
        <AnimatePresence mode="wait">
          {itemSeleccionado ? (
            <DetalleServicioView 
              key="detalle" 
              servicio={itemSeleccionado} 
              onBack={() => setItemSeleccionado(null)} 
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

function DirectorioView({ onSelect }) {
  const [filtro, setFiltro] = useState('Todos');
  const categorias = ['Todos', 'Guías', 'Transporte', 'Hospedaje', 'Gastronomía'];

  const serviciosFiltrados = SERVICIOS_BD.filter(s => filtro === 'Todos' || s.categoria === filtro);

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
      </div>
      
      <div className="flex flex-col gap-5">
        {serviciosFiltrados.map((servicio, i) => (
          <motion.div 
            key={servicio.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onSelect(servicio)}
            className="bg-white rounded-[24px] p-2 shadow-desert-sm border border-white hover:border-desert-sand/80 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex gap-4">
              <div className="w-24 h-28 shrink-0 rounded-[18px] overflow-hidden bg-desert-sand relative">
                <img src={servicio.fotoUrl} alt={servicio.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                  <Star size={10} className="text-desert-earth fill-current" />
                  <span className="text-[10px] font-bold text-desert-night">{servicio.rating}</span>
                </div>
              </div>
              <div className="py-2 pr-3 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-desert-earth uppercase tracking-wider mb-1">
                  {servicio.categoria}
                </span>
                <h3 className="font-black text-desert-night text-lg leading-tight flex items-center gap-1 mb-1">
                  {servicio.nombre}
                  {servicio.verificado && <CheckCircle size={14} className="text-[#25D366] shrink-0" />}
                </h3>
                <p className="text-sm text-desert-stone font-medium line-clamp-1 mb-2">
                  {servicio.especialidad}
                </p>
                <div className="text-[#25D366] text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
                  Disponible hoy
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DetalleServicioView({ servicio, onBack }) {
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
        <div className="flex gap-6 mb-8 pb-8 border-b border-desert-sand/40">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-desert-stone font-medium">Valoración</span>
            <div className="flex items-center text-desert-night font-black text-xl gap-1">
              <Star size={20} className="fill-desert-earth text-desert-earth" /> {servicio.rating}
            </div>
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
      </div>

      <div className="fixed bottom-0 w-full max-w-md px-6 py-6 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
        <button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-full flex items-center justify-center gap-2 font-black text-lg shadow-desert-lg pointer-events-auto transition-transform active:scale-[0.98]">
          <Phone size={22} strokeWidth={2.5} />
          Contactar en WhatsApp
        </button>
      </div>

    </motion.div>
  );
}

function MapaView() {
  const tatacoaCenter = [3.2359, -75.1700];
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const marcadores = [
    { id: 1, pos: [3.2350, -75.1720], nombre: "Cuzco (Desierto Rojo)" },
    { id: 2, pos: [3.2200, -75.1500], nombre: "Los Hoyos (Gris)" },
    { id: 3, pos: [3.2380, -75.1680], nombre: "Observatorio" },
  ];

  const rutaSegura = [
    [3.2380, -75.1680],
    [3.2350, -75.1720],
    [3.2200, -75.1500],
  ];

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

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col relative bg-[#FDFBF7]">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[400] w-[85%] bg-white/90 backdrop-blur-xl p-3.5 rounded-2xl shadow-desert-md border border-white">
        <h2 className="text-sm font-black text-desert-night mb-0.5 text-center flex justify-center items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          Ruta Segura Activa
        </h2>
        <p className="text-xs text-desert-stone text-center font-medium">Sigue la línea azul para no perderte</p>
      </div>

      <button 
        onClick={requestLocation}
        className={`absolute bottom-32 right-6 z-[400] bg-white p-4 rounded-full shadow-xl border-2 transition-all ${isLocating ? 'border-desert-earth animate-pulse' : 'border-blue-500 hover:bg-blue-50'}`}
        title="Mi Ubicación"
      >
        <Navigation size={26} className={isLocating ? 'text-desert-earth' : 'text-blue-600'} />
      </button>

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
        
        {marcadores.map(lugar => (
          <Marker key={lugar.id} position={lugar.pos}>
            <Popup>
              <strong className="text-desert-earth font-bold font-sans">{lugar.nombre}</strong>
            </Popup>
          </Marker>
        ))}

        <Polyline 
          positions={rutaSegura} 
          pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8, dashArray: '12, 12', lineCap: 'round' }} 
        />
        <UserLocationMarker location={userLocation} />
      </MapContainer>
    </div>
  );
}

// Componente oculto pero necesario para Leaflet en este archivo (o puedes moverlo)
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
