import { useState, useEffect } from 'react';
import { obtenerSupabase, supabaseHabilitado } from './supabaseClient';

// Sesión del panel /admin con Supabase Auth (correo y contraseña). Los
// usuarios se crean a mano en Supabase → Authentication → Users; no hay
// registro público. Las escrituras las protege RLS en la base de datos.
export function useAuth() {
  const [session, setSession] = useState(null);
  const [cargando, setCargando] = useState(supabaseHabilitado);

  useEffect(() => {
    if (!supabaseHabilitado) return;
    let cancelado = false;
    let listener = null;
    obtenerSupabase().then(async (supabase) => {
      const { data } = await supabase.auth.getSession();
      if (cancelado) return;
      setSession(data.session);
      setCargando(false);
      listener = supabase.auth.onAuthStateChange((_event, nuevaSesion) => {
        setSession(nuevaSesion);
      }).data;
    });
    return () => {
      cancelado = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  async function entrar(email, password) {
    const supabase = await obtenerSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function salir() {
    const supabase = await obtenerSupabase();
    await supabase.auth.signOut();
  }

  return { session, cargando, entrar, salir };
}
