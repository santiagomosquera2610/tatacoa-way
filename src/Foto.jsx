// Imagen optimizada (corrección 1.3, rendimiento).
//
// Cada foto local /img/nombre.jpg tiene tres versiones WebP generadas con
// cwebp: nombre-480.webp (miniaturas), nombre-800.webp (tarjetas) y
// nombre-1200.webp (pantalla completa). El navegador elige la más pequeña que le sirva según
// `sizes` y la densidad de la pantalla; el JPG queda solo como respaldo.
// Las rutas guardadas en Supabase siguen siendo .jpg, así que no hay que
// cambiar la base de datos.
//
// Al agregar una foto nueva a public/img, genera sus versiones con:
//   cwebp -q 72 -resize 480 0 foto.jpg -o foto-480.webp
//   cwebp -q 72 -resize 800 0 foto.jpg -o foto-800.webp
//   cwebp -q 72 -resize 1200 0 foto.jpg -o foto-1200.webp

export function variantesWebp(src) {
  const m = typeof src === 'string' && src.match(/^\/img\/(.+)\.jpg$/);
  if (!m) return null;
  return `/img/${m[1]}-480.webp 480w, /img/${m[1]}-800.webp 800w, /img/${m[1]}-1200.webp 1200w`;
}

// Ancho máximo de la app (max-w-md = 448 px).
export const SIZES_ANCHO_APP = '(max-width: 448px) 100vw, 448px';

export function Foto({ src, sizes = SIZES_ANCHO_APP, prioridad = false, como: Img = 'img', ...props }) {
  const srcSet = variantesWebp(src);
  const img = (
    <Img
      src={src}
      // La imagen principal (LCP) se pide de inmediato y con prioridad alta;
      // el resto se carga en diferido cuando se acerca a la pantalla.
      loading={prioridad ? 'eager' : 'lazy'}
      decoding={prioridad ? 'sync' : 'async'}
      fetchPriority={prioridad ? 'high' : undefined}
      {...props}
    />
  );
  if (!srcSet) return img;
  return (
    // display: contents → <picture> no altera el layout de la <img>.
    <picture className="contents">
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      {img}
    </picture>
  );
}
