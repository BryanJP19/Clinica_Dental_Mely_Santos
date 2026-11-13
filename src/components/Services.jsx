import { SERVICES } from '../data'
export default function Services({ onBook, compact }) {
  const list = compact ? SERVICES.slice(0, 3) : SERVICES
  return (
    <section className={'wrap ' + (compact ? 'sect' : 'page')}>
      <h2>{compact ? 'Servicios principales' : 'Servicios odontológicos'}</h2>
      <div className="grid3">
        {list.map(s => (
          <article className="card svc" key={s.id}>
            <h3>{s.name}</h3><p>{s.desc}</p><small>{s.perks}</small>
            <button className="btn btn-ghost" onClick={() => onBook(s.id)}>Reservar {s.name.toLowerCase()}</button>
          </article>
        ))}
      </div>
      {compact && <p className="center"><a className="link" href="#servicios">Ver todos los servicios</a></p>}
    </section>
  )
}
