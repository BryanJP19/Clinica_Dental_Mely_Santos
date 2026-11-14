import { supabase } from './supabase'
export const ROLES = { admin: 'Doctora principal', doctor: 'Doctor/a', secretaria: 'Secretaria' }
export const checkPw = pw => pw.length >= 10 && /[a-zA-Z]/.test(pw) && /\d/.test(pw) ? '' : 'La contraseña necesita mínimo 10 caracteres, con letras y números.'

export async function profileOf(id) {
  const { data } = await supabase.from('profiles').select('id,nombre,rol,activo').eq('id', id).maybeSingle()
  return data?.activo ? data : null
}
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) return { error: 'Correo o contraseña incorrectos.' }
  const user = await profileOf(data.user.id)
  if (!user) { await supabase.auth.signOut(); return { error: 'Esta cuenta no tiene acceso.' } }
  return { user }
}
export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session ? profileOf(data.session.user.id) : null
}
export const logout = () => supabase.auth.signOut()
export const changePassword = async pw => { const e = checkPw(pw); if (e) return { error: e }; const { error } = await supabase.auth.updateUser({ password: pw }); return { error: error?.message } }

export const doctors = async () => (await supabase.rpc('doctores_publicos')).data || []
export const busySlots = async (doctor, fecha) => (await supabase.rpc('horas_ocupadas', { p_doctor: doctor, p_fecha: fecha })).data || []
export async function reservar(a) {
  const { error } = await supabase.rpc('reservar_cita', { p_doctor: a.doctorId, p_servicio: a.servicio, p_fecha: a.fecha, p_hora: a.hora, p_nombre: a.nombre, p_telefono: a.telefono, p_correo: a.correo })
  if (!error) return {}
  const m = error.message || ''
  return { error: m.includes('horario ocupado') ? 'Ese horario acaba de ser tomado. Elige otro.' : m.includes('pendientes') ? 'Ya tienes citas pendientes con este teléfono. Llámanos para otra.' : 'No pudimos guardar la cita. Revisa los datos e intenta de nuevo.' }
}

export const listCitas = async () => (await supabase.from('citas').select('*, doctor:profiles(nombre)').order('fecha').order('hora')).data || []
export const setEstado = (id, estado) => supabase.from('citas').update({ estado }).eq('id', id)
export const deleteCita = id => supabase.from('citas').delete().eq('id', id)
export const listProfiles = async () => (await supabase.from('profiles').select('id,nombre,rol,activo').order('nombre')).data || []
export const updateProfile = (id, patch) => supabase.from('profiles').update(patch).eq('id', id)
export async function enviarMensaje(m) {
  const { error } = await supabase.rpc('enviar_mensaje', { p_nombre: m.nombre, p_correo: m.correo, p_telefono: m.telefono, p_mensaje: m.mensaje })
  return { error: error ? 'No pudimos enviar el mensaje. Intenta de nuevo o escríbenos por WhatsApp.' : null }
}
export const listMensajes = async () => (await supabase.from('mensajes').select('*').order('created_at', { ascending: false })).data || []
export const deleteMensaje = id => supabase.from('mensajes').delete().eq('id', id)
