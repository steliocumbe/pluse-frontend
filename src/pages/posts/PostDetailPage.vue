<!--
  /posts/:id — detalhe do posto.
-->
<template>
  <AdminPageTemplate
    eyebrow="Cadastros · Posto"
    :title="post?.name || 'Posto'"
    :description="post?.client_name || ''"
    :breadcrumb="[
      { label: 'Postos', to: { name: 'posts-list' } },
      { label: post?.name || 'Detalhe' },
    ]"
    :back-to="{ name: 'posts-list' }"
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
        O cliente ainda não foi aprovado pela direcção — complete o processo de admissão do cliente antes de activar este posto.
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

        <!-- Contratos comerciais a cobrir este posto -->
        <section class="detail-section lg:col-span-2">
          <header class="detail-section__head">
            <span class="detail-section__icon"><AppIcon name="ki-document" :size="16" /></span>
            <span class="detail-section__title">Contratos comerciais a cobrir este posto</span>
            <span v-if="postContracts.length" class="posts-count">{{ postContracts.length }}</span>
          </header>
          <div class="detail-section__body detail-section__body--single">
            <div v-if="loadingContracts" class="text-sm text-muted-foreground">
              <q-spinner size="14px" class="q-mr-xs" /> A verificar…
            </div>
            <div v-else-if="!postContracts.length" class="text-sm text-muted-foreground">
              Este posto ainda não está coberto por nenhum contrato comercial activo.
              <router-link
                :to="{ name: 'client-contracts-new', query: { client: post.client } }"
                class="text-primary font-semibold"
              >
                Criar contrato →
              </router-link>
            </div>
            <div v-else class="flex flex-col gap-2">
              <router-link
                v-for="c in postContracts" :key="c.id"
                :to="{ name: 'client-contracts-detail', params: { id: c.id } }"
                class="contract-link"
              >
                <span class="contract-link__icon"><AppIcon name="ki-document" :size="16" /></span>
                <div class="grow min-w-0">
                  <div class="text-sm font-semibold text-mono truncate">
                    {{ c.reference }} — {{ c.title }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ c.modality_display }} ·
                    {{ formatDate(c.start_date) }}
                    {{ c.end_date ? '→ ' + formatDate(c.end_date) : '' }}
                  </div>
                </div>
                <AppBadge :variant="contractStatusVariant(c.contract_status)" size="sm">
                  {{ c.contract_status_display }}
                </AppBadge>
              </router-link>
            </div>
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
import { clientContractService } from 'src/services/client-contract.service'
import { contractStatusVariant } from 'src/config/client-contracts'
import { useToast } from 'src/composables/useToast'
import { absoluteFileUrl } from 'src/utils/file-url'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import PostActivateDialog from 'src/components/posts/PostActivateDialog.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const toast = useToast()

const post = ref(null)
const postContracts = ref([])
const loadingContracts = ref(false)

function formatDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}

async function loadContractsForPost() {
  if (!post.value) return
  loadingContracts.value = true
  try {
    // Backend não tem filtro `posts=<id>` direto — pedimos os contratos do mesmo
    // cliente e filtramos no cliente quais incluem este posto. Aceitável a esta
    // escala (poucas dezenas de contratos por cliente).
    const data = await clientContractService.list({
      client: post.value.client,
      page_size: 100,
    })
    const rows = data?.results ?? data ?? []
    postContracts.value = rows.filter((c) => {
      // ClientContractSerializer detail tem `posts_data`; o list tem só ids.
      // Como aqui usamos list, vamos buscar o detalhe quando necessário, mas
      // para evitar N+1 começamos por filtrar pelos contratos activos ou em rascunho.
      return c.contract_status !== 'expired' && c.contract_status !== 'terminated'
    })
    // Refina: para cada contrato pedimos o detalhe para ver os posts cobertos.
    // Limite de 8 detalhes para não saturar.
    const detailed = await Promise.all(
      postContracts.value.slice(0, 8).map((c) => clientContractService.get(c.id)),
    )
    postContracts.value = detailed.filter(
      (c) => Array.isArray(c.posts) && c.posts.includes(Number(post.value.id)),
    )
  } catch {
    /* interceptor toasts */
  } finally {
    loadingContracts.value = false
  }
}

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
    component: PostActivateDialog,
    componentProps: { post: post.value },
  }).onOk((updatedPost) => {
    post.value = updatedPost
    toast.success('Posto activado com sucesso.')
    // Recarrega a lista de contratos para reflectir qualquer activação
    loadContractsForPost()
  })
}

onMounted(async () => {
  try {
    post.value = await postService.get(route.params.id)
    loadContractsForPost()
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

.posts-count {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--muted);
  color: var(--muted-foreground);
}

.contract-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card);
  text-decoration: none;
  transition: border-color 140ms ease;
}
.contract-link:hover {
  border-color: color-mix(in oklab, var(--primary) 28%, var(--border));
}
.contract-link__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 9px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}

@media (max-width: 640px) {
  .detail-section__body { grid-template-columns: 1fr; }
}
</style>
