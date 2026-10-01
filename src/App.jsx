import { useState } from 'react';
import { Map, List, Phone, CheckCircle, MapPin, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('directorio');

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      {/* Contenedor simulando la pantalla de un celular */}
      <div className="w-full max-w-md bg-white shadow-2xl relative pb-20 overflow-hidden">
        
        {/* Encabezado */}
        <header className="bg-orange-600 text-white p-5 sticky top-0 z-10 shadow-md">
          <h1 className="text-2xl font-bold text-center tracking-wide">Tatacoa Way</h1>
          <p className="text-center text-orange-100 text-sm mt-1">Explora sin perderte</p>
        </header>

        {/* Contenido Dinámico */}
        <main className="p-4">
          {activeTab === 'directorio' ? <DirectorioView /> : <MapaView />}
        </main>

        {/* Barra de Navegación Inferior */}
        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around p-2 z-10 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
    <div className="animate-in fade-in duration-300">
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
  return (
    <div className="animate-in fade-in duration-300 h-[70vh] flex flex-col">
      <h2 className="text-xl font-extrabold text-gray-800 mb-1">Tu ubicación GPS</h2>
      <p className="text-sm text-gray-500 mb-4">Conoce las rutas seguras y evita desorientarte.</p>
      
      <div className="flex-1 bg-gray-50 rounded-2xl border-2 border-dashed border-orange-200 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
        <MapPin size={56} className="text-orange-400 mb-4 animate-bounce z-10" />
        <h3 className="text-gray-800 font-bold text-lg z-10 px-6 text-center">
          Módulo de Mapa Interactivo
        </h3>
        <p className="text-sm text-gray-500 mt-2 z-10 text-center px-8">
          En la versión final, aquí verás el mapa offline del desierto con los puntos de hidratación.
        </p>
      </div>
    </div>
  );
}
