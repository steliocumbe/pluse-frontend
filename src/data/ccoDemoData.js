export const ccoFilters = {
  clients: ['Todos os clientes', 'MozMall Retail', 'Porto Logística', 'Banco Central', 'Hospital Maputo'],
  posts: ['Todos os postos', 'MozMall Entrada Norte', 'Porto Gate 4', 'Banco Central Cofre', 'Hospital Ala Sul'],
  shifts: ['Turno atual', '06h-12h', '12h-18h', '18h-00h', '00h-06h'],
  zones: ['Todas as zonas', 'Centro urbano', 'Zona industrial', 'Baixa', 'Zona hospitalar'],
}

export const ccoStats = [
  { label: 'Postos cobertos', value: '181/184', copy: '98% da cobertura prevista', icon: 'ki-shield-tick', tone: 'is-blue' },
  { label: 'Presenças confirmadas', value: '312', copy: 'GPS, QR Code ou foto validados', icon: 'ki-check-circle', tone: 'is-green' },
  { label: 'Atrasos ativos', value: '18', copy: '9 encaminhados ao supervisor', icon: 'ki-time', tone: 'is-amber' },
  { label: 'Ocorrências abertas', value: '27', copy: '3 críticas para decisão imediata', icon: 'ki-warning-2', tone: 'is-red' },
]

export const commandQueues = [
  { title: 'Porto Gate 4 descoberto', copy: 'Turno noturno sem vigilante confirmado. Substituição precisa ser publicada.', badge: 'Crítico', variant: 'danger', icon: 'ki-warning-2', tone: 'is-red', time: '09:42' },
  { title: 'Check-in fora do raio', copy: 'Rui Matola registou entrada a 420m do posto contratado.', badge: 'GPS', variant: 'warning', icon: 'ki-geolocation', tone: 'is-amber', time: '09:31' },
  { title: 'Registos offline pendentes', copy: '14 presenças aguardam sincronização automática no terreno.', badge: '14', variant: 'info', icon: 'ki-cloud', tone: 'is-blue', time: '09:18' },
  { title: 'Ocorrência crítica aberta', copy: 'Hospital Ala Sul sem confirmação de vigilante no início do turno.', badge: 'Crítica', variant: 'danger', icon: 'ki-notification-status', tone: 'is-red', time: '08:57' },
]

export const coverageRows = [
  { post: 'MozMall Entrada Norte', client: 'MozMall Retail', zone: 'Centro urbano', expected: '2', present: '2', supervisor: 'Mateus Bila', status: 'Coberto', variant: 'success' },
  { post: 'Porto Gate 4', client: 'Porto Logística', zone: 'Zona industrial', expected: '2', present: '1', supervisor: 'Sandra Nhantumbo', status: 'Descoberto', variant: 'danger' },
  { post: 'Banco Central Cofre', client: 'Banco Central', zone: 'Baixa', expected: '3', present: '3', supervisor: 'Mateus Bila', status: 'Coberto', variant: 'primary' },
  { post: 'Hospital Ala Sul', client: 'Hospital Maputo', zone: 'Zona hospitalar', expected: '1', present: '0', supervisor: 'Carlos Sitoe', status: 'Sem entrada', variant: 'warning' },
]

export const outOfRadiusRows = [
  { person: 'Rui Matola', post: 'Porto Gate 4', client: 'Porto Logística', distance: '420 m', time: '06:31', validation: 'Supervisor acionado', status: 'Rever', variant: 'warning' },
  { person: 'Ana Macamo', post: 'Hospital Ala Sul', client: 'Hospital Maputo', distance: '180 m', time: '06:44', validation: 'Foto pendente', status: 'Bloqueado', variant: 'danger' },
  { person: 'Carlos Bila', post: 'MozMall Parque', client: 'MozMall Retail', distance: '95 m', time: '07:02', validation: 'Dentro da tolerância', status: 'Aceite', variant: 'success' },
  { person: 'Fátima Mabunda', post: 'Armazém Matola', client: 'Porto Logística', distance: '240 m', time: '07:18', validation: 'A aguardar justificativo', status: 'Pendente', variant: 'warning' },
]

export const incidentRows = [
  { code: 'OC-1028', title: 'Posto descoberto', post: 'Porto Gate 4', client: 'Porto Logística', owner: 'Sandra Nhantumbo', priority: 'Crítica', status: 'Em decisão', variant: 'danger' },
  { code: 'OC-1027', title: 'Check-in fora do raio', post: 'Hospital Ala Sul', client: 'Hospital Maputo', owner: 'Carlos Sitoe', priority: 'Alta', status: 'Em análise', variant: 'warning' },
  { code: 'OC-1024', title: 'Ronda sem evidência fotográfica', post: 'Banco Central Cofre', client: 'Banco Central', owner: 'Mateus Bila', priority: 'Média', status: 'A validar', variant: 'primary' },
  { code: 'OC-1019', title: 'Equipamento não devolvido', post: 'MozMall Entrada Norte', client: 'MozMall Retail', owner: 'Operações', priority: 'Baixa', status: 'Aberta', variant: 'success' },
]

export const delayRows = [
  { person: 'Rui Matola', post: 'Porto Gate 4', client: 'Porto Logística', expected: '06:00', actual: '06:31', impact: 'Posto parcialmente descoberto', status: 'Escalado', variant: 'danger' },
  { person: 'Carlos Bila', post: 'MozMall Parque', client: 'MozMall Retail', expected: '06:00', actual: '06:19', impact: 'Sem impacto no cliente', status: 'Justificar', variant: 'warning' },
  { person: 'Fátima Mabunda', post: 'Armazém Matola', client: 'Porto Logística', expected: '06:00', actual: '06:22', impact: 'Aguardou substituição', status: 'Resolvido', variant: 'success' },
  { person: 'Ana Macamo', post: 'Hospital Ala Sul', client: 'Hospital Maputo', expected: '06:00', actual: 'Sem entrada', impact: 'Posto descoberto', status: 'Crítico', variant: 'danger' },
]
