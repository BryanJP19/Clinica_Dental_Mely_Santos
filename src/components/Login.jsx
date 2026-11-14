import { useState } from 'react'
import { login } from '../auth'
export default function Login({ onLogin }) {
  const [f, setF] = useState({ email: 'melymarsanto@gmail.com', password: 'Melymar123' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async e => {
    e.preventDefault(); setErr(''); setBusy(true)
    const r = await login(f.email, f.password)
    setBusy(false); r.error ? setErr(r.error) : onLogin(r.user)
  }
  return (
    <section className="wrap page">
      <form className="card login" onSubmit={submit}>
        <h2>Acceso del personal</h2>
        <input required type="email" maxLength={80} placeholder="Correo" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} autoComplete="username" />
        <input required type="password" maxLength={128} placeholder="Contraseña" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} autoComplete="current-password" />
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Verificando…' : 'Entrar'}</button>
      </form>
    </section>
  )
}
