import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Star, Check, X, Pencil, Trash2, Plus, LogOut, MapPin,
  Search, Package, QrCode, MessageSquare, AlertTriangle, Inbox,
} from 'lucide-react';
import { useAuth } from './useAuth';
import { useServicios, crearServicio, actualizarServicio, eliminarServicio } from './useServicios';
import { useResenasAdmin, aprobarResena, rechazarResena } from './useResenas';
import { QRAdminView } from './QRAdminView';
import { supabaseHabilitado } from './supabaseClient';

const CATEGORIAS = ['Guías', 'Transporte', 'Hospedaje', 'Gastronomía'];
const FOTOS_DISPONIBLES = [
  '/img/cielo-tatacoa.jpg', '/img/desierto-rojo.jpg', '/img/chiva-transporte.jpg',
  '/img/motocarro-tatacoa.jpg', '/img/glamping-desierto.jpg', '/img/achiras-huila.jpg',
  '/img/bosque-tropical.jpg', '/img/cordillera-andes.jpg', '/img/los-hoyos.jpg',
  '/img/atardecer-tatacoa.jpg', '/img/fosiles-tatacoa.jpg',
];

const SPRING_SUAVE = { type: 'spring', damping: 32, stiffness: 320 };
const SPRING_HOJA = { type: 'spring', damping: 30, stiffness: 280 };

export function AdminView() {
  const { session, cargando, entrar, salir } = useAuth();
  const [tab, setTab] = useState('resenas');
  const { servicios, cargando: cargandoServicios, recargar: recargarServicios } = useServicios();
  const { resenas, cargando: cargandoResenas, recargar: recargarResenas } = useResenasAdmin();
  const [toast, setToast] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);
  const reducirMovimiento = useReducedMotion();

  function avisar(mensaje, tipo = 'ok') {
    setToast({ mensaje, tipo, key: Date.now() });
  }

  function pedirConfirmacion(config) {
    setConfirmacion(config);
  }

  const pendientes = resenas.filter(r => !r.aprobado).length;
  const ratingPromedio = servicios.length
    ? (servicios.reduce((acc, s) => acc + Number(s.rating || 0), 0) / servicios.length).toFixed(1)
    : '—';

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

  const TABS = [
    { id: 'resenas', label: 'Reseñas', icon: MessageSquare, badge: pendientes },
    { id: 'servicios', label: 'Servicios', icon: Package },
    { id: 'qr', label: 'Códigos QR', icon: QrCode },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7]">
      <header
        className="sticky top-0 z-10 px-6 pb-4 flex items-center justify-between border-b border-desert-sand/50"
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          background: 'rgba(253, 251, 247, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <div className="flex items-center gap-2">
          <MapPin className="text-desert-earth" size={20} strokeWidth={2.5} />
          <span className="font-black text-desert-night">Panel Tatacoa Way</span>
        </div>
        <button onClick={salir} className="flex items-center gap-1.5 text-sm font-bold text-desert-stone hover:text-desert-night active:scale-95 transition-all">
          <LogOut size={16} /> Salir
        </button>
      </header>

      <div className="px-6 pt-5 grid grid-cols-3 gap-3">
        <StatCard label="Servicios" valor={servicios.length} />
        <StatCard label="Pendientes" valor={pendientes} resaltar={pendientes > 0} />
        <StatCard label="Rating prom." valor={ratingPromedio} />
      </div>

      <div className="px-6 pt-5 flex gap-2 overflow-x-auto scrollbar-hide">
        {TABS.map(t => {
          const Icono = t.icon;
          const activo = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors active:scale-95 ${activo ? 'bg-desert-night text-white' : 'bg-white border border-desert-sand/50 text-desert-stone'}`}
            >
              <Icono size={15} />
              {t.label}
              {!!t.badge && (
                <span className={`ml-0.5 text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center ${activo ? 'bg-white text-desert-night' : 'bg-desert-earth text-white'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {tab === 'resenas' && (
          <ResenasTab
            resenas={resenas}
            cargando={cargandoResenas}
            recargar={recargarResenas}
            servicios={servicios}
            avisar={avisar}
            pedirConfirmacion={pedirConfirmacion}
          />
        )}
        {tab === 'servicios' && (
          <ServiciosTab
            servicios={servicios}
            cargando={cargandoServicios}
            recargar={recargarServicios}
            avisar={avisar}
            pedirConfirmacion={pedirConfirmacion}
          />
        )}
        {tab === 'qr' && <div className="-m-6"><QRAdminView /></div>}
      </div>

      <AnimatePresence>
        {confirmacion && (
          <ConfirmDialog
            {...confirmacion}
            reducirMovimiento={reducirMovimiento}
            onCancel={() => setConfirmacion(null)}
            onConfirm={async () => {
              await confirmacion.onConfirm();
              setConfirmacion(null);
            }}
          />
        )}
      </AnimatePresence>

      <ToastHost toast={toast} reducirMovimiento={reducirMovimiento} />
    </div>
  );
}

function StatCard({ label, valor, resaltar }) {
  return (
    <div className={`rounded-2xl p-3.5 border ${resaltar ? 'bg-desert-earth/10 border-desert-earth/30' : 'bg-white border-desert-sand/50'}`}>
      <p className={`text-xl font-black leading-none ${resaltar ? 'text-desert-earth' : 'text-desert-night'}`}>{valor}</p>
      <p className="text-[11px] text-desert-stone font-bold mt-1">{label}</p>
    </div>
  );
}

function ToastHost({ toast, reducirMovimiento }) {
  const [visible, setVisible] = useState(toast);

  useEffect(() => {
    if (!toast) return;
    setVisible(toast);
    const t = setTimeout(() => setVisible(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="fixed left-0 right-0 z-[800] flex justify-center pointer-events-none" style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
      <AnimatePresence>
        {visible && (
          <motion.div
            key={visible.key}
            initial={reducirMovimiento ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducirMovimiento ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.95 }}
            transition={SPRING_SUAVE}
            className={`pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full shadow-desert-lg font-bold text-sm text-white ${visible.tipo === 'error' ? 'bg-desert-red' : 'bg-desert-night'}`}
          >
            {visible.tipo === 'error' ? <AlertTriangle size={15} /> : <Check size={15} />}
            {visible.mensaje}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfirmDialog({ titulo, mensaje, confirmLabel, peligroso = true, onConfirm, onCancel, reducirMovimiento }) {
  const [procesando, setProcesando] = useState(false);

  async function handleConfirm() {
    setProcesando(true);
    await onConfirm();
    setProcesando(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[900] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onCancel}
    >
      <motion.div
        initial={reducirMovimiento ? { opacity: 0 } : { y: '100%' }}
        animate={reducirMovimiento ? { opacity: 1 } : { y: 0 }}
        exit={reducirMovimiento ? { opacity: 0 } : { y: '100%' }}
        transition={SPRING_HOJA}
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-sm bg-white rounded-t-[32px] sm:rounded-3xl p-6 flex flex-col gap-4"
      >
        <div className={`w-11 h-11 rounded-full flex items-center justify-center ${peligroso ? 'bg-desert-red/10' : 'bg-desert-sand/40'}`}>
          <AlertTriangle size={20} className={peligroso ? 'text-desert-red' : 'text-desert-earth'} />
        </div>
        <div>
          <h2 className="text-lg font-black text-desert-night mb-1">{titulo}</h2>
          <p className="text-desert-stone text-sm font-medium">{mensaje}</p>
        </div>
        <div className="flex gap-3 mt-1">
          <button onClick={onCancel} className="flex-1 bg-desert-sand/40 text-desert-night font-bold py-3 rounded-full active:scale-95 transition-transform">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={procesando}
            className={`flex-1 text-white font-bold py-3 rounded-full active:scale-95 transition-transform disabled:opacity-40 ${peligroso ? 'bg-desert-red' : 'bg-desert-earth'}`}
          >
            {procesando ? 'Un momento...' : (confirmLabel ?? 'Confirmar')}
          </button>
        </div>
      </motion.div>
    </motion.div>
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
            className="w-full bg-desert-earth disabled:opacity-40 text-white py-3 rounded-full font-black active:scale-95 transition-transform"
          >
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </form>
    </div>
  );
}

const FILTROS_RESENAS = [
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'publicadas', label: 'Publicadas' },
  { id: 'todas', label: 'Todas' },
];

function ResenasTab({ resenas, cargando, recargar, servicios, avisar, pedirConfirmacion }) {
  const [filtro, setFiltro] = useState('pendientes');
  const [procesando, setProcesando] = useState(null);

  const nombreDe = (id) => servicios.find(s => s.id === id)?.nombre ?? `Servicio #${id}`;

  const visibles = useMemo(() => {
    if (filtro === 'pendientes') return resenas.filter(r => !r.aprobado);
    if (filtro === 'publicadas') return resenas.filter(r => r.aprobado);
    return resenas;
  }, [resenas, filtro]);

  async function handleAprobar(r) {
    setProcesando(r.id);
    const { error } = await aprobarResena(r.id);
    await recargar();
    setProcesando(null);
    avisar(error ? 'No se pudo aprobar la reseña.' : `Reseña de ${nombreDe(r.servicio_id)} publicada.`, error ? 'error' : 'ok');
  }

  function handleRechazar(r) {
    pedirConfirmacion({
      titulo: r.aprobado ? '¿Quitar esta reseña?' : '¿Rechazar esta reseña?',
      mensaje: `Se eliminará la reseña de ${nombreDe(r.servicio_id)} de forma permanente.`,
      confirmLabel: r.aprobado ? 'Quitar' : 'Rechazar',
      onConfirm: async () => {
        setProcesando(r.id);
        const { error } = await rechazarResena(r.id);
        await recargar();
        setProcesando(null);
        avisar(error ? 'No se pudo completar la acción.' : 'Reseña eliminada.', error ? 'error' : 'ok');
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {FILTROS_RESENAS.map(f => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filtro === f.id ? 'bg-desert-earth text-white' : 'bg-white border border-desert-sand/50 text-desert-stone'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {cargando && <p className="text-desert-stone font-medium">Cargando reseñas...</p>}

      {!cargando && visibles.length === 0 && (
        <EmptyState icon={Inbox} texto={filtro === 'pendientes' ? 'No hay reseñas pendientes por ahora.' : 'No hay reseñas en esta vista.'} />
      )}

      {visibles.map(r => (
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
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${r.aprobado ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-desert-sand/40 text-desert-earth'}`}>
              {r.aprobado ? 'Publicada' : 'Pendiente'}
            </span>
          </div>

          {r.comentario && (
            <p className="text-desert-stone text-sm font-medium mb-4">{r.comentario}</p>
          )}

          <div className="flex gap-2">
            {!r.aprobado && (
              <button
                onClick={() => handleAprobar(r)}
                disabled={procesando === r.id}
                className="flex items-center gap-1.5 bg-[#25D366] text-white text-sm font-bold px-4 py-2 rounded-full disabled:opacity-40 active:scale-95 transition-transform"
              >
                <Check size={14} /> Aprobar
              </button>
            )}
            <button
              onClick={() => handleRechazar(r)}
              disabled={procesando === r.id}
              className="flex items-center gap-1.5 bg-desert-sand/40 text-desert-night text-sm font-bold px-4 py-2 rounded-full disabled:opacity-40 active:scale-95 transition-transform"
            >
              <X size={14} /> {r.aprobado ? 'Quitar' : 'Rechazar'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icono, texto }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <div className="bg-desert-sand/30 p-4 rounded-full mb-4">
        <Icono size={22} className="text-desert-earth" />
      </div>
      <p className="text-desert-stone text-sm font-medium max-w-[240px]">{texto}</p>
    </div>
  );
}

const SERVICIO_VACIO = {
  nombre: '', especialidad: '', categoria: CATEGORIAS[0], verificado: true,
  fotoUrl: '', telefono: '', descripcion: '', precio: '', incluye: [], rating: 4.5,
  lat: '', lon: '',
};

function ServiciosTab({ servicios, cargando, recargar, avisar, pedirConfirmacion }) {
  const [editando, setEditando] = useState(null);
  const [creando, setCreando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return servicios.filter(s => {
      const coincideTexto = !q || s.nombre.toLowerCase().includes(q) || s.especialidad.toLowerCase().includes(q);
      const coincideCategoria = filtroCategoria === 'Todos' || s.categoria === filtroCategoria;
      return coincideTexto && coincideCategoria;
    });
  }, [servicios, busqueda, filtroCategoria]);

  function handleEliminar(s) {
    pedirConfirmacion({
      titulo: `¿Eliminar "${s.nombre}"?`,
      mensaje: 'Se quitará del Directorio y del generador de QR. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      onConfirm: async () => {
        const { error } = await eliminarServicio(s.id);
        await recargar();
        avisar(error ? 'No se pudo eliminar.' : `${s.nombre} eliminado.`, error ? 'error' : 'ok');
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setCreando(true)}
        className="flex items-center justify-center gap-2 bg-desert-night text-white font-bold py-3 rounded-full active:scale-95 transition-transform"
      >
        <Plus size={16} /> Agregar servicio
      </button>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-desert-stone" />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o especialidad"
          className="w-full rounded-full border border-desert-sand/60 bg-white pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-desert-earth/40"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {['Todos', ...CATEGORIAS].map(c => (
          <button
            key={c}
            onClick={() => setFiltroCategoria(c)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filtroCategoria === c ? 'bg-desert-earth text-white' : 'bg-white border border-desert-sand/50 text-desert-stone'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {cargando && <p className="text-desert-stone font-medium">Cargando servicios...</p>}

      {!cargando && visibles.length === 0 && (
        <EmptyState icon={Search} texto="Ningún servicio coincide con la búsqueda." />
      )}

      {visibles.map(s => (
        <div key={s.id} className="bg-white rounded-2xl p-4 border border-desert-sand/50 shadow-desert-sm flex items-center gap-3">
          <img src={s.fotoUrl} alt={s.nombre} className="w-14 h-14 rounded-xl object-cover shrink-0 bg-desert-sand" />
          <div className="flex-1 min-w-0">
            <p className="font-black text-desert-night truncate">{s.nombre}</p>
            <p className="text-desert-stone text-xs font-medium truncate">{s.categoria} · {s.especialidad}</p>
          </div>
          <button onClick={() => setEditando(s)} className="p-2 rounded-full bg-desert-sand/30 text-desert-night shrink-0 active:scale-90 transition-transform">
            <Pencil size={15} />
          </button>
          <button onClick={() => handleEliminar(s)} className="p-2 rounded-full bg-desert-sand/30 text-desert-red shrink-0 active:scale-90 transition-transform">
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      <AnimatePresence>
        {(editando || creando) && (
          <ServicioFormModal
            servicio={editando ?? SERVICIO_VACIO}
            esNuevo={creando}
            onClose={() => { setEditando(null); setCreando(false); }}
            onSaved={async () => {
              await recargar();
              avisar(creando ? 'Servicio creado.' : 'Cambios guardados.');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ServicioFormModal({ servicio, esNuevo, onClose, onSaved }) {
  const [form, setForm] = useState({
    ...servicio,
    incluyeTexto: (servicio.incluye ?? []).join(', '),
    lat: servicio.lat ?? '',
    lon: servicio.lon ?? '',
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
      lat: form.lat === '' ? null : Number(form.lat),
      lon: form.lon === '' ? null : Number(form.lon),
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.form
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={SPRING_HOJA}
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

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-desert-night">Foto</label>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-desert-sand shrink-0 flex items-center justify-center">
              {form.fotoUrl ? (
                <img src={form.fotoUrl} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
              ) : (
                <Search size={18} className="text-desert-stone" />
              )}
            </div>
            <input
              list="fotos-disponibles"
              value={form.fotoUrl}
              onChange={e => campo('fotoUrl', e.target.value)}
              required
              placeholder="/img/nombre-del-archivo.jpg"
              className="flex-1 rounded-xl border border-desert-sand/60 p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-desert-earth/40"
            />
            <datalist id="fotos-disponibles">
              {FOTOS_DISPONIBLES.map(f => <option key={f} value={f} />)}
            </datalist>
          </div>
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <Campo label="Latitud" type="number" step="0.0001" value={form.lat} onChange={v => campo('lat', v)} placeholder="3.2340" />
          <Campo label="Longitud" type="number" step="0.0001" value={form.lon} onChange={v => campo('lon', v)} placeholder="-75.1700" />
        </div>
        <p className="text-xs text-desert-stone -mt-2">Para ubicarlo en el Mapa. Déjalo vacío si no quieres que aparezca ahí.</p>

        <div className="flex gap-3 mt-2">
          <button type="button" onClick={onClose} className="flex-1 bg-desert-sand/40 text-desert-night font-bold py-3 rounded-full active:scale-95 transition-transform">
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="flex-1 bg-desert-earth disabled:opacity-40 text-white font-bold py-3 rounded-full active:scale-95 transition-transform">
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </motion.form>
    </motion.div>
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
