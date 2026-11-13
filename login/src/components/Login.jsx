import { useState } from 'react'
import { listUsers, createUser, login } from '../auth'
export default function Login({ onLogin }) {
  const setup = listUsers().length === 0
  const [f, setF] = useState({ nombre: '', usuario: '', password: '', confirm: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const upd = k => e => setF({ ...f, [k]: e.target.value })
  const submit = async e => {
    e.preventDefault(); setErr('')
    if (setup && f.password !== f.confirm) return setErr('Las contraseñas no coinciden.')
    setBusy(true)
    let r
    if (setup) { r = await createUser({ ...f, rol: 'admin' }); if (r.user) r = await login(f.usuario, f.password) }
    else r = await login(f.usuario, f.password)
    setBusy(false)
    r.error ? setErr(r.error) : onLogin(r.user)
  }
  return (
    <section className="wrap page">
      <form className="card login" onSubmit={submit}>
        <h2>{setup ? 'Crear cuenta principal' : 'Acceso del personal'}</h2>
        {setup && <p className="muted">Primera configuración: esta cuenta será la de la doctora principal y podrá crear las demás.</p>}
        {setup && <input required maxLength={60} placeholder="Nombre completo" value={f.nombre} onChange={upd('nombre')} autoComplete="name" />}
        <input required maxLength={30} placeholder="Usuario" value={f.usuario} onChange={upd('usuario')} autoComplete="username" />
        <input required type="password" maxLength={128} placeholder="Contraseña" value={f.password} onChange={upd('password')} autoComplete={setup ? 'new-password' : 'current-password'} />
        {setup && <input required type="password" maxLength={128} placeholder="Repite la contraseña" value={f.confirm} onChange={upd('confirm')} autoComplete="new-password" />}
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Verificando…' : setup ? 'Crear y entrar' : 'Entrar'}</button>
      </form>
    </section>
  )
}
