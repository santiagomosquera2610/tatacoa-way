export function calificacionDe(servicio, agregados) {
  const real = agregados[servicio.id];
  if (real && real.total > 0) {
    return {
      valor: Math.round(real.promedio * 10) / 10,
      detalle: `${real.total} ${real.total === 1 ? 'reseña' : 'reseñas'}`,
      esReal: true,
    };
  }
  if (servicio.rating == null) {
    return { valor: null, detalle: 'Aún sin calificar', esReal: false };
  }
  return {
    valor: servicio.rating,
    detalle: 'Calificación inicial del semillero',
    esReal: false,
  };
}
