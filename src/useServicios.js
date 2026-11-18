import { useState, useEffect, useCallback } from 'react';
import { obtenerSupabase, supabaseHabilitado } from './supabaseClient';
import { SERVICIOS_BD as SERVICIOS_RESPALDO } from './ServiciosData';

// La tabla usa snake_case (foto_url) y la app camelCase (fotoUrl):
// estas dos funciones traducen en cada lectura y escritura.
// Ya no se lee ni se escribe `rating_inicial` (corrección 1.1): la
// calificación sale solo de reseñas aprobadas (ver ratingUtils.js).
function aCamelCase(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    especialidad: fila.especialidad,
    categoria: fila.categoria,
    verificado: fila.verificado,
    fotoUrl: fila.foto_url,
    telefono: fila.telefono,
    descripcion: fila.descripcion,
    precio: fila.precio,
    incluye: fila.incluye ?? [],
    lat: fila.lat,
    lon: fila.lon,
  };
}

function aSnakeCase(servicio) {
  return {
    nombre: servicio.nombre,
    especialidad: servicio.especialidad,
    categoria: servicio.categoria,
    verificado: servicio.verificado,
    foto_url: servicio.fotoUrl,
    telefono: servicio.telefono,
    descripcion: servicio.descripcion,
    precio: servicio.precio,
    incluye: servicio.incluye,
    lat: servicio.lat,
    lon: servicio.lon,
  };
}

// Lee el directorio desde Supabase. Lo que se edita en /admin se ve en la
// app pública sin redesplegar (PF-17).
export function useServicios() {
  const [servicios, setServicios] = useState(supabaseHabilitado ? [] : SERVICIOS_RESPALDO);
  const [cargando, setCargando] = useState(supabaseHabilitado);

  const recargar = useCallback(async () => {
    if (!supabaseHabilitado) return;
    setCargando(true);
    const supabase = await obtenerSupabase();
    const { data, error } = await supabase.from('servicios').select('*').order('id');
    if (!error && data) {
      setServicios(data.map(aCamelCase));
    }
    setCargando(false);
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  return { servicios, cargando, recargar };
}

export async function crearServicio(servicio) {
  const supabase = await obtenerSupabase();
  const { error } = await supabase.from('servicios').insert(aSnakeCase(servicio));
  return { error: error?.message ?? null };
}

export async function actualizarServicio(id, servicio) {
  const supabase = await obtenerSupabase();
  const { error } = await supabase.from('servicios').update(aSnakeCase(servicio)).eq('id', id);
  return { error: error?.message ?? null };
}

export async function eliminarServicio(id) {
  const supabase = await obtenerSupabase();
  const { error } = await supabase.from('servicios').delete().eq('id', id);
  return { error: error?.message ?? null };
}
