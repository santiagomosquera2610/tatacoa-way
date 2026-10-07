import { useState, useEffect } from 'react';
import { supabase, supabaseHabilitado } from './supabaseClient';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [cargando, setCargando] = useState(supabaseHabilitado);

  useEffect(() => {
    if (!supabaseHabilitado) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargando(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nuevaSesion) => {
      setSession(nuevaSesion);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function entrar(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function salir() {
    await supabase.auth.signOut();
  }

  return { session, cargando, entrar, salir };
}
