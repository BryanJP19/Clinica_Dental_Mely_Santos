import { useState, useEffect } from 'react'
import useLocalStorage from './useLocalStorage'
import Navbar from './components/Navbar'
import Home from './components/Home'
import About from './components/About'
import Services from './components/Services'
import BookingCalendar from './components/BookingCalendar'
import AdminPanel from './components/AdminPanel'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Login from './components/Login'
import { getSession, touch, logout } from './auth'

const routes = ['inicio', 'nosotros', 'servicios', 'reservar', 'contacto', 'admin']
const read = () => { const h = location.hash.replace('#', ''); return routes.includes(h) ? h : 'inicio' }

export default function App() {
  const [page, setPage] = useState(read())
  const [appts, setAppts] = useLocalStorage('ms_citas', [])
  const [preset, setPreset] = useState('')
  const [user, setUser] = useState(getSession)
  useEffect(() => { const f = () => { setPage(read()); window.scrollTo(0, 0) }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  useEffect(() => { if (!user) return; const t = () => touch(); const c = setInterval(() => { if (!getSession()) setUser(null) }, 30000); ['click', 'keydown'].forEach(e => addEventListener(e, t)); return () => { clearInterval(c); ['click', 'keydown'].forEach(e => removeEventListener(e, t)) } }, [user])
  const out = () => { logout(); setUser(null) }
  const book = (id = '') => { setPreset(id); location.hash = 'reservar' }
  return (
    <>
      <Navbar page={page} />
      <main key={page}>
        {page === 'inicio' && <Home onBook={book} />}
        {page === 'nosotros' && <About onBook={book} />}
        {page === 'servicios' && <Services onBook={book} />}
        {page === 'reservar' && <BookingCalendar appts={appts} setAppts={setAppts} preset={preset} />}
        {page === 'contacto' && <Contact />}
        {page === 'admin' && (user ? <AdminPanel appts={appts} setAppts={setAppts} user={user} onLogout={out} /> : <Login onLogin={setUser} />)}
      </main>
      <Footer />
    </>
  )
}
