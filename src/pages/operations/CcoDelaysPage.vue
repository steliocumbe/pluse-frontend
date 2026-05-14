<template>
  <CcoTablePage
    title="Atrasos"
    description="Fila de atrasos com impacto no cliente, no posto e na abertura do turno para decisão rápida do operador."
    meta-primary="18 atrasos ativos"
    meta-icon="ki-time"
    table-eyebrow="Atrasos"
    table-title="Entradas fora do horário"
    side-title="Tratamento recomendado"
    side-badge="18 ativos"
    side-variant="warning"
    row-key="person"
    :stats="stats"
    :columns="columns"
    :rows="delayRows"
    :actions="actions"
  />
</template>

<script setup>
import CcoTablePage from 'src/components/operations/CcoTablePage.vue'
import { delayRows } from 'src/data/ccoDemoData'

const stats = [
  { label: 'Atrasos ativos', value: '18', copy: 'monitorados no turno atual', icon: 'ki-time', tone: 'is-amber' },
  { label: 'Escalados', value: '6', copy: 'com supervisor acionado', icon: 'ki-phone', tone: 'is-red' },
  { label: 'Resolvidos', value: '9', copy: 'regularizados nas últimas 2 horas', icon: 'ki-check-circle', tone: 'is-green' },
  { label: 'Com impacto financeiro', value: '4', copy: 'podem afetar faturação', icon: 'ki-cheque', tone: 'is-blue' },
]

const columns = [
  { key: 'person', label: 'Vigilante' },
  { key: 'post', label: 'Posto' },
  { key: 'expected', label: 'Previsto' },
  { key: 'actual', label: 'Entrada' },
  { key: 'status', label: 'Estado', badge: true },
]

const actions = [
  { title: 'Acionar substituto', copy: 'Casos críticos podem evoluir para posto descoberto.', badge: '2', variant: 'danger', icon: 'ki-user-tick', tone: 'is-red' },
  { title: 'Pedir justificativo', copy: '4 atrasos dependem de motivo antes do fecho.', badge: '4', variant: 'warning', icon: 'ki-document', tone: 'is-amber' },
  { title: 'Atualizar presença', copy: '9 registos já podem seguir para validação financeira.', badge: '9', variant: 'success', icon: 'ki-check-circle', tone: 'is-green' },
]
</script>
