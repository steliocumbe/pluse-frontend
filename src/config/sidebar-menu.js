/**
 * PLUSE sidebar menu.
 *
 * CURRENT PHASE: Módulo RH (Recursos Humanos).
 * Only RH-related entries are active. The rest of the product modules are
 * kept in `parkedModules` below — uncomment / move them back into
 * `sidebarMenu` as each module is built.
 *
 * Conventions:
 *   - Group with children only when there are 2+ meaningful entries.
 *   - "Novo X" actions live as buttons on list pages, NOT in the menu.
 *   - Headings stay even with a single leaf below (visual scaffolding).
 */
export const sidebarMenu = [
  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Visão geral' },
  { label: 'Dashboard', icon: 'ki-element-11', to: '/' },

  // ────────────────────────────────────────────────────────────────────────
  // Organizado pelo ciclo de vida do colaborador. Itens marcados como "🔜"
  // ainda não têm página própria — caem na PlaceholderPage via catch-all.
  { type: 'heading', label: 'Recursos Humanos' },
  { label: 'Colaboradores', icon: 'ki-people', to: '/employees' },
  { label: 'Aprovações pendentes', icon: 'ki-check-circle', to: '/employees/approvals' },
  { label: 'Contratos de trabalho', icon: 'ki-document', to: '/employment-contracts' },
  {
    label: 'Escalas e assiduidade',
    icon: 'ki-calendar',
    children: [
      { label: 'Escalas', to: '/schedules' },
      { label: 'Mapa de assiduidade', to: '/attendance-map' },
    ],
  },
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
  { label: 'Formação e certificações', icon: 'ki-information-2', to: '/training' },
  { label: 'Avaliação de desempenho', icon: 'ki-chart-simple', to: '/performance' },
  { label: 'Alertas de RH', icon: 'ki-warning-2', to: '/hr-alerts' },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Conta' },
  { label: 'Meu perfil', icon: 'ki-profile-circle', to: '/profile' },
  { label: 'Ajuda e suporte', icon: 'ki-information-3', to: '/support' },
]

/**
 * Modules parked until their phase arrives. Keeping the definitions here
 * (instead of deleting) means re-enabling a module is a copy-paste back
 * into `sidebarMenu` — no need to re-derive routes/icons.
 */
export const parkedModules = [
  { type: 'heading', label: 'Cadastros' },
  { label: 'Clientes', icon: 'ki-profile-user', to: '/clients' },
  {
    label: 'Contratos',
    icon: 'ki-document',
    children: [
      { label: 'Ativos', to: '/contracts/active' },
      { label: 'Pendentes', to: '/contracts/pending' },
      { label: 'A expirar (30 dias)', to: '/contracts/expiring' },
    ],
  },
  {
    label: 'Postos',
    icon: 'ki-geolocation',
    children: [
      { label: 'Lista', to: '/posts' },
      { label: 'Mapa', to: '/posts/map' },
    ],
  },

  { type: 'heading', label: 'Operações' },
  {
    label: 'Presenças e Check-ins',
    icon: 'ki-check-circle',
    children: [
      { label: 'Em curso', to: '/attendances/ongoing' },
      { label: 'Hoje', to: '/attendances/today' },
      { label: 'Atrasos', to: '/attendances/late' },
      { label: 'Sem check-out', to: '/attendances/missing-checkout' },
    ],
  },
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
  {
    label: 'Centro de Controlo',
    icon: 'ki-chart-line',
    children: [
      { label: 'Centro de comando', to: '/cco' },
      { label: 'Painel de presenças', to: '/cco/presences' },
      { label: 'Postos cobertos', to: '/cco/coverage' },
      { label: 'Atrasos', to: '/cco/delays' },
      { label: 'Fora do raio', to: '/cco/out-of-radius' },
      { label: 'Ocorrências abertas', to: '/cco/incidents' },
    ],
  },

  { type: 'heading', label: 'Faturação' },
  { label: 'Relatórios por período', icon: 'ki-cheque', to: '/billing/periods' },
  { label: 'Por cliente', icon: 'ki-profile-user', to: '/billing/by-client' },
  { label: 'Por contrato', icon: 'ki-document', to: '/billing/by-contract' },
  { label: 'Exportações', icon: 'ki-cloud-download', to: '/billing/exports' },

  { type: 'heading', label: 'Ativos e equipamento' },
  { label: 'Lista', icon: 'ki-setting-2', to: '/assets' },
  { label: 'Atribuições', icon: 'ki-user-tick', to: '/assets/assignments' },
  { label: 'Movimentação', icon: 'ki-route', to: '/assets/transfers' },

  { type: 'heading', label: 'Administração' },
  { label: 'Utilizadores', icon: 'ki-user', to: '/admin/users' },
  { label: 'Perfis e permissões', icon: 'ki-shield', to: '/admin/roles' },
  { label: 'Auditoria', icon: 'ki-information-2', to: '/admin/audit' },
  { label: 'Configurações', icon: 'ki-setting', to: '/admin/settings' },
]

/**
 * Filter the menu tree by the current user's groups.
 * Currently a passthrough — kept here so when we introduce frontend
 * role gating, components don't need to change call sites.
 */
export function filterMenuByGroups(menu /*, userGroups = [] */) {
  return menu
}
