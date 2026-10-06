import { useState, useEffect } from 'react';
import { Map, List, Phone, CheckCircle, Info, Navigation } from 'lucide-react';
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

// Ícono personalizado para la ubicación del usuario (Punto azul con radar)
const userIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="relative flex h-6 w-6"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-6 w-6 bg-blue-600 border-2 border-white shadow-md"></span></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export default function App() {
  const [activeTab, setActiveTab] = useState('mapa');

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white shadow-2xl relative pb-20 overflow-hidden flex flex-col h-screen">
        
        <header className="bg-orange-600 text-white p-5 sticky top-0 z-[1000] shadow-md">
          <h1 className="text-2xl font-bold text-center tracking-wide">Tatacoa Way</h1>
          <p className="text-center text-orange-100 text-sm mt-1">Explora sin perderte</p>
        </header>

        <main className="flex-1 overflow-hidden relative z-0">
          {activeTab === 'directorio' ? <DirectorioView /> : <MapaView />}
        </main>

        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around p-2 z-[1000] pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setActiveTab('directorio')}
            className={`flex flex-col items-center p-2 w-full transition-colors ${activeTab === 'directorio' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List size={26} />
            <span className="text-xs mt-1 font-medium">Directorio</span>
          </button>
          <button 
            onClick={() => setActiveTab('mapa')}
            className={`flex flex-col items-center p-2 w-full transition-colors ${activeTab === 'mapa' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
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
  const categorias = ['Todos', 'Guías', 'Transporte', 'Hospedaje', 'Gastronomía'];

  const servicios = [
    { id: 1, nombre: "Carlos Ramírez", especialidad: "Tour Astronómico", verificado: true, categoria: "Guías" },
    { id: 2, nombre: "María Gómez", especialidad: "Ruta del Cuzco (Rojo)", verificado: true, categoria: "Guías" },
    { id: 3, nombre: "Asoc. Villavieja", especialidad: "Transporte desde Neiva", verificado: true, categoria: "Transporte" },
    { id: 4, nombre: "TukTuk Tatacoa", especialidad: "Movilidad interna desierto", verificado: true, categoria: "Transporte" },
    { id: 5, nombre: "Hostal Noches de Saturno", especialidad: "Cabañas y Zona de Camping", verificado: true, categoria: "Hospedaje" },
    { id: 6, nombre: "Restaurante El Oasis", especialidad: "Platos típicos y Chivo", verificado: true, categoria: "Gastronomía" },
  ];

  const serviciosFiltrados = servicios.filter(s => filtro === 'Todos' || s.categoria === filtro);

  return (
    <div className="p-4 overflow-y-auto h-full animate-in fade-in duration-300">
      <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="text-orange-600 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-gray-700">
            Contacta locales sin intermediarios. <strong>Cero comisiones.</strong>
          </p>
        </div>
      </div>

      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-gray-800 mb-3">Explorar Servicios</h2>
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${filtro === cat ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col gap-4 pb-4">
        {serviciosFiltrados.map(servicio => (
          <div key={servicio.id} className="border border-gray-200 rounded-2xl p-4 shadow-sm bg-white flex flex-col hover:border-orange-300 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-lg">
                  {servicio.nombre} 
                  {servicio.verificado && <CheckCircle size={18} className="text-green-500" />}
                </h3>
                <p className="text-sm text-gray-500 font-medium">{servicio.especialidad}</p>
                <span className="inline-block mt-1 text-xs font-semibold text-orange-600 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-md">
                  {servicio.categoria}
                </span>
              </div>
              <div className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shrink-0">
                Disponible
              </div>
            </div>
            <button className="mt-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-sm active:scale-[0.98]">
              <Phone size={20} />
              Contactar
            </button>
          </div>
        ))}
        {serviciosFiltrados.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No hay servicios en esta categoría aún.</p>
        )}
      </div>
    </div>
  );
}

// Componente para volar hacia la ubicación del usuario
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
    <div className="animate-in fade-in duration-300 h-full flex flex-col relative">
      {/* Etiqueta superior */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] w-[90%] bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-orange-100">
        <h2 className="text-sm font-extrabold text-orange-600 mb-0.5 text-center">Ruta Segura Activa</h2>
        <p className="text-xs text-gray-600 text-center font-medium">Sigue la línea azul para no desorientarte</p>
      </div>

      {/* Botón Flotante de GPS */}
      <button 
        onClick={requestLocation}
        className={`absolute bottom-6 right-4 z-[400] bg-white p-3 rounded-full shadow-xl border-2 transition-all ${isLocating ? 'border-orange-400 animate-pulse' : 'border-blue-500 hover:bg-blue-50'}`}
        title="Mi Ubicación"
      >
        <Navigation size={24} className={isLocating ? 'text-orange-500' : 'text-blue-600'} />
      </button>

      <MapContainer 
        center={tatacoaCenter} 
        zoom={14} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0"
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
                <strong className="block text-orange-600 mb-1">{lugar.nombre}</strong>
                <span className="text-xs text-gray-600">{lugar.desc}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        <Polyline 
          positions={rutaSegura} 
          pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8, dashArray: '10, 10' }} 
        />

        {/* Renderiza el GPS del usuario si existe */}
        <UserLocationMarker location={userLocation} />
      </MapContainer>
    </div>
  );
}
