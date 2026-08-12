<template>
  <section v-if="events.length" class="audit-trail">
    <header class="audit-trail__head">
      <AppIcon name="ki-information-2" :size="14" />
      <h3>{{ title }}</h3>
    </header>

    <ol class="audit-trail__list">
      <li v-for="(ev, i) in events" :key="i" class="audit-trail__item">
        <span class="audit-trail__dot" :class="`is-${ev.tone || 'neutral'}`" />
        <div class="audit-trail__body">
          <p class="audit-trail__action">
            <strong>{{ ev.action }}</strong>
            <span v-if="ev.by" class="audit-trail__by">por {{ ev.by }}</span>
          </p>
          <p v-if="ev.at" class="audit-trail__when">{{ formatDateTime(ev.at) }}</p>
          <p v-if="ev.note" class="audit-trail__note">{{ ev.note }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

/**
 * AuditTrail — mostra "quem fez o quê e quando" para uma entidade auditada.
 *
 * Aceita uma `entity` (objecto com campos created_*, approved_*, updated_*)
 * ou uma lista `events` à medida. Eventos só aparecem se o `at` correspondente
 * estiver presente.
 *
 *   <AuditTrail :entity="employee" />
 *
 *   ou para mais controlo:
 *
 *   <AuditTrail :events="[
 *     { action: 'Criado', by: 'RH', at: '2026-01-01T...' },
 *     { action: 'Validado', by: 'Diretor de Operações', at: '...', tone: 'success' },
 *   ]" />
 */
const props = defineProps({
  title: { type: String, default: 'Histórico' },
  entity: { type: Object, default: null },
  events: { type: Array, default: null },
})

function nameOf(field) {
  // Aceita um user serializado (objecto com full_name/email) ou um id raw
  if (!field) return null
  if (typeof field === 'object') {
    return field.full_name || field.email || field.username || `#${field.id}`
  }
  return `#${field}`
}

const events = computed(() => {
  if (props.events) return props.events.filter((e) => e.at)
  const e = props.entity
  if (!e) return []

  const list = []
  if (e.created_at) {
    list.push({
      action: 'Criado',
      by: nameOf(e.created_by) || nameOf(e.created_by_name),
      at: e.created_at,
      tone: 'info',
    })
  }
  if (e.validated_at) {
    list.push({
      action: 'Validado',
      by: nameOf(e.validated_by) || nameOf(e.validated_by_name),
      at: e.validated_at,
      tone: 'success',
    })
  }
  if (e.approved_at) {
    list.push({
      action: 'Aprovado',
      by: nameOf(e.approved_by) || nameOf(e.approved_by_name),
      at: e.approved_at,
      tone: 'success',
    })
  }
  if (e.closed_at) {
    list.push({
      action: 'Encerrado',
      by: nameOf(e.closed_by) || nameOf(e.closed_by_name),
      at: e.closed_at,
      tone: 'neutral',
    })
  }
  if (e.rejection_reason) {
    list.push({
      action: 'Rejeitado',
      by: null,
      at: e.updated_at,
      tone: 'danger',
      note: e.rejection_reason,
    })
  }
  if (e.updated_at && e.updated_at !== e.created_at && !e.rejection_reason) {
    list.push({
      action: 'Actualizado',
      by: nameOf(e.updated_by) || nameOf(e.updated_by_name),
      at: e.updated_at,
      tone: 'neutral',
    })
  }

  // Ordenar cronológico
  return list
    .filter((x) => x.at)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
})

function formatDateTime(s) {
  if (!s) return ''
  try {
    return new Date(s).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return s }
}
</script>

<style scoped>
.audit-trail {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}
.audit-trail__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  color: var(--muted-foreground);
}
.audit-trail__head h3 {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}

.audit-trail__list {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}
.audit-trail__list::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 4px;
  bottom: 4px;
  width: 1px;
  background: var(--border);
}

.audit-trail__item {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 6px 0 10px 0;
}
.audit-trail__item:last-child { padding-bottom: 0; }

.audit-trail__dot {
  position: relative;
  width: 11px;
  height: 11px;
  flex: none;
  border-radius: 50%;
  background: var(--muted-foreground);
  margin-top: 4px;
  z-index: 1;
  box-shadow: 0 0 0 3px var(--card);
}
.audit-trail__dot.is-success { background: #16a34a; }
.audit-trail__dot.is-danger { background: var(--destructive); }
.audit-trail__dot.is-info { background: var(--primary); }
.audit-trail__dot.is-warning { background: #f59e0b; }

.audit-trail__body { flex: 1; min-width: 0; }
.audit-trail__action {
  font-size: 0.9rem;
  margin: 0;
  color: var(--mono);
}
.audit-trail__action strong { font-weight: 600; }
.audit-trail__by {
  margin-left: 4px;
  color: var(--muted-foreground);
  font-weight: 400;
}
.audit-trail__when {
  font-size: 0.76rem;
  color: var(--muted-foreground);
  margin: 2px 0 0;
}
.audit-trail__note {
  margin: 4px 0 0;
  padding: 6px 10px;
  font-size: 0.82rem;
  background: color-mix(in oklab, var(--destructive) 6%, transparent);
  border-left: 3px solid var(--destructive);
  border-radius: 4px;
  color: color-mix(in oklab, var(--destructive) 80%, black 20%);
}
</style>
