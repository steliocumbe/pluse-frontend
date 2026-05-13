<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <main class="auth-page flex items-center justify-center grow min-h-screen px-4 py-8 sm:px-6">
        <router-view />
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
</style>
