import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseHabilitado } from './supabaseClient';
import { SERVICIOS_BD as SERVICIOS_RESPALDO } from './ServiciosData';

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
    rating: fila.rating_inicial,
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
    rating_inicial: servicio.rating,
  };
}

export function useServicios() {
  const [servicios, setServicios] = useState(supabaseHabilitado ? [] : SERVICIOS_RESPALDO);
  const [cargando, setCargando] = useState(supabaseHabilitado);

  const recargar = useCallback(async () => {
    if (!supabaseHabilitado) return;
    setCargando(true);
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
  const { error } = await supabase.from('servicios').insert(aSnakeCase(servicio));
  return { error: error?.message ?? null };
}

export async function actualizarServicio(id, servicio) {
  const { error } = await supabase.from('servicios').update(aSnakeCase(servicio)).eq('id', id);
  return { error: error?.message ?? null };
}

export async function eliminarServicio(id) {
  const { error } = await supabase.from('servicios').delete().eq('id', id);
  return { error: error?.message ?? null };
}
