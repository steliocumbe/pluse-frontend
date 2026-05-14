<template>
  <CcoTablePage
    title="Painel de presenças"
    description="Leitura operacional das entradas do turno, presença confirmada, validações pendentes e registos que impactam faturação."
    meta-primary="312 presenças confirmadas"
    meta-icon="ki-check-circle"
    table-eyebrow="Presenças"
    table-title="Entradas por posto e validação"
    side-title="Ações do operador"
    side-badge="14 pendentes"
    side-variant="warning"
    row-key="name"
    :stats="stats"
    :columns="columns"
    :rows="attendanceRows"
    :actions="actions"
  />
</template>

<script setup>
import CcoTablePage from 'src/components/operations/CcoTablePage.vue'
import { attendanceRows } from 'src/data/operationsDemoData'

const stats = [
  { label: 'Confirmadas', value: '312', copy: 'entradas válidas no turno atual', icon: 'ki-check-circle', tone: 'is-green' },
  { label: 'Offline', value: '14', copy: 'aguardam sincronização no terreno', icon: 'ki-cloud', tone: 'is-blue' },
  { label: 'Atrasos', value: '18', copy: 'precisam de justificação operacional', icon: 'ki-time', tone: 'is-amber' },
  { label: 'Ausências', value: '7', copy: 'podem deixar postos descobertos', icon: 'ki-user-cross', tone: 'is-red' },
]

const columns = [
  { key: 'name', label: 'Vigilante' },
  { key: 'post', label: 'Posto' },
  { key: 'time', label: 'Hora' },
  { key: 'validation', label: 'Validação' },
  { key: 'status', label: 'Estado', badge: true },
]

const actions = [
  { title: 'Sincronizar offline', copy: 'Acompanhar 14 presenças guardadas sem internet.', badge: '14', variant: 'info', icon: 'ki-cloud', tone: 'is-blue' },
  { title: 'Validar ausências', copy: '7 postos exigem substituição ou justificativo.', badge: '7', variant: 'danger', icon: 'ki-user-cross', tone: 'is-red' },
  { title: 'Liberar para faturação', copy: 'Entradas confirmadas alimentam a base financeira do período.', badge: '312', variant: 'success', icon: 'ki-cheque', tone: 'is-green' },
]
</script>
