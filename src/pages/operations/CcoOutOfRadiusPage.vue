<template>
  <CcoTablePage
    title="Check-ins fora do raio"
    description="Validação de entradas feitas fora da área permitida, cruzando distância, evidência e decisão do supervisor."
    meta-primary="3 check-ins fora do raio"
    meta-icon="ki-geolocation"
    table-eyebrow="Geolocalização"
    table-title="Registos fora da tolerância"
    side-title="Validação em campo"
    side-badge="3 por rever"
    side-variant="warning"
    row-key="person"
    :stats="stats"
    :columns="columns"
    :rows="outOfRadiusRows"
    :actions="actions"
  />
</template>

<script setup>
import CcoTablePage from 'src/components/operations/CcoTablePage.vue'
import { outOfRadiusRows } from 'src/data/ccoDemoData'

const stats = [
  { label: 'Fora do raio', value: '3', copy: 'bloqueiam validação automática', icon: 'ki-geolocation', tone: 'is-red' },
  { label: 'Dentro da tolerância', value: '1', copy: 'aceite por regra operacional', icon: 'ki-check-circle', tone: 'is-green' },
  { label: 'Fotos pendentes', value: '6', copy: 'exigem evidência adicional', icon: 'ki-picture', tone: 'is-amber' },
  { label: 'Supervisores acionados', value: '3', copy: 'validam presença no terreno', icon: 'ki-shield-tick', tone: 'is-blue' },
]

const columns = [
  { key: 'person', label: 'Vigilante' },
  { key: 'post', label: 'Posto' },
  { key: 'distance', label: 'Distância' },
  { key: 'validation', label: 'Validação' },
  { key: 'status', label: 'Estado', badge: true },
]

const actions = [
  { title: 'Validar evidência', copy: 'Foto e localização devem ser confirmadas antes de contar presença.', badge: '6', variant: 'warning', icon: 'ki-picture', tone: 'is-amber' },
  { title: 'Escalar supervisor', copy: '3 entradas precisam de decisão em campo.', badge: '3', variant: 'danger', icon: 'ki-shield-tick', tone: 'is-red' },
  { title: 'Ajustar raio', copy: 'Postos remotos podem precisar de tolerância operacional.', badge: '2', variant: 'info', icon: 'ki-setting-2', tone: 'is-blue' },
]
</script>
