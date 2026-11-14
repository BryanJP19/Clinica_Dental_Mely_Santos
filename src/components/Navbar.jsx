import { useState } from 'react'
const links = [['inicio', 'Inicio'], ['nosotros', 'La clínica'], ['servicios', 'Servicios'], ['contacto', 'Contacto']]
export default function Navbar({ page }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="nav">
      <a href="#inicio" className="brand"><span className="mono">MS</span><span>Dra. Mely Santos</span></a>
      <button className="burger" aria-label="Menú" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
      <nav className={open ? 'open' : ''} onClick={() => setOpen(false)}>
        {links.map(([id, t]) => <a key={id} href={'#' + id} className={page === id ? 'on' : ''}>{t}</a>)}
        <a href="#reservar" className="btn btn-sm">Agendar cita</a>
      </nav>
    </header>
  )
}
