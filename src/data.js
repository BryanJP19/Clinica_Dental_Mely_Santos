export const WHATSAPP = '18494535436'
export const PHONE = '(849) 453-5436'
export const ADDRESS = 'Uniremos, Santo Domingo · Av. Abraham Lincoln #126'
export const HOURS = [['Lunes a viernes', '8:00 a. m. – 5:00 p. m.'], ['Sábados', '8:00 a. m. – 12:00 m.']]
export const SERVICES = [
  { id: 'ortodoncia', name: 'Ortodoncia', desc: 'Brackets y alineadores para una mordida correcta y una sonrisa alineada.', perks: 'Evaluación personalizada · controles mensuales' },
  { id: 'blanqueamiento', name: 'Blanqueamiento dental', desc: 'Aclara varios tonos en una sola sesión, cuidando el esmalte.', perks: 'Resultado visible el mismo día' },
  { id: 'endodoncia', name: 'Endodoncia', desc: 'Tratamiento de conductos para salvar la pieza dental sin dolor.', perks: 'Anestesia local · menos sesiones' },
  { id: 'limpieza', name: 'Limpieza profunda', desc: 'Eliminación de sarro y placa para encías sanas y aliento fresco.', perks: 'Recomendada cada 6 meses' },
  { id: 'estetica', name: 'Estética dental', desc: 'Carillas y diseño de sonrisa a la medida de tu rostro.', perks: 'Diseño previo antes de iniciar' },
]
export const slotsFor = d => { const w = new Date(d + 'T00:00').getDay(); return w === 6 ? [['Mañana', ['08:00','09:00','10:00','11:00']]] : [['Mañana', ['08:00','09:00','10:00','11:00']], ['Tarde', ['13:00','14:00','15:00','16:00']]] }
export const STATUS = ['Pendiente', 'Confirmada', 'Completada']
