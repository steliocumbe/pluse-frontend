/**
 * PLUSE sidebar menu.
 *
 * The menu is organised by operational workspaces instead of mirroring every
 * available route. This keeps the admin experience focused on what each team
 * needs to decide or execute next.
 */
export const sidebarMenu = [
  { type: 'heading', label: 'Visão geral' },
  { label: 'Dashboard', icon: 'ki-element-11', to: '/' },

  { type: 'heading', label: 'Centro de Controlo' },
  {
    label: 'Centro de comando',
    icon: 'ki-chart-line',
    children: [
      { label: 'Painel ao vivo', to: '/cco' },
      { label: 'Presenças', to: '/cco/presences' },
      { label: 'Postos cobertos', to: '/cco/coverage' },
      { label: 'Atrasos', to: '/cco/delays' },
      { label: 'Check-ins fora do raio', to: '/cco/out-of-radius' },
      { label: 'Ocorrências abertas', to: '/cco/incidents' },
    ],
  },
  {
    label: 'Presenças e check-ins',
    icon: 'ki-check-circle',
    children: [
      { label: 'Em curso', to: '/attendances/ongoing' },
      { label: 'Hoje', to: '/attendances/today' },
      { label: 'Atrasos', to: '/attendances/late' },
      { label: 'Sem check-out', to: '/attendances/missing-checkout' },
    ],
  },
  { label: 'Ocorrências', icon: 'ki-warning-2', to: '/incidents' },
  { label: 'Participações', icon: 'ki-information-2', to: '/participations' },

  { type: 'heading', label: 'Supervisão' },
  {
    label: 'Supervisor',
    icon: 'ki-route',
    children: [
      { label: 'Equipa em campo', to: '/supervisor/team' },
      { label: 'Rondas', to: '/supervisor/patrols' },
      { label: 'Validar ocorrência', to: '/supervisor/incidents/validation' },
      { label: 'Confirmar presença', to: '/supervisor/attendance-confirmation' },
    ],
  },

  { type: 'heading', label: 'Clientes e contratos' },
  { label: 'Clientes', icon: 'ki-profile-user', to: '/clients' },
  { label: 'Contratos comerciais', icon: 'ki-document', to: '/contracts' },
  {
    label: 'Postos',
    icon: 'ki-geolocation',
    children: [
      { label: 'Lista de postos', to: '/posts' },
      { label: 'Mapa operacional', to: '/posts/map' },
    ],
  },

  { type: 'heading', label: 'Escalas' },
  {
    label: 'Planeamento',
    icon: 'ki-calendar',
    children: [
      { label: 'Calendário de escalas', to: '/schedules' },
      { label: 'Por posto', to: '/schedules/by-post' },
      { label: 'Por colaborador', to: '/schedules/by-employee' },
    ],
  },
  { label: 'Marcação de presenças', icon: 'ki-user-tick', to: '/attendance' },
  { label: 'Mapa de assiduidade', icon: 'ki-map', to: '/attendance-map' },

  { type: 'heading', label: 'Recursos Humanos' },
  { label: 'Colaboradores', icon: 'ki-people', to: '/employees' },
  { label: 'Aprovações pendentes', icon: 'ki-check-circle', to: '/employees/approvals' },
  { label: 'Contratos de trabalho', icon: 'ki-document', to: '/employment-contracts' },
  {
    label: 'Férias, faltas e baixas',
    icon: 'ki-calendar-tick',
    children: [
      { label: 'Pedidos de férias', to: '/leaves' },
      { label: 'Faltas e substituições', to: '/absences' },
      { label: 'Baixas médicas', to: '/sick-leaves' },
    ],
  },
  {
    label: 'Processamento salarial',
    icon: 'ki-cheque',
    children: [
      { label: 'Folha de pagamento', to: '/payroll' },
      { label: 'Categorias salariais', to: '/payroll/categories' },
    ],
  },
  {
    label: 'Formação e certificações',
    icon: 'ki-information-2',
    children: [
      { label: 'Formações', to: '/training' },
      { label: 'Certificações', to: '/certifications' },
    ],
  },
  { label: 'Avaliação de desempenho', icon: 'ki-chart-simple', to: '/performance' },
  { label: 'Alertas de RH', icon: 'ki-warning-2', to: '/hr-alerts' },

  { type: 'heading', label: 'Ativos e equipamento' },
  { label: 'Viaturas', icon: 'ki-setting-2', to: '/assets/vehicles' },
  { label: 'Equipamentos', icon: 'ki-shield-tick', to: '/assets/equipment' },
  { label: 'Atribuições', icon: 'ki-user-tick', to: '/assets/assignments' },

  { type: 'heading', label: 'Conta' },
  { label: 'Meu perfil', icon: 'ki-profile-circle', to: '/profile' },
  { label: 'Ajuda e suporte', icon: 'ki-information-3', to: '/support' },
]

export const parkedModules = [
  { type: 'heading', label: 'Financeiro' },
  { label: 'Relatórios por período', icon: 'ki-cheque', to: '/billing/periods' },
  { label: 'Por cliente', icon: 'ki-profile-user', to: '/billing/by-client' },
  { label: 'Por contrato', icon: 'ki-document', to: '/billing/by-contract' },
  { label: 'Exportações', icon: 'ki-cloud-download', to: '/billing/exports' },

  { type: 'heading', label: 'Administração' },
  { label: 'Utilizadores', icon: 'ki-user', to: '/admin/users' },
  { label: 'Perfis e permissões', icon: 'ki-shield', to: '/admin/roles' },
  { label: 'Auditoria', icon: 'ki-information-2', to: '/admin/audit' },
  { label: 'Configurações', icon: 'ki-setting', to: '/admin/settings' },
]

export function filterMenuByGroups(menu /*, userGroups = [] */) {
  return menu
}
