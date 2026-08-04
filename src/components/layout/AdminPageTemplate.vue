<template>
  <section class="admin-page kt-container-fluid">
    <div class="admin-page-hero">
      <div class="admin-page-hero-content">
        <div>
          <!-- Breadcrumb + back: aceita slot ou props -->
          <div v-if="breadcrumb?.length || backTo || $slots.breadcrumb" class="admin-page-nav">
            <AdminBackButton v-if="backTo !== null" :to="backTo" :label="backLabel" />
            <AdminBreadcrumb v-if="breadcrumb?.length" :items="breadcrumb" />
            <slot name="breadcrumb" />
          </div>

          <p v-if="eyebrow" class="admin-page-eyebrow">{{ eyebrow }}</p>
          <div class="admin-page-title">{{ title }}</div>
          <p v-if="description" class="admin-page-description">{{ description }}</p>
          <div v-if="$slots.meta" class="admin-page-meta">
            <slot name="meta" />
          </div>
        </div>

        <div v-if="$slots.actions" class="admin-page-actions">
          <slot name="actions" />
        </div>
      </div>

      <div v-if="$slots.hero" class="admin-page-hero-extra">
        <slot name="hero" />
      </div>
    </div>

    <div v-if="$slots.tabs" class="admin-page-tabs">
      <slot name="tabs" />
    </div>

    <div class="admin-page-content">
      <slot />
    </div>

    <footer class="admin-page-footer">
      <span class="admin-page-footer__mark">MIGUEL M.C ERP</span>
      <span class="admin-page-footer__copy">Rodapé padrão da aba administrativa.</span>
    </footer>
  </section>
</template>

<script setup>
import AdminBackButton from './AdminBackButton.vue'
import AdminBreadcrumb from './AdminBreadcrumb.vue'

defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  /**
   * Lista do breadcrumb. Cada item: `{ label, to? }`.
   * Se omitido (ou vazio), o breadcrumb não é renderizado.
   */
  breadcrumb: { type: Array, default: () => [] },
  /**
   * `to` do botão "voltar". Aceita string, RouteLocationRaw ou:
   *   - `null` (default) → botão escondido
   *   - `'back'`         → router.back() (fallback para '/')
   *   - rota             → navega para essa rota
   */
  backTo: { type: [String, Object, null], default: null },
  backLabel: { type: String, default: 'Voltar' },
})
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: none;
  gap: 26px;
  padding-inline: clamp(18px, 1.8vw, 32px);
  padding-bottom: 36px;
}

.admin-page-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--pluse-admin-hero-border);
  border-radius: 28px;
  background: var(--pluse-admin-hero-bg);
  color: var(--pluse-admin-hero-fg);
  box-shadow: var(--pluse-admin-hero-shadow);
}

.admin-page-hero::before {
  position: absolute;
  inset: auto 4% -34% auto;
  width: 280px;
  height: 280px;
  content: '';
  border-radius: 999px;
  background: var(--pluse-admin-hero-orb);
  filter: blur(18px);
}

.admin-page-hero::after {
  position: absolute;
  inset: -16% auto auto 52%;
  width: 190px;
  height: 190px;
  content: '';
  border: 1px solid var(--pluse-admin-hero-accent-border);
  border-radius: 40px;
  transform: rotate(18deg);
}

.admin-page-hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  padding: 32px;
}

.admin-page-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.admin-page-eyebrow {
  margin: 0 0 10px;
  color: var(--primary);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  line-height: 1.2;
  text-transform: uppercase;
}

.admin-page-title {
  max-width: 820px;
  font-size: 2.18rem;
  font-weight: 680;
  letter-spacing: 0;
  line-height: 1.08;
}

.admin-page-description {
  max-width: 760px;
  margin: 12px 0 0;
  color: var(--pluse-admin-hero-muted);
  font-size: 1.02rem;
  line-height: 1.65;
}

.admin-page-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.admin-page-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  flex: none;
}

.admin-page-hero-extra {
  position: relative;
  z-index: 1;
  padding: 0 32px 32px;
}

.admin-page-tabs {
  margin-top: -12px;
}

.admin-page-content {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.admin-page-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 4px 0;
  color: var(--muted-foreground);
  font-size: 0.73rem;
}

.admin-page-footer__mark {
  font-weight: 900;
  letter-spacing: 0.14em;
  color: var(--primary);
  text-transform: uppercase;
}

.admin-page-footer__copy {
  text-align: right;
}

@media (max-width: 768px) {
  .admin-page-hero-content {
    flex-direction: column;
    padding: 24px;
  }

  .admin-page-title {
    font-size: 1.7rem;
  }

  .admin-page-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .admin-page-hero-extra {
    padding: 0 24px 24px;
  }

  .admin-page-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-page-footer__copy {
    text-align: left;
  }
}
</style>
