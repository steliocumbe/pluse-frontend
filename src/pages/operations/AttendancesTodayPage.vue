<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Presenças de hoje"
    description="Resumo diário de entradas confirmadas, ausências, validações e registos que alimentam a operação e a faturação."
  >
    <AttendanceBoard
      table-eyebrow="Hoje"
      table-title="Registos do dia"
      side-title="Validações do dia"
      side-badge="9 por rever"
      :stats="stats"
      :rows="attendanceRows"
      :queue="queue"
    />
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AttendanceBoard from 'src/components/operations/AttendanceBoard.vue'
import { attendanceRows } from 'src/data/operationsDemoData'

const stats = [
  { label: 'Presentes', value: '312', copy: 'vigilantes com entrada confirmada', icon: 'ki-user-tick', tone: 'is-green' },
  { label: 'Taxa de presença', value: '95.7%', copy: 'base para faturação do período', icon: 'ki-chart-line', tone: 'is-blue' },
  { label: 'Atrasos', value: '18', copy: 'monitorados desde o início do turno', icon: 'ki-time', tone: 'is-amber' },
  { label: 'Ausências', value: '7', copy: 'aguardam substituição ou justificativo', icon: 'ki-user-cross', tone: 'is-red' },
]

const queue = [
  { title: 'Justificativos pendentes', copy: '7 ausências precisam de motivo e decisão operacional.', badge: '7', variant: 'danger', icon: 'ki-user-cross', tone: 'is-red' },
  { title: 'Registos enviados para faturação', copy: '268 presenças já estão prontas para cruzamento financeiro.', badge: '268', variant: 'success', icon: 'ki-cheque', tone: 'is-green' },
  { title: 'Validação de supervisor', copy: '9 entradas precisam de confirmação antes do fecho diário.', badge: '9', variant: 'warning', icon: 'ki-shield-tick', tone: 'is-amber' },
]
</script>
