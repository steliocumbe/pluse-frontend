<template>
  <section class="login-shell w-full" aria-labelledby="login-title">
    <div class="kt-card login-card overflow-hidden">
      <div class="grid min-h-[620px] lg:grid-cols-[0.92fr_1.08fr]">
        <aside class="login-intro hidden lg:flex flex-col justify-between gap-8 p-12">
          <div class="login-intro-content">
            <div class="brand-mark mb-8">
              <img :src="brandLogoUrl" alt="PLUSE" />
            </div>

            <p class="login-kicker">Plataforma PLUSE</p>
            <div class="login-intro-title">
              Aceda ao seu centro de operações.
            </div>
            <p class="login-intro-copy">
              Monitorize equipas, pedidos e dados críticos num ambiente seguro, rápido e preparado
              para o trabalho diário.
            </p>
          </div>

          <div class="login-feature-list">
            <div class="flex items-center gap-3">
              <span class="feature-icon">
                <AppIcon name="ki-shield-tick" :size="18" />
              </span>
              <span>Sessão protegida e controlada</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="feature-icon">
                <AppIcon name="ki-chart-simple" :size="18" />
              </span>
              <span>Informação pronta para decisão</span>
            </div>
          </div>

          <div class="login-support-card">
            <p class="login-support-card__title">Assistência técnica</p>
            <div class="login-support-item">
              <span class="login-support-item__icon">
                <AppIcon name="ki-whatsapp" :size="16" />
              </span>
              <span>+258 873404155</span>
            </div>
            <div class="login-support-item">
              <span class="login-support-item__icon">
                <AppIcon name="ki-sms" :size="16" />
              </span>
              <span>reanecaetano@gmail.com</span>
            </div>
            <div class="login-support-item">
              <span class="login-support-item__icon">
                <AppIcon name="ki-bank" :size="16" />
              </span>
              <span>NUIT 402158042</span>
            </div>
            <div class="login-support-item login-support-item--start">
              <span class="login-support-item__icon">
                <AppIcon name="ki-geolocation" :size="16" />
              </span>
              <span>Rua da amizade Nº46, Maputo</span>
            </div>
          </div>
        </aside>

        <form
          class="login-form flex flex-col justify-center gap-6 p-6 sm:p-10 lg:px-16 xl:px-20"
          novalidate
          @submit.prevent="onSubmit"
        >
          <div class="login-form-inner">
            <div class="lg:hidden">
              <div class="brand-mark mb-5">
                <img :src="brandLogoUrl" alt="PLUSE" />
              </div>
              <p class="login-kicker mb-2">PLUSE</p>
            </div>

            <div class="login-form-heading">
              <p id="login-title" class="login-form-title">
                Iniciar sessão
              </p>
              <p class="login-form-copy">
                Entre com as suas credenciais para continuar a gerir a operação.
              </p>
            </div>

            <div
              v-if="errorMessage"
              class="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-start gap-2"
              role="alert"
              aria-live="polite"
            >
              <AppIcon name="ki-warning-2" :size="16" class="mt-0.5 shrink-0" />
              <span>{{ errorMessage }}</span>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="kt-form-label !w-auto font-normal text-mono" for="identifier">
                Operador
              </label>
              <select
                id="identifier"
                v-model="form.identifier"
                class="kt-input"
                :disabled="auth.loading || loadingOperators"
                required
              >
                <option value="" disabled>
                  {{ loadingOperators ? 'A carregar operadores...' : 'Selecione o operador' }}
                </option>
                <option
                  v-for="operator in operators"
                  :key="operator.id"
                  :value="operator.identifier"
                >
                  {{ operator.label }}
                </option>
              </select>
              <p class="login-field-help">
                Selecione o operador e introduza apenas a palavra-passe.
              </p>
              <p v-if="operatorsError" class="login-field-help login-field-help--error">
                {{ operatorsError }}
              </p>
              <p
                v-else-if="!loadingOperators && operators.length === 0"
                class="login-field-help login-field-help--warning"
              >
                Nenhum operador disponível para iniciar sessão.
              </p>
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between gap-2">
                <label class="kt-form-label !w-auto font-normal text-mono shrink-0" for="password">
                  Palavra-passe
                </label>
                <span class="text-xs text-secondary-foreground">Recuperação disponível em breve</span>
              </div>
              <div class="kt-input">
                <input
                  id="password"
                  v-model="form.password"
                  name="user_password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Insira a palavra-passe"
                  autocomplete="current-password"
                  :disabled="auth.loading"
                  required
                />
                <button
                  type="button"
                  class="kt-btn kt-btn-sm kt-btn-ghost kt-btn-icon bg-transparent! -me-1.5"
                  :disabled="auth.loading"
                  :aria-label="showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'"
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

            <div class="flex items-center justify-between gap-4">
              <label class="kt-label">
                <input
                  v-model="form.rememberMe"
                  class="kt-checkbox kt-checkbox-sm"
                  type="checkbox"
                  :disabled="auth.loading"
                />
                <span class="kt-checkbox-label">Manter sessão iniciada</span>
              </label>
            </div>

            <button
              type="submit"
              class="kt-btn kt-btn-primary login-submit flex justify-center w-full"
              :disabled="auth.loading || !canSubmit"
            >
              <span v-if="auth.loading" class="flex items-center gap-2">
                <AppIcon name="loader-circle" :size="16" icon-class="animate-spin" />
                A entrar...
              </span>
              <span v-else>Entrar no PLUSE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { authService } from 'src/services/auth.service'
import AppIcon from 'src/components/ui/AppIcon.vue'

const brandLogoUrl = `${import.meta.env.BASE_URL}icons/android-chrome-512x512.png`

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({ identifier: '', password: '', rememberMe: false })
const showPassword = ref(false)
const operators = ref([])
const loadingOperators = ref(false)
const operatorsError = ref(null)

const errorMessage = computed(() => auth.error)
const canSubmit = computed(() => Boolean(form.identifier.trim() && form.password))

function getOperatorIdentifier(operator) {
  return String(
    operator?.identifier ||
      operator?.username ||
      operator?.email ||
      operator?.phone ||
      operator?.telephone ||
      operator?.value ||
      operator?.id ||
      '',
  ).trim()
}

function getOperatorLabel(operator, identifier) {
  const primary =
    operator?.label ||
    operator?.full_name ||
    operator?.name ||
    operator?.display_name ||
    operator?.username ||
    operator?.email ||
    identifier

  const secondary = [operator?.email, operator?.username, operator?.phone, operator?.telephone]
    .filter(Boolean)
    .find((value) => value !== primary)

  return secondary ? `${primary} · ${secondary}` : primary
}

function normalizeOperatorsPayload(payload) {
  const rawOperators = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.operators)
        ? payload.operators
        : Array.isArray(payload?.users)
          ? payload.users
          : Array.isArray(payload?.data)
            ? payload.data
            : []

  return rawOperators
    .map((operator) => {
      const identifier = getOperatorIdentifier(operator)
      return {
        ...operator,
        id: operator?.id || identifier,
        identifier,
        label: getOperatorLabel(operator, identifier),
      }
    })
    .filter((operator) => operator.identifier)
}

async function loadOperators() {
  loadingOperators.value = true
  operatorsError.value = null
  try {
    const payload = await authService.loginOperators()
    operators.value = normalizeOperatorsPayload(payload)

    if (!form.identifier && operators.value.length === 1) {
      form.identifier = operators.value[0].identifier
    }
  } catch (error) {
    operators.value = []
    const status = error?.response?.status
    const data = error?.response?.data || {}
    const detail = data?.detail
    const machineCode = data?.machine_code
    if (status === 423) {
      operatorsError.value = `Sistema bloqueado por licença. Código deste computador: ${machineCode || 'indisponível'}.`
    } else if (detail) {
      operatorsError.value = detail
    } else if (status) {
      operatorsError.value = `Não foi possível carregar os operadores. O backend respondeu com erro ${status}.`
    } else {
      operatorsError.value =
        'Não foi possível carregar os operadores. Verifique se o backend está activo.'
    }
  } finally {
    loadingOperators.value = false
  }
}

onMounted(() => {
  loadOperators()
})

async function onSubmit() {
  if (!canSubmit.value) return
  try {
    await auth.login(form.identifier.trim(), form.password)
    const redirectTo = route.query.redirect || '/'
    await router.replace(redirectTo)
  } catch {
    // A store já carrega a mensagem de erro em auth.error.
  }
}
</script>

<style scoped>
.login-card {
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 30px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  animation: login-card-in 520ms ease-out both;
  box-shadow:
    0 24px 70px color-mix(in oklab, var(--foreground) 8%, transparent),
    0 0 34px color-mix(in oklab, white 72%, transparent),
    0 1px 0 color-mix(in oklab, var(--border) 80%, transparent);
}

.login-intro {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, color-mix(in oklab, white 80%, var(--primary) 20%), transparent 40%),
    linear-gradient(180deg, color-mix(in oklab, var(--muted) 54%, transparent), var(--background)),
    linear-gradient(135deg, color-mix(in oklab, var(--primary) 16%, transparent), transparent 60%);
  border-inline-end: 1px solid var(--border);
}

.login-intro::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  content: '';
  background: linear-gradient(180deg, var(--primary), color-mix(in oklab, var(--primary) 28%, var(--background)));
}

.login-intro::after {
  position: absolute;
  right: 42px;
  bottom: 42px;
  width: 138px;
  height: 138px;
  content: '';
  border: 1px solid color-mix(in oklab, var(--primary) 18%, transparent);
  border-radius: 24px;
  transform: rotate(12deg);
}

.login-intro-content,
.login-feature-list,
.login-form-inner {
  position: relative;
  z-index: 1;
}

.login-kicker {
  margin: 0 0 12px;
  color: var(--primary);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.2;
  text-transform: uppercase;
}

.login-intro-title {
  max-width: 380px;
  margin-bottom: 18px;
  color: var(--mono);
  font-size: 3rem;
  font-weight: 650;
  letter-spacing: 0;
  line-height: 1.05;
}

.login-intro-copy {
  max-width: 365px;
  margin: 0;
  color: var(--secondary-foreground);
  font-size: 0.92rem;
  line-height: 1.75;
}

.login-feature-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--secondary-foreground);
  font-size: 0.9rem;
}

.login-support-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
  padding: 16px 18px;
  border: 1px solid color-mix(in oklab, var(--border) 76%, white 24%);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 251, 255, 0.96));
  box-shadow: 0 14px 30px -20px rgba(15, 23, 42, 0.24);
}

.login-support-card__title {
  margin: 0 0 2px;
  color: var(--primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-support-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--secondary-foreground);
  font-size: 0.82rem;
  line-height: 1.3;
}

.login-support-item--start {
  align-items: flex-start;
}

.login-support-item__icon {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: 10px;
  background: color-mix(in oklab, var(--primary) 10%, white);
  color: var(--primary);
}

.login-form {
  background:
    radial-gradient(circle at top right, color-mix(in oklab, white 82%, var(--primary) 18%), transparent 28%),
    linear-gradient(180deg, color-mix(in oklab, var(--primary) 4%, transparent), transparent 34%),
    var(--background);
}

.login-form-inner {
  display: flex;
  width: min(100%, 430px);
  flex-direction: column;
  gap: 24px;
  margin-inline: auto;
  animation: login-form-in 620ms 120ms ease-out both;
}

.login-form-heading {
  padding-bottom: 4px;
}

.login-form-title {
  margin: 0 0 10px;
  color: var(--mono);
  font-size: 2.35rem;
  font-weight: 620;
  letter-spacing: 0;
  line-height: 1.08;
}

.login-form-copy {
  max-width: 340px;
  margin: 0;
  color: var(--secondary-foreground);
  font-size: 0.9rem;
  line-height: 1.65;
}

.login-field-help {
  margin: 2px 2px 0;
  color: var(--muted-foreground);
  font-size: 0.76rem;
  line-height: 1.35;
}

.login-field-help--error {
  color: var(--destructive);
}

.login-field-help--warning {
  color: #b45309;
}

.brand-mark {
  position: relative;
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 12px;
  background: white;
  color: var(--primary-foreground);
  font-weight: 700;
  letter-spacing: 0;
  overflow: hidden;
  box-shadow: 0 12px 28px color-mix(in oklab, var(--primary) 28%, transparent);
  animation: brand-float 5.5s ease-in-out infinite;
}

.brand-mark img {
  display: block;
  width: 88%;
  height: 88%;
  object-fit: contain;
}

.feature-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  flex: none;
  border-radius: 8px;
  background: color-mix(in oklab, var(--primary) 10%, transparent);
  color: var(--primary);
}

.login-submit {
  border-radius: 999px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--pluse-blue-500) 100%) !important;
  border: 1px solid color-mix(in oklab, var(--primary) 72%, white 28%) !important;
  box-shadow: 0 10px 24px -10px rgba(59, 130, 246, 0.38);
}

.login-form :deep(.kt-input),
.login-form :deep(select.kt-input) {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  border-color: color-mix(in oklab, var(--border) 88%, white 12%);
}

.login-form :deep(.kt-input:focus-within),
.login-form :deep(input.kt-input:focus) {
  border-color: color-mix(in oklab, var(--primary) 45%, var(--border));
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 10%, transparent);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

@keyframes login-card-in {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes login-form-in {
  from {
    opacity: 0;
    transform: translateX(18px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes brand-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@media (max-width: 1180px) {
  .login-shell {
    max-width: 980px;
  }

  .login-intro-title {
    font-size: 2.65rem;
  }
}

@media (max-width: 640px) {
  .login-card {
    box-shadow: 0 16px 48px color-mix(in oklab, var(--foreground) 8%, transparent);
  }

  .login-support-card {
    padding: 14px;
  }

  .login-form-title {
    font-size: 2rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-card,
  .login-form-inner,
  .brand-mark {
    animation: none;
  }
}
</style>
