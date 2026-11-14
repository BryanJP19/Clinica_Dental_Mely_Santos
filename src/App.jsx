import { useState, useEffect, useRef } from 'react'
import Navbar from './components/Navbar'
import Home from './components/Home'
import About from './components/About'
import Services from './components/Services'
import BookingCalendar from './components/BookingCalendar'
import AdminPanel from './components/AdminPanel'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Login from './components/Login'
import { getSession, logout } from './auth'

const routes = ['inicio', 'nosotros', 'servicios', 'reservar', 'contacto', 'admin']
const read = () => { const h = location.hash.replace('#', ''); return routes.includes(h) ? h : 'inicio' }
const IDLE = 30 * 60e3

export default function App() {
  const [page, setPage] = useState(read())
  const [preset, setPreset] = useState('')
  const [user, setUser] = useState(null)
  const last = useRef(Date.now())
  useEffect(() => { getSession().then(setUser) }, [])
  useEffect(() => { const f = () => { setPage(read()); window.scrollTo(0, 0) }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  useEffect(() => {
    if (!user) return
    const t = () => { last.current = Date.now() }
    const c = setInterval(() => { if (Date.now() - last.current > IDLE) out() }, 30000)
    ;['click', 'keydown'].forEach(e => addEventListener(e, t))
    return () => { clearInterval(c); ['click', 'keydown'].forEach(e => removeEventListener(e, t)) }
  }, [user])
  const out = async () => { await logout(); setUser(null) }
  const book = (id = '') => { setPreset(id); location.hash = 'reservar' }
  return (
    <>
      <Navbar page={page} />
      <main key={page}>
        {page === 'inicio' && <Home onBook={book} />}
        {page === 'nosotros' && <About onBook={book} />}
        {page === 'servicios' && <Services onBook={book} />}
        {page === 'reservar' && <BookingCalendar preset={preset} />}
        {page === 'contacto' && <Contact />}
        {page === 'admin' && (user ? <AdminPanel user={user} onLogout={out} /> : <Login onLogin={u => { last.current = Date.now(); setUser(u) }} />)}
      </main>
      <Footer />
    </>
  )
}
