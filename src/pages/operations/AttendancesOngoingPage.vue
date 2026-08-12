<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Presenças em curso"
    description="Acompanhamento das entradas ativas do turno, atrasos, validações pendentes e sincronização offline."
  >
    <template #actions>
      <router-link to="/cco" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-chart-line" :size="16" icon-class="me-1.5" />
        Abrir Base de Operações
      </router-link>
    </template>

    <AttendanceBoard
      table-eyebrow="Operação atual"
      table-title="Check-ins em curso"
      :stats="stats"
      :rows="attendanceRows"
      :queue="queue"
    />
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AttendanceBoard from 'src/components/operations/AttendanceBoard.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { attendanceRows } from 'src/data/operationsDemoData'

const stats = [
  { label: 'Check-ins confirmados', value: '312', copy: 'entrada validada por GPS ou QR Code', icon: 'ki-qr-code', tone: 'is-green' },
  { label: 'Atrasos', value: '18', copy: '9 resolvidos nas últimas 2 horas', icon: 'ki-time', tone: 'is-amber' },
  { label: 'Ausências', value: '7', copy: 'postos aguardam substituição', icon: 'ki-user-cross', tone: 'is-red' },
  { label: 'Offline pendente', value: '14', copy: 'check-ins aguardam sincronização', icon: 'ki-cloud', tone: 'is-blue' },
]

const queue = [
  { title: 'Check-ins offline guardados', copy: '14 presenças foram registadas sem internet e aguardam envio automático.', badge: '14', variant: 'warning', icon: 'ki-cloud', tone: 'is-amber' },
  { title: 'Fora do raio permitido', copy: '3 entradas precisam de validação do supervisor antes de contar para faturação.', badge: '3', variant: 'danger', icon: 'ki-geolocation', tone: 'is-red' },
  { title: 'Fotos por validar', copy: '6 postos críticos exigem verificação visual no início do turno.', badge: '6', variant: 'info', icon: 'ki-picture', tone: 'is-blue' },
]
</script>
