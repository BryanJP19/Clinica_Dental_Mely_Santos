import { WHATSAPP } from '../data'
export default function Hero({ onBook }) {
  return (
    <section className="hero wrap">
      <div className="hero-copy">
        <h1>Tu sonrisa, nuestra prioridad</h1>
        <p>Odontología general y estética con atención cercana, tecnología actual y un consultorio pensado para que te sientas en confianza.</p>
        <div className="row">
          <button className="btn" onClick={() => onBook()}>Agendar cita</button>
          <a className="btn btn-ghost" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">Escribir por WhatsApp</a>
        </div>
        <ul className="stats">
          <li><b>2+</b> años de experiencia</li><li><b>200+</b> pacientes atendidos</li><li><b>2</b> especialidades</li>
        </ul>
      </div>
      <div className="plaque"><img className="logo-hero" src="/logo.png" alt="Logotipo de la Dra. Mely Santos, Odontóloga" /></div>
    </section>
  )
}
