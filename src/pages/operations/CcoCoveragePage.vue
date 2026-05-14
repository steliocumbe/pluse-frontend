<template>
  <CcoTablePage
    title="Postos cobertos/descobertos"
    description="Monitorização da cobertura prevista versus presença real, destacando postos que exigem substituição imediata."
    meta-primary="181 de 184 postos cobertos"
    meta-icon="ki-shield-tick"
    table-eyebrow="Cobertura"
    table-title="Estado por posto"
    side-title="Prioridades de cobertura"
    side-badge="3 em risco"
    side-variant="danger"
    row-key="post"
    :stats="stats"
    :columns="columns"
    :rows="coverageRows"
    :actions="actions"
  />
</template>

<script setup>
import CcoTablePage from 'src/components/operations/CcoTablePage.vue'
import { coverageRows } from 'src/data/ccoDemoData'

const stats = [
  { label: 'Cobertos', value: '181', copy: 'com vigilantes confirmados', icon: 'ki-shield-tick', tone: 'is-green' },
  { label: 'Descobertos', value: '3', copy: 'exigem substituição imediata', icon: 'ki-warning-2', tone: 'is-red' },
  { label: 'Postos críticos', value: '27', copy: 'monitorados pelo centro de comando', icon: 'ki-lock', tone: 'is-blue' },
  { label: 'Supervisores em campo', value: '12', copy: 'acompanham validações presenciais', icon: 'ki-route', tone: 'is-amber' },
]

const columns = [
  { key: 'post', label: 'Posto' },
  { key: 'client', label: 'Cliente' },
  { key: 'zone', label: 'Zona' },
  { key: 'present', label: 'Presentes' },
  { key: 'status', label: 'Estado', badge: true },
]

const actions = [
  { title: 'Publicar substituição', copy: 'Porto Gate 4 precisa de reforço no turno noturno.', badge: 'Crítico', variant: 'danger', icon: 'ki-user-tick', tone: 'is-red' },
  { title: 'Confirmar supervisor', copy: 'Hospital Ala Sul está sem entrada confirmada.', badge: '1', variant: 'warning', icon: 'ki-shield-tick', tone: 'is-amber' },
  { title: 'Validar postos críticos', copy: '27 postos críticos estão ativos no acompanhamento.', badge: '27', variant: 'info', icon: 'ki-lock', tone: 'is-blue' },
]
</script>
