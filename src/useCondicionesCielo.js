import { useState, useEffect } from 'react';

const TATACOA_LAT = 3.2359;
const TATACOA_LON = -75.1700;

// Referencia: luna nueva conocida (6 ene 2000, 18:14 UTC) y mes sinódico promedio.
const LUNA_NUEVA_REF = Date.UTC(2000, 0, 6, 18, 14) / 1000;
const MES_SINODICO = 29.53058867 * 86400;

function calcularFaseLunar(fecha = new Date()) {
  const segundos = fecha.getTime() / 1000;
  const ciclos = (segundos - LUNA_NUEVA_REF) / MES_SINODICO;
  const fase = ciclos - Math.floor(ciclos); // 0 a 1
  const iluminacion = Math.round((1 - Math.cos(fase * 2 * Math.PI)) * 50); // 0-100%

  let nombre;
  if (fase < 0.03 || fase > 0.97) nombre = 'Luna Nueva';
  else if (fase < 0.22) nombre = 'Creciente';
  else if (fase < 0.28) nombre = 'Cuarto Creciente';
  else if (fase < 0.47) nombre = 'Gibosa Creciente';
  else if (fase < 0.53) nombre = 'Luna Llena';
  else if (fase < 0.72) nombre = 'Gibosa Menguante';
  else if (fase < 0.78) nombre = 'Cuarto Menguante';
  else nombre = 'Menguante';

  return { fase, iluminacion, nombre };
}

const WEATHER_CODE_MAP = {
  0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
  45: 'Neblina', 48: 'Neblina', 51: 'Llovizna', 53: 'Llovizna', 55: 'Llovizna',
  61: 'Lluvia ligera', 63: 'Lluvia', 65: 'Lluvia fuerte', 80: 'Chubascos', 81: 'Chubascos', 82: 'Chubascos fuertes',
  95: 'Tormenta',
};

export function useCondicionesCielo() {
  const [clima, setClima] = useState(null);
  const [estado, setEstado] = useState('cargando');
  const luna = calcularFaseLunar();

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${TATACOA_LAT}&longitude=${TATACOA_LON}&current=temperature_2m,weather_code,cloud_cover,relative_humidity_2m&timezone=America%2FBogota`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('No se pudo cargar el clima');
        const data = await res.json();
        if (cancelado) return;
        setClima({
          temperatura: Math.round(data.current.temperature_2m),
          nubosidad: data.current.cloud_cover,
          humedad: data.current.relative_humidity_2m,
          condicion: WEATHER_CODE_MAP[data.current.weather_code] ?? 'Variable',
        });
        setEstado('listo');
      } catch {
        if (!cancelado) setEstado('error');
      }
    }
    cargar();
    return () => { cancelado = true; };
  }, []);

  let recomendacion = null;
  if (clima) {
    if (clima.nubosidad > 60) {
      recomendacion = 'Cielo nublado: visibilidad baja para observación astronómica.';
    } else if (luna.iluminacion > 65) {
      recomendacion = 'Luna brillante: buena para fotos de paisaje, estrellas menos visibles.';
    } else {
      recomendacion = 'Cielo despejado y luna favorable: buena noche para observar estrellas.';
    }
  }

  return { clima, luna, estado, recomendacion };
}
