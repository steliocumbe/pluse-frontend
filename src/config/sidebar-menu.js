/**
 * PLUSE sidebar menu — mapped 1:1 to the 12 product modules.
 *
 * Conventions:
 *   - Group with children only when there are 2+ meaningful entries.
 *   - "Novo X" actions live as buttons on the list pages, NOT in the menu.
 *   - Headings stay even with a single leaf below (visual scaffolding).
 *   - Section headings absorb their sole group's name when there's only one
 *     group (e.g. "Faturação" replaces "Financeiro > Faturação").
 *
 * NOTE: role-based filtering will be reintroduced when frontend permissions
 * land. For now the whole menu is shown to all authenticated users —
 * the backend enforces permission per request.
 */
export const sidebarMenu = [
  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Visão geral' },
  { label: 'Dashboard', icon: 'ki-element-11', to: '/' },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Cadastros' },
  {
    label: 'Colaboradores',
    icon: 'ki-people',
    children: [
      { label: 'Lista', to: '/employees' },
      { label: 'Aprovações pendentes', to: '/employees/approvals' },
    ],
  },
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

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Operações' },
  {
    label: 'Escalas',
    icon: 'ki-calendar',
    children: [
      { label: 'Calendário', to: '/schedules' },
      { label: 'Por posto', to: '/schedules/by-post' },
      { label: 'Por colaborador', to: '/schedules/by-employee' },
    ],
  },
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
    label: 'Vigilante Mobile',
    icon: 'ki-phone',
    children: [
      { label: 'Escala do dia', to: '/#/vigilante/escala', external: true },
      { label: 'Detalhe do posto', to: '/#/vigilante/posto', external: true },
      { label: 'Check-in GPS/QR', to: '/#/vigilante/check-in', external: true },
      { label: 'Resultado do check-in', to: '/#/vigilante/resultado', external: true },
      { label: 'Offline pendente', to: '/#/vigilante/offline', external: true },
      { label: 'Nova ocorrência', to: '/#/vigilante/ocorrencia', external: true },
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
    label: 'Centro de Controlo Operacional',
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
  {
    label: 'Ocorrências',
    icon: 'ki-warning-2',
    children: [
      { label: 'Abertas', to: '/incidents/open' },
      { label: 'Em análise', to: '/incidents/in-review' },
      { label: 'Resolvidas', to: '/incidents/resolved' },
    ],
  },
  {
    label: 'Rondas',
    icon: 'ki-route',
    children: [
      { label: 'Em curso', to: '/patrols/ongoing' },
      { label: 'Histórico', to: '/patrols' },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // Section heading absorbs the (only) group name "Faturação".
  { type: 'heading', label: 'Faturação' },
  { label: 'Relatórios por período', icon: 'ki-cheque', to: '/billing/periods' },
  { label: 'Por cliente', icon: 'ki-profile-user', to: '/billing/by-client' },
  { label: 'Por contrato', icon: 'ki-document', to: '/billing/by-contract' },
  { label: 'Exportações', icon: 'ki-cloud-download', to: '/billing/exports' },

  // ────────────────────────────────────────────────────────────────────────
  // Section heading absorbs the (only) group name "Ativos e equipamento".
  { type: 'heading', label: 'Ativos e equipamento' },
  { label: 'Lista', icon: 'ki-setting-2', to: '/assets' },
  { label: 'Atribuições', icon: 'ki-user-tick', to: '/assets/assignments' },
  { label: 'Movimentação', icon: 'ki-route', to: '/assets/transfers' },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Administração' },
  { label: 'Utilizadores', icon: 'ki-user', to: '/admin/users' },
  { label: 'Perfis e permissões', icon: 'ki-shield', to: '/admin/roles' },
  { label: 'Auditoria', icon: 'ki-information-2', to: '/admin/audit' },
  { label: 'Configurações', icon: 'ki-setting', to: '/admin/settings' },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Conta' },
  { label: 'Meu perfil', icon: 'ki-profile-circle', to: '/profile' },
  { label: 'Ajuda e suporte', icon: 'ki-information-3', to: '/support' },
]

/**
 * Filter the menu tree by the current user's groups.
 * Currently a passthrough — kept here so when we introduce frontend
 * role gating, components don't need to change call sites.
 */
export function filterMenuByGroups(menu /*, userGroups = [] */) {
  return menu
}
