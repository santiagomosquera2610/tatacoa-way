import { useState, useEffect } from 'react';
import { supabase, supabaseHabilitado } from './supabaseClient';

export function useResenas() {
  const [agregados, setAgregados] = useState({});
  const [cargando, setCargando] = useState(supabaseHabilitado);

  useEffect(() => {
    if (!supabaseHabilitado) return;
    let cancelado = false;

    async function cargar() {
      const { data, error } = await supabase
        .from('resenas')
        .select('servicio_id, calificacion')
        .eq('aprobado', true);

      if (cancelado) return;
      if (!error && data) {
        const porServicio = {};
        for (const r of data) {
          if (!porServicio[r.servicio_id]) porServicio[r.servicio_id] = [];
          porServicio[r.servicio_id].push(r.calificacion);
        }
        const resultado = {};
        for (const [id, valores] of Object.entries(porServicio)) {
          resultado[id] = {
            promedio: valores.reduce((a, b) => a + b, 0) / valores.length,
            total: valores.length,
          };
        }
        setAgregados(resultado);
      }
      setCargando(false);
    }
    cargar();
    return () => { cancelado = true; };
  }, []);

  return { agregados, cargando };
}

export async function enviarResena({ servicioId, calificacion, comentario }) {
  if (!supabaseHabilitado) {
    return { error: 'El sistema de reseñas no está disponible todavía.' };
  }
  const { error } = await supabase.from('resenas').insert({
    servicio_id: servicioId,
    calificacion,
    comentario: comentario || null,
    aprobado: false,
  });
  return { error: error?.message ?? null };
}
