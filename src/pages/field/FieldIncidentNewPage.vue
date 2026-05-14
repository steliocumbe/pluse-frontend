<template>
  <AdminPageTemplate
    eyebrow="Fluxo mobile"
    title="Nova ocorrência"
    description="Registo rápido de ocorrência em campo, com prioridade, categoria, evidência e envio para supervisor."
  >
    <div class="field-showcase">
      <FieldPhoneShell title="Nova ocorrência">
        <section class="field-form">
          <label>
            <span>Tipo</span>
            <select>
              <option v-for="type in incidentTypes" :key="type">{{ type }}</option>
            </select>
          </label>
          <label>
            <span>Prioridade</span>
            <select>
              <option>Normal</option>
              <option>Alta</option>
              <option>Crítica</option>
            </select>
          </label>
          <label>
            <span>Descrição</span>
            <textarea rows="4">Porta lateral encontrada aberta durante ronda interna.</textarea>
          </label>
        </section>

        <section class="field-evidence-row">
          <button type="button">
            <AppIcon name="ki-picture" :size="18" />
            Foto
          </button>
          <button type="button">
            <AppIcon name="ki-geolocation" :size="18" />
            GPS
          </button>
          <button type="button">
            <AppIcon name="ki-microphone" :size="18" />
            Áudio
          </button>
        </section>

        <button type="button" class="field-primary-action">Enviar ao supervisor</button>
      </FieldPhoneShell>

      <aside class="field-context-panel">
        <span>Ocorrência em segundos</span>
        <strong>O formulário deve ser simples, mas completo.</strong>
        <p>Categoria, prioridade, descrição e evidências são suficientes para o supervisor validar sem retrabalho.</p>
      </aside>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import FieldPhoneShell from 'src/components/operations/FieldPhoneShell.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { incidentTypes } from 'src/data/fieldDemoData'
</script>
