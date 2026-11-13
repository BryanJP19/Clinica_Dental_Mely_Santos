const enc = new TextEncoder()
const b64 = b => btoa(String.fromCharCode(...new Uint8Array(b)))
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0))
export const ROLES = { admin: 'Doctora principal', doctor: 'Doctor/a', secretaria: 'Secretaria' }
const MAX_FAILS = 5, LOCK_MS = 5 * 60e3, IDLE_MS = 30 * 60e3
const read = (s, k, d) => { try { return JSON.parse(s.getItem(k)) ?? d } catch { return d } }
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v))

async function derive(pw, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits'])
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 210000, hash: 'SHA-256' }, key, 256))
}
const same = (a, b) => a.length === b.length && [...a].reduce((r, c, i) => r | (c.charCodeAt(0) ^ b.charCodeAt(i)), 0) === 0

export const listUsers = () => read(localStorage, 'ms_users', [])
export const doctors = () => listUsers().filter(u => u.activo && (u.rol === 'admin' || u.rol === 'doctor')).map(({ id, nombre }) => ({ id, nombre }))
export const checkPw = pw => pw.length >= 10 && /[a-zA-Z]/.test(pw) && /\d/.test(pw) ? '' : 'La contraseña necesita mínimo 10 caracteres, con letras y números.'

export async function createUser({ nombre, usuario, rol, password }) {
  const users = listUsers(), u = usuario.trim().toLowerCase()
  if (nombre.trim().length < 3 || !/^[a-z0-9._-]{3,30}$/.test(u)) return { error: 'Nombre o usuario inválido (usuario: letras, números, punto, guion).' }
  if (users.some(x => x.usuario === u)) return { error: 'Ese usuario ya existe.' }
  const e = checkPw(password); if (e) return { error: e }
  if (!users.length) rol = 'admin'; else if (!ROLES[rol] || rol === 'admin') rol = rol === 'doctor' ? 'doctor' : 'secretaria'
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const user = { id: crypto.randomUUID(), nombre: nombre.trim().slice(0, 60), usuario: u, rol, activo: true, salt: b64(salt), hash: await derive(password, salt) }
  save('ms_users', [...users, user]); return { user }
}
export async function resetPassword(id, password) {
  const e = checkPw(password); if (e) return { error: e }
  const salt = crypto.getRandomValues(new Uint8Array(16)), hash = await derive(password, salt)
  save('ms_users', listUsers().map(u => u.id === id ? { ...u, salt: b64(salt), hash } : u)); return { ok: true }
}
export const setActive = (id, activo) => save('ms_users', listUsers().map(u => u.id === id ? { ...u, activo } : u))

export async function login(usuario, password) {
  const lock = read(localStorage, 'ms_lock', { n: 0, until: 0 })
  if (lock.until > Date.now()) return { error: `Demasiados intentos. Espera ${Math.ceil((lock.until - Date.now()) / 60000)} min.` }
  const u = listUsers().find(x => x.usuario === usuario.trim().toLowerCase() && x.activo)
  const h = await derive(password, u ? unb64(u.salt) : crypto.getRandomValues(new Uint8Array(16)))
  if (u && same(h, u.hash)) {
    save('ms_lock', { n: 0, until: 0 }); sessionStorage.setItem('ms_sess', JSON.stringify({ id: u.id, t: Date.now() })); return { user: u }
  }
  const n = lock.n + 1
  save('ms_lock', n >= MAX_FAILS ? { n: 0, until: Date.now() + LOCK_MS } : { n, until: 0 })
  return { error: 'Usuario o contraseña incorrectos.' }
}
export function getSession() {
  const s = read(sessionStorage, 'ms_sess', null)
  if (!s || Date.now() - s.t > IDLE_MS) { sessionStorage.removeItem('ms_sess'); return null }
  return listUsers().find(x => x.id === s.id && x.activo) || null
}
export const touch = () => { const s = read(sessionStorage, 'ms_sess', null); if (s) sessionStorage.setItem('ms_sess', JSON.stringify({ ...s, t: Date.now() })) }
export const logout = () => sessionStorage.removeItem('ms_sess')
