// Puntos reales extraídos de OpenStreetMap (Overpass API) para el Desierto
// de la Tatacoa y Villavieja. Informativos: no son parte del directorio
// verificado por el semillero (eso vive en ServiciosData / Supabase).
export const PUNTOS_INTERES = [
  // El Cuzco (desierto rojo)
  { id: 'poi-1', nombre: 'Observatorio Astronómico de Tatacoa', categoria: 'atractivo', pos: [3.23426, -75.17039] },
  { id: 'poi-2', nombre: 'Mirador Desierto Rojo', categoria: 'atractivo', pos: [3.23283, -75.17116] },
  { id: 'poi-3', nombre: 'Banco de Arena', categoria: 'atractivo', pos: [3.23212, -75.16685] },
  { id: 'poi-4', nombre: 'Estoraque La Torre', categoria: 'atractivo', pos: [3.23228, -75.16645] },
  { id: 'poi-5', nombre: 'Finca El Cuzco', categoria: 'hospedaje', pos: [3.22941, -75.16251] },
  { id: 'poi-6', nombre: 'Hostal Laberintos Del Cuzco', categoria: 'hospedaje', pos: [3.23335, -75.16905] },
  { id: 'poi-7', nombre: 'Hostal La Tranquilidad', categoria: 'hospedaje', pos: [3.23322, -75.15865] },
  { id: 'poi-8', nombre: 'El Rincón del Cabrito', categoria: 'restaurante', pos: [3.23330, -75.16187] },
  { id: 'poi-9', nombre: 'Estadero El Deseo', categoria: 'restaurante', pos: [3.23397, -75.16881] },
  { id: 'poi-10', nombre: 'Sol y Luna', categoria: 'restaurante', pos: [3.23262, -75.15842] },

  // Los Hoyos (desierto gris)
  { id: 'poi-11', nombre: 'Sendero de los Xilópalos', categoria: 'atractivo', pos: [3.23654, -75.10152] },
  { id: 'poi-12', nombre: 'Mirador Ventana', categoria: 'atractivo', pos: [3.22443, -75.13042] },
  { id: 'poi-13', nombre: 'Bethel Bio Luxury Hotel', categoria: 'hospedaje', pos: [3.25026, -75.12879] },
  { id: 'poi-14', nombre: 'Oasis del Mesón', categoria: 'restaurante', pos: [3.26628, -75.12731] },
  { id: 'poi-15', nombre: 'Sol Picante', categoria: 'restaurante', pos: [3.21937, -75.13570] },

  // Villavieja (pueblo)
  { id: 'poi-16', nombre: 'Museo Paleontológico de Villavieja', categoria: 'atractivo', pos: [3.21922, -75.21939] },
  { id: 'poi-17', nombre: 'Yararaka Boutique Hotel', categoria: 'hospedaje', pos: [3.22034, -75.21817] },
  { id: 'poi-18', nombre: 'Tatacoa Fusión', categoria: 'restaurante', pos: [3.21943, -75.21772] },
  { id: 'poi-19', nombre: 'Hospital de Villavieja', categoria: 'servicio', pos: [3.21966, -75.21965] },
  { id: 'poi-20', nombre: 'Droguería Central', categoria: 'servicio', pos: [3.22022, -75.21825] },
];

export const ORIGEN_DEFECTO = { nombre: 'Parque Principal de Villavieja', pos: [3.21950, -75.21880] };
