// Pantalla vacía (color de fondo) mientras se descarga una vista diferida.
// Compartida por arranque.jsx y entry-server.jsx para que el HTML coincida.
export function FallbackCarga() {
  return <div className="min-h-[100dvh] bg-[#FDFBF7]" />;
}
