import { useState, useEffect } from 'react'
import { SERVICES, slotsFor, WHATSAPP } from '../data'
import { doctors, busySlots, reservar } from '../auth'
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const clean = s => s.replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 80)
let lastSend = 0

export default function BookingCalendar({ preset }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [docs, setDocs] = useState(null)
  const [doc, setDoc] = useState('')
  const [busy, setBusy] = useState([])
  const [service, setService] = useState(preset || '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [f, setF] = useState({ nombre: '', telefono: '', correo: '' })
  const [hp, setHp] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(null)

  useEffect(() => { doctors().then(d => { setDocs(d); setDoc(d[0]?.id || '') }) }, [])
  useEffect(() => { if (doc && date) busySlots(doc, date).then(setBusy); else setBusy([]) }, [doc, date, done])

  const first = view.getDay(), days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))]
  const disabled = d => d < today || d.getDay() === 0
  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1)

  const submit = async e => {
    e.preventDefault()
    if (hp) return
    if (!doc || !service || !date || !time) return setErr('Elige servicio, fecha y hora.')
    if (f.nombre.trim().length < 3) return setErr('Escribe tu nombre completo.')
    if (!/^[\d\s()+-]{10,20}$/.test(f.telefono)) return setErr('Escribe un teléfono válido de 10 dígitos.')
    if (!/^\S+@\S+\.\S+$/.test(f.correo)) return setErr('Escribe un correo válido.')
    if (Date.now() - lastSend < 20000) return setErr('Espera unos segundos antes de reservar de nuevo.')
    lastSend = Date.now(); setErr(''); setSaving(true)
    const a = { doctorId: doc, doctor: docs.find(d => d.id === doc).nombre, servicio: service, fecha: date, hora: time, nombre: clean(f.nombre), telefono: clean(f.telefono), correo: clean(f.correo) }
    const r = await reservar(a)
    setSaving(false)
    if (r.error) { setErr(r.error); busySlots(doc, date).then(setBusy) } else setDone(a)
  }
  const reset = () => { setDone(null); setDate(''); setTime(''); setF({ nombre: '', telefono: '', correo: '' }) }
  const sName = id => SERVICES.find(s => s.id === id)?.name
  const wa = done && `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, soy ${done.nombre}. Agendé ${sName(done.servicio)} con ${done.doctor} el ${done.fecha} a las ${done.hora}.`)}`

  return (
    <section className="wrap page">
      <h2>Reserva tu cita</h2>
      {docs && !docs.length && <p className="card muted">Las reservas en línea no están disponibles por ahora. Escríbenos por WhatsApp.</p>}
      <form className="book" onSubmit={submit} noValidate>
        <div className="card">
          {docs?.length > 0 && <><h3>Doctor/a</h3><div className="chips">{docs.map(d => <button type="button" key={d.id} className={'chip' + (doc === d.id ? ' on' : '')} onClick={() => { setDoc(d.id); setTime('') }}>{d.nombre}</button>)}</div></>}
          <h3>1. Servicio</h3>
          <div className="chips">{SERVICES.map(s => <button type="button" key={s.id} className={'chip' + (service === s.id ? ' on' : '')} onClick={() => setService(s.id)}>{s.name}</button>)}</div>
          <h3>2. Fecha</h3>
          <div className="cal-head">
            <button type="button" className="icon" disabled={!canPrev} aria-label="Mes anterior" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}>‹</button>
            <b>{MESES[view.getMonth()]} {view.getFullYear()}</b>
            <button type="button" className="icon" aria-label="Mes siguiente" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}>›</button>
          </div>
          <div className="cal">
            {['D','L','M','M','J','V','S'].map((d, i) => <span key={i} className="dow">{d}</span>)}
            {cells.map((d, i) => d ? <button type="button" key={i} disabled={disabled(d)} className={'day' + (date === iso(d) ? ' on' : '')} onClick={() => { setDate(iso(d)); setTime('') }}>{d.getDate()}</button> : <span key={i} />)}
          </div>
          <small>Lun–Vie 8am–5pm, sáb 8am–12pm. Domingos cerrado.</small>
        </div>
        <div className="card">
          <h3>3. Horario</h3>
          {!date ? <p className="muted">Elige una fecha para ver los horarios.</p> : slotsFor(date).map(([l, hs]) => (
            <div key={l}><p className="muted">{l}</p><div className="chips">{hs.map(h => <button type="button" key={h} disabled={busy.includes(h)} className={'chip' + (time === h ? ' on' : '')} onClick={() => setTime(h)}>{h}</button>)}</div></div>
          ))}
          <h3>4. Tus datos</h3>
          <input maxLength={80} placeholder="Nombre completo" value={f.nombre} onChange={e => setF({ ...f, nombre: e.target.value })} />
          <input maxLength={20} placeholder="Teléfono" inputMode="tel" value={f.telefono} onChange={e => setF({ ...f, telefono: e.target.value })} />
          <input maxLength={80} placeholder="Correo electrónico" type="email" value={f.correo} onChange={e => setF({ ...f, correo: e.target.value })} />
          <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={e => setHp(e.target.value)} />
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn" disabled={saving || !docs?.length}>{saving ? 'Guardando cita…' : 'Confirmar cita'}</button>
        </div>
      </form>
      {done && (
        <div className="modal" role="dialog" aria-modal="true"><div className="card gold">
          <h3>Cita confirmada</h3>
          <p>{done.nombre}, te esperamos el <b>{done.fecha}</b> a las <b>{done.hora}</b> con <b>{done.doctor}</b> para <b>{sName(done.servicio)}</b>.</p>
          <div className="row"><a className="btn" href={wa} target="_blank" rel="noreferrer">Enviar por WhatsApp</a><button className="btn btn-ghost" onClick={reset}>Cerrar</button></div>
        </div></div>
      )}
    </section>
  )
}
