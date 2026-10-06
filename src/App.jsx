import { useState, useEffect } from 'react';
import { Map, List, Phone, CheckCircle, Info, Navigation, ArrowLeft, Star, Clock, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Arreglar el ícono por defecto de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícono personalizado para la ubicación del usuario
const userIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="relative flex h-6 w-6"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-6 w-6 bg-blue-600 border-2 border-white shadow-md"></span></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// BASE DE DATOS MOCK (Simulada)
const SERVICIOS_BD = [
  { 
    id: 1, nombre: "Carlos Ramírez", especialidad: "Tour Astronómico", verificado: true, categoria: "Guías",
    fotoUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    descripcion: "Guía local certificado por el observatorio. Conmigo aprenderás a leer las estrellas y constelaciones aprovechando los cielos despejados de la Tatacoa. Incluye uso de telescopio profesional.",
    precio: "$40.000 COP / persona",
    incluye: ["Charla astronómica de 2 horas", "Telescopio profesional", "Fotografía estelar con tu celular"],
    rating: 4.9
  },
  { 
    id: 2, nombre: "María Gómez", especialidad: "Ruta del Cuzco (Rojo)", verificado: true, categoria: "Guías",
    fotoUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=80",
    descripcion: "Recorrido inmersivo por el laberinto del Desierto Rojo (Cuzco). Te contaré la historia geológica y te mostraré las formaciones más impresionantes para tus fotos.",
    precio: "$35.000 COP / grupo",
    incluye: ["Recorrido guiado de 2.5h", "Hidratación básica", "Paradas fotográficas"],
    rating: 4.8
  },
  { 
    id: 3, nombre: "Asoc. Villavieja", especialidad: "Transporte desde Neiva", verificado: true, categoria: "Transporte",
    fotoUrl: "https://images.unsplash.com/photo-1519003300449-424ad0405076?auto=format&fit=crop&w=800&q=80",
    descripcion: "Cooperativa oficial de transporte. Te recogemos en el terminal de Neiva o el aeropuerto y te llevamos directo a tu hostal en el desierto con total seguridad.",
    precio: "$25.000 COP / trayecto",
    incluye: ["Aire acondicionado", "Seguro de viaje", "Conductor local"],
    rating: 4.7
  },
  { 
    id: 4, nombre: "TukTuk Tatacoa", especialidad: "Movilidad interna desierto", verificado: true, categoria: "Transporte",
    fotoUrl: "https://images.unsplash.com/photo-1620023602484-9bc504b2b623?auto=format&fit=crop&w=800&q=80",
    descripcion: "El transporte más divertido para moverte entre Los Hoyos (desierto gris) y El Cuzco (desierto rojo). Disfruta de la brisa mientras te llevamos.",
    precio: "$15.000 COP / viaje",
    incluye: ["Capacidad 3 personas", "Paseo panorámico", "Música a bordo"],
    rating: 4.9
  },
  { 
    id: 5, nombre: "Hostal Noches de Saturno", especialidad: "Cabañas y Zona de Camping", verificado: true, categoria: "Hospedaje",
    fotoUrl: "https://images.unsplash.com/photo-1504280190538-4b7ab7c6317b?auto=format&fit=crop&w=800&q=80",
    descripcion: "Descansa bajo las estrellas. Ofrecemos cabañas ecológicas y alquiler de carpas listas para usar. Tenemos piscina para refrescarte del calor del mediodía.",
    precio: "Desde $30.000 COP",
    incluye: ["Acceso a piscina", "Baños y duchas compartidas", "Restaurante en el sitio"],
    rating: 4.5
  },
  { 
    id: 6, nombre: "Restaurante El Oasis", especialidad: "Platos típicos y Chivo", verificado: true, categoria: "Gastronomía",
    fotoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    descripcion: "Parada obligatoria para almorzar. Nuestro plato estrella es el estofado de chivo tradicional de la región, acompañado de jugo de cactus local.",
    precio: "Platos desde $25.000",
    incluye: ["Comida 100% típica", "Opciones vegetarianas", "Refrescos helados"],
    rating: 4.8
  },
];


export default function App() {
  const [activeTab, setActiveTab] = useState('directorio');

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex justify-center font-sans">
      <div className="w-full max-w-md bg-white shadow-2xl relative overflow-hidden flex flex-col h-screen border-x border-desert-sand/50">
        
        {/* Usamos un layout sin header pegajoso si estamos viendo un detalle, lo controlará el componente */}
        
        <main className="flex-1 overflow-hidden relative z-0 pb-16">
          {activeTab === 'directorio' ? <DirectorioView /> : <MapaView />}
        </main>

        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-desert-sand/50 flex justify-around p-2 z-[1000] pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setActiveTab('directorio')}
            className={`flex flex-col items-center p-2 w-full transition-colors ${activeTab === 'directorio' ? 'text-desert-red' : 'text-desert-stone hover:text-desert-night'}`}
          >
            <List size={26} />
            <span className="text-xs mt-1 font-medium">Directorio</span>
          </button>
          <button 
            onClick={() => setActiveTab('mapa')}
            className={`flex flex-col items-center p-2 w-full transition-colors ${activeTab === 'mapa' ? 'text-desert-red' : 'text-desert-stone hover:text-desert-night'}`}
          >
            <Map size={26} />
            <span className="text-xs mt-1 font-medium">Mapa Seguro</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

function DirectorioView() {
  const [filtro, setFiltro] = useState('Todos');
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const categorias = ['Todos', 'Guías', 'Transporte', 'Hospedaje', 'Gastronomía'];

  const serviciosFiltrados = SERVICIOS_BD.filter(s => filtro === 'Todos' || s.categoria === filtro);

  // Si hay un item seleccionado, renderizamos la vista de detalle
  if (itemSeleccionado) {
    return <DetalleServicioView servicio={itemSeleccionado} onBack={() => setItemSeleccionado(null)} />;
  }

  return (
    <div className="flex flex-col h-full bg-[#FDFBF7]">
      <header className="bg-desert-red text-white p-5 shadow-md shrink-0">
        <h1 className="text-2xl font-bold text-center tracking-wide">Tatacoa Way</h1>
        <p className="text-center text-desert-sand text-sm mt-1 opacity-90">Explora sin perderte</p>
      </header>

      <div className="p-4 overflow-y-auto flex-1">
        <div className="mb-6 bg-desert-sand/40 border border-desert-earth/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="text-desert-earth shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-desert-night">
              Contacta locales sin intermediarios. <strong className="text-desert-red">Cero comisiones.</strong>
            </p>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-desert-night mb-3">Explorar Servicios</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltro(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${filtro === cat ? 'bg-desert-earth text-white shadow-sm' : 'bg-white border border-desert-sand text-desert-stone hover:bg-desert-sand/30'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-4 pb-4">
          {serviciosFiltrados.map(servicio => (
            <div 
              key={servicio.id} 
              onClick={() => setItemSeleccionado(servicio)}
              className="border border-desert-sand/80 rounded-2xl p-4 shadow-sm bg-white flex flex-col hover:border-desert-earth/50 transition-colors cursor-pointer active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="pr-2">
                  <h3 className="font-bold text-desert-night flex items-center gap-1.5 text-lg leading-tight">
                    {servicio.nombre} 
                    {servicio.verificado && <CheckCircle size={16} className="text-[#25D366] shrink-0" />}
                  </h3>
                  <p className="text-sm text-desert-stone font-medium mt-1">{servicio.especialidad}</p>
                  <span className="inline-block mt-2 text-xs font-semibold text-desert-earth bg-desert-sand/40 border border-desert-earth/20 px-2 py-0.5 rounded-md">
                    {servicio.categoria}
                  </span>
                </div>
                <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden shadow-sm bg-gray-100">
                  <img src={servicio.fotoUrl} alt={servicio.nombre} className="w-full h-full object-cover" />
                </div>
              </div>
              <button className="mt-2 w-full bg-gray-50 text-desert-night border border-gray-200 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
                Ver detalles
              </button>
            </div>
          ))}
          {serviciosFiltrados.length === 0 && (
            <p className="text-center text-desert-stone mt-4">No hay servicios en esta categoría aún.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// NUEVA VISTA DE DETALLE
function DetalleServicioView({ servicio, onBack }) {
  return (
    <div className="h-full bg-white overflow-y-auto flex flex-col animate-in slide-in-from-right-8 duration-300 relative">
      
      {/* Botón Flotante para Volver */}
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg text-desert-night hover:bg-white transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Imagen de Cabecera */}
      <div className="w-full h-64 relative">
        <img src={servicio.fotoUrl} alt={servicio.nombre} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block mb-2 text-xs font-bold text-white bg-desert-earth/90 px-2.5 py-1 rounded-md shadow-sm">
            {servicio.categoria}
          </span>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            {servicio.nombre}
            {servicio.verificado && <CheckCircle size={20} className="text-[#25D366]" />}
          </h1>
        </div>
      </div>

      {/* Contenido del Detalle */}
      <div className="p-5 flex-1 pb-24">
        
        {/* Info rápida */}
        <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="flex flex-col items-center">
            <div className="flex items-center text-yellow-500 font-black text-lg gap-1">
              <Star size={18} className="fill-current" /> {servicio.rating}
            </div>
            <span className="text-xs text-desert-stone font-medium">Valoración</span>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div className="flex flex-col">
            <span className="text-desert-earth font-bold text-lg">{servicio.precio}</span>
            <span className="text-xs text-desert-stone font-medium">Tarifa promedio</span>
          </div>
        </div>

        <h2 className="text-lg font-bold text-desert-night mb-2">Acerca del servicio</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          {servicio.descripcion}
        </p>

        <h2 className="text-lg font-bold text-desert-night mb-3">¿Qué incluye?</h2>
        <ul className="space-y-3 mb-6">
          {servicio.incluye.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-700">
              <Check size={18} className="text-[#25D366] shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

      </div>

      {/* Botón flotante inferior (CTA) */}
      <div className="fixed bottom-[80px] w-full max-w-md px-4 pointer-events-none">
        <button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg shadow-xl shadow-green-500/20 pointer-events-auto transition-transform active:scale-[0.98]">
          <Phone size={22} />
          Contactar por WhatsApp
        </button>
      </div>

    </div>
  );
}

function MapaView() {
  const tatacoaCenter = [3.2359, -75.1700];
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const marcadores = [
    { id: 1, pos: [3.2350, -75.1720], nombre: "Cuzco (Desierto Rojo)", desc: "Senderos principales y laberintos." },
    { id: 2, pos: [3.2200, -75.1500], nombre: "Los Hoyos (Gris)", desc: "Piscina natural y dunas grises." },
    { id: 3, pos: [3.2380, -75.1680], nombre: "Observatorio Astronómico", desc: "Punto seguro. Hidratación disponible." },
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
      <header className="bg-desert-red text-white p-5 shadow-md shrink-0 absolute top-0 w-full z-[1000] opacity-90 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-center tracking-wide">Tatacoa Way</h1>
      </header>

      {/* Etiqueta superior */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400] w-[90%] bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-md border border-desert-sand">
        <h2 className="text-sm font-extrabold text-desert-red mb-0.5 text-center">Ruta Segura Activa</h2>
        <p className="text-xs text-desert-stone text-center font-medium">Sigue la línea azul para no desorientarte</p>
      </div>

      {/* Botón Flotante de GPS */}
      <button 
        onClick={requestLocation}
        className={`absolute bottom-6 right-4 z-[400] bg-white p-3 rounded-full shadow-xl border-2 transition-all ${isLocating ? 'border-desert-earth animate-pulse' : 'border-blue-500 hover:bg-blue-50'}`}
        title="Mi Ubicación"
      >
        <Navigation size={24} className={isLocating ? 'text-desert-earth' : 'text-blue-600'} />
      </button>

      <MapContainer 
        center={tatacoaCenter} 
        zoom={14} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0 pt-16"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {marcadores.map(lugar => (
          <Marker key={lugar.id} position={lugar.pos}>
            <Popup>
              <div className="text-center">
                <strong className="block text-desert-earth mb-1">{lugar.nombre}</strong>
                <span className="text-xs text-desert-stone">{lugar.desc}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        <Polyline 
          positions={rutaSegura} 
          pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8, dashArray: '10, 10' }} 
        />

        <UserLocationMarker location={userLocation} />
      </MapContainer>
    </div>
  );
}
