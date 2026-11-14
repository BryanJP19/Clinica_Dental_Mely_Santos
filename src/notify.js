import { ADDRESS, PHONE, SERVICES } from './data'
const hora12 = h => { const [H, M] = h.split(':').map(Number); return `${H % 12 || 12}:${String(M).padStart(2, '0')} ${H < 12 ? 'a. m.' : 'p. m.'}` }

export function confirmText(a) {
  const f = new Date(a.fecha + 'T00:00').toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' })
  const s = SERVICES.find(x => x.id === a.servicio)?.name || 'tu consulta'
  return `Hola ${a.nombre}, te confirmamos tu cita de ${s} con ${a.doctor?.nombre || 'la clínica'} el ${f} a las ${hora12(a.hora)}.\nTe esperamos en ${ADDRESS}.\nSi necesitas cambiarla, escríbenos al ${PHONE}. ¡Gracias por elegirnos!`
}
export function waLink(a) {
  let d = a.telefono.replace(/\D/g, ''); if (d.length === 10) d = '1' + d
  return `https://wa.me/${d}?text=${encodeURIComponent(confirmText(a))}`
}
export const mailLink = a => `mailto:${a.correo}?subject=${encodeURIComponent('Confirmación de tu cita · Dra. Mely Santos')}&body=${encodeURIComponent(confirmText(a))}`