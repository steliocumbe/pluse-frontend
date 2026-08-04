<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <main class="auth-page flex items-center justify-center grow min-h-screen px-4 py-8 sm:px-6">
        <div class="auth-page-shell">
          <router-view />
          <footer class="auth-page-footer">
            <span class="auth-page-footer__mark">MIGUEL M.C ERP</span>
            <span class="auth-page-footer__copy">Acesso, bloqueio e configuração do sistema.</span>
          </footer>
        </div>
      </main>
    </q-page-container>
  </q-layout>
</template>

<script setup>
// Layout used for unauthenticated routes (login, password reset, etc.).
// Mirrors the Metronic auth pages — full-bleed background image with the
// auth card centred.
</script>

<style scoped>
.auth-page {
  background:
    linear-gradient(180deg, var(--background) 0%, color-mix(in oklab, var(--muted) 58%, transparent) 100%),
    radial-gradient(circle at 50% 0%, color-mix(in oklab, var(--primary) 8%, transparent), transparent 36rem);
}

.auth-page-shell {
  width: min(100%, 1080px);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.auth-page-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 4px;
  color: var(--muted-foreground);
  font-size: 0.72rem;
}

.auth-page-footer__mark {
  font-weight: 900;
  letter-spacing: 0.14em;
  color: var(--primary);
  text-transform: uppercase;
}

.auth-page-footer__copy {
  text-align: right;
}

@media (max-width: 640px) {
  .auth-page-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .auth-page-footer__copy {
    text-align: left;
  }
}
</style>
