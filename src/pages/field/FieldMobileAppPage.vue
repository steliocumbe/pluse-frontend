<template>
  <main class="field-app" :class="`field-app--${screen}`">
    <header class="field-app-header">
      <div>
        <span>{{ current.eyebrow }}</span>
        <strong>{{ current.title }}</strong>
      </div>
      <span class="field-app-avatar">JM</span>
    </header>

    <section v-if="screen === 'schedule'" class="field-app-content">
      <article class="field-app-hero">
        <span>{{ fieldShift.date }}</span>
        <strong>{{ fieldShift.currentPost }}</strong>
        <p>{{ fieldShift.shift }} - supervisor {{ fieldShift.supervisor }}</p>
        <router-link to="/vigilante/check-in" class="field-app-primary">Iniciar check-in</router-link>
      </article>

      <div class="field-app-timeline">
        <article v-for="item in fieldSchedule" :key="item.title" :class="item.tone">
          <time>{{ item.time }}</time>
          <span><AppIcon :name="item.icon" :size="16" /></span>
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.copy }}</p>
          </div>
        </article>
      </div>
    </section>

    <section v-else-if="screen === 'post'" class="field-app-content">
      <article class="field-app-map">
        <AppIcon name="ki-geolocation" :size="34" />
        <strong>{{ fieldPost.name }}</strong>
        <p>{{ fieldPost.address }}</p>
      </article>

      <div class="field-app-cards">
        <article>
          <span>Cliente</span>
          <strong>{{ fieldPost.client }}</strong>
          <p>Raio permitido: {{ fieldPost.radius }}</p>
        </article>
        <article>
          <span>QR Code</span>
          <strong>{{ fieldPost.qr }}</strong>
          <p>Obrigatório para confirmar presença.</p>
        </article>
      </div>

      <article class="field-app-panel">
        <strong>Instruções</strong>
        <p v-for="item in fieldPost.instructions" :key="item">{{ item }}</p>
      </article>
    </section>

    <section v-else-if="screen === 'check-in'" class="field-app-content">
      <article class="field-app-scan">
        <div>
          <AppIcon name="ki-qr-code" :size="72" />
        </div>
        <strong>Leia o QR Code do posto</strong>
        <p>GPS ativo. Está a 28 m do ponto permitido.</p>
      </article>

      <div class="field-app-cards two">
        <article>
          <span>GPS</span>
          <strong>Validado</strong>
          <p>Dentro do raio</p>
        </article>
        <article>
          <span>Ligação</span>
          <strong>Online</strong>
          <p>Envio imediato</p>
        </article>
      </div>

      <router-link to="/vigilante/resultado" class="field-app-primary">Confirmar check-in</router-link>
      <router-link to="/vigilante/offline" class="field-app-secondary">Guardar offline</router-link>
    </section>

    <section v-else-if="screen === 'result'" class="field-app-content">
      <article class="field-app-result success">
        <span><AppIcon name="ki-check-circle" :size="48" /></span>
        <strong>Presença confirmada</strong>
        <p>MozMall Entrada Norte, 06:02. GPS, QR Code e horário validados.</p>
      </article>

      <article class="field-app-panel warning">
        <strong>Quando houver erro</strong>
        <p>O sistema mostra o motivo: fora do raio, QR inválido ou ligação indisponível.</p>
      </article>

      <router-link to="/vigilante/ocorrencia" class="field-app-secondary">Reportar ocorrência</router-link>
    </section>

    <section v-else-if="screen === 'offline'" class="field-app-content">
      <article class="field-app-result offline">
        <span><AppIcon name="ki-cloud" :size="48" /></span>
        <strong>Check-in guardado</strong>
        <p>Será sincronizado automaticamente quando a ligação voltar.</p>
      </article>

      <div class="field-app-cards">
        <article v-for="item in offlineQueue" :key="item.title">
          <span>{{ item.badge }}</span>
          <strong>{{ item.title }}</strong>
          <p>{{ item.copy }}</p>
        </article>
      </div>

      <button type="button" class="field-app-primary">Tentar sincronizar</button>
    </section>

    <section v-else class="field-app-content">
      <form class="field-app-form">
        <label>
          <span>Tipo</span>
          <select>
            <option v-for="type in incidentTypes" :key="type">{{ type }}</option>
          </select>
        </label>
        <label>
          <span>Prioridade</span>
          <select>
            <option>Normal</option>
            <option>Alta</option>
            <option>Crítica</option>
          </select>
        </label>
        <label>
          <span>Descrição</span>
          <textarea rows="5">Porta lateral encontrada aberta durante ronda interna.</textarea>
        </label>
      </form>

      <div class="field-app-evidence">
        <button type="button"><AppIcon name="ki-picture" :size="18" /> Foto</button>
        <button type="button"><AppIcon name="ki-geolocation" :size="18" /> GPS</button>
        <button type="button"><AppIcon name="ki-microphone" :size="18" /> Áudio</button>
      </div>

      <button type="button" class="field-app-primary">Enviar ao supervisor</button>
    </section>

    <nav class="field-app-nav">
      <router-link to="/vigilante/escala"><AppIcon name="ki-calendar" :size="18" />Escala</router-link>
      <router-link to="/vigilante/posto"><AppIcon name="ki-geolocation" :size="18" />Posto</router-link>
      <router-link to="/vigilante/check-in"><AppIcon name="ki-qr-code" :size="18" />Check-in</router-link>
      <router-link to="/vigilante/ocorrencia"><AppIcon name="ki-warning-2" :size="18" />Ocorrência</router-link>
    </nav>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { fieldPost, fieldSchedule, fieldShift, incidentTypes, offlineQueue } from 'src/data/fieldDemoData'

const props = defineProps({
  screen: { type: String, required: true },
})

const titles = {
  schedule: { eyebrow: 'PLUSE Campo', title: 'Escala do dia' },
  post: { eyebrow: 'Posto de serviço', title: 'Detalhe do posto' },
  'check-in': { eyebrow: 'Validação', title: 'Check-in GPS/QR' },
  result: { eyebrow: 'Validação', title: 'Resultado do check-in' },
  offline: { eyebrow: 'Modo offline', title: 'Pendente de sincronização' },
  incident: { eyebrow: 'Ocorrências', title: 'Nova ocorrência' },
}

const current = computed(() => titles[props.screen] || titles.schedule)
</script>
