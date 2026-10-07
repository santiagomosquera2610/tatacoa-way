import { useState } from 'react';
import { Star, Check, X, Pencil, Trash2, Plus, LogOut, MapPin } from 'lucide-react';
import { useAuth } from './useAuth';
import { useServicios, crearServicio, actualizarServicio, eliminarServicio } from './useServicios';
import { useResenasAdmin, aprobarResena, rechazarResena } from './useResenas';
import { QRAdminView } from './QRAdminView';
import { supabaseHabilitado } from './supabaseClient';

const CATEGORIAS = ['Guías', 'Transporte', 'Hospedaje', 'Gastronomía'];

export function AdminView() {
  const { session, cargando, entrar, salir } = useAuth();
  const [tab, setTab] = useState('resenas');

  if (!supabaseHabilitado) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FDFBF7] px-6 text-center">
        <p className="text-desert-night font-bold">El panel de admin no está disponible todavía.</p>
      </div>
    );
  }

  if (cargando) {
    return <div className="min-h-[100dvh] bg-[#FDFBF7]" />;
  }

  if (!session) {
    return <LoginForm onSubmit={entrar} />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7]">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-desert-sand/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="text-desert-earth" size={20} strokeWidth={2.5} />
          <span className="font-black text-desert-night">Panel Tatacoa Way</span>
        </div>
        <button onClick={salir} className="flex items-center gap-1.5 text-sm font-bold text-desert-stone hover:text-desert-night transition-colors">
          <LogOut size={16} /> Salir
        </button>
      </header>

      <div className="px-6 pt-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {[
          { id: 'resenas', label: 'Reseñas' },
          { id: 'servicios', label: 'Servicios' },
          { id: 'qr', label: 'Códigos QR' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${tab === t.id ? 'bg-desert-earth text-white' : 'bg-white border border-desert-sand/50 text-desert-stone'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === 'resenas' && <ResenasTab />}
        {tab === 'servicios' && <ServiciosTab />}
        {tab === 'qr' && <div className="-m-6"><QRAdminView /></div>}
      </div>
    </div>
  );
}

function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const { error } = await onSubmit(email, password);
    if (error) setError('Correo o contraseña incorrectos.');
    setEnviando(false);
  }

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-desert-md border border-desert-sand/50">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <MapPin className="text-desert-earth" size={22} strokeWidth={2.5} />
          <span className="font-black text-desert-night text-lg">Panel de admin</span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-bold text-desert-night">Correo</label>
            <input
              id="email" type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-desert-sand/60 p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-desert-earth/40"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-bold text-desert-night">Contraseña</label>
            <input
              id="password" type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-desert-sand/60 p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-desert-earth/40"
            />
          </div>

          {error && <p className="text-sm text-desert-red font-medium text-center">{error}</p>}

          <button
            type="submit" disabled={enviando}
            className="w-full bg-desert-earth disabled:opacity-40 text-white py-3 rounded-full font-black"
          >
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ResenasTab() {
  const { resenas, cargando, recargar } = useResenasAdmin();
  const { servicios } = useServicios();
  const [procesando, setProcesando] = useState(null);

  const nombreDe = (id) => servicios.find(s => s.id === id)?.nombre ?? `Servicio #${id}`;

  async function handleAprobar(id) {
    setProcesando(id);
    await aprobarResena(id);
    await recargar();
    setProcesando(null);
  }

  async function handleRechazar(id) {
    setProcesando(id);
    await rechazarResena(id);
    await recargar();
    setProcesando(null);
  }

  if (cargando) return <p className="text-desert-stone font-medium">Cargando reseñas...</p>;

  if (resenas.length === 0) {
    return <p className="text-desert-stone font-medium">Todavía no hay reseñas.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {resenas.map(r => (
        <div key={r.id} className="bg-white rounded-2xl p-5 border border-desert-sand/50 shadow-desert-sm">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="font-black text-desert-night">{nombreDe(r.servicio_id)}</p>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} size={14} className={n <= r.calificacion ? 'fill-desert-earth text-desert-earth' : 'fill-desert-sand text-desert-sand'} />
                ))}
              </div>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${r.aprobado ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-desert-sand/40 text-desert-earth'}`}>
              {r.aprobado ? 'Publicada' : 'Pendiente'}
            </span>
          </div>

          {r.comentario && (
            <p className="text-desert-stone text-sm font-medium mb-4">{r.comentario}</p>
          )}

          <div className="flex gap-2">
            {!r.aprobado && (
              <button
                onClick={() => handleAprobar(r.id)}
                disabled={procesando === r.id}
                className="flex items-center gap-1.5 bg-[#25D366] text-white text-sm font-bold px-4 py-2 rounded-full disabled:opacity-40"
              >
                <Check size={14} /> Aprobar
              </button>
            )}
            <button
              onClick={() => handleRechazar(r.id)}
              disabled={procesando === r.id}
              className="flex items-center gap-1.5 bg-desert-sand/40 text-desert-night text-sm font-bold px-4 py-2 rounded-full disabled:opacity-40"
            >
              <X size={14} /> {r.aprobado ? 'Quitar' : 'Rechazar'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const SERVICIO_VACIO = {
  nombre: '', especialidad: '', categoria: CATEGORIAS[0], verificado: true,
  fotoUrl: '', telefono: '', descripcion: '', precio: '', incluye: [], rating: 4.5,
};

function ServiciosTab() {
  const { servicios, cargando, recargar } = useServicios();
  const [editando, setEditando] = useState(null);
  const [creando, setCreando] = useState(false);

  async function handleEliminar(id) {
    await eliminarServicio(id);
    await recargar();
  }

  if (cargando) return <p className="text-desert-stone font-medium">Cargando servicios...</p>;

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setCreando(true)}
        className="flex items-center justify-center gap-2 bg-desert-night text-white font-bold py-3 rounded-full"
      >
        <Plus size={16} /> Agregar servicio
      </button>

      {servicios.map(s => (
        <div key={s.id} className="bg-white rounded-2xl p-4 border border-desert-sand/50 shadow-desert-sm flex items-center gap-3">
          <img src={s.fotoUrl} alt={s.nombre} className="w-14 h-14 rounded-xl object-cover shrink-0 bg-desert-sand" />
          <div className="flex-1 min-w-0">
            <p className="font-black text-desert-night truncate">{s.nombre}</p>
            <p className="text-desert-stone text-xs font-medium truncate">{s.categoria} · {s.especialidad}</p>
          </div>
          <button onClick={() => setEditando(s)} className="p-2 rounded-full bg-desert-sand/30 text-desert-night shrink-0">
            <Pencil size={15} />
          </button>
          <button onClick={() => handleEliminar(s.id)} className="p-2 rounded-full bg-desert-sand/30 text-desert-red shrink-0">
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      {(editando || creando) && (
        <ServicioFormModal
          servicio={editando ?? SERVICIO_VACIO}
          esNuevo={creando}
          onClose={() => { setEditando(null); setCreando(false); }}
          onSaved={recargar}
        />
      )}
    </div>
  );
}

function ServicioFormModal({ servicio, esNuevo, onClose, onSaved }) {
  const [form, setForm] = useState({
    ...servicio,
    incluyeTexto: (servicio.incluye ?? []).join(', '),
  });
  const [guardando, setGuardando] = useState(false);

  function campo(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    const datos = {
      ...form,
      incluye: form.incluyeTexto.split(',').map(s => s.trim()).filter(Boolean),
      rating: Number(form.rating),
    };
    if (esNuevo) {
      await crearServicio(datos);
    } else {
      await actualizarServicio(servicio.id, datos);
    }
    await onSaved();
    setGuardando(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[700] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-t-[32px] sm:rounded-3xl p-6 flex flex-col gap-4"
      >
        <h2 className="text-lg font-black text-desert-night">{esNuevo ? 'Nuevo servicio' : 'Editar servicio'}</h2>

        <Campo label="Nombre" value={form.nombre} onChange={v => campo('nombre', v)} required />
        <Campo label="Especialidad" value={form.especialidad} onChange={v => campo('especialidad', v)} required />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-desert-night">Categoría</label>
          <select
            value={form.categoria}
            onChange={e => campo('categoria', e.target.value)}
            className="w-full rounded-xl border border-desert-sand/60 p-3 text-sm font-medium"
          >
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <Campo label="Foto (ruta o URL)" value={form.fotoUrl} onChange={v => campo('fotoUrl', v)} required />
        <Campo label="Teléfono WhatsApp (57...)" value={form.telefono} onChange={v => campo('telefono', v)} required />
        <Campo label="Precio" value={form.precio} onChange={v => campo('precio', v)} required />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-desert-night">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={e => campo('descripcion', e.target.value)}
            rows={3}
            required
            className="w-full rounded-xl border border-desert-sand/60 p-3 text-sm font-medium resize-none"
          />
        </div>

        <Campo label="Incluye (separado por comas)" value={form.incluyeTexto} onChange={v => campo('incluyeTexto', v)} />
        <Campo label="Calificación inicial (1-5)" type="number" step="0.1" min="1" max="5" value={form.rating} onChange={v => campo('rating', v)} required />

        <div className="flex gap-3 mt-2">
          <button type="button" onClick={onClose} className="flex-1 bg-desert-sand/40 text-desert-night font-bold py-3 rounded-full">
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="flex-1 bg-desert-earth disabled:opacity-40 text-white font-bold py-3 rounded-full">
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Campo({ label, value, onChange, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-desert-night">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-desert-sand/60 p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-desert-earth/40"
        {...props}
      />
    </div>
  );
}
