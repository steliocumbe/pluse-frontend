/**
 * PLUSE sidebar menu.
 *
 * Keep the sidebar honest: only screens with real operational behaviour or
 * backend-backed data should be visible here. Presentation/demo routes can
 * remain accessible directly, but should not compete with daily work.
 */
export const sidebarMenu = [
  { type: 'heading', label: 'Visão geral' },
  { label: 'Dashboard', icon: 'ki-element-11', to: '/' },

  { type: 'heading', label: 'Centro de Controlo' },
  { label: 'Centro de controle', icon: 'ki-chart-line', to: '/cco' },
  { label: 'Ocorrências', icon: 'ki-warning-2', to: '/incidents' },
  { label: 'Participações', icon: 'ki-information-2', to: '/participations' },

  { type: 'heading', label: 'Supervisão' },
  { label: 'Rondas e supervisões', icon: 'ki-route', to: '/supervisor/patrols' },

  { type: 'heading', label: 'Clientes e operação' },
  { label: 'Contratos de cliente', icon: 'ki-document', to: '/client-contracts' },
  { label: 'Clientes', icon: 'ki-profile-user', to: '/clients' },
  { label: 'Postos', icon: 'ki-geolocation', to: '/posts' },
  { label: 'Registo de serviços', icon: 'ki-briefcase', to: '/service-catalog' },

  { type: 'heading', label: 'Escalas e assiduidade' },
  { label: 'Escalas', icon: 'ki-calendar', to: '/schedules' },
  { label: 'Marcação de presenças', icon: 'ki-user-tick', to: '/attendance' },
  { label: 'Mapa de assiduidade', icon: 'ki-map', to: '/attendance-map' },

  { type: 'heading', label: 'Recursos Humanos' },
  { label: 'Colaboradores', icon: 'ki-people', to: '/employees' },
  { label: 'Aprovações pendentes', icon: 'ki-check-circle', to: '/employees/approvals' },
  { label: 'Contratos de trabalho', icon: 'ki-document', to: '/employment-contracts' },
  { label: 'Pedidos de férias', icon: 'ki-calendar-tick', to: '/leaves' },
  { label: 'Planos de férias', icon: 'ki-calendar-tick', to: '/hr/vacation-plans' },
  { label: 'Saldo de férias', icon: 'ki-chart-simple', to: '/hr/vacation-balances' },
  { label: 'Faltas e substituições', icon: 'ki-user', to: '/absences' },
  { label: 'Baixas médicas', icon: 'ki-shield-tick', to: '/sick-leaves' },
  { label: 'Folha de pagamento', icon: 'ki-cheque', to: '/payroll' },

  { type: 'heading', label: 'Contabilidade e finanças' },
  { label: 'Plano de contas', icon: 'ki-bank', to: '/finance/accounts' },
  { label: 'Diário contabilístico', icon: 'ki-document', to: '/finance/journal' },
  { label: 'Faturação', icon: 'ki-cheque', to: '/finance/billing' },

  { type: 'heading', label: 'Ativos e equipamento' },
  { label: 'Viaturas', icon: 'ki-setting-2', to: '/assets/vehicles' },
  { label: 'Equipamentos', icon: 'ki-shield-tick', to: '/assets/equipment' },
  { label: 'Atribuições', icon: 'ki-user-tick', to: '/assets/assignments' },

  { type: 'heading', label: 'Administração' },
  { label: 'Configurações', icon: 'ki-setting', to: '/admin/settings' },
  { label: 'Licença do sistema', icon: 'ki-shield-tick', to: '/admin/license' },
]

export const parkedModules = [
  { type: 'heading', label: 'Demonstração e fluxos em desenho' },
  { label: 'Contratos comerciais', icon: 'ki-document', to: '/contracts' },
  { label: 'Mapa operacional de postos', icon: 'ki-geolocation', to: '/posts/map' },
  { label: 'Painel de presenças CCO', icon: 'ki-check-circle', to: '/cco/presences' },
  { label: 'Postos cobertos CCO', icon: 'ki-shield-tick', to: '/cco/coverage' },
  { label: 'Atrasos CCO', icon: 'ki-time', to: '/cco/delays' },
  { label: 'Check-ins fora do raio CCO', icon: 'ki-geolocation', to: '/cco/out-of-radius' },
  { label: 'Ocorrências abertas CCO', icon: 'ki-warning-2', to: '/cco/incidents' },
  { label: 'Equipa em campo', icon: 'ki-people', to: '/supervisor/team' },
  { label: 'Validação de ocorrência', icon: 'ki-search-list', to: '/supervisor/incidents/validation' },
  { label: 'Confirmação de presença', icon: 'ki-check-circle', to: '/supervisor/attendance-confirmation' },
  { label: 'Presenças em curso', icon: 'ki-check-circle', to: '/attendances/ongoing' },
  { label: 'Presenças de hoje', icon: 'ki-user-tick', to: '/attendances/today' },
  { label: 'Atrasos de presença', icon: 'ki-time', to: '/attendances/late' },
  { label: 'Sem check-out', icon: 'ki-exit-right', to: '/attendances/missing-checkout' },

  { type: 'heading', label: 'Recursos Humanos futuros' },
  { label: 'Formações', icon: 'ki-information-2', to: '/training' },
  { label: 'Certificações', icon: 'ki-medal-star', to: '/certifications' },
  { label: 'Avaliação de desempenho', icon: 'ki-chart-simple', to: '/performance' },
  { label: 'Alertas de RH', icon: 'ki-warning-2', to: '/hr-alerts' },

  { type: 'heading', label: 'Financeiro futuro' },
  { label: 'Categorias salariais', icon: 'ki-dollar', to: '/payroll/categories' },
  { label: 'Relatórios por período', icon: 'ki-cheque', to: '/billing/periods' },
  { label: 'Por cliente', icon: 'ki-profile-user', to: '/billing/by-client' },
  { label: 'Por contrato', icon: 'ki-document', to: '/billing/by-contract' },
  { label: 'Exportações', icon: 'ki-cloud-download', to: '/billing/exports' },

  { type: 'heading', label: 'Administração futura' },
  { label: 'Utilizadores', icon: 'ki-user', to: '/admin/users' },
  { label: 'Perfis e permissões', icon: 'ki-shield', to: '/admin/roles' },
  { label: 'Auditoria', icon: 'ki-information-2', to: '/admin/audit' },
  { label: 'Configurações', icon: 'ki-setting', to: '/admin/settings' },
]

export function filterMenuByGroups(menu /*, userGroups = [] */) {
  return menu
}
