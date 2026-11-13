export default function About({ onBook }) {
  return (
    <section className="wrap page">
      <h2>Sobre la Dra. Mely Santos</h2>
      <div className="grid2">
        <div className="card"><h3>Filosofía de trabajo</h3><p>Cada paciente recibe un diagnóstico claro, un plan por escrito y opciones de tratamiento explicadas sin tecnicismos. Prevenir es mejor, y más económico, que reparar.</p></div>
        <div className="card"><h3>Experiencia</h3><p>Odontóloga con práctica en odontología general, endodoncia y estética dental.</p></div>
        <div className="card"><h3>Compromiso</h3><p>Citas puntuales, esterilización rigurosa y seguimiento después de cada tratamiento.</p></div>
        <div className="card gold"><h3>¿Primera visita?</h3><p>Reserva una evaluación y recibe tu plan de tratamiento.</p><button className="btn" onClick={() => onBook()}>Reservar evaluación</button></div>
      </div>
    </section>
  )
}
