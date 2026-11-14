import { useState, useEffect } from 'react'
import { SERVICES, STATUS } from '../data'
import { waLink, mailLink } from '../notify'
import { ROLES, listCitas, setEstado, deleteCita, listProfiles, updateProfile, changePassword, listMensajes, deleteMensaje } from '../auth'

function Team({ me }) {
  const [users, setUsers] = useState([])
  const load = () => listProfiles().then(setUsers)
  useEffect(() => { load() }, [])
  const patch = async (id, p) => { await updateProfile(id, p); load() }
  return (
    <div className="card">
      <h3>Equipo</h3>
      <p className="muted">Para agregar a alguien nuevo, créale el usuario en Supabase (Authentication → Add user) y aquí le asignas el rol.</p>
      <ul className="hours">{users.map(u => (
        <li key={u.id}><span>{u.nombre}{!u.activo && ' (inactivo)'}</span>
          {u.id === me.id ? <b>{ROLES[u.rol]}</b> : <span className="row0">
            <select value={u.rol} onChange={e => patch(u.id, { rol: e.target.value })}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <button className="btn btn-ghost btn-sm" onClick={() => patch(u.id, { activo: !u.activo })}>{u.activo ? 'Desactivar' : 'Activar'}</button></span>}
        </li>))}</ul>
    </div>
  )
}

function Account() {
  const [pw, setPw] = useState(''); const [msg, setMsg] = useState('')
  const go = async e => { e.preventDefault(); const r = await changePassword(pw); setMsg(r.error || 'Contraseña actualizada.'); if (!r.error) setPw('') }
  return (
    <form className="card login" style={{ margin: 0 }} onSubmit={go}>
      <h3>Cambiar mi contraseña</h3>
      <input required type="password" maxLength={128} placeholder="Nueva contraseña" value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" />
      <button className="btn">Actualizar</button>{msg && <p className="muted" role="status">{msg}</p>}
    </form>
  )
}

function Messages() {
  const [m, setM] = useState(null)
  useEffect(() => { listMensajes().then(setM) }, [])
  const del = async id => { await deleteMensaje(id); setM(m.filter(x => x.id !== id)) }
  if (!m) return <p className="muted">Cargando mensajes…</p>
  return !m.length ? <p className="card muted">No hay mensajes.</p> : (
    <div className="grid2">{m.map(x => (
      <div className="card" key={x.id}><h3>{x.nombre}</h3><p>{x.mensaje}</p>
        <small className="muted">{x.correo}{x.telefono && ' · ' + x.telefono} · {new Date(x.created_at).toLocaleString('es-DO')}</small>
        <div className="row"><button className="btn btn-ghost btn-sm" onClick={() => del(x.id)}>Eliminar</button></div></div>))}</div>
  )
}

export default function AdminPanel({ user, onLogout }) {
  const [tab, setTab] = useState('citas')
  const [appts, setAppts] = useState(null)
  const [fd, setFd] = useState('')
  const [notice, setNotice] = useState(null)
  const staff = user.rol !== 'doctor'
  useEffect(() => { listCitas().then(setAppts) }, [])
  const list = appts || []
  const docs = [...new Map(list.map(a => [a.doctor_id, a.doctor?.nombre])).entries()]
  const shown = list.filter(a => !fd || a.doctor_id === fd)
  const set = async (id, estado) => { const { error } = await setEstado(id, estado); if (!error) { setAppts(list.map(a => a.id === id ? { ...a, estado } : a)); if (estado === 'Confirmada') setNotice(list.find(a => a.id === id)) } }
  const del = async id => { if (staff && confirm('¿Eliminar esta cita?')) { const { error } = await deleteCita(id); if (!error) setAppts(list.filter(a => a.id !== id)) } }
  return (
    <section className="wrap page">
      <div className="bar"><h2>Panel</h2><span className="muted">{user.nombre} · {ROLES[user.rol]}</span><button className="btn btn-ghost btn-sm" onClick={onLogout}>Cerrar sesión</button></div>
      <div className="tabs">
        <button className={tab === 'citas' ? 'on' : ''} onClick={() => setTab('citas')}>Citas</button>
        {user.rol === 'admin' && <button className={tab === 'equipo' ? 'on' : ''} onClick={() => setTab('equipo')}>Equipo</button>}
        {staff && <button className={tab === 'mensajes' ? 'on' : ''} onClick={() => setTab('mensajes')}>Mensajes</button>}
        <button className={tab === 'cuenta' ? 'on' : ''} onClick={() => setTab('cuenta')}>Mi cuenta</button>
      </div>
      {tab === 'equipo' && user.rol === 'admin' ? <Team me={user} /> : tab === 'mensajes' && staff ? <Messages /> : tab === 'cuenta' ? <Account /> : <>
        <ul className="stats">{STATUS.map(s => <li key={s}><b>{list.filter(a => a.estado === s).length}</b> {s.toLowerCase()}s</li>)}</ul>
        {staff && docs.length > 1 && <select className="fsel" value={fd} onChange={e => setFd(e.target.value)}><option value="">Todos los doctores</option>{docs.map(([id, n]) => <option key={id} value={id}>{n}</option>)}</select>}
        {appts === null ? <p className="muted">Cargando citas…</p> : !shown.length ? <p className="card muted">No hay citas para mostrar.</p> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Fecha</th><th>Hora</th><th>Doctor/a</th><th>Paciente</th><th>Servicio</th><th>Contacto</th><th>Estado</th><th></th></tr></thead>
            <tbody>{shown.map(a => (
              <tr key={a.id}><td>{a.fecha}</td><td>{a.hora}</td><td>{a.doctor?.nombre}</td><td>{a.nombre}</td><td>{SERVICES.find(s => s.id === a.servicio)?.name}</td><td>{a.telefono}<br />{a.correo}</td>
                <td><select value={a.estado} onChange={e => set(a.id, e.target.value)}>{STATUS.map(s => <option key={s}>{s}</option>)}</select></td>
                <td>{a.estado === 'Confirmada' && <a className="btn btn-sm" href={waLink(a)} target="_blank" rel="noreferrer">WhatsApp</a>} {staff && <button className="btn btn-ghost btn-sm" onClick={() => del(a.id)}>Eliminar</button>}</td></tr>))}</tbody>
          </table></div>
        )}
      </>}
            {notice && <div className="modal" role="dialog" aria-modal="true"><div className="card gold">
        <h3>Cita confirmada</h3><p>Avisa a {notice.nombre} con un clic:</p>
        <div className="row"><a className="btn" href={waLink(notice)} target="_blank" rel="noreferrer" onClick={() => setNotice(null)}>Enviar por WhatsApp</a>
          <a className="btn btn-ghost" href={mailLink(notice)} onClick={() => setNotice(null)}>Enviar por correo</a>
          <button className="btn btn-ghost" onClick={() => setNotice(null)}>Ahora no</button></div></div></div>}
    </section>
  )
}
