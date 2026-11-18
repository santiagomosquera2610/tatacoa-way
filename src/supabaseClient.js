const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sin estas variables la app no se cae: funciona en modo de respaldo con
// los datos de ServiciosData.js, y el panel y las reseñas se desactivan.
export const supabaseHabilitado = Boolean(url && anonKey);

// La librería de Supabase se descarga bajo demanda, la primera vez que se
// necesita, y no en el paquete inicial: así la portada (Descubre), que no
// usa la base de datos, carga más rápido (corrección 1.3, rendimiento).
let clientePromesa = null;

export function obtenerSupabase() {
  if (!supabaseHabilitado) return Promise.resolve(null);
  if (!clientePromesa) {
    clientePromesa = import('@supabase/supabase-js').then(({ createClient }) => createClient(url, anonKey));
  }
  return clientePromesa;
}
