<template>
  <div class="client-document-slots">
    <article
      v-for="slot in slots"
      :key="slot.value"
      class="client-document-slot"
      :class="{ 'client-document-slot--filled': !!slot.row.file }"
    >
      <header class="client-document-slot__header">
        <span class="client-document-slot__icon">
          <q-icon name="description" size="18px" />
        </span>
        <div class="client-document-slot__title-wrap">
          <h4>{{ slot.label }}</h4>
          <span>{{ slot.row.file?.name || 'Documento por anexar' }}</span>
        </div>
        <q-badge
          :color="slot.row.file ? 'positive' : 'grey-7'"
          :label="slot.row.file ? 'Anexado' : 'Pendente'"
        />
      </header>

      <q-file
        :model-value="slot.row.file || null"
        :label="`Carregar ${slot.label}`"
        outlined
        dense
        clearable
        accept=".pdf,.jpg,.jpeg,.png"
        max-file-size="10485760"
        :disable="disabled"
        @update:model-value="(file) => updateSlot(slot, 'file', file)"
      >
        <template #prepend>
          <q-icon name="attach_file" />
        </template>
      </q-file>

      <div class="client-document-slot__dates">
        <q-input
          :model-value="slot.row.issue_date || ''"
          label="Data de emissão"
          type="date"
          outlined
          dense
          stack-label
          :disable="disabled"
          @update:model-value="(value) => updateSlot(slot, 'issue_date', value)"
        />
        <q-input
          :model-value="slot.row.expiry_date || ''"
          label="Data de validade"
          type="date"
          outlined
          dense
          stack-label
          :disable="disabled"
          @update:model-value="(value) => updateSlot(slot, 'expiry_date', value)"
        />
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { clientDocumentTypes } from 'src/config/client-documents'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const slots = computed(() => clientDocumentTypes.map((item) => ({
  ...item,
  row: props.modelValue.find((doc) => doc.type === item.value) || {},
})))

function updateSlot(slot, field, value) {
  const next = [...props.modelValue]
  const idx = next.findIndex((doc) => doc.type === slot.value)
  const current = idx >= 0 ? next[idx] : { type: slot.value, title: slot.label }
  const row = {
    ...current,
    type: slot.value,
    title: slot.label,
    [field]: value,
  }

  const hasContent = !!row.file || !!row.issue_date || !!row.expiry_date
  if (!hasContent) {
    if (idx >= 0) next.splice(idx, 1)
  } else if (idx >= 0) {
    next.splice(idx, 1, row)
  } else {
    next.push(row)
  }
  emit('update:modelValue', next)
}
</script>

<style scoped>
.client-document-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}

.client-document-slot {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
}

.client-document-slot--filled {
  border-color: color-mix(in oklab, #10b981 32%, var(--border));
  background: color-mix(in oklab, #10b981 5%, var(--card));
}

.client-document-slot__header {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.client-document-slot__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 8px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}

.client-document-slot__title-wrap {
  flex: 1;
  min-width: 0;
}

.client-document-slot__title-wrap h4 {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.25;
  font-weight: 700;
  color: var(--foreground);
}

.client-document-slot__title-wrap span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
  font-size: 0.76rem;
  color: var(--muted-foreground);
}

.client-document-slot__dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

@media (max-width: 520px) {
  .client-document-slot__dates {
    grid-template-columns: 1fr;
  }
}
</style>
