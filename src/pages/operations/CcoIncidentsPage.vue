<template>
  <CcoTablePage
    title="Ocorrências abertas"
    description="Fila de ocorrências em aberto, com prioridade, responsável e decisão necessária para manter a operação sob controlo."
    meta-primary="27 ocorrências abertas"
    meta-icon="ki-warning-2"
    table-eyebrow="Ocorrências"
    table-title="Casos abertos por prioridade"
    side-title="Decisões pendentes"
    side-badge="3 críticas"
    side-variant="danger"
    row-key="code"
    :stats="stats"
    :columns="columns"
    :rows="incidentRows"
    :actions="actions"
  />
</template>

<script setup>
import CcoTablePage from 'src/components/operations/CcoTablePage.vue'
import { incidentRows } from 'src/data/ccoDemoData'

const stats = [
  { label: 'Abertas', value: '27', copy: 'ocorrências em tratamento', icon: 'ki-warning-2', tone: 'is-red' },
  { label: 'Críticas', value: '3', copy: 'exigem decisão imediata', icon: 'ki-notification-status', tone: 'is-red' },
  { label: 'Em análise', value: '12', copy: 'com responsável definido', icon: 'ki-search-list', tone: 'is-amber' },
  { label: 'Resolvidas hoje', value: '19', copy: 'fechadas no turno atual', icon: 'ki-check-circle', tone: 'is-green' },
]

const columns = [
  { key: 'code', label: 'Código' },
  { key: 'title', label: 'Ocorrência' },
  { key: 'post', label: 'Posto' },
  { key: 'owner', label: 'Responsável' },
  { key: 'status', label: 'Estado', badge: true },
]

const actions = [
  { title: 'Decidir caso crítico', copy: 'Porto Gate 4 precisa de substituição publicada.', badge: 'Crítico', variant: 'danger', icon: 'ki-warning-2', tone: 'is-red' },
  { title: 'Confirmar evidência', copy: 'Ocorrências com fotografia pendente devem ser revistas.', badge: '6', variant: 'warning', icon: 'ki-picture', tone: 'is-amber' },
  { title: 'Fechar casos resolvidos', copy: '19 ocorrências já têm informação suficiente para encerramento.', badge: '19', variant: 'success', icon: 'ki-check-circle', tone: 'is-green' },
]
</script>
