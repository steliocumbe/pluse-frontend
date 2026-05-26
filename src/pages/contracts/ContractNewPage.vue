<template>
  <AdminPageTemplate
    eyebrow="Contratos"
    title="Registar contrato"
    description="Defina o acordo comercial que vai gerar postos, escalas e a base de faturação em meticais."
    :breadcrumb="[
      { label: 'Contratos', to: { name: 'contracts-list' } },
      { label: 'Novo' },
    ]"
    :back-to="{ name: 'contracts-list' }"
  >
    <template #actions>
      <router-link :to="{ name: 'contracts-list' }" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-arrow-left" :size="16" icon-class="me-1.5" />
        Voltar
      </router-link>
      <button type="button" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-check" :size="16" icon-class="me-1.5" />
        Enviar para aprovação
      </button>
    </template>

    <template #meta>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-dollar" :size="14" />
        Valores em meticais
      </span>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-time" :size="14" />
        Requer aprovação
      </span>
    </template>

    <div class="pluse-demo-page">
      <section class="pluse-demo-form-layout">
        <form class="pluse-demo-form">
          <article class="pluse-demo-form-section">
            <div class="pluse-demo-section-head">
              <div>
                <span>Dados comerciais</span>
                <strong>Cliente, período e serviço</strong>
              </div>
              <AppBadge variant="warning">Em revisão</AppBadge>
            </div>

            <div class="pluse-demo-form-grid">
              <div class="pluse-demo-field">
                <label>Cliente <span>Obrigatório</span></label>
                <select>
                  <option>MozMall Retail</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Tipo de serviço <span>Obrigatório</span></label>
                <select>
                  <option>Segurança perimetral</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Inicio <span>Obrigatório</span></label>
                <input value="2026-05-01" />
              </div>
              <div class="pluse-demo-field">
                <label>Fim <span>Obrigatório</span></label>
                <input value="2027-04-30" />
              </div>
              <div class="pluse-demo-field">
                <label>Valor mensal <span>Obrigatório</span></label>
                <input value="1.280.000 MT" />
                <small>Sem abreviacao para evitar ambiguidade em apresentação e financeiro.</small>
              </div>
              <div class="pluse-demo-field">
                <label>Moeda <span>Obrigatório</span></label>
                <select>
                  <option>Metical - MT</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Estado inicial <span>Obrigatório</span></label>
                <select>
                  <option>Pendente de aprovação</option>
                </select>
              </div>
              <!-- <div class="pluse-demo-field">
                <label>Centro de custo <span class="optional">Opcional</span></label>
                <input value="MZ-MAPUTO-RETAIL" />
              </div> -->
            </div>
          </article>

          <article class="pluse-demo-form-section">
            <div class="pluse-demo-section-head">
              <div>
                <span>Operação contratada</span>
                <strong>Base para criar postos</strong>
              </div>
            </div>

            <div class="pluse-demo-form-grid">
              <div class="pluse-demo-field">
                <label>Nº de postos previstos <span>Obrigatório</span></label>
                <input value="18" />
              </div>
              <div class="pluse-demo-field">
                <label>Vigilantes contratados <span>Obrigatório</span></label>
                <input value="42" />
              </div>
              <div class="pluse-demo-field">
                <label>Turnos incluidos <span>Obrigatório</span></label>
                <select>
                  <option>Diurno e noturno</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Regra de faturação <span>Obrigatório</span></label>
                <select>
                  <option>Por presença validada</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Horas por turno <span>Obrigatório</span></label>
                <select>
                  <option>12 horas</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Substituicao em falta <span>Obrigatório</span></label>
                <select>
                  <option>Obrigatória em até 2 horas</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Rondas incluidas <span class="optional">A validar</span></label>
                <select>
                  <option>Sim, por posto critico</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Ocorrências no relatório <span>Obrigatório</span></label>
                <select>
                  <option>Incluir todas as abertas e resolvidas</option>
                </select>
              </div>
              <div class="pluse-demo-field is-wide">
                <label>Condicoes especiais <span class="optional">Opcional</span></label>
                <textarea>Descontar faltas nao substituidas e reportar postos incompletos no fecho mensal.</textarea>
              </div>
            </div>
          </article>

          <article class="pluse-demo-form-section">
            <div class="pluse-demo-section-head">
              <div>
                <span>Aprovacao e documentos</span>
                <strong>Controlo antes de activar contrato</strong>
              </div>
              <AppBadge variant="danger">Sensivel</AppBadge>
            </div>

            <div class="pluse-demo-form-grid">
              <div class="pluse-demo-field">
                <label>Aprovador comercial <span>Obrigatório</span></label>
                <select>
                  <option>Direção Geral</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Aprovador financeiro <span>Obrigatório</span></label>
                <select>
                  <option>Direção Financeira</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Contrato assinado <span>Obrigatório</span></label>
                <select>
                  <option>Anexo pendente</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Proposta comercial <span class="optional">Opcional</span></label>
                <select>
                  <option>Anexo recebido</option>
                </select>
              </div>
              <div class="pluse-demo-field is-wide">
                <label>Justificacao de aprovação <span class="optional">Opcional</span></label>
                <textarea>Contrato prioritario para abertura de postos antes do inicio do mes operacional.</textarea>
              </div>
            </div>
          </article>

          <div class="pluse-demo-form-actions">
            <router-link :to="{ name: 'contracts-list' }" class="kt-btn kt-btn-outline">Cancelar</router-link>
            <router-link :to="{ name: 'posts-new' }" class="kt-btn kt-btn-primary">Aprovar demo e criar posto</router-link>
          </div>
        </form>

        <!-- <aside class="pluse-demo-panel pluse-demo-side-note">
          <div class="pluse-demo-section-head">
            <div>
              <span>Questoes de negocio</span>
              <strong>Campos a validar</strong>
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
//   { title: 'Faturação por posto ou presença?', copy: 'Define como o financeiro fecha o período.', icon: 'ki-dollar', tone: 'is-blue' },
//   { title: 'Quem aprova contratos?', copy: 'Direção, financeiro ou ambos podem ser necessários.', icon: 'ki-shield-tick', tone: 'is-red' },
//   { title: 'Turnos padrao', copy: 'Precisamos confirmar turnos usados na operação real.', icon: 'ki-time', tone: 'is-amber' },
// ]
</script>
