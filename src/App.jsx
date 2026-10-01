import { useState } from 'react';
import { Map, List, Phone, CheckCircle, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Arreglar el ícono por defecto de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function App() {
  const [activeTab, setActiveTab] = useState('mapa'); // Empezar en mapa para que lo veas rápido

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white shadow-2xl relative pb-20 overflow-hidden flex flex-col h-screen">
        
        <header className="bg-orange-600 text-white p-5 sticky top-0 z-50 shadow-md">
          <h1 className="text-2xl font-bold text-center tracking-wide">Tatacoa Way</h1>
          <p className="text-center text-orange-100 text-sm mt-1">Explora sin perderte</p>
        </header>

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'directorio' ? <DirectorioView /> : <MapaView />}
        </main>

        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around p-2 z-50 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
  const guias = [
    { id: 1, nombre: "Carlos Ramírez", especialidad: "Tour Astronómico", verificado: true },
    { id: 2, nombre: "María Gómez", especialidad: "Ruta del Cuzco (Rojo)", verificado: true },
    { id: 3, nombre: "Asoc. Villavieja", especialidad: "Transporte y Tour completo", verificado: true },
  ];

  return (
    <div className="p-4 animate-in fade-in duration-300">
      <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="text-orange-600 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-gray-700">
            Contacta a los guías locales sin intermediarios. <strong>Cero comisiones.</strong>
          </p>
        </div>
      </div>
      <h2 className="text-xl font-extrabold text-gray-800 mb-4">Guías Certificados</h2>
      <div className="flex flex-col gap-4">
        {guias.map(guia => (
          <div key={guia.id} className="border border-gray-200 rounded-2xl p-4 shadow-sm bg-white flex flex-col hover:border-orange-300 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-lg">
                  {guia.nombre} 
                  {guia.verificado && <CheckCircle size={18} className="text-green-500" />}
                </h3>
                <p className="text-sm text-gray-500 font-medium">{guia.especialidad}</p>
              </div>
              <div className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                Disponible
              </div>
            </div>
            <button className="mt-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-sm active:scale-[0.98]">
              <Phone size={20} />
              Contactar por WhatsApp
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapaView() {
  // Coordenadas aproximadas del Desierto de la Tatacoa (Cuzco)
  const tatacoaCenter = [3.2359, -75.1700];

  const marcadores = [
    { id: 1, pos: [3.2350, -75.1720], nombre: "Cuzco (Desierto Rojo)", desc: "Senderos principales y laberintos." },
    { id: 2, pos: [3.2200, -75.1500], nombre: "Los Hoyos (Gris)", desc: "Piscina natural y dunas grises." },
    { id: 3, pos: [3.2380, -75.1680], nombre: "Observatorio Astronómico", desc: "Punto seguro. Hidratación disponible." },
  ];

  // Ruta sugerida conectando los puntos
  const rutaSegura = [
    [3.2380, -75.1680], // Observatorio
    [3.2350, -75.1720], // Cuzco
    [3.2200, -75.1500], // Los Hoyos
  ];

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col relative">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] w-[90%] bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-orange-100">
        <h2 className="text-sm font-extrabold text-orange-600 mb-0.5 text-center">Ruta Segura Activa</h2>
        <p className="text-xs text-gray-600 text-center font-medium">Sigue la línea azul para no desorientarte</p>
      </div>

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
        
        {/* Marcadores de sitios importantes */}
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

        {/* Línea de ruta segura */}
        <Polyline 
          positions={rutaSegura} 
          pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8, dashArray: '10, 10' }} 
        />
      </MapContainer>
    </div>
  );
}
