<template>
  <AdminPageTemplate
    eyebrow="Clientes"
    title="Registar cliente"
    description="Valide os dados mínimos para transformar uma oportunidade comercial num contrato operacional."
  >
    <template #actions>
      <router-link :to="{ name: 'clients-list' }" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-arrow-left" :size="16" icon-class="me-1.5" />
        Voltar
      </router-link>
      <button type="button" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-check" :size="16" icon-class="me-1.5" />
        Guardar cliente
      </button>
    </template>

    <template #meta>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-information-2" :size="14" />
        Dados demonstrativos
      </span>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-shield-tick" :size="14" />
        Cadastro completo
      </span>
    </template>

    <div class="pluse-demo-page">
      <section class="pluse-demo-form-layout">
        <form class="pluse-demo-form">
          <article class="pluse-demo-form-section">
            <div class="pluse-demo-section-head">
              <div>
                <span>Identificacao</span>
                <strong>Dados legais do cliente</strong>
              </div>
              <AppBadge variant="primary">Obrigatório</AppBadge>
            </div>

            <div class="pluse-demo-form-grid">
              <div class="pluse-demo-field">
                <label>Nome comercial <span>Obrigatório</span></label>
                <input value="MozMall Retail" />
                <small>Nome usado nas telas operacionais.</small>
              </div>
              <div class="pluse-demo-field">
                <label>Razao social <span>Obrigatório</span></label>
                <input value="MozMall Retail, Lda" />
              </div>
              <div class="pluse-demo-field">
                <label>NUIT <span>Obrigatório</span></label>
                <input value="400123456" />
              </div>
              <div class="pluse-demo-field">
                <label>Sector <span class="optional">Opcional</span></label>
                <select>
                  <option>Retalho</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Tipo de cliente <span>Obrigatório</span></label>
                <select>
                  <option>Empresa privada</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Estado <span>Obrigatório</span></label>
                <select>
                  <option>Ativo</option>
                  <option>Pendente</option>
                  <option>Inactivo</option>
                </select>
              </div>
              <div class="pluse-demo-field is-wide">
                <label>Endereco fiscal <span>Obrigatório</span></label>
                <input value="Av. Julius Nyerere, Maputo" />
              </div>
              <div class="pluse-demo-field">
                <label>Provincia <span>Obrigatório</span></label>
                <select>
                  <option>Maputo Cidade</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Distrito/Cidade <span>Obrigatório</span></label>
                <input value="Maputo" />
              </div>
            </div>
          </article>

          <article class="pluse-demo-form-section">
            <div class="pluse-demo-section-head">
              <div>
                <span>Contactos</span>
                <strong>Quem responde pela operação</strong>
              </div>
            </div>

            <div class="pluse-demo-form-grid">
              <div class="pluse-demo-field">
                <label>Responsável operacional <span>Obrigatório</span></label>
                <input value="Ana Muchanga" />
              </div>
              <div class="pluse-demo-field">
                <label>Telefone <span>Obrigatório</span></label>
                <input value="+258 84 123 4567" />
              </div>
              <div class="pluse-demo-field">
                <label>Email <span>Obrigatório</span></label>
                <input value="operações@mozmall.co.mz" />
              </div>
              <div class="pluse-demo-field">
                <label>Canal de alertas <span class="optional">Opcional</span></label>
                <select>
                  <option>Email e telefone</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Cargo do responsavel <span>Obrigatório</span></label>
                <input value="Gestora de Operacoes" />
              </div>
              <div class="pluse-demo-field">
                <label>Contacto alternativo <span class="optional">Opcional</span></label>
                <input value="+258 82 555 4433" />
              </div>
              <div class="pluse-demo-field">
                <label>Responsável financeiro <span class="optional">Opcional</span></label>
                <input value="Rui Mucavele" />
              </div>
              <div class="pluse-demo-field">
                <label>Email financeiro <span class="optional">Opcional</span></label>
                <input value="financeiro@mozmall.co.mz" />
              </div>
              <div class="pluse-demo-field is-wide">
                <label>Notas internas <span class="optional">Opcional</span></label>
                <textarea>Cliente exige relatório operacional semanal e validação mensal de presenças.</textarea>
              </div>
            </div>
          </article>

          <article class="pluse-demo-form-section">
            <div class="pluse-demo-section-head">
              <div>
                <span>Operação e faturação</span>
                <strong>Preferencias antes do primeiro contrato</strong>
              </div>
              <AppBadge variant="info">A validar</AppBadge>
            </div>

            <div class="pluse-demo-form-grid">
              <div class="pluse-demo-field">
                <label>Periodicidade de relatório <span>Obrigatório</span></label>
                <select>
                  <option>Semanal e mensal</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Formato de faturação <span>Obrigatório</span></label>
                <select>
                  <option>Por contrato e posto</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Prazo de pagamento <span class="optional">Opcional</span></label>
                <select>
                  <option>30 dias</option>
                </select>
              </div>
              <div class="pluse-demo-field">
                <label>Retencao/Imposto <span class="optional">A validar</span></label>
                <select>
                  <option>Aplicar regra padrao</option>
                </select>
              </div>
              <div class="pluse-demo-field is-wide">
                <label>Observacoes comerciais <span class="optional">Opcional</span></label>
                <textarea>Cliente pretende iniciar com 18 postos e expandir para parqueamento após aprovação do primeiro relatório.</textarea>
              </div>
            </div>
          </article>

          <div class="pluse-demo-form-actions">
            <router-link :to="{ name: 'clients-list' }" class="kt-btn kt-btn-outline">Cancelar</router-link>
            <router-link :to="{ name: 'contracts-new' }" class="kt-btn kt-btn-primary">Guardar e criar contrato</router-link>
          </div>
        </form>

        <aside class="pluse-demo-panel pluse-demo-side-note">
          <div class="pluse-demo-section-head">
            <div>
              <span>Validacao do formulario</span>
              <strong>Campos a confirmar com a equipa</strong>
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
        </aside>
      </section>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

const checklist = [
  { title: 'NUIT deve ser obrigatório?', copy: 'Importante se a faturação entrar no MVP.', icon: 'ki-document', tone: 'is-blue' },
  { title: 'Responsável operacional', copy: 'Necessário para alertas de ausência e ocorrências.', icon: 'ki-profile-user', tone: 'is-green' },
  { title: 'Endereco fiscal vs. local operacional', copy: 'Podem ser dados diferentes em clientes com varios postos.', icon: 'ki-geolocation', tone: 'is-amber' },
]
</script>
