/**
 * PLUSE sidebar menu.
 *
 * `sidebarMenu` lista APENAS o que já está construído e funcional. Tudo o
 * que ainda está por construir vive em `parkedModules`, organizado pelo
 * roteiro de fases — à medida que cada área é implementada, move-se a
 * respectiva entrada de `parkedModules` para `sidebarMenu`.
 *
 * Convenções:
 *   - Grupo com `children` só quando há 2+ entradas úteis.
 *   - Acções "Novo X" são botões nas páginas de lista, NÃO no menu.
 *   - Headings ficam mesmo com uma só folha abaixo (estrutura visual).
 */
export const sidebarMenu = [
  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Visão geral' },
  { label: 'Dashboard', icon: 'ki-element-11', to: '/' },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Recursos Humanos' },
  { label: 'Colaboradores', icon: 'ki-people', to: '/employees' },
  { label: 'Aprovações pendentes', icon: 'ki-check-circle', to: '/employees/approvals' },
  { label: 'Contratos de trabalho', icon: 'ki-document', to: '/employment-contracts' },
  {
    label: 'Escalas e assiduidade',
    icon: 'ki-calendar',
    children: [
      { label: 'Escalas', to: '/schedules' },
      { label: 'Marcação de presenças', to: '/attendance' },
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
  {
    label: 'Formação e certificações',
    icon: 'ki-information-2',
    children: [
      { label: 'Formações', to: '/training' },
      { label: 'Certificações', to: '/certifications' },
    ],
  },
  { label: 'Avaliação de desempenho', icon: 'ki-chart-simple', to: '/performance' },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Cadastros' },
  { label: 'Clientes', icon: 'ki-profile-user', to: '/clients' },
  { label: 'Postos', icon: 'ki-geolocation', to: '/posts' },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Conta' },
  { label: 'Meu perfil', icon: 'ki-profile-circle', to: '/profile' },
  { label: 'Ajuda e suporte', icon: 'ki-information-3', to: '/support' },
]

/**
 * Áreas ainda por construir — escondidas do menu até a fase respectiva.
 * Re-activar = copiar a entrada para `sidebarMenu`. Mantidas aqui para não
 * re-derivar rotas/ícones e para servir de mapa do roteiro.
 */
export const parkedModules = [
  // ── RH — próximas fases ─────────────────────────────────────────────────
  { type: 'heading', label: 'Recursos Humanos — próximas fases' },
  { label: 'Alertas de RH', icon: 'ki-warning-2', to: '/hr-alerts' },

  // ── Operações (Fase 4) ──────────────────────────────────────────────────
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

  // ── Financeiro (Fase 5) ─────────────────────────────────────────────────
  { type: 'heading', label: 'Financeiro' },
  { label: 'Relatórios por período', icon: 'ki-cheque', to: '/billing/periods' },
  { label: 'Por cliente', icon: 'ki-profile-user', to: '/billing/by-client' },
  { label: 'Por contrato', icon: 'ki-document', to: '/billing/by-contract' },
  { label: 'Exportações', icon: 'ki-cloud-download', to: '/billing/exports' },

  // ── Ativos e equipamento ────────────────────────────────────────────────
  { type: 'heading', label: 'Ativos e equipamento' },
  { label: 'Lista', icon: 'ki-setting-2', to: '/assets' },
  { label: 'Atribuições', icon: 'ki-user-tick', to: '/assets/assignments' },
  { label: 'Movimentação', icon: 'ki-route', to: '/assets/transfers' },

  // ── Administração ───────────────────────────────────────────────────────
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
