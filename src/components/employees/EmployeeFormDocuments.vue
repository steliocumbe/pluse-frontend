<!--
  Inline document slots used during employee creation and batch uploads.

  The default view stays intentionally small: four mandatory HR slots plus a
  flexible "extra document" list for special cases.
-->
<template>
  <div class="employee-docs">
    <div class="docs-summary">
      <AppIcon name="ki-document" :size="18" icon-class="text-primary" />
      <span class="docs-summary__text">
        <strong>{{ attachedRequiredCount }}</strong> de {{ requiredDocuments.length }} obrigatórios anexados
        <template v-if="extraAttachedCount">
          · <strong>{{ extraAttachedCount }}</strong> extra{{ extraAttachedCount === 1 ? '' : 's' }}
        </template>
      </span>
    </div>

    <section class="doc-section">
      <header class="doc-section__head">
        <div>
          <h4>Documentação Obrigatória</h4>
          <p>BI, NUIT, NIB Bancário e Contrato Assinado.</p>
        </div>
        <span class="doc-section__count">{{ attachedRequiredCount }} / {{ requiredDocuments.length }}</span>
      </header>

      <div class="required-grid">
        <article
          v-for="doc in requiredDocuments"
          :key="doc.value"
          class="required-slot"
          :class="{ 'required-slot--filled': !!slots[doc.value].file }"
        >
          <div class="required-slot__head">
            <span class="required-slot__icon">
              <q-icon :name="slots[doc.value].file ? 'check' : 'upload_file'" size="16px" />
            </span>
            <div class="required-slot__label">
              <strong>{{ doc.label }}</strong>
              <span v-if="doc.expirable">Tem validade</span>
            </div>
          </div>

          <q-file
            v-model="slots[doc.value].file"
            dense
            outlined
            clearable
            :label="slots[doc.value].file ? '' : 'Anexar ficheiro'"
            max-file-size="10485760"
            accept=".pdf,.jpg,.jpeg,.png"
          >
            <template #prepend><q-icon name="upload_file" size="18px" /></template>
          </q-file>

          <div v-if="slots[doc.value].file" class="doc-dates">
            <q-input
              v-model="slots[doc.value].issue_date"
              label="Data de emissão"
              type="date"
              outlined
              dense
              stack-label
            />
            <q-input
              v-model="slots[doc.value].expiry_date"
              :label="doc.expirable ? 'Validade' : 'Validade opcional'"
              type="date"
              outlined
              dense
              stack-label
            />
          </div>

          <span
            v-if="slots[doc.value].file && expiryStatus(slots[doc.value]).tone !== 'neutral'"
            class="doc-alert"
            :class="`doc-alert--${expiryStatus(slots[doc.value]).tone}`"
          >
            <q-icon :name="expiryStatus(slots[doc.value]).icon" size="13px" />
            {{ expiryStatus(slots[doc.value]).label }}
          </span>
        </article>
      </div>
    </section>

    <section class="doc-section">
      <header class="doc-section__head">
        <div>
          <h4>Documentos Extras</h4>
          <p>Registo criminal, aptidão física, certificados ou outros anexos específicos.</p>
        </div>
        <q-btn
          outline
          no-caps
          color="primary"
          icon="add"
          size="sm"
          label="Adicionar Documento Extra"
          @click="addExtra"
        />
      </header>

      <div v-if="extras.length" class="extra-list">
        <article
          v-for="(doc, index) in extras"
          :key="doc._localId"
          class="extra-doc"
          :class="{ 'extra-doc--filled': !!doc.file }"
        >
          <div class="extra-doc__top">
            <q-input
              v-model="doc.title"
              label="Nome do documento *"
              outlined
              dense
              class="extra-doc__title"
              :rules="[(v) => !!v || 'Obrigatório']"
            />
            <q-file
              v-model="doc.file"
              dense
              outlined
              clearable
              class="extra-doc__file"
              :label="doc.file ? '' : 'Anexar ficheiro'"
              max-file-size="10485760"
              accept=".pdf,.jpg,.jpeg,.png"
            >
              <template #prepend><q-icon name="upload_file" size="18px" /></template>
            </q-file>
            <q-btn flat round dense color="negative" icon="delete" size="sm" @click="removeExtra(index)" />
          </div>
          <div v-if="doc.file" class="doc-dates">
            <q-input v-model="doc.issue_date" label="Data de emissão" type="date" outlined dense stack-label />
            <q-input v-model="doc.expiry_date" label="Validade" type="date" outlined dense stack-label />
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { requiredDocumentTypes, requiredDocumentTypeValues } from 'src/config/document-types'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const requiredDocuments = requiredDocumentTypes
const requiredSet = new Set(requiredDocumentTypeValues)
const slots = reactive(Object.fromEntries(
  requiredDocuments.map((doc) => [doc.value, { file: null, issue_date: '', expiry_date: '' }]),
))

let counter = 0
const blankExtra = () => ({
  _localId: ++counter,
  title: '',
  file: null,
  issue_date: '',
  expiry_date: '',
})
const extras = ref([])

for (const d of props.modelValue || []) {
  if (requiredSet.has(d.type) && slots[d.type]) {
    slots[d.type] = {
      file: d.file || null,
      issue_date: d.issue_date || '',
      expiry_date: d.expiry_date || '',
    }
  } else {
    extras.value.push({
      _localId: ++counter,
      title: d.title || '',
      file: d.file || null,
      issue_date: d.issue_date || '',
      expiry_date: d.expiry_date || '',
    })
  }
}

const attachedRequiredCount = computed(
  () => Object.values(slots).filter((slot) => slot.file).length,
)
const extraAttachedCount = computed(() => extras.value.filter((doc) => doc.file).length)

function addExtra() {
  extras.value.push(blankExtra())
}

function removeExtra(index) {
  extras.value.splice(index, 1)
}

function expiryStatus(doc) {
  if (!doc.expiry_date) return { tone: 'neutral', icon: 'remove', label: '' }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((new Date(doc.expiry_date) - today) / 86400000)
  if (days < 0) return { tone: 'negative', icon: 'error', label: 'Expirado' }
  if (days <= 30) return { tone: 'warning', icon: 'flag', label: days === 0 ? 'Expira hoje' : `Expira em ${days} dia${days === 1 ? '' : 's'}` }
  return { tone: 'positive', icon: 'check_circle', label: 'Válido' }
}

function buildModel() {
  const out = []
  for (const [type, slot] of Object.entries(slots)) {
    if (slot.file) {
      out.push({
        type,
        title: '',
        file: slot.file,
        issue_date: slot.issue_date || '',
        expiry_date: slot.expiry_date || '',
      })
    }
  }
  for (const doc of extras.value) {
    if (doc.file) {
      out.push({
        type: 'other',
        title: doc.title || '',
        file: doc.file,
        issue_date: doc.issue_date || '',
        expiry_date: doc.expiry_date || '',
      })
    }
  }
  return out
}

watch(
  [slots, extras],
  () => emit('update:modelValue', buildModel()),
  { deep: true },
)
</script>

<style scoped>
.employee-docs {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.docs-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: color-mix(in oklab, var(--primary) 6%, var(--card));
}

.docs-summary__text {
  font-size: 0.85rem;
  color: var(--foreground);
}

.doc-section {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  overflow: hidden;
}

.doc-section__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--muted) 35%, var(--card));
}

.doc-section__head h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--mono);
}

.doc-section__head p {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: var(--muted-foreground);
}

.doc-section__count {
  flex: none;
  border-radius: 999px;
  padding: 2px 9px;
  background: var(--muted);
  color: var(--muted-foreground);
  font-size: 0.72rem;
  font-weight: 700;
}

.required-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.required-slot {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--card);
}

.required-slot:nth-child(2n) {
  border-right: none;
}

.required-slot:nth-last-child(-n + 2) {
  border-bottom: none;
}

.required-slot--filled,
.extra-doc--filled {
  background: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 5%, var(--card));
}

.required-slot__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.required-slot__icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 8px;
  background: color-mix(in oklab, var(--primary) 12%, var(--card));
  color: var(--primary);
}

.required-slot__label {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.required-slot__label strong {
  font-size: 0.9rem;
  color: var(--foreground);
}

.required-slot__label span {
  font-size: 0.72rem;
  color: var(--muted-foreground);
}

.doc-dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.doc-alert {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 5px;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.72rem;
  font-weight: 700;
}

.doc-alert--positive {
  background: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 16%, var(--card));
  color: var(--pluse-emerald-600, #059669);
}

.doc-alert--warning {
  background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 18%, var(--card));
  color: var(--pluse-amber-600, #d97706);
}

.doc-alert--negative {
  background: color-mix(in oklab, var(--destructive) 16%, var(--card));
  color: var(--destructive);
}

.extra-list {
  display: flex;
  flex-direction: column;
}

.extra-doc {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
}

.extra-doc:last-child {
  border-bottom: none;
}

.extra-doc__top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.extra-doc__title {
  flex: 1;
  min-width: 0;
}

.extra-doc__file {
  width: 220px;
  flex: none;
}

@media (max-width: 720px) {
  .required-grid {
    grid-template-columns: 1fr;
  }

  .required-slot,
  .required-slot:nth-child(2n),
  .required-slot:nth-last-child(-n + 2) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .required-slot:last-child {
    border-bottom: none;
  }

  .doc-section__head,
  .extra-doc__top {
    flex-direction: column;
  }

  .extra-doc__file {
    width: 100%;
  }

  .doc-dates {
    grid-template-columns: 1fr;
  }
}
</style>
