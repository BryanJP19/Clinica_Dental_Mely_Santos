import { useState } from 'react'
import { WHATSAPP, PHONE, ADDRESS, HOURS } from '../data'
export default function Contact() {
  const [sent, setSent] = useState(false)
  return (
    <section className="wrap page">
      <h2>Contacto y ubicación</h2>
      <div className="grid2">
        <div className="card">
        <iframe
          className="map"
          title="Mapa de la clínica"
          src="https://www.google.com/maps?q=18.4574648,-69.9254417&z=17&output=embed"
          loading="lazy"
          style={{ border: 0, width: '100%' }}
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a className="link" href="https://maps.app.goo.gl/fDkyDFk9fUwNVTAL7" target="_blank" rel="noreferrer">Abrir en Google Maps</a>
          <p>{ADDRESS}<br />{PHONE}</p><ul className="hours">{HOURS.map(([d, h]) => <li key={d}><span>{d}</span><b>{h}</b></li>)}</ul>
          <a className="btn" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">Abrir WhatsApp</a>
        </div>
        <form className="card" onSubmit={e => { e.preventDefault(); setSent(true) }}>
          <h3>Escríbenos</h3>
          <input required placeholder="Nombre" /><input required type="email" placeholder="Correo" />
          <input required type="tel" placeholder="WhatsApp" />
          <textarea required rows="4" placeholder="¿En qué podemos ayudarte?" />
          <button className="btn">Enviar mensaje</button>
          {sent && <p className="ok" role="status">Mensaje recibido. Te responderemos pronto.</p>}
        </form>
      </div>
    </section>
  )
}
