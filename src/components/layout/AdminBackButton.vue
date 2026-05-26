<template>
  <q-btn
    :to="to"
    :icon="icon"
    :label="label"
    flat
    no-caps
    dense
    class="admin-back-btn"
    :class="{ 'is-light': light }"
    @click="onClick"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'

/**
 * Botão "voltar" padronizado.
 *
 *   <AdminBackButton />                           <!-- vai à página anterior -->
 *   <AdminBackButton to="/employees" />           <!-- vai a uma rota específica -->
 *   <AdminBackButton label="Voltar à lista" />
 *
 * `light` quando usado sobre fundo escuro (ex. dentro do hero).
 */
const props = defineProps({
  to: { type: [String, Object], default: null },
  label: { type: String, default: 'Voltar' },
  icon: { type: String, default: 'arrow_back' },
  light: { type: Boolean, default: true },
})

const router = useRouter()

function onClick(e) {
  if (props.to) return  // q-btn handles the to
  e.preventDefault()
  // Se não há histórico, manda para a home
  if (window.history.state?.back) router.back()
  else router.push('/')
}
</script>

<style scoped>
.admin-back-btn {
  font-size: 0.82rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  transition: background-color .15s ease, color .15s ease;
}
.admin-back-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}
.admin-back-btn:not(.is-light) {
  color: var(--primary);
}
.admin-back-btn:not(.is-light):hover {
  background: color-mix(in oklab, var(--primary) 10%, transparent);
}
</style>
