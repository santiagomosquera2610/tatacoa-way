// La calificación que se muestra sale SOLO de reseñas reales aprobadas.
// Ya no existe una "calificación inicial" asignada por el semillero: un
// servicio sin reseñas aprobadas muestra "Sin calificaciones aún".
export const SIN_CALIFICACIONES = 'Sin calificaciones aún';

export function calificacionDe(servicio, agregados) {
  const real = agregados[servicio.id];
  if (real && real.total > 0) {
    return {
      valor: Math.round(real.promedio * 10) / 10,
      detalle: `${real.total} ${real.total === 1 ? 'reseña' : 'reseñas'}`,
      esReal: true,
    };
  }
  return { valor: null, detalle: SIN_CALIFICACIONES, esReal: false };
}
