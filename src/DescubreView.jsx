import { useRef, useState, useEffect, useLayoutEffect, createRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';
import { Trash2, Footprints, PawPrint, Droplets, ChevronDown, ChevronRight, X, ExternalLink, Trees, ShieldCheck, Bone, Landmark, ScrollText, Hourglass } from 'lucide-react';
import { HISTORIA_TATACOA } from './HistoriaData';
import { BUENAS_PRACTICAS } from './EducacionData';
import { CONTEXTO_TATACOA } from './ContextoData';
import { Foto } from './Foto';

const ICONOS = { Trash2, Footprints, PawPrint, Droplets, Trees, ShieldCheck, Bone, Landmark, ScrollText, Hourglass };

const CREMA = '#FDFBF7';
// Tonos intermedios entre la noche y el crema: índigo, malva, durazno.
const AMANECER = ['#2c2d45', '#7d6275', '#e3b9a0'];
// Color de texto legible sobre cada tono de fondo (claro sobre oscuro).
const TEXTO_OSCURO = '#2a333a';
const TEXTO_CLARO = '#FDFBF7';
const EASE = [0.16, 1, 0.3, 1];

// Narrativa con scroll al estilo de las páginas de producto de Apple:
// todo el movimiento está atado a la posición del scroll (no a tiempo),
// usa solo transform/opacity/color (barato para el celular) y se apaga
// por completo si el usuario tiene activado "reducir movimiento".
export function DescubreView() {
  const scrollRef = useRef(null);
  const tarjetasRef = useRef([]);
  const siguienteSeccionRef = useRef(null);
  const reducir = useReducedMotion();
  const [abierto, setAbierto] = useState(null);

  const { scrollY } = useScroll({ container: scrollRef });
  const tramos = useTramosDeColor(scrollRef, tarjetasRef, siguienteSeccionRef);

  // El fondo pasa por el tono de cada época (bosque → Andes → valle →
  // fósiles → noche) según qué tarjeta está en el centro de la pantalla,
  // y vuelve a crema al llegar a la sección siguiente.
  const fondo = useTransform(scrollY, tramos.posiciones, tramos.colores);
  const estrellas = useTransform(scrollY, tramos.posiciones, tramos.estrellas);
  const colorTexto = useTransform(scrollY, tramos.posiciones, tramos.textos);

  return (
    <div className="h-full relative">
      <motion.div
        ref={scrollRef}
        style={{ backgroundColor: reducir ? CREMA : fondo }}
        className="h-full overflow-y-auto scrollbar-hide pb-32 relative"
      >
        {!reducir && (
          <motion.div
            aria-hidden="true"
            style={{ opacity: estrellas }}
            className="cielo-estrellado absolute inset-0 pointer-events-none"
          />
        )}

        <Hero scrollRef={scrollRef} reducir={reducir} />
        <LineaDeTiempo
          scrollRef={scrollRef}
          reducir={reducir}
          tarjetasRef={tarjetasRef}
          onAbrir={setAbierto}
        />
        <MasAllaDelNombre scrollRef={scrollRef} reducir={reducir} refSeccion={siguienteSeccionRef} onAbrir={setAbierto} colorTexto={colorTexto} />
        <EducacionAmbiental reducir={reducir} />
      </motion.div>

      <AnimatePresence>
        {abierto && <DetalleEvento evento={abierto} onCerrar={() => setAbierto(null)} />}
      </AnimatePresence>
    </div>
  );
}

// Mide dónde queda el centro de cada tarjeta dentro del scroll para
// atar cada color de época a su tarjeta exacta (no a un % aproximado).
function useTramosDeColor(scrollRef, tarjetasRef, educacionRef) {
  const [tramos, setTramos] = useState({ posiciones: [0, 1], colores: [CREMA, CREMA], estrellas: [0, 0], textos: [TEXTO_OSCURO, TEXTO_OSCURO] });

  useLayoutEffect(() => {
    const contenedor = scrollRef.current;
    if (!contenedor) return;

    function medir() {
      const alto = contenedor.clientHeight;
      const base = contenedor.getBoundingClientRect().top - contenedor.scrollTop;
      const centro = (el) => {
        const r = el.getBoundingClientRect();
        return r.top - base + r.height / 2 - alto / 2;
      };
      const tarjetas = tarjetasRef.current.filter(Boolean);
      const educacion = educacionRef.current;
      if (tarjetas.length !== HISTORIA_TATACOA.length || !educacion) return;

      const centros = tarjetas.map(centro);
      const primera = tarjetas[0].getBoundingClientRect().top - base - alto;
      const ultima = centros[centros.length - 1];
      // Amanecer: después de la noche, el fondo pasa por varios tonos
      // intermedios a lo largo de casi una pantalla de scroll, en vez de
      // saltar de golpe al crema.
      const finNoche = ultima + alto * 0.3;
      const llegadaSiguiente = Math.max(finNoche + alto * 0.9, educacion.getBoundingClientRect().top - base - alto * 0.25);
      const tramoAmanecer = (llegadaSiguiente - finNoche) / 4;
      const nocheFinal = HISTORIA_TATACOA.at(-1);

      const posiciones = [
        Math.max(0, primera), ...centros, finNoche,
        finNoche + tramoAmanecer, finNoche + tramoAmanecer * 2, finNoche + tramoAmanecer * 3, llegadaSiguiente,
      ];
      const colores = [
        CREMA, ...HISTORIA_TATACOA.map(e => e.tono), nocheFinal.tono,
        ...(nocheFinal.dark ? AMANECER : [CREMA, CREMA, CREMA]), CREMA,
      ];
      const estrellas = [
        0, ...HISTORIA_TATACOA.map(e => (e.dark ? 1 : 0)), nocheFinal.dark ? 1 : 0,
        nocheFinal.dark ? 0.4 : 0, 0, 0, 0,
      ];

      // useTransform exige posiciones crecientes.
      for (let i = 1; i < posiciones.length; i++) {
        if (posiciones[i] <= posiciones[i - 1]) posiciones[i] = posiciones[i - 1] + 1;
      }
      const claro = (e) => (e.dark ? TEXTO_CLARO : TEXTO_OSCURO);
      const textos = [
        TEXTO_OSCURO, ...HISTORIA_TATACOA.map(claro), claro(nocheFinal),
        ...(nocheFinal.dark ? [TEXTO_CLARO, TEXTO_CLARO, TEXTO_OSCURO] : [TEXTO_OSCURO, TEXTO_OSCURO, TEXTO_OSCURO]), TEXTO_OSCURO,
      ];
      setTramos({ posiciones, colores, estrellas, textos });
    }

    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(contenedor);
    if (contenedor.firstElementChild) {
      [...contenedor.children].forEach(hijo => observador.observe(hijo));
    }
    return () => observador.disconnect();
  }, [scrollRef, tarjetasRef, educacionRef]);

  return tramos;
}

function Hero({ scrollRef, reducir }) {
  const ref = useRef(null);
  // El hero queda fijo (sticky) durante la primera media pantalla de scroll
  // y en ese tramo se transforma; después se va con el resto del contenido.
  const { scrollYProgress } = useScroll({
    container: scrollRef,
    target: ref,
    offset: ['start start', 'end end'],
  });

  const escala = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const radio = useTransform(scrollYProgress, [0, 1], [0, 36]);
  const velo = useTransform(scrollYProgress, [0, 0.6], [0.1, 0.5]);
  const tituloOpacidad = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const tituloY = useTransform(scrollYProgress, [0, 0.35], [0, -48]);
  const fraseOpacidad = useTransform(scrollYProgress, [0.35, 0.65], [0, 1]);
  const fraseY = useTransform(scrollYProgress, [0.35, 0.65], [32, 0]);
  const pistaOpacidad = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const degradadoOpacidad = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  const animar = (valor) => (reducir ? undefined : valor);

  return (
    <section ref={ref} className={`relative ${reducir ? 'h-[45vh] mb-8' : 'h-[150dvh]'}`}>
      <div className={`${reducir ? 'h-full' : 'sticky top-0 h-[100dvh]'} overflow-hidden`}>
        <motion.div
          style={{ scale: animar(escala), borderRadius: animar(radio) }}
          className="absolute inset-0 overflow-hidden will-change-transform"
        >
          {/* Elemento LCP: prioridad alta, sin lazy y con medidas fijas.
              index.html además la precarga en la ruta "/". */}
          <Foto
            src="/img/atardecer-tatacoa.jpg"
            alt="Atardecer sobre las formaciones del Desierto de la Tatacoa"
            prioridad
            width={1200}
            height={800}
            className="w-full h-full object-cover"
          />
          <motion.div
            style={{ opacity: animar(degradadoOpacidad) }}
            className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/40 to-transparent"
          />
          <motion.div style={{ opacity: reducir ? 0.1 : velo }} className="absolute inset-0 bg-black" />
        </motion.div>

        {/* Título inicial: sube y se desvanece al empezar a bajar */}
        <motion.div
          style={{ opacity: animar(tituloOpacidad), y: animar(tituloY) }}
          className={`absolute inset-x-0 bottom-0 px-8 z-10 ${reducir ? 'pb-8' : 'pb-44'}`}
        >
          <span className="text-white uppercase tracking-[0.2em] font-black text-[10px] bg-desert-red/90 px-3 py-1 rounded-full inline-block mb-3 shadow-md">
            Patrimonio Natural
          </span>
          <h2 className="text-4xl font-black text-desert-night leading-none tracking-tight mb-2">
            Desierto de <br /> la Tatacoa
          </h2>
          <p className="text-desert-night/85 font-semibold text-sm max-w-[280px]">
            Descubre los secretos de uno de los paisajes secos más emblemáticos de Colombia.
          </p>
        </motion.div>

        {!reducir && (
          <>
            {/* Segunda frase: aparece en el centro mientras la foto se encoge */}
            <motion.p
              style={{ opacity: fraseOpacidad, y: fraseY }}
              className="absolute inset-0 z-10 flex items-center justify-center px-10 text-center text-white text-3xl font-black leading-tight tracking-tight drop-shadow-lg pointer-events-none"
            >
              Millones de años de historia, en un solo recorrido.
            </motion.p>

            <motion.div
              style={{ opacity: pistaOpacidad }}
              aria-hidden="true"
              className="absolute bottom-28 inset-x-0 z-10 flex flex-col items-center text-desert-night/80 pointer-events-none"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">Desliza</span>
              <ChevronDown size={18} className="animate-bounce mt-1" />
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}

function LineaDeTiempo({ scrollRef, reducir, tarjetasRef, onAbrir }) {
  const ref = useRef(null);
  // La línea vertical se va "llenando" a medida que se avanza por las épocas.
  const { scrollYProgress } = useScroll({
    container: scrollRef,
    target: ref,
    offset: ['start 70%', 'end 70%'],
  });
  const relleno = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} className="px-6 relative">
      <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-desert-sand/60 rounded-full" />
      {!reducir && (
        <motion.div
          style={{ scaleY: relleno }}
          className="absolute left-10 top-0 bottom-0 w-0.5 bg-desert-earth rounded-full origin-top"
        />
      )}

      <div className="flex flex-col gap-24">
        {HISTORIA_TATACOA.map((evento, i) => (
          <EventoHistoria
            key={evento.id}
            evento={evento}
            scrollRef={scrollRef}
            reducir={reducir}
            refTarjeta={(el) => { tarjetasRef.current[i] = el; }}
            onAbrir={onAbrir}
          />
        ))}
      </div>
    </div>
  );
}

function EventoHistoria({ evento, scrollRef, reducir, refTarjeta, onAbrir }) {
  const ref = useRef(null);

  // Recorrido completo de la tarjeta por la pantalla: 0 = entra por abajo,
  // 1 = sale por arriba. Con eso aparece, se queda nítida en el centro y se
  // desvanece al irse (en vez de animarse una sola vez).
  const { scrollYProgress: paso } = useScroll({
    container: scrollRef,
    target: ref,
    offset: ['start end', 'end start'],
  });
  const opacidad = useTransform(paso, [0.05, 0.3, 0.72, 0.95], [0, 1, 1, 0]);
  const escala = useTransform(paso, [0.05, 0.3, 0.72, 0.95], [0.92, 1, 1, 0.94]);
  const y = useTransform(paso, [0.05, 0.3], [60, 0]);
  const fotoY = useTransform(paso, [0, 1], ['-12%', '12%']);
  // La etiqueta de la época entra un poco antes y desde la izquierda.
  const etiquetaX = useTransform(paso, [0.05, 0.25], [-24, 0]);
  const etiquetaOpacidad = useTransform(paso, [0.05, 0.22, 0.78, 0.92], [0, 1, 1, 0]);
  // El texto aparece después de la foto, como en un "reveal" por capas.
  const textoOpacidad = useTransform(paso, [0.18, 0.34], [0, 1]);
  const textoY = useTransform(paso, [0.18, 0.34], [16, 0]);

  // El nodo de la línea se "enciende" cuando la tarjeta llega al centro.
  const { scrollYProgress: llegada } = useScroll({
    container: scrollRef,
    target: ref,
    offset: ['start 75%', 'start 45%'],
  });
  const nodoEscala = useTransform(llegada, [0, 1], [0.6, 1]);
  const nodoColor = useTransform(llegada, [0, 1], ['#f2e2ce', '#c86343']);

  const asignarRef = (el) => {
    ref.current = el;
    refTarjeta(el);
  };

  return (
    <motion.div
      ref={asignarRef}
      style={reducir ? undefined : { opacity: opacidad, scale: escala, y }}
      className="relative pl-12"
    >
      <motion.div
        style={reducir ? undefined : { scale: nodoEscala, backgroundColor: nodoColor }}
        className="absolute left-[-5px] top-1.5 w-3.5 h-3.5 rounded-full bg-desert-earth ring-4 ring-black/5 z-10 shadow-sm"
      />

      <div className="flex flex-col gap-3">
        <motion.span
          style={reducir ? undefined : { x: etiquetaX, opacity: etiquetaOpacidad }}
          className={`text-xs font-black uppercase tracking-wider ${evento.dark ? 'text-white/70' : 'text-desert-night/80'}`}
        >
          {evento.epoca}
        </motion.span>

        <button
          type="button"
          onClick={() => onAbrir(evento)}
          aria-label={`Leer más sobre: ${evento.titulo}`}
          className={`text-left w-full rounded-3xl overflow-hidden shadow-desert-md border border-black/5 ${evento.bg} active:scale-[0.98] transition-transform`}
        >
          <div className="h-40 w-full relative overflow-hidden">
            <Foto
              como={motion.img}
              style={reducir ? undefined : { y: fotoY }}
              src={evento.imgUrl}
              alt=""
              className={`absolute inset-x-0 w-full object-cover ${reducir ? 'inset-y-0 h-full' : '-top-[12%] h-[124%]'}`}
            />
            {evento.dark && <div className="absolute inset-0 bg-black/40" />}
          </div>
          <motion.div
            style={reducir ? undefined : { opacity: textoOpacidad, y: textoY }}
            className="p-5"
          >
            <h3 className={`text-xl font-black mb-2 ${evento.dark ? 'text-white' : 'text-desert-night'}`}>
              {evento.titulo}
            </h3>
            <p className={`text-sm leading-relaxed font-medium line-clamp-3 ${evento.dark ? 'text-white/80' : 'text-desert-stone'}`}>
              {evento.texto}
            </p>
            <span className={`mt-3 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider ${evento.dark ? 'text-desert-sand' : 'text-desert-earth'}`}>
              Leer más <ChevronRight size={14} strokeWidth={3} aria-hidden="true" />
            </span>
          </motion.div>
        </button>
      </div>
    </motion.div>
  );
}

// Hoja inferior con la información completa de una época. Muestra el texto
// ampliado y la fuente solo si existen en HistoriaData (nunca se rellena
// con contenido sin fuente).
function DetalleEvento({ evento, onCerrar }) {
  const cerrarRef = useRef(null);

  useEffect(() => {
    cerrarRef.current?.focus({ preventScroll: true });
    const alPresionar = (e) => { if (e.key === 'Escape') onCerrar(); };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [onCerrar]);

  const parrafos = evento.detalle?.length ? evento.detalle : [evento.texto];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[600] bg-black/50 backdrop-blur-sm flex items-end"
      onClick={onCerrar}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-evento-titulo"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[88%] bg-[#FDFBF7] rounded-t-[32px] overflow-y-auto overscroll-contain shadow-desert-lg"
      >
        <div className={`relative shrink-0 ${evento.imgUrl ? 'h-56' : `h-52 ${evento.bg}`}`}>
          {evento.imgUrl ? (
            <>
              <Foto src={evento.imgUrl} alt={evento.titulo} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </>
          ) : (
            IconoDe(evento) && (
              <div className="absolute top-6 left-6 bg-white/80 w-12 h-12 rounded-2xl flex items-center justify-center">
                {(() => { const I = IconoDe(evento); return <I size={24} className={evento.color} aria-hidden="true" />; })()}
              </div>
            )
          )}
          <button
            ref={cerrarRef}
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/85 backdrop-blur-md text-desert-night shadow-sm"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
          <div className="absolute bottom-5 left-6 right-6">
            <span className={`text-[10px] font-black uppercase tracking-widest ${evento.imgUrl ? 'text-white/85' : 'text-desert-night/80'}`}>{evento.epoca}</span>
            <h2 id="detalle-evento-titulo" className={`text-3xl font-black leading-tight mt-1 ${evento.imgUrl ? 'text-white' : 'text-desert-night'}`}>
              {evento.titulo}
            </h2>
          </div>
        </div>

        <div className="p-6 pb-12">
          {parrafos.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, ease: EASE, duration: 0.5 }}
              className="text-desert-night/80 leading-relaxed font-medium mb-4"
            >
              {p}
            </motion.p>
          ))}

          {evento.credito && (
            <p className="text-[11px] text-desert-night/80 font-medium leading-snug mt-2">
              Foto: {evento.credito.descripcion}. {evento.credito.autor},{' '}
              <a href={evento.credito.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {evento.credito.licencia}
              </a>
              , vía Wikimedia Commons.
            </p>
          )}

          {evento.fuentes?.length > 0 && (
            <div className="mt-6 pt-5 border-t border-desert-sand">
              <h3 className="text-xs font-black uppercase tracking-wider text-desert-night/80 mb-3">Fuentes</h3>
              <ul className="space-y-2">
                {evento.fuentes.map(f => (
                  <li key={f.url}>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-1.5 text-sm font-bold text-desert-red underline underline-offset-2"
                    >
                      {f.nombre}
                      <ExternalLink size={13} className="mt-1 shrink-0" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

const IconoDe = (item) => ICONOS[item.icono] ?? null;

// Ecosistema, conservación, paleontología y cultura como tarjetas
// apiladas: cada una se queda fija arriba y la siguiente sube y se le monta
// encima; la de atrás se encoge y se oscurece (efecto "stack" de Apple).
function MasAllaDelNombre({ scrollRef, reducir, refSeccion, onAbrir, colorTexto }) {
  // Una ref por envoltura: cada tarjeta se anima según la posición real
  // de la tarjeta que la cubre (no con fracciones fijas de la pila).
  const [envolturas] = useState(() => CONTEXTO_TATACOA.map(() => createRef()));
  const total = CONTEXTO_TATACOA.length;

  return (
    <section ref={refSeccion} className="px-5 mt-[16vh] relative" aria-labelledby="mas-alla-titulo">
      <motion.div
        initial={reducir ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: EASE }}
        className="px-1"
      >
        <motion.span style={reducir ? undefined : { color: colorTexto, opacity: 0.7 }} className="text-xs font-black uppercase tracking-wider text-desert-earth">Más allá del nombre</motion.span>
        <motion.h2
          id="mas-alla-titulo"
          style={reducir ? undefined : { color: colorTexto }}
          className="text-2xl font-black text-desert-night mt-1 mb-2"
        >
          Lo que hace única a la Tatacoa
        </motion.h2>
        <motion.p style={reducir ? undefined : { color: colorTexto, opacity: 0.8 }} className="text-desert-stone font-medium text-sm max-w-[320px] mb-8">
          Ecosistema, ciencia y cultura, con fuentes verificables.
        </motion.p>
      </motion.div>

      <div className={reducir ? 'flex flex-col gap-5' : 'relative'}>
        {CONTEXTO_TATACOA.map((item, i) => (
          <TarjetaApilada
            key={item.id}
            item={item}
            indice={i}
            total={total}
            scrollRef={scrollRef}
            refPropia={envolturas[i]}
            refSiguiente={envolturas[i + 1] ?? envolturas[i]}
            reducir={reducir}
            onAbrir={onAbrir}
          />
        ))}
      </div>
    </section>
  );
}

function TarjetaApilada({ item, indice, total, scrollRef, refPropia, refSiguiente, reducir, onAbrir }) {
  const Icono = IconoDe(item);
  const esUltima = indice === total - 1;
  const topFijo = 24 + indice * 14;
  const topSiguiente = topFijo + 14;

  // 0 cuando la siguiente tarjeta asoma por abajo, 1 cuando ya llegó a su
  // sitio encima de esta. Al subir, el valor regresa solo a 0.
  const { scrollYProgress: cubierta } = useScroll({
    container: scrollRef,
    target: refSiguiente,
    offset: ['start end', `start ${topSiguiente}px`],
  });
  const escala = useTransform(cubierta, [0, 1], [1, esUltima ? 1 : 0.95]);
  const sombra = useTransform(cubierta, [0, 1], [0, esUltima ? 0 : 0.45]);

  // La foto hace un zoom lento mientras la tarjeta sube a su sitio.
  const { scrollYProgress: llegada } = useScroll({
    container: scrollRef,
    target: refPropia,
    offset: ['start end', `start ${topFijo}px`],
  });
  const zoomFoto = useTransform(llegada, [0, 1], [1.15, 1]);

  const tarjeta = (
    <motion.button
      type="button"
      onClick={() => onAbrir(item)}
      aria-label={`Leer más sobre: ${item.titulo}`}
      style={reducir ? undefined : { scale: escala }}
      className="relative block w-full h-[440px] text-left rounded-[28px] overflow-hidden shadow-desert-lg origin-top active:scale-[0.98] transition-transform bg-desert-night"
    >
      <Foto
        como={motion.img}
        src={item.imgUrl}
        alt=""
        style={reducir ? undefined : { scale: zoomFoto }}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

      <div className="absolute top-5 left-5 flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full pl-1.5 pr-3 py-1.5">
        <span className="bg-desert-sand/60 w-7 h-7 rounded-full flex items-center justify-center">
          {Icono && <Icono size={15} className={item.color} strokeWidth={2.5} aria-hidden="true" />}
        </span>
        <span className="text-[11px] font-black uppercase tracking-wider text-desert-night">{item.epoca}</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6">
        <h3 className="text-2xl font-black text-white leading-tight mb-2">{item.titulo}</h3>
        <p className="text-white/85 text-sm leading-relaxed font-medium line-clamp-3">{item.texto}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-desert-sand">
          Leer más <ChevronRight size={14} strokeWidth={3} aria-hidden="true" />
        </span>
      </div>

      {!reducir && (
        <motion.div style={{ opacity: sombra }} className="absolute inset-0 bg-black pointer-events-none" />
      )}
    </motion.button>
  );

  // Cada tarjeta se pega un poco más abajo que la anterior para que se
  // vean los bordes de la pila; el espacio entre envolturas es el
  // recorrido de scroll en el que la siguiente sube.
  // (El espacio va en un separador aparte, no como margen: `sticky` cuenta
  // el margen y soltaría la tarjeta antes de tiempo.)
  return (
    <>
      <div ref={refPropia} className={reducir ? '' : 'sticky'} style={reducir ? undefined : { top: topFijo }}>
        {tarjeta}
      </div>
      {!reducir && !esUltima && <div aria-hidden="true" className="h-[38vh]" />}
    </>
  );
}

function EducacionAmbiental({ reducir }) {
  return (
    <div className="px-6 mt-20 relative">
      <motion.div
        initial={reducir ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <h2 className="text-2xl font-black text-desert-night mb-2">Cuida lo que ves</h2>
        <p className="text-desert-stone font-medium text-sm max-w-[320px] mb-6">
          Este ecosistema seco es frágil. Así lo mantenemos intacto.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {BUENAS_PRACTICAS.map((item, i) => {
          const Icono = ICONOS[item.icono];
          return (
            <motion.div
              key={item.id}
              initial={reducir ? false : { opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
              className={`rounded-3xl p-5 ${item.bg} border border-black/5`}
            >
              <div className="bg-white/70 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <Icono size={20} className={item.color} strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="font-black text-desert-night text-sm leading-tight mb-2">
                {item.titulo}
              </h3>
              <p className="text-desert-stone text-xs leading-relaxed font-medium">
                {item.texto}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
