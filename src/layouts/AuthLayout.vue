<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <main class="flex items-center justify-center grow bg-center bg-no-repeat page-bg min-h-screen">
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
.page-bg {
  background-image: url('/keenthemes/dist/assets/media/images/2600x1200/bg-10.png');
}
:global(.dark) .page-bg {
  background-image: url('/keenthemes/dist/assets/media/images/2600x1200/bg-10-dark.png');
}
</style>
