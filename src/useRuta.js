import { useState } from 'react';

const BASE_POR_PERFIL = {
  pie: 'https://routing.openstreetmap.de/routed-foot/route/v1/foot/',
  carro: 'https://routing.openstreetmap.de/routed-car/route/v1/driving/',
};

export function useRuta() {
  const [ruta, setRuta] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  async function calcularRuta(origen, destino, perfil = 'pie') {
    setCargando(true);
    setError(null);
    try {
      const coords = `${origen[1]},${origen[0]};${destino[1]},${destino[0]}`;
      const url = `${BASE_POR_PERFIL[perfil]}${coords}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('No se pudo calcular la ruta');
      const data = await res.json();
      if (data.code !== 'Ok' || !data.routes?.length) throw new Error('Ruta no encontrada');

      const r = data.routes[0];
      setRuta({
        coordenadas: r.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
        distanciaKm: r.distance / 1000,
        duracionMin: r.duration / 60,
        perfil,
      });
    } catch (e) {
      setError(e.message);
      setRuta(null);
    } finally {
      setCargando(false);
    }
  }

  function limpiarRuta() {
    setRuta(null);
    setError(null);
  }

  return { ruta, cargando, error, calcularRuta, limpiarRuta };
}
