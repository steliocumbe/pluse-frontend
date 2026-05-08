<template>
  <div class="kt-card max-w-[400px] w-full">
    <form class="kt-card-content flex flex-col gap-6 p-10" novalidate @submit.prevent="onSubmit">
      <div class="text-center mb-2.5">
        <span class="text-3xl font-medium text-mono leading-none mb-2.5 whitespace-nowrap">
          Bem vindo!
        </span>

        <div class="flex items-center justify-center font-medium">
          <span class="text-lg text-secondary-foreground"> Ao PLUSE </span>
        </div>
      </div>

      <div
        v-if="errorMessage"
        class="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-start gap-2"
      >
        <AppIcon name="ki-warning-2" :size="16" class="mt-0.5 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <div class="flex flex-col gap-1">
        <label class="kt-form-label !w-auto font-normal text-mono" for="identifier">
          Utilizador ou telefone
        </label>
        <input
          id="identifier"
          v-model="form.identifier"
          class="kt-input"
          type="text"
          placeholder="exemplo@empresa.co.mz"
          autocomplete="username"
          :disabled="auth.loading"
          required
        />
      </div>

      <div class="flex flex-col gap-1">
        <div class="flex items-center justify-between gap-2">
          <label class="kt-form-label !w-auto font-normal text-mono shrink-0" for="password">
            Senha
          </label>
          <a
            class="text-sm kt-link shrink-0 opacity-50 cursor-not-allowed"
            title="Ainda não disponível"
          >
            Esqueci a senha?
          </a>
        </div>
        <div class="kt-input">
          <input
            id="password"
            v-model="form.password"
            name="user_password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Insira a senha"
            autocomplete="current-password"
            :disabled="auth.loading"
            required
          />
          <button
            type="button"
            class="kt-btn kt-btn-sm kt-btn-ghost kt-btn-icon bg-transparent! -me-1.5"
            tabindex="-1"
            :aria-label="showPassword ? 'Esconder password' : 'Mostrar password'"
            @click="showPassword = !showPassword"
          >
            <AppIcon
              :name="showPassword ? 'ki-eye-slash' : 'ki-eye'"
              :size="18"
              icon-class="text-muted-foreground"
            />
          </button>
        </div>
      </div>

      <label class="kt-label">
        <input v-model="form.rememberMe" class="kt-checkbox kt-checkbox-sm" type="checkbox" />
        <span class="kt-checkbox-label">Manter sessão iniciada</span>
      </label>

      <button
        type="submit"
        class="kt-btn kt-btn-primary flex justify-center grow"
        :disabled="auth.loading"
      >
        <span v-if="auth.loading" class="flex items-center gap-2">
          <AppIcon name="loader-circle" :size="16" icon-class="animate-spin" />
          A entrar…
        </span>
        <span v-else>Entrar</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import AppIcon from 'src/components/ui/AppIcon.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({ identifier: '', password: '', rememberMe: false })
const showPassword = ref(false)

const errorMessage = computed(() => auth.error)

async function onSubmit() {
  if (!form.identifier.trim() || !form.password) return
  try {
    await auth.login(form.identifier.trim(), form.password)
    const redirectTo = route.query.redirect || '/'
    await router.replace(redirectTo)
  } catch {
    // store já carrega a mensagem de erro em auth.error
  }
}
</script>
