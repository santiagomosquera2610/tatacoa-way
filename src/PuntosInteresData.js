// Puntos reales extraídos de OpenStreetMap (Overpass API) para el Desierto
// de la Tatacoa y Villavieja. Puramente informativos (atractivos naturales
// y servicios de salud/farmacia): no son negocios contactables, por eso no
// viven en el Directorio. Los hospedajes y restaurantes reales de la zona
// sí están en ServiciosData / Supabase, marcados como "verificado: false"
// hasta que el semillero los confirme.
export const PUNTOS_INTERES = [
  // El Cuzco (desierto rojo)
  { id: 'poi-1', nombre: 'Observatorio Astronómico de Tatacoa', categoria: 'atractivo', pos: [3.23426, -75.17039], foto: '/img/observatorio-tatacoa.jpg' },
  { id: 'poi-2', nombre: 'Mirador Desierto Rojo', categoria: 'atractivo', pos: [3.23283, -75.17116], foto: '/img/mirador-rojo.jpg' },
  { id: 'poi-3', nombre: 'Banco de Arena', categoria: 'atractivo', pos: [3.23212, -75.16685], foto: '/img/banco-arena.jpg' },
  { id: 'poi-4', nombre: 'Estoraque La Torre', categoria: 'atractivo', pos: [3.23228, -75.16645], foto: '/img/estoraque-torre.jpg' },

  // Los Hoyos (desierto gris)
  { id: 'poi-11', nombre: 'Sendero de los Xilópalos', categoria: 'atractivo', pos: [3.23654, -75.10152], foto: '/img/sendero-xilopalos.jpg' },
  { id: 'poi-12', nombre: 'Mirador Ventana', categoria: 'atractivo', pos: [3.22443, -75.13042], foto: '/img/mirador-ventana.jpg' },

  // Villavieja (pueblo)
  { id: 'poi-16', nombre: 'Museo Paleontológico de Villavieja', categoria: 'atractivo', pos: [3.21922, -75.21939], foto: '/img/fosiles-tatacoa.jpg' },
  { id: 'poi-19', nombre: 'Hospital de Villavieja', categoria: 'servicio', pos: [3.21966, -75.21965] },
  { id: 'poi-20', nombre: 'Droguería Central', categoria: 'servicio', pos: [3.22022, -75.21825], foto: '/img/drogueria-central.jpg' },
];

export const ORIGEN_DEFECTO = { nombre: 'Parque Principal de Villavieja', pos: [3.21950, -75.21880] };
