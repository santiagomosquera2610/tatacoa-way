import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ResenaView } from './ResenaView.jsx'
import { QRAdminView } from './QRAdminView.jsx'

function Root() {
  const path = window.location.pathname;
  const matchResena = path.match(/^\/resena\/(.+)$/);

  if (matchResena) {
    return <ResenaView servicioId={matchResena[1]} />;
  }
  if (path === '/admin/qr') {
    return <QRAdminView />;
  }
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
