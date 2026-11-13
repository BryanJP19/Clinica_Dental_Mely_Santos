import { useState } from 'react'
import { SERVICES, STATUS } from '../data'
import { ROLES, listUsers, createUser, setActive, resetPassword } from '../auth'

function Team({ me }) {
  const [users, setUsers] = useState(listUsers())
  const [f, setF] = useState({ nombre: '', usuario: '', rol: 'doctor', password: '' })
  const [rp, setRp] = useState({ id: '', password: '' })
  const [msg, setMsg] = useState('')
  const add = async e => {
    e.preventDefault(); const r = await createUser(f); setMsg(r.error || 'Usuario creado.')
    if (r.user) { setF({ nombre: '', usuario: '', rol: 'doctor', password: '' }); setUsers(listUsers()) }
  }
  const reset = async e => {
    e.preventDefault(); if (!rp.id) return setMsg('Elige un usuario.')
    const r = await resetPassword(rp.id, rp.password); setMsg(r.error || 'Contraseña actualizada.'); if (!r.error) setRp({ id: '', password: '' })
  }
  return (
    <div className="grid2">
      <div className="card">
        <h3>Equipo</h3>
        <ul className="hours">{users.map(u => (
          <li key={u.id}><span>{u.nombre} · {ROLES[u.rol]}{!u.activo && ' (inactivo)'}</span>
            {u.id !== me.id && <button className="btn btn-ghost btn-sm" onClick={() => { setActive(u.id, !u.activo); setUsers(listUsers()) }}>{u.activo ? 'Desactivar' : 'Activar'}</button>}</li>
        ))}</ul>
      </div>
      <div className="card">
        <form onSubmit={add}>
          <h3>Agregar persona</h3>
          <input required maxLength={60} placeholder="Nombre completo" value={f.nombre} onChange={e => setF({ ...f, nombre: e.target.value })} />
          <input required maxLength={30} placeholder="Usuario" value={f.usuario} onChange={e => setF({ ...f, usuario: e.target.value })} autoComplete="off" />
          <select value={f.rol} onChange={e => setF({ ...f, rol: e.target.value })}><option value="doctor">Doctor/a</option><option value="secretaria">Secretaria</option></select>
          <input required type="password" maxLength={128} placeholder="Contraseña inicial" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} autoComplete="new-password" />
          <button className="btn">Crear usuario</button>
        </form>
        <form onSubmit={reset}>
          <h3>Restablecer contraseña</h3>
          <select value={rp.id} onChange={e => setRp({ ...rp, id: e.target.value })}><option value="">Elige usuario</option>{users.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}</select>
          <input required type="password" maxLength={128} placeholder="Nueva contraseña" value={rp.password} onChange={e => setRp({ ...rp, password: e.target.value })} autoComplete="new-password" />
          <button className="btn btn-ghost">Actualizar</button>
        </form>
        {msg && <p className="muted" role="status">{msg}</p>}
      </div>
    </div>
  )
}

export default function AdminPanel({ appts, setAppts, user, onLogout }) {
  const [tab, setTab] = useState('citas')
  const [fd, setFd] = useState('')
  const docs = listUsers().filter(u => u.rol === 'admin' || u.rol === 'doctor')
  const mine = user.rol === 'doctor' ? appts.filter(a => a.doctorId === user.id) : appts
  const shown = mine.filter(a => !fd || a.doctorId === fd).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
  const set = (id, estado) => setAppts(appts.map(a => a.id === id ? { ...a, estado } : a))
  const del = id => user.rol !== 'doctor' && confirm('¿Eliminar esta cita?') && setAppts(appts.filter(a => a.id !== id))
  return (
    <section className="wrap page">
      <div className="bar"><h2>Panel</h2><span className="muted">{user.nombre} · {ROLES[user.rol]}</span><button className="btn btn-ghost btn-sm" onClick={onLogout}>Cerrar sesión</button></div>
      {user.rol === 'admin' && <div className="tabs"><button className={tab === 'citas' ? 'on' : ''} onClick={() => setTab('citas')}>Citas</button><button className={tab === 'equipo' ? 'on' : ''} onClick={() => setTab('equipo')}>Equipo</button></div>}
      {tab === 'equipo' && user.rol === 'admin' ? <Team me={user} /> : <>
        <ul className="stats">{STATUS.map(s => <li key={s}><b>{mine.filter(a => a.estado === s).length}</b> {s.toLowerCase()}s</li>)}</ul>
        {user.rol !== 'doctor' && docs.length > 1 && <select className="fsel" value={fd} onChange={e => setFd(e.target.value)}><option value="">Todos los doctores</option>{docs.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select>}
        {!shown.length ? <p className="card muted">No hay citas para mostrar.</p> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Fecha</th><th>Hora</th><th>Doctor/a</th><th>Paciente</th><th>Servicio</th><th>Contacto</th><th>Estado</th><th></th></tr></thead>
            <tbody>{shown.map(a => (
              <tr key={a.id}><td>{a.fecha}</td><td>{a.hora}</td><td>{a.doctor}</td><td>{a.nombre}</td><td>{SERVICES.find(s => s.id === a.servicio)?.name}</td><td>{a.telefono}<br />{a.correo}</td>
                <td><select value={a.estado} onChange={e => set(a.id, e.target.value)}>{STATUS.map(s => <option key={s}>{s}</option>)}</select></td>
                <td>{user.rol !== 'doctor' && <button className="btn btn-ghost btn-sm" onClick={() => del(a.id)}>Eliminar</button>}</td></tr>))}</tbody>
          </table></div>
        )}
      </>}
    </section>
  )
}
