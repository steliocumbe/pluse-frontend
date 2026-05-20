<template>
  <AdminPageTemplate
    eyebrow="Postos"
    title="Registar posto"
    description="Transforme o contrato aprovado num local operacional com GPS, QR Code, lotacao e regras de check-in."
  >
    <template #actions>
      <router-link :to="{ name: 'posts-list' }" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-arrow-left" :size="16" icon-class="me-1.5" />
        Voltar
      </router-link>
      <button type="button" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-check" :size="16" icon-class="me-1.5" />
        Guardar posto
      </button>
    </template>

    <template #meta>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-geolocation" :size="14" />
        GPS obrigatório
      </span>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-qr-code" :size="14" />
        QR Code preparado
      </span>
    </template>

    <div class="pluse-demo-page">
      <section class="pluse-demo-form-layout">
        <form class="pluse-demo-form">
          <article class="pluse-demo-form-section">
            <div class="pluse-demo-section-head">
              <div>
                <span>Localizacao</span>
                <strong>Identificacao do posto</strong>
              </div>
              <AppBadge variant="primary">Operacional</AppBadge>
            </div>

            <div class="pluse-demo-form-grid">
              <div class="pluse-demo-field">
                <label>Cliente <span>Obrigatório</span></label>
                <select>
                  <option>MozMall Retail</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Contrato <span>Obrigatório</span></label>
                <select>
                  <option>C-104 - Segurança perimetral</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Nome do posto <span>Obrigatório</span></label>
                <input value="MozMall Entrada Norte" />
              </div>
              <div class="pluse-demo-field">
                <label>Codigo interno <span class="optional">Automatico</span></label>
                <input value="P-018" />
              </div>
              <div class="pluse-demo-field is-wide">
                <label>Endereco operacional <span>Obrigatório</span></label>
                <input value="Av. Julius Nyerere, entrada norte do centro comercial" />
              </div>
              <div class="pluse-demo-field">
                <label>Latitude <span>Obrigatório</span></label>
                <input value="-25.966421" />
              </div>
              <div class="pluse-demo-field">
                <label>Longitude <span>Obrigatório</span></label>
                <input value="32.583214" />
              </div>
              <div class="pluse-demo-field">
                <label>Zona operacional <span>Obrigatório</span></label>
                <select>
                  <option>Centro urbano</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Nivel de risco <span>Obrigatório</span></label>
                <select>
                  <option>Medio</option>
                  <option>Alto</option>
                  <option>Critico</option>
                </select>
              </div>
            </div>
          </article>

          <article class="pluse-demo-form-section">
            <div class="pluse-demo-section-head">
              <div>
                <span>Regras de presenca</span>
                <strong>Check-in e cobertura</strong>
              </div>
            </div>

            <div class="pluse-demo-form-grid">
              <div class="pluse-demo-field">
                <label>Vigilantes por turno <span>Obrigatório</span></label>
                <input value="2" />
              </div>
              <div class="pluse-demo-field">
                <label>Raio GPS permitido <span>Obrigatório</span></label>
                <input value="120 metros" />
              </div>
              <div class="pluse-demo-field">
                <label>QR Code <span>Obrigatório</span></label>
                <select>
                  <option>Gerar automaticamente</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Foto no check-in <span class="optional">A validar</span></label>
                <select>
                  <option>Exigir apenas em postos críticos</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Tolerancia de atraso <span>Obrigatório</span></label>
                <input value="15 minutos" />
              </div>
              <div class="pluse-demo-field">
                <label>Check-out obrigatório <span class="optional">A validar</span></label>
                <select>
                  <option>Sim, no fim do turno</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Permitir offline <span>Obrigatório</span></label>
                <select>
                  <option>Sim, sincronizar quando houver internet</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Supervisor responsavel <span>Obrigatório</span></label>
                <select>
                  <option>Mateus Bila</option>
                </select>
              </div>
              <div class="pluse-demo-field is-wide">
                <label>Instrucoes do posto <span class="optional">Opcional</span></label>
                <textarea>Vigilante deve confirmar abertura do portão de serviço e registar ocorrências fora do horario comercial.</textarea>
              </div>
            </div>
          </article>

          <article class="pluse-demo-form-section">
            <div class="pluse-demo-section-head">
              <div>
                <span>Escala inicial</span>
                <strong>Como o posto entra na operação</strong>
              </div>
              <AppBadge variant="warning">Antes do turno</AppBadge>
            </div>

            <div class="pluse-demo-form-grid">
              <div class="pluse-demo-field">
                <label>Data de inicio <span>Obrigatório</span></label>
                <input value="2026-05-18" />
              </div>
              <div class="pluse-demo-field">
                <label>Turno inicial <span>Obrigatório</span></label>
                <select>
                  <option>Diurno - 06h as 18h</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Vigilante principal <span class="optional">Opcional</span></label>
                <select>
                  <option>Joao Mucavele</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Vigilante substituto <span class="optional">Opcional</span></label>
                <select>
                  <option>Por definir</option>
                </select>
              </div>
              <div class="pluse-demo-field is-wide">
                <label>Equipamento necessário <span class="optional">Opcional</span></label>
                <textarea>Rádio, lanterna, fardamento completo e livro de ocorrências.</textarea>
              </div>
            </div>
          </article>

          <div class="pluse-demo-form-actions">
            <router-link :to="{ name: 'posts-list' }" class="kt-btn kt-btn-outline">Cancelar</router-link>
            <router-link to="/schedules" class="kt-btn kt-btn-primary">Guardar e criar escala</router-link>
          </div>
        </form>

        <!-- <aside class="pluse-demo-panel pluse-demo-side-note">
          <div class="pluse-demo-section-head">
            <div>
              <span>Decisoes de campo</span>
              <strong>O que precisamos validar</strong>
            </div>
          </div>
          <div class="pluse-demo-required-list">
            <div v-for="item in checklist" :key="item.title">
              <span class="pluse-demo-card-icon" :class="item.tone">
                <AppIcon :name="item.icon" :size="17" />
              </span>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.copy }}</p>
              </div>
            </div>
          </div>
        </aside> -->
      </section>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

// Side-panel data — paired with the commented-out <aside> in the template.
// Kept commented so ESLint doesn't flag it as unused; uncomment together
// with the matching <aside> when the panel is re-enabled.
// const checklist = [
//   { title: 'GPS sempre obrigatório?', copy: 'Essencial para provar presenca, mas pode variar por conectividade.', icon: 'ki-geolocation', tone: 'is-blue' },
//   { title: 'QR Code fisico', copy: 'Precisamos decidir se sera impresso, colado no posto ou mostrado pelo cliente.', icon: 'ki-qr-code', tone: 'is-amber' },
//   { title: 'Foto no check-in', copy: 'Aumenta prova, mas pode tornar o fluxo mais pesado no campo.', icon: 'ki-picture', tone: 'is-red' },
// ]
</script>
