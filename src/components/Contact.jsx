import { useState } from 'react'
import { WHATSAPP, PHONE, ADDRESS, HOURS } from '../data'
import { enviarMensaje } from '../auth'
export default function Contact() {
  const [f, setF] = useState({ nombre: '', correo: '', telefono: '', mensaje: '' })
  const [hp, setHp] = useState('')
  const [st, setSt] = useState({ busy: false, ok: false, err: '' })
  const upd = k => e => setF({ ...f, [k]: e.target.value })
  const submit = async e => {
    e.preventDefault(); if (hp) return
    setSt({ busy: true, ok: false, err: '' })
    const r = await enviarMensaje(f)
    if (r.error) setSt({ busy: false, ok: false, err: r.error })
    else { setF({ nombre: '', correo: '', telefono: '', mensaje: '' }); setSt({ busy: false, ok: true, err: '' }) }
  }
  return (
    <section className="wrap page">
      <h2>Contacto y ubicación</h2>
      <div className="grid2">
        <div className="card">
          <iframe className="map" title="Mapa de la clínica" src="https://maps.google.com/maps?q=18.4574648,-69.9254417&z=17&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <a className="link" href="https://maps.app.goo.gl/fDkyDFk9fUwNVTAL7" target="_blank" rel="noreferrer">Abrir en Google Maps</a>
          <p>{ADDRESS}<br />{PHONE}</p>
          <ul className="hours">{HOURS.map(([d, h]) => <li key={d}><span>{d}</span><b>{h}</b></li>)}</ul>
          <a className="btn" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">Abrir WhatsApp</a>
        </div>
        <form className="card" onSubmit={submit}>
          <h3>Escríbenos</h3>
          <input required maxLength={80} placeholder="Nombre" value={f.nombre} onChange={upd('nombre')} />
          <input required type="email" maxLength={80} placeholder="Correo" value={f.correo} onChange={upd('correo')} />
          <input type="tel" maxLength={20} placeholder="Teléfono (opcional)" value={f.telefono} onChange={upd('telefono')} />
          <textarea required minLength={5} maxLength={1000} rows="4" placeholder="¿En qué podemos ayudarte?" value={f.mensaje} onChange={upd('mensaje')} />
          <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={e => setHp(e.target.value)} />
          <button className="btn" disabled={st.busy}>{st.busy ? 'Enviando…' : 'Enviar mensaje'}</button>
          {st.ok && <p className="ok" role="status">Mensaje recibido. Te responderemos pronto.</p>}
          {st.err && <p className="err" role="alert">{st.err}</p>}
        </form>
      </div>
    </section>
  )
}
