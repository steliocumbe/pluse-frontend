export const supervisorStats = [
  { label: 'Equipa em campo', value: '38', copy: 'vigilantes em serviço no turno atual', icon: 'ki-people', tone: 'is-blue' },
  { label: 'Rondas em curso', value: '12', copy: '3 com validação pendente', icon: 'ki-route', tone: 'is-green' },
  { label: 'Ocorrências', value: '7', copy: '2 críticas aguardam decisão', icon: 'ki-warning-2', tone: 'is-red' },
  { label: 'Presenças por confirmar', value: '9', copy: 'fora do raio ou sem evidência completa', icon: 'ki-check-circle', tone: 'is-amber' },
]

export const supervisorCommand = [
  {
    title: 'Confirmar presença duvidosa',
    copy: 'Resolver entradas fora do raio, offline ou sem evidência suficiente.',
    icon: 'ki-check-circle',
    tone: 'is-amber',
  },
  {
    title: 'Acompanhar ronda',
    copy: 'Ver quem está no terreno e que postos precisam de visita.',
    icon: 'ki-route',
    tone: 'is-blue',
  },
  {
    title: 'Escalar à Base de Operações',
    copy: 'Enviar apenas casos bloqueantes ou críticos para decisão central.',
    icon: 'ki-chart-line',
    tone: 'is-red',
  },
]

export const fieldTeam = [
  { name: 'João Mucavele', post: 'MozMall Entrada Norte', status: 'Em serviço', last: 'Check-in 05:52', variant: 'success' },
  { name: 'Lúcia Cossa', post: 'Banco Central Cofre', status: 'Em ronda', last: 'Última evidência 09:18', variant: 'primary' },
  { name: 'Rui Matola', post: 'Porto Gate 4', status: 'Atrasado', last: 'Entrada 06:31 fora do raio', variant: 'warning' },
  { name: 'Ana Macamo', post: 'Hospital Ala Sul', status: 'Ausente', last: 'Sem check-in', variant: 'danger' },
]

export const patrols = [
  { title: 'MozMall - Ronda interna', progress: '4/5 pontos', owner: 'João Mucavele', status: 'Em curso', variant: 'primary', tone: 'is-blue' },
  { title: 'Banco Central - Cofre', progress: '6/6 pontos', owner: 'Lúcia Cossa', status: 'Concluída', variant: 'success', tone: 'is-green' },
  { title: 'Porto Gate 4 - Perímetro', progress: '1/4 pontos', owner: 'Rui Matola', status: 'Atrasada', variant: 'warning', tone: 'is-amber' },
]

export const supervisorIncidents = [
  { code: 'OC-1028', title: 'Posto descoberto', post: 'Porto Gate 4', evidence: 'Sem entrada confirmada', status: 'Decidir', variant: 'danger' },
  { code: 'OC-1027', title: 'Check-in fora do raio', post: 'Hospital Ala Sul', evidence: 'GPS a 180 m, foto pendente', status: 'Validar', variant: 'warning' },
  { code: 'OC-1024', title: 'Ronda sem evidência', post: 'Banco Central Cofre', evidence: 'Falta fotografia do ponto 3', status: 'Rever', variant: 'primary' },
]

export const attendanceConfirmations = [
  { name: 'Rui Matola', post: 'Porto Gate 4', reason: 'GPS fora do raio', action: 'Confirmar com ressalva', variant: 'warning' },
  { name: 'Ana Macamo', post: 'Hospital Ala Sul', reason: 'Sem check-in', action: 'Marcar ausência', variant: 'danger' },
  { name: 'Carlos Bila', post: 'MozMall Parque', reason: 'Offline sincronizado', action: 'Confirmar presença', variant: 'success' },
]
