import { useState, useEffect, useCallback } from 'react';
import { obtenerSupabase, supabaseHabilitado } from './supabaseClient';

// Promedio y número de reseñas por servicio, contando SOLO las aprobadas
// por el semillero. Es lo único de lo que sale la calificación pública.
export function useResenas() {
  const [agregados, setAgregados] = useState({});
  const [cargando, setCargando] = useState(supabaseHabilitado);

  useEffect(() => {
    if (!supabaseHabilitado) return;
    let cancelado = false;

    async function cargar() {
      const supabase = await obtenerSupabase();
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

// Reseña pública sin cuenta (desde el QR). Siempre entra con
// aprobado: false; no se publica hasta que el semillero la apruebe (PF-14).
export async function enviarResena({ servicioId, calificacion, comentario }) {
  if (!supabaseHabilitado) {
    return { error: 'El sistema de reseñas no está disponible todavía.' };
  }
  const supabase = await obtenerSupabase();
  const { error } = await supabase.from('resenas').insert({
    servicio_id: servicioId,
    calificacion,
    comentario: comentario || null,
    aprobado: false,
  });
  return { error: error?.message ?? null };
}

export function useResenasAdmin() {
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    if (!supabaseHabilitado) return;
    setCargando(true);
    const supabase = await obtenerSupabase();
    const { data, error } = await supabase
      .from('resenas')
      .select('*')
      .order('creado_en', { ascending: false });
    if (!error && data) setResenas(data);
    setCargando(false);
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  return { resenas, cargando, recargar };
}

export async function aprobarResena(id) {
  const supabase = await obtenerSupabase();
  const { error } = await supabase.from('resenas').update({ aprobado: true }).eq('id', id);
  return { error: error?.message ?? null };
}

// Rechazar borra la reseña: no se guardan reseñas rechazadas.
export async function rechazarResena(id) {
  const supabase = await obtenerSupabase();
  const { error } = await supabase.from('resenas').delete().eq('id', id);
  return { error: error?.message ?? null };
}
