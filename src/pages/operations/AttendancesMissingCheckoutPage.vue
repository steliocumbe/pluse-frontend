<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Sem check-out"
    description="Controlo de saídas não registadas, com impacto em jornada, faturação e validação final do turno."
  >
    <AttendanceBoard
      table-eyebrow="Fecho de turno"
      table-title="Saídas pendentes"
      side-title="Regularização"
      side-badge="11 pendentes"
      :stats="stats"
      :rows="rows"
      :queue="queue"
    />
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AttendanceBoard from 'src/components/operations/AttendanceBoard.vue'

const stats = [
  { label: 'Sem check-out', value: '11', copy: 'saídas pendentes de confirmação', icon: 'ki-exit-right', tone: 'is-amber' },
  { label: 'Regularizados', value: '19', copy: 'fechados pelo supervisor', icon: 'ki-check-circle', tone: 'is-green' },
  { label: 'Críticos', value: '2', copy: 'postos sensíveis sem fecho', icon: 'ki-warning-2', tone: 'is-red' },
  { label: 'Turnos fechados', value: '173', copy: 'prontos para auditoria e faturação', icon: 'ki-lock', tone: 'is-blue' },
]

const rows = [
  { initials: 'JM', name: 'João Mucavele', role: 'Vigilante', post: 'MozMall Entrada Norte', time: '18:00', validation: 'Saída pendente', status: 'Pendente', variant: 'warning' },
  { initials: 'LC', name: 'Lúcia Cossa', role: 'Vigilante', post: 'Banco Central Cofre', time: '18:00', validation: 'Supervisor acionado', status: 'Crítico', variant: 'danger' },
  { initials: 'CB', name: 'Carlos Bila', role: 'Vigilante', post: 'Armazém Matola', time: '18:00', validation: 'Offline', status: 'A sincronizar', variant: 'primary' },
  { initials: 'FM', name: 'Fátima Mabunda', role: 'Vigilante', post: 'Hospital Ala Sul', time: '18:00', validation: 'Aprovado', status: 'Fechado', variant: 'success' },
]

const queue = [
  { title: 'Confirmar presença final', copy: '2 postos críticos precisam de validação do supervisor.', badge: '2', variant: 'danger', icon: 'ki-shield-tick', tone: 'is-red' },
  { title: 'Sincronizar registos offline', copy: '5 saídas foram guardadas sem internet.', badge: '5', variant: 'info', icon: 'ki-cloud', tone: 'is-blue' },
  { title: 'Fechar jornada', copy: '11 registos precisam de fecho para liberar faturação.', badge: '11', variant: 'warning', icon: 'ki-lock', tone: 'is-amber' },
]
</script>
