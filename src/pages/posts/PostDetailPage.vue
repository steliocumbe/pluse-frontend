<!--
  /posts/:id — detalhe do posto.
-->
<template>
  <AdminPageTemplate
    eyebrow="Cadastros · Posto"
    :title="post?.name || 'Posto'"
    :description="post?.client_name || ''"
  >
    <template #meta>
      <span v-if="post" class="admin-meta-chip admin-meta-chip--accent">
        <q-icon :name="statusIcon(post.status)" size="14px" />
        {{ post.status_display }}
      </span>
      <span v-if="post" class="admin-meta-chip">
        <AppIcon name="ki-geolocation" :size="13" />
        {{ post.service_type_display }}
      </span>
      <span v-if="post?.is_armed" class="admin-meta-chip">
        <AppIcon name="ki-shield-tick" :size="13" />
        Armado
      </span>
    </template>

    <template #actions>
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="arrow_back" label="Voltar" :to="{ name: 'posts-list' }"
      />
      <template v-if="post">
        <q-btn
          outline no-caps class="admin-hero-button"
          icon="edit" label="Editar"
          :to="{ name: 'posts-edit', params: { id: post.id } }"
        />
        <q-btn
          v-if="post.status === 'pending'"
          unelevated no-caps class="admin-hero-primary"
          icon="check_circle" label="Activar posto"
          @click="activate"
        />
      </template>
    </template>

    <div v-if="!post" class="loading-state">
      <q-spinner color="primary" size="2em" />
      <span>A carregar…</span>
    </div>

    <template v-else>
      <q-banner
        v-if="post.status === 'pending' && !post.client_is_operational"
        rounded class="bg-orange-1 text-orange-9 q-mb-md"
      >
        <template #avatar><q-icon name="warning" /></template>
        O cliente ainda não concluiu o onboarding — o posto não pode ser activado.
      </q-banner>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section class="detail-section">
          <header class="detail-section__head">
            <span class="detail-section__icon"><AppIcon name="ki-geolocation" :size="16" /></span>
            <span class="detail-section__title">Posto</span>
          </header>
          <div class="detail-section__body">
            <div class="field-row">
              <span class="field-row__label">Cliente</span>
              <span class="field-row__value">{{ post.client_name }}</span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Tipo de serviço</span>
              <span class="field-row__value">{{ post.service_type_display }}</span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Regime de turno</span>
              <span class="field-row__value">
                {{ post.shift_hours ? `${post.shift_hours}h` : '— (por definir)' }}
              </span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Posto armado</span>
              <span class="field-row__value">{{ post.is_armed ? 'Sim' : 'Não' }}</span>
            </div>
            <div class="field-row field-row--wide">
              <span class="field-row__label">Localização</span>
              <span class="field-row__value">{{ post.location || '—' }}</span>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <header class="detail-section__head">
            <span class="detail-section__icon"><AppIcon name="ki-people" :size="16" /></span>
            <span class="detail-section__title">Capacidade</span>
          </header>
          <div class="detail-section__body detail-section__body--single">
            <div class="capacity-box">
              <div class="capacity-figure">
                <strong>{{ post.current_guards }}</strong>
                <span>/ {{ post.max_guards ?? '∞' }}</span>
              </div>
              <span class="capacity-label">vigilantes alocados</span>
              <AppBadge
                :variant="post.has_capacity ? 'success' : 'danger'"
                class="mt-2"
              >
                {{ post.has_capacity ? 'Com vagas' : 'Posto cheio' }}
              </AppBadge>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <header class="detail-section__head">
            <span class="detail-section__icon"><AppIcon name="ki-dollar" :size="16" /></span>
            <span class="detail-section__title">Custos e facturação</span>
          </header>
          <div class="detail-section__body">
            <div class="field-row">
              <span class="field-row__label">Custo mensal</span>
              <span class="field-row__value">{{ money(post.monthly_cost) }}</span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Valor de facturação</span>
              <span class="field-row__value">{{ money(post.billing_amount) }}</span>
            </div>
            <div class="field-row field-row--wide">
              <span class="field-row__label">Margem mensal</span>
              <span
                class="field-row__value"
                :class="marginClass(post.margin)"
              >
                {{ money(post.margin) }}
              </span>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <header class="detail-section__head">
            <span class="detail-section__icon"><AppIcon name="ki-document" :size="16" /></span>
            <span class="detail-section__title">Documentos</span>
          </header>
          <div class="detail-section__body detail-section__body--single">
            <a v-if="post.procedures_file" :href="absoluteFileUrl(post.procedures_file)"
               target="_blank" rel="noopener" class="file-link">
              <AppIcon name="ki-document" :size="14" /> Procedimentos do posto
            </a>
            <span v-else class="text-sm text-muted-foreground">Sem procedimentos anexados.</span>
            <a v-if="post.opening_form_file" :href="absoluteFileUrl(post.opening_form_file)"
               target="_blank" rel="noopener" class="file-link">
              <AppIcon name="ki-document" :size="14" /> Formulário de abertura
            </a>
            <span v-else class="text-sm text-muted-foreground">
              Sem formulário de abertura — necessário para activar o posto.
            </span>
            <p v-if="post.notes" class="text-sm whitespace-pre-line mt-2">{{ post.notes }}</p>
          </div>
        </section>
      </div>
    </template>
  </AdminPageTemplate>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { postService } from 'src/services/post.service'
import { useToast } from 'src/composables/useToast'
import { absoluteFileUrl } from 'src/utils/file-url'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const toast = useToast()

const post = ref(null)

function statusIcon(status) {
  return { active: 'check_circle', pending: 'schedule', inactive: 'block' }[status] || 'info'
}
function money(v) {
  return v === null || v === undefined || v === '' ? '—' : `${v} MZN`
}
function marginClass(v) {
  if (v === null || v === undefined) return ''
  return Number(v) < 0 ? 'text-destructive' : 'text-positive'
}

function activate() {
  $q.dialog({
    title: 'Activar posto',
    message: 'Activar este posto? Exige cliente com onboarding concluído e formulário de abertura anexado.',
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Activar', color: 'positive', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      post.value = await postService.activate(post.value.id)
      toast.success('Posto activado.')
    } catch (err) {
      toast.error('Não foi possível activar.', { caption: err?.response?.data?.detail })
    }
  })
}

onMounted(async () => {
  try {
    post.value = await postService.get(route.params.id)
  } catch {
    toast.error('Posto não encontrado.')
    router.push({ name: 'posts-list' })
  }
})
</script>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--muted-foreground);
}
.detail-section {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  overflow: hidden;
}
.detail-section__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--muted) 30%, transparent);
}
.detail-section__icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}
.detail-section__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--mono);
}
.detail-section__body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 20px;
  padding: 18px;
}
.detail-section__body--single { grid-template-columns: 1fr; }
.field-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.field-row--wide { grid-column: 1 / -1; }
.field-row__label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
.field-row__value {
  font-size: 0.9rem;
  color: var(--foreground);
  word-break: break-word;
}
.capacity-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 0;
}
.capacity-figure {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.capacity-figure strong {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--mono);
  line-height: 1;
}
.capacity-figure span {
  font-size: 1.1rem;
  color: var(--muted-foreground);
}
.capacity-label {
  font-size: 0.78rem;
  color: var(--muted-foreground);
}
.file-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
}
.file-link:hover { text-decoration: underline; }

@media (max-width: 640px) {
  .detail-section__body { grid-template-columns: 1fr; }
}
</style>
