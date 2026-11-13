import Hero from './Hero'
import { SERVICES, WHATSAPP, PHONE, ADDRESS, HOURS } from '../data'

const steps = [['Elige tu servicio', 'Selecciona el tratamiento que necesitas.'], ['Escoge fecha y hora', 'Mira los horarios libres en el calendario.'], ['Confirma tus datos', 'Recibe la confirmación y avísanos por WhatsApp.']]
const values = [['Diagnóstico claro', 'Te explicamos cada opción sin tecnicismos.'], ['Higiene rigurosa', 'Instrumental esterilizado en cada cita.'], ['Seguimiento', 'Te acompañamos después del tratamiento.']]

export default function Home({ onBook }) {
  return (
    <>
      <Hero onBook={onBook} />

      <section className="wrap sect">
        <div className="split">
          <div><h2>La clínica de la Dra. Mely Santos</h2><a className="link" href="#nosotros">Conocer más</a></div>
          <div className="lines">{values.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>
        </div>
      </section>

      <section className="wrap sect">
        <h2>Servicios</h2>
        <ul className="list">
          {SERVICES.map(s => (
            <li key={s.id}>
              <div><h3>{s.name}</h3><p>{s.desc}</p></div>
              <button className="btn btn-ghost btn-sm" onClick={() => onBook(s.id)}>Reservar</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="band">
        <div className="wrap sect">
          <h2>Agenda en tres pasos</h2>
          <ol className="steps">{steps.map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}</ol>
          <button className="btn" onClick={() => onBook()}>Ir al calendario</button>
        </div>
      </section>

      <section className="wrap sect">
        <div className="split">
          <div>
            <h2>Visítanos</h2>
            <p className="muted">{ADDRESS}</p>
            <ul className="hours">{HOURS.map(([d, h]) => <li key={d}><span>{d}</span><b>{h}</b></li>)}</ul>
          </div>
          <div className="cta">
            <h3>¿Tienes dudas?</h3>
            <p className="muted">Escríbenos al {PHONE} y te respondemos el mismo día.</p>
            <div className="row">
              <a className="btn" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp</a>
              <a className="btn btn-ghost" href="#contacto">Ver contacto</a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
