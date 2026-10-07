export const SERVICIOS_BD = [
  {
    id: 1, nombre: "Carlos Ramírez", especialidad: "Tour Astronómico", verificado: true, categoria: "Guías",
    fotoUrl: "/img/cielo-tatacoa.jpg", telefono: "573157429618",
    descripcion: "Guía local certificado por el observatorio. Conmigo aprenderás a leer las estrellas y constelaciones aprovechando los cielos despejados de la Tatacoa. Incluye uso de telescopio profesional.",
    precio: "$40.000 COP / pers",
    incluye: ["Charla astronómica de 2 horas", "Telescopio profesional", "Fotografía estelar con celular"],
    rating: 4.9, lat: 3.2340, lon: -75.1700
  },
  {
    id: 2, nombre: "María Gómez", especialidad: "Ruta del Cuzco", verificado: true, categoria: "Guías",
    fotoUrl: "/img/desierto-rojo.jpg", telefono: "573122894475",
    descripcion: "Recorrido inmersivo por el laberinto del Desierto Rojo (Cuzco). Te contaré la historia geológica y te mostraré las formaciones más impresionantes para tus fotos.",
    precio: "$35.000 COP / grupo",
    incluye: ["Recorrido guiado de 2.5h", "Hidratación básica", "Paradas fotográficas"],
    rating: 4.8, lat: 3.2320, lon: -75.1690
  },
  {
    id: 3, nombre: "Asoc. Villavieja", especialidad: "Transporte Neiva", verificado: true, categoria: "Transporte",
    fotoUrl: "/img/chiva-transporte.jpg", telefono: "573015567823",
    descripcion: "Cooperativa oficial de transporte. Te recogemos en el terminal de Neiva o el aeropuerto y te llevamos directo a tu hostal en el desierto con total seguridad.",
    precio: "$25.000 COP / tray",
    incluye: ["Aire acondicionado", "Seguro de viaje", "Conductor local"],
    rating: 4.7, lat: 3.2195, lon: -75.2188
  },
  {
    id: 4, nombre: "TukTuk Tatacoa", especialidad: "Movilidad desierto", verificado: true, categoria: "Transporte",
    fotoUrl: "/img/motocarro-tatacoa.jpg", telefono: "573186240957",
    descripcion: "El transporte más divertido para moverte entre Los Hoyos y El Cuzco. Disfruta de la brisa mientras te llevamos.",
    precio: "$15.000 COP / viaje",
    incluye: ["Capacidad 3 personas", "Paseo panorámico", "Música a bordo"],
    rating: 4.9, lat: 3.2330, lon: -75.1670
  },
  {
    id: 5, nombre: "Hostal Saturno", especialidad: "Camping y Cabañas", verificado: true, categoria: "Hospedaje",
    fotoUrl: "/img/glamping-desierto.jpg", telefono: "573204478129",
    descripcion: "Descansa bajo las estrellas. Ofrecemos cabañas ecológicas y alquiler de carpas listas para usar. Tenemos piscina para refrescarte del calor del mediodía.",
    precio: "Desde $30.000",
    incluye: ["Acceso a piscina", "Baños compartidos", "Restaurante local"],
    rating: 4.5, lat: 3.2345, lon: -75.1670
  },
  {
    id: 6, nombre: "Rest. El Oasis", especialidad: "Platos típicos", verificado: true, categoria: "Gastronomía",
    fotoUrl: "/img/achiras-huila.jpg", telefono: "573139902264",
    descripcion: "Parada obligatoria para almorzar. Nuestro plato estrella es el estofado de chivo tradicional de la región, acompañado de jugo de cactus local.",
    precio: "Desde $25.000",
    incluye: ["Comida típica", "Opciones vegetarianas", "Refrescos helados"],
    rating: 4.8, lat: 3.2192, lon: -75.2180
  },

  // Lugares reales del Desierto de la Tatacoa y Villavieja (OpenStreetMap),
  // agregados al Directorio sin verificar aún por el semillero. Sin teléfono
  // ni precio confirmado: no se inventa información que no se tiene.
  {
    id: 7, nombre: "Hostal Laberintos Del Cuzco", especialidad: "Hospedaje en el desierto", verificado: false, categoria: "Hospedaje",
    fotoUrl: "/img/hostal-laberintos.jpg", telefono: null,
    descripcion: "Hospedaje ubicado en pleno Desierto Rojo (El Cuzco), a pocos minutos del Observatorio Astronómico. Aún no verificado por el semillero.",
    precio: "Consulta precios en el lugar",
    incluye: [],
    rating: null, lat: 3.23335, lon: -75.16905
  },
  {
    id: 8, nombre: "Finca El Cuzco", especialidad: "Hospedaje rural", verificado: false, categoria: "Hospedaje",
    fotoUrl: "/img/finca-cuzco.jpg", telefono: null,
    descripcion: "Finca de hospedaje en la zona del Cuzco, dentro del desierto. Aún no verificado por el semillero.",
    precio: "Consulta precios en el lugar",
    incluye: [],
    rating: null, lat: 3.22941, lon: -75.16251
  },
  {
    id: 9, nombre: "Hostal La Tranquilidad", especialidad: "Camping en el desierto", verificado: false, categoria: "Hospedaje",
    fotoUrl: "/img/hostal-tranquilidad.jpg", telefono: null,
    descripcion: "Zona de camping en el Desierto Rojo, cerca del Observatorio. Aún no verificado por el semillero.",
    precio: "Consulta precios en el lugar",
    incluye: [],
    rating: null, lat: 3.23322, lon: -75.15865
  },
  {
    id: 10, nombre: "Bethel Bio Luxury Hotel", especialidad: "Hospedaje boutique", verificado: false, categoria: "Hospedaje",
    fotoUrl: "/img/bethel-hotel.jpg", telefono: "573125377071",
    descripcion: "Hotel boutique en la zona de Los Hoyos (desierto gris). Aún no verificado por el semillero, pero cuenta con contacto público.",
    precio: "Consulta precios en el lugar",
    incluye: [],
    rating: null, lat: 3.25026, lon: -75.12879
  },
  {
    id: 11, nombre: "Yararaka Boutique Hotel", especialidad: "Hospedaje en Villavieja", verificado: false, categoria: "Hospedaje",
    fotoUrl: "/img/yararaka-hotel.jpg", telefono: null,
    descripcion: "Hotel boutique en el centro de Villavieja, el pueblo de entrada al desierto. Aún no verificado por el semillero.",
    precio: "Consulta precios en el lugar",
    incluye: [],
    rating: null, lat: 3.22034, lon: -75.21817
  },
  {
    id: 12, nombre: "El Rincón del Cabrito", especialidad: "Comida típica huilense", verificado: false, categoria: "Gastronomía",
    fotoUrl: "/img/rincon-cabrito.jpg", telefono: null,
    descripcion: "Restaurante en la zona del Cuzco especializado en cabrito, el plato insignia de la región. Aún no verificado por el semillero.",
    precio: "Consulta precios en el lugar",
    incluye: [],
    rating: null, lat: 3.23330, lon: -75.16187
  },
  {
    id: 13, nombre: "Estadero El Deseo", especialidad: "Comida típica", verificado: false, categoria: "Gastronomía",
    fotoUrl: "/img/estadero-deseo.jpg", telefono: null,
    descripcion: "Estadero dentro del desierto, cerca del Observatorio. Aún no verificado por el semillero.",
    precio: "Consulta precios en el lugar",
    incluye: [],
    rating: null, lat: 3.23397, lon: -75.16881
  },
  {
    id: 14, nombre: "Sol y Luna", especialidad: "Comida típica", verificado: false, categoria: "Gastronomía",
    fotoUrl: "/img/sol-y-luna.jpg", telefono: null,
    descripcion: "Restaurante en la zona del Cuzco. Aún no verificado por el semillero.",
    precio: "Consulta precios en el lugar",
    incluye: [],
    rating: null, lat: 3.23262, lon: -75.15842
  },
  {
    id: 15, nombre: "Oasis del Mesón", especialidad: "Comida típica", verificado: false, categoria: "Gastronomía",
    fotoUrl: "/img/oasis-meson.jpg", telefono: null,
    descripcion: "Restaurante en la zona de Los Hoyos (desierto gris). Aún no verificado por el semillero.",
    precio: "Consulta precios en el lugar",
    incluye: [],
    rating: null, lat: 3.26628, lon: -75.12731
  },
  {
    id: 16, nombre: "Sol Picante", especialidad: "Comida típica", verificado: false, categoria: "Gastronomía",
    fotoUrl: "/img/sol-picante.jpg", telefono: null,
    descripcion: "Restaurante en la zona de Los Hoyos (desierto gris). Aún no verificado por el semillero.",
    precio: "Consulta precios en el lugar",
    incluye: [],
    rating: null, lat: 3.21937, lon: -75.13570
  },
  {
    id: 17, nombre: "Tatacoa Fusión", especialidad: "Cocina fusión", verificado: false, categoria: "Gastronomía",
    fotoUrl: "/img/tatacoa-fusion.jpg", telefono: null,
    descripcion: "Restaurante en el centro de Villavieja. Aún no verificado por el semillero.",
    precio: "Consulta precios en el lugar",
    incluye: [],
    rating: null, lat: 3.21943, lon: -75.21772
  },
];
