/**
 * PLUSE sidebar menu definition.
 *
 * Each entry is one of:
 *   { type: 'heading', label }                    → uppercase section header
 *   { type: 'divider' }                           → visual separator
 *   { label, icon, to }                           → leaf link
 *   { label, icon, to, badge }                    → leaf link with chip (e.g. "Em breve")
 *   { label, icon, children: [...] }              → group with collapsible submenu
 *
 * `roles`: optional array of group names — entry only renders when the
 * authenticated user belongs to at least one of them. Omit to show to all.
 * Mirrors Django groups created by `manage.py seed_roles`:
 *   Administrador, Direcao, RH, CCO, Financeiro, Supervisor, Vigilante.
 *
 * `to` paths are placeholders — they render a `PlaceholderPage` until the
 * real page is implemented. The catch-all in routes.js handles unknown ones.
 */
export const sidebarMenu = [
  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Visão geral' },
  {
    label: 'Dashboards',
    icon: 'ki-element-11',
    children: [
      { label: 'Operacional', to: '/dashboards/operacional' },
      { label: 'Financeiro', to: '/dashboards/financeiro', roles: ['Administrador', 'Direcao', 'Financeiro'] },
      { label: 'RH', to: '/dashboards/rh', roles: ['Administrador', 'Direcao', 'RH'] },
      { label: 'Vigilante', to: '/dashboards/vigilante', roles: ['Vigilante'] },
    ],
  },
  {
    label: 'Mapa em tempo real',
    icon: 'ki-geolocation',
    to: '/operacao/mapa',
    badge: 'Em breve',
    roles: ['Administrador', 'Direcao', 'CCO', 'Supervisor'],
  },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Operações' },
  {
    label: 'Postos',
    icon: 'ki-shop',
    children: [
      { label: 'Lista de postos', to: '/postos' },
      { label: 'Mapa de postos', to: '/postos/mapa' },
      { label: 'QR codes', to: '/postos/qr-codes' },
      { label: 'Novo posto', to: '/postos/novo' },
    ],
  },
  {
    label: 'Escalas',
    icon: 'ki-calendar',
    children: [
      { label: 'Calendário', to: '/escalas' },
      { label: 'Por posto', to: '/escalas/por-posto' },
      { label: 'Por colaborador', to: '/escalas/por-colaborador' },
      { label: 'Substituições', to: '/escalas/substituicoes' },
      { label: 'Aprovações pendentes', to: '/escalas/aprovacoes', badge: '3' },
      { label: 'Nova escala', to: '/escalas/nova' },
    ],
  },
  {
    label: 'Presenças',
    icon: 'ki-check-circle',
    children: [
      { label: 'Hoje', to: '/presencas/hoje' },
      { label: 'Histórico', to: '/presencas' },
      { label: 'Ausências', to: '/presencas/ausencias' },
      { label: 'Atrasos', to: '/presencas/atrasos' },
      { label: 'Sem check-out', to: '/presencas/sem-checkout' },
    ],
  },
  {
    label: 'Check-ins',
    icon: 'ki-qr-code',
    children: [
      { label: 'Em curso', to: '/checkins/em-curso' },
      { label: 'Pendentes de validação', to: '/checkins/pendentes' },
      { label: 'Fora do posto', to: '/checkins/fora-posto', badge: 'Alerta' },
    ],
  },
  {
    label: 'Ocorrências',
    icon: 'ki-warning-2',
    children: [
      { label: 'Abertas', to: '/ocorrencias/abertas' },
      { label: 'Em análise', to: '/ocorrencias/em-analise' },
      { label: 'Resolvidas', to: '/ocorrencias/resolvidas' },
      { label: 'Por tipo', to: '/ocorrencias/por-tipo' },
      { label: 'Nova ocorrência', to: '/ocorrencias/nova' },
    ],
  },
  {
    label: 'Rondas',
    icon: 'ki-route',
    children: [
      { label: 'Em curso', to: '/rondas/em-curso' },
      { label: 'Histórico', to: '/rondas' },
      { label: 'Por posto', to: '/rondas/por-posto' },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Cadastros' },
  {
    label: 'Colaboradores',
    icon: 'ki-people',
    roles: ['Administrador', 'Direcao', 'RH', 'CCO'],
    children: [
      { label: 'Vigilantes', to: '/colaboradores/vigilantes' },
      { label: 'Supervisores', to: '/colaboradores/supervisores' },
      { label: 'Funcionários internos', to: '/colaboradores/internos' },
      { label: 'Aprovações pendentes', to: '/colaboradores/aprovacoes', badge: 'RH' },
      { label: 'Documentos', to: '/colaboradores/documentos' },
      { label: 'Certificados', to: '/colaboradores/certificados' },
      { label: 'Histórico disciplinar', to: '/colaboradores/disciplinar', roles: ['Administrador', 'RH'] },
      { label: 'Novo colaborador', to: '/colaboradores/novo' },
    ],
  },
  {
    label: 'Clientes',
    icon: 'ki-profile-user',
    roles: ['Administrador', 'Direcao', 'CCO', 'Financeiro'],
    children: [
      { label: 'Lista', to: '/clientes' },
      { label: 'Activos', to: '/clientes/activos' },
      { label: 'Inactivos', to: '/clientes/inactivos' },
      { label: 'Contactos', to: '/clientes/contactos' },
      { label: 'Novo cliente', to: '/clientes/novo' },
    ],
  },
  {
    label: 'Contratos',
    icon: 'ki-document',
    roles: ['Administrador', 'Direcao', 'Financeiro'],
    children: [
      { label: 'Activos', to: '/contratos/activos' },
      { label: 'Pendentes', to: '/contratos/pendentes' },
      { label: 'Suspensos', to: '/contratos/suspensos' },
      { label: 'Encerrados', to: '/contratos/encerrados' },
      { label: 'A expirar (30 dias)', to: '/contratos/a-expirar', badge: 'Alerta' },
      { label: 'Aprovações', to: '/contratos/aprovacoes', roles: ['Administrador', 'Direcao'] },
      { label: 'Novo contrato', to: '/contratos/novo' },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Logística' },
  {
    label: 'Activos',
    icon: 'ki-setting-2',
    children: [
      { label: 'Lista', to: '/activos' },
      { label: 'Por categoria', to: '/activos/categorias' },
      { label: 'Atribuições', to: '/activos/atribuicoes' },
      { label: 'Movimentação', to: '/activos/movimentacao' },
      { label: 'Manutenção', to: '/activos/manutencao' },
      { label: 'Em falta', to: '/activos/em-falta', badge: 'Alerta' },
    ],
  },
  {
    label: 'Fardamento',
    icon: 'ki-user-edit',
    children: [
      { label: 'Stock', to: '/fardamento/stock' },
      { label: 'Distribuições', to: '/fardamento/distribuicoes' },
      { label: 'Devoluções', to: '/fardamento/devolucoes' },
      { label: 'Pedidos', to: '/fardamento/pedidos' },
    ],
  },
  {
    label: 'Equipamento',
    icon: 'ki-phone',
    children: [
      { label: 'Rádios', to: '/equipamento/radios' },
      { label: 'Lanternas', to: '/equipamento/lanternas' },
      { label: 'Coletes', to: '/equipamento/coletes' },
      { label: 'Outros', to: '/equipamento/outros' },
    ],
  },
  {
    label: 'Frota',
    icon: 'ki-compass',
    badge: 'Em breve',
    children: [
      { label: 'Veículos', to: '/frota/veiculos' },
      { label: 'Manutenção', to: '/frota/manutencao' },
      { label: 'Combustível', to: '/frota/combustivel' },
      { label: 'Tracking GPS', to: '/frota/tracking' },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Financeiro' },
  {
    label: 'Faturação',
    icon: 'ki-cheque',
    roles: ['Administrador', 'Direcao', 'Financeiro'],
    children: [
      { label: 'Por cliente', to: '/faturacao/por-cliente' },
      { label: 'Por contrato', to: '/faturacao/por-contrato' },
      { label: 'Por período', to: '/faturacao/por-periodo' },
      { label: 'Rascunhos', to: '/faturacao/rascunhos' },
      { label: 'Emitidas', to: '/faturacao/emitidas' },
      { label: 'Pagas', to: '/faturacao/pagas' },
      { label: 'Em atraso', to: '/faturacao/em-atraso', badge: 'Alerta' },
      { label: 'Nova factura', to: '/faturacao/nova' },
    ],
  },
  {
    label: 'Cobrança',
    icon: 'ki-dollar',
    roles: ['Administrador', 'Direcao', 'Financeiro'],
    children: [
      { label: 'Recebimentos', to: '/cobranca/recebimentos' },
      { label: 'Pendentes', to: '/cobranca/pendentes' },
      { label: 'Conciliação', to: '/cobranca/conciliacao' },
    ],
  },
  {
    label: 'Despesas',
    icon: 'ki-wallet',
    roles: ['Administrador', 'Direcao', 'Financeiro'],
    children: [
      { label: 'Salários', to: '/despesas/salarios' },
      { label: 'Operacionais', to: '/despesas/operacionais' },
      { label: 'Fardamento e equipamento', to: '/despesas/fardamento' },
      { label: 'Manutenção', to: '/despesas/manutencao' },
      { label: 'Outras', to: '/despesas/outras' },
    ],
  },
  {
    label: 'Impostos & Fiscal',
    icon: 'ki-bank',
    roles: ['Administrador', 'Financeiro'],
    children: [
      { label: 'IVA', to: '/fiscal/iva' },
      { label: 'INSS', to: '/fiscal/inss' },
      { label: 'IRPS', to: '/fiscal/irps' },
      { label: 'Declarações', to: '/fiscal/declaracoes' },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'RH & Folha' },
  {
    label: 'Folha de pagamento',
    icon: 'ki-cheque',
    roles: ['Administrador', 'Direcao', 'RH', 'Financeiro'],
    children: [
      { label: 'Mensal', to: '/folha/mensal' },
      { label: 'Horas extra', to: '/folha/horas-extra' },
      { label: 'Bónus', to: '/folha/bonus' },
      { label: 'Descontos', to: '/folha/descontos' },
      { label: 'Histórico', to: '/folha/historico' },
    ],
  },
  {
    label: 'Férias & ausências',
    icon: 'ki-calendar-tick',
    roles: ['Administrador', 'RH', 'Direcao'],
    children: [
      { label: 'Pedidos pendentes', to: '/ferias/pedidos', badge: 'RH' },
      { label: 'Calendário', to: '/ferias/calendario' },
      { label: 'Saldos', to: '/ferias/saldos' },
      { label: 'Atestados médicos', to: '/ferias/atestados' },
    ],
  },
  {
    label: 'Recrutamento',
    icon: 'ki-user-tick',
    roles: ['Administrador', 'RH'],
    badge: 'Em breve',
    children: [
      { label: 'Vagas abertas', to: '/recrutamento/vagas' },
      { label: 'Candidatos', to: '/recrutamento/candidatos' },
      { label: 'Entrevistas', to: '/recrutamento/entrevistas' },
    ],
  },
  {
    label: 'Formação',
    icon: 'ki-information-2',
    roles: ['Administrador', 'RH'],
    children: [
      { label: 'Cursos', to: '/formacao/cursos' },
      { label: 'Inscrições', to: '/formacao/inscricoes' },
      { label: 'Certificados emitidos', to: '/formacao/certificados' },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Relatórios' },
  {
    label: 'Operacional',
    icon: 'ki-chart-line',
    children: [
      { label: 'Cobertura de postos', to: '/relatorios/operacional/cobertura' },
      { label: 'Absentismo', to: '/relatorios/operacional/absentismo' },
      { label: 'Atrasos', to: '/relatorios/operacional/atrasos' },
      { label: 'Ocorrências por tipo', to: '/relatorios/operacional/ocorrencias' },
      { label: 'Performance vigilantes', to: '/relatorios/operacional/performance' },
    ],
  },
  {
    label: 'Financeiro',
    icon: 'ki-chart-pie-3',
    roles: ['Administrador', 'Direcao', 'Financeiro'],
    children: [
      { label: 'Faturação mensal', to: '/relatorios/financeiro/faturacao' },
      { label: 'Margem por contrato', to: '/relatorios/financeiro/margem' },
      { label: 'Custo por posto', to: '/relatorios/financeiro/custo-posto' },
      { label: 'Receita por cliente', to: '/relatorios/financeiro/receita-cliente' },
      { label: 'Cashflow', to: '/relatorios/financeiro/cashflow' },
    ],
  },
  {
    label: 'RH',
    icon: 'ki-chart-simple',
    roles: ['Administrador', 'RH', 'Direcao'],
    children: [
      { label: 'Horas trabalhadas', to: '/relatorios/rh/horas' },
      { label: 'Aniversários', to: '/relatorios/rh/aniversarios' },
      { label: 'Contratos a expirar', to: '/relatorios/rh/contratos-expirar' },
      { label: 'Turnover', to: '/relatorios/rh/turnover' },
    ],
  },
  {
    label: 'Auditoria',
    icon: 'ki-shield-tick',
    roles: ['Administrador'],
    children: [
      { label: 'Acessos', to: '/relatorios/auditoria/acessos' },
      { label: 'Alterações', to: '/relatorios/auditoria/alteracoes' },
      { label: 'Aprovações', to: '/relatorios/auditoria/aprovacoes' },
      { label: 'Tentativas falhadas', to: '/relatorios/auditoria/tentativas' },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Comunicação' },
  {
    label: 'Notificações',
    icon: 'ki-notification',
    to: '/notificacoes',
  },
  {
    label: 'Mensagens internas',
    icon: 'ki-message-text',
    to: '/mensagens',
    badge: 'Em breve',
  },
  {
    label: 'Anúncios',
    icon: 'ki-flag',
    to: '/anuncios',
  },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Administração' },
  {
    label: 'Utilizadores',
    icon: 'ki-user',
    roles: ['Administrador'],
    children: [
      { label: 'Lista', to: '/admin/utilizadores' },
      { label: 'Activos', to: '/admin/utilizadores/activos' },
      { label: 'Bloqueados', to: '/admin/utilizadores/bloqueados' },
      { label: 'Pendentes', to: '/admin/utilizadores/pendentes' },
      { label: 'Novo utilizador', to: '/admin/utilizadores/novo' },
    ],
  },
  {
    label: 'Perfis & permissões',
    icon: 'ki-shield',
    to: '/admin/perfis',
    roles: ['Administrador'],
  },
  {
    label: 'Configurações',
    icon: 'ki-setting',
    roles: ['Administrador'],
    children: [
      { label: 'Geral', to: '/admin/config/geral' },
      { label: 'Aprovações', to: '/admin/config/aprovacoes' },
      { label: 'Notificações', to: '/admin/config/notificacoes' },
      { label: 'Integrações', to: '/admin/config/integracoes' },
      { label: 'Email/SMS', to: '/admin/config/email-sms' },
      { label: 'Personalização', to: '/admin/config/personalizacao' },
    ],
  },
  {
    label: 'Backups',
    icon: 'ki-cloud-add',
    to: '/admin/backups',
    roles: ['Administrador'],
  },
  {
    label: 'Auditoria',
    icon: 'ki-information-2',
    to: '/admin/auditoria',
    roles: ['Administrador'],
  },

  // ────────────────────────────────────────────────────────────────────────
  { type: 'heading', label: 'Conta' },
  {
    label: 'Meu perfil',
    icon: 'ki-profile-circle',
    children: [
      { label: 'Detalhes', to: '/perfil' },
      { label: 'Alterar password', to: '/perfil/password' },
      { label: 'Sessões activas', to: '/perfil/sessoes' },
      { label: 'Preferências', to: '/perfil/preferencias' },
    ],
  },
  {
    label: 'Ajuda & Suporte',
    icon: 'ki-information-3',
    children: [
      { label: 'Manual', to: '/ajuda/manual' },
      { label: 'FAQ', to: '/ajuda/faq' },
      { label: 'Contactar suporte', to: '/ajuda/contacto' },
      { label: 'Reportar problema', to: '/ajuda/reportar' },
    ],
  },
]

/**
 * Filter the menu tree by the current user's groups.
 * - Entries without `roles` are visible to everyone.
 * - Group entries are dropped if every child gets filtered out.
 */
export function filterMenuByGroups(menu, userGroups = []) {
  const isVisibleByRoles = (roles) => {
    if (!roles || roles.length === 0) return true
    return roles.some((r) => userGroups.includes(r))
  }

  return menu
    .map((entry) => {
      if (!isVisibleByRoles(entry.roles)) return null
      if (entry.children) {
        const visibleChildren = filterMenuByGroups(entry.children, userGroups)
        if (visibleChildren.length === 0) return null
        return { ...entry, children: visibleChildren }
      }
      return entry
    })
    .filter(Boolean)
}
