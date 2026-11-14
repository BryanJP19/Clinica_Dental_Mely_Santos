export default function About({ onBook }) {
  return (
    <section className="wrap page">
      <h2>Sobre la Dra. Mely Santos</h2>
      <div className="grid2">
        <div className="card"><img className="portrait" alt="Dra. Mely Santos" src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/clinica/doctora.jpg`} onError={e => e.currentTarget.remove()} /><h3>Filosofía de trabajo</h3><p>Cada paciente recibe un diagnóstico claro, un plan por escrito y opciones de tratamiento explicadas sin tecnicismos. Prevenir es mejor, y más económico, que reparar.</p></div>
        <div className="card"><h3>Experiencia</h3><p>Odontóloga con práctica en odontología general, endodoncia, ortodoncia y estética dental. Actualiza su formación de forma continua.</p></div>
        <div className="card"><h3>Compromiso</h3><p>Citas puntuales, esterilización rigurosa y seguimiento después de cada tratamiento.</p></div>
        <div className="card gold"><h3>¿Primera visita?</h3><p>Reserva una evaluación y recibe tu plan de tratamiento.</p><button className="btn" onClick={() => onBook()}>Reservar evaluación</button></div>
      </div>
    </section>
  )
}
