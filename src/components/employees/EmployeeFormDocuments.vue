<!--
  Inline documents section used inside EmployeeForm during creation.

  Instead of an "add one row at a time" flow, this lays out EVERY known
  document type upfront, grouped by category. The user sees the full
  checklist at a glance and simply attaches a file to whichever documents
  they have on hand — no repeated "add" clicks.

  - Fixed types (23) → one row each, pre-rendered.
  - "Outros" → free rows the user can add (custom title + file).

  Types come from the shared `document-types` config, so this list never
  drifts from the backend.

  Emits `update:modelValue` an array of { type, title, file, issue_date,
  expiry_date } — only rows that actually have a file are emitted.
-->
<template>
  <div class="flex flex-col gap-4">
    <!-- Summary -->
    <div class="docs-summary">
      <AppIcon name="ki-document" :size="18" icon-class="text-primary" />
      <span class="docs-summary__text">
        <strong>{{ attachedCount }}</strong> de {{ fixedCount }} documentos anexados
        <template v-if="others.length">
          · <strong>{{ otherAttachedCount }}</strong> outro(s)
        </template>
      </span>
      <span class="docs-summary__hint">Anexe os que tiver agora — os restantes podem ser adicionados mais tarde.</span>
    </div>

    <!-- Fixed categories -->
    <section v-for="cat in fixedCategories" :key="cat.key" class="doc-cat">
      <header class="doc-cat__head">
        <span class="doc-cat__icon"><AppIcon :name="cat.icon" :size="15" /></span>
        <span class="doc-cat__title">{{ cat.label }}</span>
        <span class="doc-cat__count">{{ catAttached(cat) }} / {{ cat.types.length }}</span>
      </header>

      <div class="doc-cat__body">
        <div
          v-for="t in cat.types"
          :key="t.value"
          class="doc-line"
          :class="{ 'doc-line--filled': !!slots[t.value].file }"
        >
          <div class="doc-line__top">
            <span class="doc-line__state" :class="{ 'doc-line__state--on': !!slots[t.value].file }">
              <q-icon :name="slots[t.value].file ? 'check' : 'attach_file'" size="13px" />
            </span>
            <div class="doc-line__label">
              <span class="doc-line__name">{{ t.label }}</span>
              <span v-if="t.expirable" class="doc-line__tag">tem validade</span>
            </div>
            <q-file
              v-model="slots[t.value].file"
              dense
              outlined
              clearable
              class="doc-line__file"
              :label="slots[t.value].file ? '' : 'Anexar ficheiro'"
              max-file-size="10485760"
              accept=".pdf,.jpg,.jpeg,.png"
            >
              <template #prepend><q-icon name="upload_file" size="18px" /></template>
            </q-file>
          </div>

          <div v-if="slots[t.value].file" class="doc-line__dates">
            <q-input
              v-model="slots[t.value].issue_date"
              label="Data de emissão"
              type="date" outlined dense stack-label
            />
            <q-input
              v-model="slots[t.value].expiry_date"
              :label="t.expirable ? 'Validade (recomendado)' : 'Validade'"
              type="date" outlined dense stack-label
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Outros documentos -->
    <section class="doc-cat">
      <header class="doc-cat__head">
        <span class="doc-cat__icon"><AppIcon name="ki-document" :size="15" /></span>
        <span class="doc-cat__title">Outros documentos</span>
        <span class="doc-cat__count">{{ otherAttachedCount }}</span>
      </header>

      <div class="doc-cat__body">
        <div
          v-for="(o, index) in others"
          :key="o._localId"
          class="doc-line doc-line--other"
          :class="{ 'doc-line--filled': !!o.file }"
        >
          <div class="doc-line__top">
            <q-input
              v-model="o.title"
              label="Descrição *"
              outlined dense
              class="doc-line__title"
              :rules="[(v) => !!v || 'Obrigatório']"
            />
            <q-file
              v-model="o.file"
              dense outlined clearable
              class="doc-line__file"
              :label="o.file ? '' : 'Anexar ficheiro'"
              max-file-size="10485760"
              accept=".pdf,.jpg,.jpeg,.png"
            >
              <template #prepend><q-icon name="upload_file" size="18px" /></template>
            </q-file>
            <q-btn flat round dense color="negative" icon="delete" size="sm"
                   @click="removeOther(index)" />
          </div>
          <div v-if="o.file" class="doc-line__dates">
            <q-input v-model="o.issue_date" label="Data de emissão"
                     type="date" outlined dense stack-label />
            <q-input v-model="o.expiry_date" label="Validade"
                     type="date" outlined dense stack-label />
          </div>
        </div>

        <div>
          <q-btn outline no-caps color="primary" icon="add" size="sm"
                 label="Adicionar outro documento" @click="addOther" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { documentCategories } from 'src/config/document-types'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

// Every category except the catch-all "other" — those get fixed rows.
const fixedCategories = documentCategories.filter((c) => c.key !== 'other')
const fixedCount = fixedCategories.reduce((n, c) => n + c.types.length, 0)

// One reactive slot per fixed type: { file, issue_date, expiry_date }.
const slots = reactive({})
for (const cat of fixedCategories) {
  for (const t of cat.types) {
    slots[t.value] = { file: null, issue_date: '', expiry_date: '' }
  }
}

let counter = 0
const blankOther = () => ({
  _localId: ++counter,
  title: '',
  file: null,
  issue_date: '',
  expiry_date: '',
})
const others = ref([])

// Hydrate from an existing modelValue (e.g. stepper navigation back/forward).
for (const d of props.modelValue || []) {
  if (d.type === 'other') {
    others.value.push({
      _localId: ++counter,
      title: d.title || '',
      file: d.file || null,
      issue_date: d.issue_date || '',
      expiry_date: d.expiry_date || '',
    })
  } else if (slots[d.type]) {
    slots[d.type] = {
      file: d.file || null,
      issue_date: d.issue_date || '',
      expiry_date: d.expiry_date || '',
    }
  }
}

const attachedCount = computed(
  () => Object.values(slots).filter((s) => s.file).length,
)
const otherAttachedCount = computed(() => others.value.filter((o) => o.file).length)

function catAttached(cat) {
  return cat.types.filter((t) => slots[t.value].file).length
}

function addOther() {
  others.value.push(blankOther())
}
function removeOther(i) {
  others.value.splice(i, 1)
}

// Flatten slots + others into the emitted model — only rows with a file.
function buildModel() {
  const out = []
  for (const [type, s] of Object.entries(slots)) {
    if (s.file) {
      out.push({
        type,
        title: '',
        file: s.file,
        issue_date: s.issue_date || '',
        expiry_date: s.expiry_date || '',
      })
    }
  }
  for (const o of others.value) {
    if (o.file) {
      out.push({
        type: 'other',
        title: o.title || '',
        file: o.file,
        issue_date: o.issue_date || '',
        expiry_date: o.expiry_date || '',
      })
    }
  }
  return out
}

watch(
  [slots, others],
  () => emit('update:modelValue', buildModel()),
  { deep: true },
)
</script>

<style scoped>
/* ── Summary ───────────────────────────────────────────────────────────── */
.docs-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: color-mix(in oklab, var(--primary) 6%, transparent);
}
.docs-summary__text {
  font-size: 0.85rem;
  color: var(--foreground);
}
.docs-summary__hint {
  font-size: 0.78rem;
  color: var(--muted-foreground);
}

/* ── Category ──────────────────────────────────────────────────────────── */
.doc-cat {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--card);
}
.doc-cat__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: color-mix(in oklab, var(--muted) 35%, transparent);
  border-bottom: 1px solid var(--border);
}
.doc-cat__icon {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  flex: none;
  border-radius: 7px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}
.doc-cat__title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--mono);
  flex: 1;
}
.doc-cat__count {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--muted);
  color: var(--muted-foreground);
}
.doc-cat__body {
  display: flex;
  flex-direction: column;
}

/* ── Document line ─────────────────────────────────────────────────────── */
.doc-line {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
}
.doc-line:last-child {
  border-bottom: none;
}
.doc-line--filled {
  background: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 5%, transparent);
}
.doc-line__top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.doc-line__state {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  flex: none;
  border-radius: 50%;
  background: var(--muted);
  color: var(--muted-foreground);
}
.doc-line__state--on {
  background: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 18%, transparent);
  color: var(--pluse-emerald-600, #059669);
}
.doc-line__label {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.doc-line__name {
  font-size: 0.86rem;
  color: var(--foreground);
}
.doc-line__tag {
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 1px 7px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 16%, transparent);
  color: var(--pluse-amber-600, #d97706);
  white-space: nowrap;
}
.doc-line__file {
  width: 220px;
  flex: none;
}
.doc-line__title {
  flex: 1;
  min-width: 0;
}
.doc-line__dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 10px;
  padding-left: 34px;
}

@media (max-width: 640px) {
  .doc-line__top {
    flex-wrap: wrap;
  }
  .doc-line__file {
    width: 100%;
  }
  .doc-line__dates {
    grid-template-columns: 1fr;
    padding-left: 0;
  }
}
</style>
