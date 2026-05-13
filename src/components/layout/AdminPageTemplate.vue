<template>
  <section class="admin-page kt-container-fluid">
    <div class="admin-page-hero">
      <div class="admin-page-hero-content">
        <div>
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
  </section>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
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
  border: 1px solid color-mix(in oklab, var(--primary) 18%, transparent);
  border-radius: 18px;
  background: var(--pluse-page-hero);
  color: white;
  box-shadow: 0 22px 60px color-mix(in oklab, var(--pluse-navy-950) 14%, transparent);
}

.admin-page-hero::before {
  position: absolute;
  inset: auto 4% -42% auto;
  width: 320px;
  height: 320px;
  content: '';
  border-radius: 999px;
  background: color-mix(in oklab, var(--pluse-cyan-500) 22%, transparent);
  filter: blur(10px);
}

.admin-page-hero::after {
  position: absolute;
  inset: -30% auto auto 46%;
  width: 220px;
  height: 220px;
  content: '';
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 32px;
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

.admin-page-eyebrow {
  margin: 0 0 10px;
  color: color-mix(in oklab, white 78%, var(--pluse-cyan-500));
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
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
  color: rgba(255, 255, 255, 0.78);
  font-size: 1.02rem;
  line-height: 1.72;
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
}
</style>
