import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ResenaView } from './ResenaView.jsx'
import { AdminView } from './AdminView.jsx'

function Root() {
  const path = window.location.pathname;
  const matchResena = path.match(/^\/resena\/(.+)$/);

  if (matchResena) {
    return <ResenaView servicioId={matchResena[1]} />;
  }
  if (path.startsWith('/admin')) {
    return <AdminView />;
  }
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
