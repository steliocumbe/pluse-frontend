export const fieldShift = {
  guard: 'João Mucavele',
  date: 'Quarta-feira, 13 de maio',
  currentPost: 'MozMall Entrada Norte',
  shift: '06h-18h',
  supervisor: 'Mateus Bila',
}

export const fieldSchedule = [
  { time: '05:45', title: 'Preparação', copy: 'Uniforme, equipamento e deslocação para o posto.', status: 'Concluído', tone: 'is-green', icon: 'ki-check-circle' },
  { time: '06:00', title: 'Check-in no posto', copy: 'Validar GPS e QR Code do MozMall Entrada Norte.', status: 'Agora', tone: 'is-blue', icon: 'ki-qr-code' },
  { time: '10:00', title: 'Ronda interna', copy: 'Entrada norte, parque e zona de cargas.', status: 'Pendente', tone: 'is-amber', icon: 'ki-route' },
  { time: '18:00', title: 'Check-out', copy: 'Fechar turno com localização e fotografia.', status: 'Pendente', tone: 'is-red', icon: 'ki-exit-right' },
]

export const fieldPost = {
  name: 'MozMall Entrada Norte',
  client: 'MozMall Retail',
  address: 'Av. Julius Nyerere, Maputo',
  radius: '90 m',
  qr: 'PL-P018-ENTRADA-NORTE',
  instructions: [
    'Confirmar entrada de funcionários e fornecedores.',
    'Reportar aglomerações, portas abertas ou equipamento fora do lugar.',
    'Fazer ronda interna às 10h00 e 15h30.',
  ],
}

export const offlineQueue = [
  { title: 'Check-in guardado', copy: 'MozMall Entrada Norte, 06:02, GPS confirmado.', badge: 'Pendente', tone: 'is-amber', icon: 'ki-cloud' },
  { title: 'Foto anexada', copy: 'Evidência local pronta para envio quando houver internet.', badge: '1 foto', tone: 'is-blue', icon: 'ki-picture' },
]

export const incidentTypes = ['Segurança', 'Atraso', 'Equipamento', 'Cliente', 'Emergência']
