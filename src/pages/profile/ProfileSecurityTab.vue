<template>
  <div class="profile-tab-content">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <section class="detail-section">
        <header class="detail-section__head">
          <span class="detail-section__icon"><AppIcon name="ki-lock" :size="16" /></span>
          <span class="detail-section__title">Alterar password</span>
        </header>

        <q-form ref="formRef" greedy class="profile-form" @submit.prevent="onSubmit">
          <div v-if="globalErrors.length" class="form-error-bar">
            <p v-for="(e, i) in globalErrors" :key="i" class="m-0">{{ e }}</p>
          </div>

          <q-input
            v-model="form.old_password"
            label="Password actual *"
            :type="showOld ? 'text' : 'password'"
            outlined dense stack-label autocomplete="current-password"
            :rules="[required()]"
            :error="!!fieldErrors.old_password"
            :error-message="fieldErrors.old_password"
            @update:model-value="() => clearField('old_password')"
          >
            <template #append>
              <q-icon
                :name="showOld ? 'visibility_off' : 'visibility'"
                class="cursor-pointer" @click="showOld = !showOld"
              />
            </template>
          </q-input>

          <q-input
            v-model="form.new_password"
            label="Nova password *"
            :type="showNew ? 'text' : 'password'"
            outlined dense stack-label autocomplete="new-password"
            hint="Mínimo 8 caracteres, pelo menos uma letra e um número."
            :rules="[required(), minLength(8)]"
            :error="!!fieldErrors.new_password"
            :error-message="fieldErrors.new_password"
            @update:model-value="() => clearField('new_password')"
          >
            <template #append>
              <q-icon
                :name="showNew ? 'visibility_off' : 'visibility'"
                class="cursor-pointer" @click="showNew = !showNew"
              />
            </template>
          </q-input>

          <q-input
            v-model="form.confirm_password"
            label="Confirmar nova password *"
            :type="showNew ? 'text' : 'password'"
            outlined dense stack-label autocomplete="new-password"
            :rules="[required(), matchesNew]"
          />

          <div class="flex justify-end gap-2 pt-2">
            <q-btn flat no-caps label="Limpar" :disable="saving" @click="reset" />
            <q-btn
              unelevated no-caps color="primary" icon="lock_reset"
              label="Alterar password" type="submit"
              :loading="saving"
            />
          </div>
        </q-form>
      </section>

      <section class="detail-section">
        <header class="detail-section__head">
          <span class="detail-section__icon"><AppIcon name="ki-shield-tick" :size="16" /></span>
          <span class="detail-section__title">Recomendações</span>
        </header>
        <ul class="security-tips">
          <li>Usa pelo menos 8 caracteres, com letras, números e símbolos.</li>
          <li>Não reutilizes a password de outras contas.</li>
          <li>Não partilhes a tua password — nem com o administrador.</li>
          <li>Se suspeitas que outra pessoa tem acesso à tua conta, vai à tab <strong>Sessões</strong> e termina as outras sessões.</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useToast } from 'src/composables/useToast'
import { useFormErrors } from 'src/composables/useFormErrors'
import { required, minLength } from 'src/utils/validators'
import { profileService } from 'src/services/profile.service'
import AppIcon from 'src/components/ui/AppIcon.vue'

const toast = useToast()
const { fieldErrors, globalErrors, setFromResponse, clear: clearErrors, clearField } = useFormErrors()

const formRef = ref(null)
const saving = ref(false)
const showOld = ref(false)
const showNew = ref(false)

const form = reactive({ old_password: '', new_password: '', confirm_password: '' })

const matchesNew = (v) => v === form.new_password || 'As passwords não coincidem.'

function reset() {
  form.old_password = ''
  form.new_password = ''
  form.confirm_password = ''
  clearErrors()
}

async function onSubmit() {
  clearErrors()
  if (!(await formRef.value?.validate())) return
  saving.value = true
  try {
    await profileService.changePassword({
      old_password: form.old_password,
      new_password: form.new_password,
    })
    toast.success('Password alterada com sucesso.')
    reset()
  } catch (err) {
    setFromResponse(err.response)
    toast.error('Não foi possível alterar a password.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
@import './profile-shared.css';

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
}

.security-tips {
  list-style: none;
  margin: 0;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.security-tips li {
  position: relative;
  padding-left: 24px;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--foreground);
}
.security-tips li::before {
  content: '✓';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--primary);
  font-weight: 700;
}
</style>
