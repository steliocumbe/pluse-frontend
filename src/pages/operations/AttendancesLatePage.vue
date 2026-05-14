<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Atrasos"
    description="Fila operacional para tratar entradas tardias, justificar impacto no turno e escalar casos que podem deixar postos descobertos."
  >
    <AttendanceBoard
      table-eyebrow="Atrasos monitorados"
      table-title="Entradas fora do horário previsto"
      side-title="Ações recomendadas"
      side-badge="18 atrasos"
      :stats="stats"
      :rows="lateRows"
      :queue="queue"
    />
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AttendanceBoard from 'src/components/operations/AttendanceBoard.vue'

const stats = [
  { label: 'Atrasos ativos', value: '18', copy: 'ainda visíveis para o operador', icon: 'ki-time', tone: 'is-amber' },
  { label: 'Resolvidos', value: '9', copy: 'normalizados nas últimas 2 horas', icon: 'ki-check-circle', tone: 'is-green' },
  { label: 'Fora do raio', value: '3', copy: 'precisam de validação no terreno', icon: 'ki-geolocation', tone: 'is-red' },
  { label: 'Impacto financeiro', value: '4', copy: 'podem afetar faturação do cliente', icon: 'ki-cheque', tone: 'is-blue' },
]

const lateRows = [
  { initials: 'RM', name: 'Rui Matola', role: 'Vigilante', post: 'Porto Gate 4', time: '06:31', validation: 'GPS fora do raio', status: 'Atraso', variant: 'warning' },
  { initials: 'AM', name: 'Ana Macamo', role: 'Vigilante', post: 'Hospital Ala Sul', time: '06:44', validation: 'Foto pendente', status: 'Rever', variant: 'danger' },
  { initials: 'CB', name: 'Carlos Bila', role: 'Vigilante', post: 'MozMall Parque', time: '06:19', validation: 'QR confirmado', status: 'Justificar', variant: 'warning' },
  { initials: 'FM', name: 'Fátima Mabunda', role: 'Vigilante', post: 'Armazém Matola', time: '06:22', validation: 'GPS confirmado', status: 'Resolvido', variant: 'success' },
]

const queue = [
  { title: 'Contactar supervisor', copy: '3 atrasos têm localização fora do raio permitido.', badge: '3', variant: 'danger', icon: 'ki-phone', tone: 'is-red' },
  { title: 'Anexar justificativo', copy: '4 entradas precisam de motivo antes do fecho de presença.', badge: '4', variant: 'warning', icon: 'ki-document', tone: 'is-amber' },
  { title: 'Atualizar faturação', copy: 'Registos resolvidos podem seguir para o cálculo financeiro.', badge: '9', variant: 'success', icon: 'ki-cheque', tone: 'is-green' },
]
</script>
