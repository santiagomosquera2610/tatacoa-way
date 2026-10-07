# Configuración de Supabase para Tatacoa Way

Ejecuta estos bloques EN ORDEN en el SQL Editor de Supabase. Copia cada bloque completo (el bloque de código entero, no línea por línea) y dale a **Run** antes de pasar al siguiente.

---

## 1. Tabla de servicios

```sql
create table servicios (
  id bigint generated always as identity primary key,
  nombre text not null,
  especialidad text not null,
  categoria text not null,
  verificado boolean not null default true,
  foto_url text not null,
  telefono text not null,
  descripcion text not null,
  precio text not null,
  incluye text[] not null default '{}',
  rating_inicial numeric not null default 4.5,
  creado_en timestamptz not null default now()
);
```

---

## 2. Seguridad de la tabla de servicios

```sql
alter table servicios enable row level security;

create policy "cualquiera puede ver los servicios"
  on servicios for select
  to anon, authenticated
  using (true);

create policy "solo admins autenticados pueden crear"
  on servicios for insert
  to authenticated
  with check (true);

create policy "solo admins autenticados pueden editar"
  on servicios for update
  to authenticated
  using (true);

create policy "solo admins autenticados pueden borrar"
  on servicios for delete
  to authenticated
  using (true);
```

---

## 3. Cargar los 6 servicios actuales

```sql
insert into servicios (id, nombre, especialidad, categoria, foto_url, telefono, descripcion, precio, incluye, rating_inicial)
overriding system value
values
(1, 'Carlos Ramírez', 'Tour Astronómico', 'Guías', '/img/cielo-tatacoa.jpg', '573157429618', 'Guía local certificado por el observatorio. Conmigo aprenderás a leer las estrellas y constelaciones aprovechando los cielos despejados de la Tatacoa. Incluye uso de telescopio profesional.', '$40.000 COP / pers', array['Charla astronómica de 2 horas','Telescopio profesional','Fotografía estelar con celular'], 4.9),
(2, 'María Gómez', 'Ruta del Cuzco', 'Guías', '/img/desierto-rojo.jpg', '573122894475', 'Recorrido inmersivo por el laberinto del Desierto Rojo (Cuzco). Te contaré la historia geológica y te mostraré las formaciones más impresionantes para tus fotos.', '$35.000 COP / grupo', array['Recorrido guiado de 2.5h','Hidratación básica','Paradas fotográficas'], 4.8),
(3, 'Asoc. Villavieja', 'Transporte Neiva', 'Transporte', '/img/chiva-transporte.jpg', '573015567823', 'Cooperativa oficial de transporte. Te recogemos en el terminal de Neiva o el aeropuerto y te llevamos directo a tu hostal en el desierto con total seguridad.', '$25.000 COP / tray', array['Aire acondicionado','Seguro de viaje','Conductor local'], 4.7),
(4, 'TukTuk Tatacoa', 'Movilidad desierto', 'Transporte', '/img/motocarro-tatacoa.jpg', '573186240957', 'El transporte más divertido para moverte entre Los Hoyos y El Cuzco. Disfruta de la brisa mientras te llevamos.', '$15.000 COP / viaje', array['Capacidad 3 personas','Paseo panorámico','Música a bordo'], 4.9),
(5, 'Hostal Saturno', 'Camping y Cabañas', 'Hospedaje', '/img/glamping-desierto.jpg', '573204478129', 'Descansa bajo las estrellas. Ofrecemos cabañas ecológicas y alquiler de carpas listas para usar. Tenemos piscina para refrescarte del calor del mediodía.', 'Desde $30.000', array['Acceso a piscina','Baños compartidos','Restaurante local'], 4.5),
(6, 'Rest. El Oasis', 'Platos típicos', 'Gastronomía', '/img/achiras-huila.jpg', '573139902264', 'Parada obligatoria para almorzar. Nuestro plato estrella es el estofado de chivo tradicional de la región, acompañado de jugo de cactus local.', 'Desde $25.000', array['Comida típica','Opciones vegetarianas','Refrescos helados'], 4.8);

select setval('servicios_id_seq', 6);
```

---

## 4. Permisos de admin sobre reseñas

```sql
create policy "admins ven todas las resenas"
  on resenas for select
  to authenticated
  using (true);

create policy "admins pueden actualizar resenas"
  on resenas for update
  to authenticated
  using (true);

create policy "admins pueden borrar resenas"
  on resenas for delete
  to authenticated
  using (true);
```

---

## 5. Tu usuario de admin

En Supabase (no por SQL): **Authentication → Users → Add user**. Pon tu email y una contraseña. Con eso entras al panel en `/admin`.

---

## 6. Agregar ubicación real a los servicios (para que salgan en el Mapa)

```sql
alter table servicios add column lat double precision;
alter table servicios add column lon double precision;

update servicios set lat = 3.2340, lon = -75.1700 where id = 1;
update servicios set lat = 3.2320, lon = -75.1690 where id = 2;
update servicios set lat = 3.2195, lon = -75.2188 where id = 3;
update servicios set lat = 3.2330, lon = -75.1670 where id = 4;
update servicios set lat = 3.2345, lon = -75.1670 where id = 5;
update servicios set lat = 3.2192, lon = -75.2180 where id = 6;
```

---

## 7. Permitir servicios sin teléfono o calificación todavía

Son lugares reales que agregamos desde mapas abiertos, pendientes de que el semillero los verifique. No se inventa un teléfono ni una calificación que no existen.

```sql
alter table servicios alter column telefono drop not null;
alter table servicios alter column rating_inicial drop not null;
```

---

## 8. Agregar 11 lugares reales nuevos (sin verificar todavía)

```sql
insert into servicios (nombre, especialidad, categoria, verificado, foto_url, telefono, descripcion, precio, incluye, rating_inicial, lat, lon) values
('Hostal Laberintos Del Cuzco', 'Hospedaje en el desierto', 'Hospedaje', false, '/img/hostal-laberintos.jpg', null, 'Hospedaje ubicado en pleno Desierto Rojo (El Cuzco), a pocos minutos del Observatorio Astronómico. Aún no verificado por el semillero.', 'Consulta precios en el lugar', '{}', null, 3.23335, -75.16905),
('Finca El Cuzco', 'Hospedaje rural', 'Hospedaje', false, '/img/finca-cuzco.jpg', null, 'Finca de hospedaje en la zona del Cuzco, dentro del desierto. Aún no verificado por el semillero.', 'Consulta precios en el lugar', '{}', null, 3.22941, -75.16251),
('Hostal La Tranquilidad', 'Camping en el desierto', 'Hospedaje', false, '/img/hostal-tranquilidad.jpg', null, 'Zona de camping en el Desierto Rojo, cerca del Observatorio. Aún no verificado por el semillero.', 'Consulta precios en el lugar', '{}', null, 3.23322, -75.15865),
('Bethel Bio Luxury Hotel', 'Hospedaje boutique', 'Hospedaje', false, '/img/bethel-hotel.jpg', '573125377071', 'Hotel boutique en la zona de Los Hoyos (desierto gris). Aún no verificado por el semillero, pero cuenta con contacto público.', 'Consulta precios en el lugar', '{}', null, 3.25026, -75.12879),
('Yararaka Boutique Hotel', 'Hospedaje en Villavieja', 'Hospedaje', false, '/img/yararaka-hotel.jpg', null, 'Hotel boutique en el centro de Villavieja, el pueblo de entrada al desierto. Aún no verificado por el semillero.', 'Consulta precios en el lugar', '{}', null, 3.22034, -75.21817),
('El Rincón del Cabrito', 'Comida típica huilense', 'Gastronomía', false, '/img/rincon-cabrito.jpg', null, 'Restaurante en la zona del Cuzco especializado en cabrito, el plato insignia de la región. Aún no verificado por el semillero.', 'Consulta precios en el lugar', '{}', null, 3.23330, -75.16187),
('Estadero El Deseo', 'Comida típica', 'Gastronomía', false, '/img/estadero-deseo.jpg', null, 'Estadero dentro del desierto, cerca del Observatorio. Aún no verificado por el semillero.', 'Consulta precios en el lugar', '{}', null, 3.23397, -75.16881),
('Sol y Luna', 'Comida típica', 'Gastronomía', false, '/img/sol-y-luna.jpg', null, 'Restaurante en la zona del Cuzco. Aún no verificado por el semillero.', 'Consulta precios en el lugar', '{}', null, 3.23262, -75.15842),
('Oasis del Mesón', 'Comida típica', 'Gastronomía', false, '/img/oasis-meson.jpg', null, 'Restaurante en la zona de Los Hoyos (desierto gris). Aún no verificado por el semillero.', 'Consulta precios en el lugar', '{}', null, 3.26628, -75.12731),
('Sol Picante', 'Comida típica', 'Gastronomía', false, '/img/sol-picante.jpg', null, 'Restaurante en la zona de Los Hoyos (desierto gris). Aún no verificado por el semillero.', 'Consulta precios en el lugar', '{}', null, 3.21937, -75.13570),
('Tatacoa Fusión', 'Cocina fusión', 'Gastronomía', false, '/img/tatacoa-fusion.jpg', null, 'Restaurante en el centro de Villavieja. Aún no verificado por el semillero.', 'Consulta precios en el lugar', '{}', null, 3.21943, -75.21772);
```

---

## 9. Avísame cuando termines todos los bloques de SQL y el usuario, para verificar que todo quedó bien antes de publicar los cambios.
