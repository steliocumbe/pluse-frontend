<template>
  <div class="profile-tab-content">
    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="2em" /><span>A carregar…</span>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Card avatar + identidade -->
      <section class="detail-section detail-section--identity">
        <header class="detail-section__head">
          <span class="detail-section__icon"><AppIcon name="ki-profile-circle" :size="16" /></span>
          <span class="detail-section__title">Identidade</span>
        </header>
        <div class="profile-identity">
          <div class="profile-identity__top">
            <div class="profile-avatar">{{ initials }}</div>
            <div class="profile-identity__main">
              <p class="profile-name">{{ form.full_name || me?.email }}</p>
              <p class="profile-email">{{ me?.email }}</p>
            </div>
          </div>

          <div class="profile-facts">
            <div class="profile-fact">
              <span>Telefone</span>
              <strong>{{ form.phone || 'Não informado' }}</strong>
            </div>
            <div class="profile-fact">
              <span>Username</span>
              <strong>{{ me?.username || '—' }}</strong>
            </div>
          </div>

          <div class="profile-roles">
            <span v-for="g in groups" :key="g" class="profile-role-chip">{{ g }}</span>
            <span v-if="!groups.length" class="profile-role-chip is-muted">Sem grupo</span>
          </div>
        </div>
      </section>

      <!-- Card dados editáveis -->
      <section class="detail-section lg:col-span-2">
        <header class="detail-section__head">
          <span class="detail-section__icon"><AppIcon name="ki-setting-2" :size="16" /></span>
          <span class="detail-section__title">Dados pessoais</span>
        </header>

        <q-form ref="formRef" greedy class="profile-form" @submit.prevent="onSubmit">
          <div v-if="globalErrors.length" class="form-error-bar">
            <p v-for="(e, i) in globalErrors" :key="i" class="m-0">{{ e }}</p>
          </div>

          <q-input
            v-model="form.full_name"
            label="Nome completo *"
            outlined dense stack-label
            :rules="[required()]"
            :error="!!fieldErrors.full_name"
            :error-message="fieldErrors.full_name"
            @update:model-value="() => clearField('full_name')"
          />

          <q-input
            v-model="form.phone"
            label="Telefone"
            outlined dense stack-label
            hint="9 dígitos a começar por 8. O prefixo +258 é opcional."
            :rules="[mozambicanPhone()]"
            :error="!!fieldErrors.phone"
            :error-message="fieldErrors.phone"
            @update:model-value="() => clearField('phone')"
          />

          <q-input
            :model-value="me?.email"
            label="Email"
            outlined dense stack-label
            readonly
            hint="O email só pode ser alterado por um administrador."
          />

          <q-input
            :model-value="me?.username"
            label="Username"
            outlined dense stack-label
            readonly
          />

          <div class="flex justify-end gap-2 pt-2">
            <q-btn flat no-caps label="Reverter" :disable="!isDirty || saving" @click="reset" />
            <q-btn
              unelevated no-caps color="primary" icon="save"
              label="Guardar alterações" type="submit"
              :disable="!isDirty"
              :loading="saving"
            />
          </div>
        </q-form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useToast } from 'src/composables/useToast'
import { useFormErrors } from 'src/composables/useFormErrors'
import { required, mozambicanPhone } from 'src/utils/validators'
import { profileService } from 'src/services/profile.service'
import AppIcon from 'src/components/ui/AppIcon.vue'

const auth = useAuthStore()
const toast = useToast()
const { fieldErrors, globalErrors, setFromResponse, clear: clearErrors, clearField } = useFormErrors()

const loading = ref(false)
const saving = ref(false)
const formRef = ref(null)
const me = ref(null)

const form = reactive({ full_name: '', phone: '' })
const initialSnapshot = ref({ full_name: '', phone: '' })

const groups = computed(() => me.value?.groups || [])
const initials = computed(() => {
  const name = form.full_name || me.value?.email || '?'
  const parts = name.split(' ').filter(Boolean)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?'
})

const isDirty = computed(
  () =>
    form.full_name !== initialSnapshot.value.full_name ||
    (form.phone || '') !== (initialSnapshot.value.phone || ''),
)

async function load() {
  loading.value = true
  try {
    me.value = await profileService.me()
    form.full_name = me.value.full_name || ''
    form.phone = me.value.phone || ''
    initialSnapshot.value = { ...form }
  } finally {
    loading.value = false
  }
}

function reset() {
  Object.assign(form, initialSnapshot.value)
  clearErrors()
}

async function onSubmit() {
  clearErrors()
  if (!(await formRef.value?.validate())) return
  saving.value = true
  try {
    const updated = await profileService.updateMe({
      full_name: form.full_name,
      phone: form.phone || null,
    })
    me.value = updated
    initialSnapshot.value = { full_name: updated.full_name || '', phone: updated.phone || '' }
    // Actualiza store para o header e sidebar reflectirem
    auth.user = { ...auth.user, ...updated }
    localStorage.setItem('pluse.user', JSON.stringify(auth.user))
    toast.success('Dados actualizados.')
  } catch (err) {
    setFromResponse(err.response)
    toast.error('Verifique os campos assinalados.')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
@import './profile-shared.css';

.profile-identity {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
}
.detail-section--identity {
  align-self: start;
}
.profile-identity__top {
  display: flex;
  align-items: center;
  gap: 14px;
}
.profile-identity__main {
  min-width: 0;
}
.profile-avatar {
  width: 62px;
  height: 62px;
  flex: none;
  border-radius: 18px;
  background: color-mix(in oklab, var(--primary) 16%, transparent);
  color: var(--primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.profile-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--foreground);
  margin: 0;
}
.profile-email {
  font-size: 0.86rem;
  color: var(--muted-foreground);
  margin: 4px 0 0;
  word-break: break-word;
}
.profile-facts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
.profile-fact {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: color-mix(in oklab, var(--muted) 22%, transparent);
  padding: 10px 12px;
}
.profile-fact span {
  display: block;
  color: var(--muted-foreground);
  font-size: 0.72rem;
  font-weight: 700;
}
.profile-fact strong {
  display: block;
  margin-top: 3px;
  color: var(--mono);
  font-size: 0.9rem;
}
.profile-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.profile-role-chip {
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}
.profile-role-chip.is-muted {
  background: var(--muted);
  color: var(--muted-foreground);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
}
</style>
