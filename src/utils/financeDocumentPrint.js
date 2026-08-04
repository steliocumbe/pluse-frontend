function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function resolveDocumentAssetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path

  const desktopBackend = typeof window !== 'undefined' ? window.pluseDesktop?.backendUrl : null
  const base = (desktopBackend || import.meta.env.VITE_API_URL || window.location.origin || '').replace(/\/+$/, '')
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}

export function formatDocumentMoney(value, currency = 'MZN') {
  const amount = Number(value || 0)
  return `${amount.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

export function formatDocumentDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('pt-PT')
  } catch {
    return String(value)
  }
}

export function openFinancePrintWindow({ title, html, mode = 'print', toast }) {
  const printWindow = window.open('', '_blank', 'width=1160,height=860')
  if (!printWindow) {
    toast?.error?.('Não foi possível abrir a janela de impressão.')
    return false
  }

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()

  printWindow.onload = () => {
    if (mode === 'print' || mode === 'pdf') {
      printWindow.print()
    }
  }

  if (mode === 'pdf') {
    toast?.info?.('Na janela de impressão, escolha “Guardar como PDF” e desative “Cabeçalhos e rodapés”.')
  }
  if (title) {
    try {
      printWindow.document.title = title
    } catch {
      // Ignore title assignment failures in restricted print contexts.
    }
  }
  return true
}

export function buildFinanceDocumentHtml({
  company = {},
  accent = '#3b82f6',
  document = {},
  hero = {},
  metaCards = [],
  counterparty = null,
  lineTable = null,
  notes = [],
  paymentBlocks = [],
  totals = [],
  footerNote = '',
}) {
  const logoUrl = resolveDocumentAssetUrl(company.logo_file)
  const stampUrl = resolveDocumentAssetUrl(company.stamp_file)
  
  // Identidade Rica com Fallbacks
  const companyName = company.trade_name || company.legal_name || 'MIGUEL M.C ERP'
  const slogan = company.slogan || 'Onde estiveres, estamos contigo'
  const contactLine = [company.phone_1, company.official_email].filter(Boolean).join(' • ')
  const companyLine2 = [company.address, contactLine].filter(Boolean).join(' | ')

  const metaHtml = metaCards.map((card) => `
    <div class="meta-line">
      <span>${escapeHtml(card.labelPt || '')}</span>
      <strong>${escapeHtml(card.value || '—')}</strong>
    </div>
  `).join('')

  const paymentHtml = paymentBlocks.length ? paymentBlocks.map((block) => `
    <div class="payment-line">
      <span>${escapeHtml(block.titlePt || '')}</span>
      <strong>${escapeHtml(block.name || '—')}</strong>
      <p>${escapeHtml(block.detail || '—')}</p>
    </div>
  `).join('') : '<div class="payment-line"><strong>Sem instruções adicionais</strong></div>'

  const totalsHtml = totals.map((item) => `
    <div class="total-row ${item.highlight ? 'total-row--highlight' : ''}">
      <div>
        <small>${escapeHtml(item.labelPt || '')}<span>${escapeHtml(item.labelEn || '')}</span></small>
      </div>
      <strong>${escapeHtml(item.value || '—')}</strong>
    </div>
  `).join('')

  const counterpartyDetails = Array.isArray(counterparty?.details)
    ? counterparty.details.filter(Boolean)
    : []

  const notesHtml = notes.length ? `
    <div class="notes-plain">
      ${notes.map((note) => `<p>${escapeHtml(note)}</p>`).join('')}
    </div>
  ` : ''

  const lineTableHtml = lineTable ? `
    <div class="wave-table-shell">
      <table>
        <thead>
          <tr>
            ${lineTable.columns.map((col) => `<th class="${col.align === 'right' ? 'num' : ''}">${escapeHtml(col.labelPt || '')}<span>${escapeHtml(col.labelEn || '')}</span></th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${lineTable.rows.map((row) => `
            <tr>
              ${lineTable.columns.map((col) => `<td class="${col.align === 'right' ? 'num' : ''}">${escapeHtml(row[col.key] ?? '—')}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : ''

  return `<!doctype html>
  <html lang="pt">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(document.title || companyName)}</title>
      <style>
        :root {
          --ink: #1e293b;
          --muted: #64748b;
          --line: #f1f5f9;
          --panel: #f8fafc;
          --accent: ${accent};
          --radius-wave: 24px;
          --shadow-soft: 0 14px 40px -14px rgba(15, 23, 42, 0.08);
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: #e2e8f0;
          color: var(--ink);
          font-family: 'Inter', system-ui, sans-serif;
          padding: 14px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        /* A estrutura .sheet agora usa Flexbox para preencher a página A4 e empurrar o rodapé */
        .sheet {
          max-width: 980px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: var(--shadow-soft);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .sheet::before {
          content: '';
          position: absolute;
          inset: 0 auto 0 0;
          width: 8px;
          background: linear-gradient(180deg, var(--accent), #60a5fa);
        }
        
        /* CABEÇALHO RICO */
        .hero {
          display: grid;
          grid-template-columns: 88px 1fr auto;
          gap: 16px;
          align-items: start;
          padding: 20px 24px 14px;
        }
        .brand {
          width: 88px; height: 88px;
          border-radius: 14px;
          background: var(--panel);
          border: 1px solid var(--line);
          display: grid; place-items: center;
          padding: 8px;
        }
        .brand img { width: 100%; height: 100%; object-fit: contain; }
        .brand-fallback { font-size: 32px; font-weight: 900; color: var(--accent); }
        .company-name { margin: 0; font-size: 1rem; font-weight: 800; letter-spacing: -0.01em; }
        .company-copy { margin-top: 5px; color: var(--muted); font-size: 0.72rem; line-height: 1.25; max-width: 460px; }
        
        .doc-mark { text-align: right; }
        .doc-kicker { color: var(--accent); text-transform: uppercase; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.05em; }
        .doc-title { margin: 2px 0; font-size: 1.45rem; font-weight: 900; line-height: 1; color: var(--ink); }
        .doc-subtitle { color: var(--muted); font-size: 0.72rem; font-weight: 600; }
        .doc-number { margin-top: 8px; font-size: 1.2rem; color: var(--accent); font-weight: 900; }
        .doc-operator { margin-top: 4px; color: var(--muted); font-size: 0.72rem; }
        
        /* CORPO */
        .content {
          flex: 1;
          padding: 4px 24px 12px;
          display: flex;
          flex-direction: column;
        }
        .top-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(220px, 0.8fr);
          gap: 12px;
          margin-bottom: 12px;
        }
        
        /* COMPONENTES WAVE (Sombras e Bordas Suaves) */
        .party-card {
          border: 1px solid var(--line);
          border-radius: 12px;
          background: #fff;
          padding: 10px 12px;
        }
        .party-card small { display: block; color: var(--muted); font-size: 0.64rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; }
        .party-card small span { font-size: 0.58rem; opacity: 0.7; margin-top: 2px; display: block; }
        .party-card strong { display: block; margin-top: 6px; font-size: 0.92rem; color: var(--ink); }
        .party-card p { margin: 3px 0 0; color: var(--muted); font-size: 0.72rem; line-height: 1.2; }
        .meta-stack { border: 1px solid var(--line); border-radius: 12px; padding: 8px 10px; background: #fff; }
        .meta-line { display: flex; justify-content: space-between; gap: 8px; padding: 5px 0; border-top: 1px dashed #e2e8f0; }
        .meta-line:first-child { border-top: none; }
        .meta-line span { font-size: 0.68rem; color: var(--muted); }
        .meta-line strong { font-size: 0.74rem; color: var(--ink); text-align: right; }
        
        /* TABELAS LINDAS E LEVES */
        .wave-table-shell {
          border-radius: 12px;
          border: 1px solid var(--line);
          background: white;
          overflow: hidden;
          margin-bottom: 12px;
          box-shadow: 0 4px 20px -10px rgba(15,23,42,0.05);
        }
        table { width: 100%; border-collapse: collapse; }
        thead th { background: var(--panel); color: var(--muted); text-align: left; padding: 9px 10px; font-size: 0.64rem; font-weight: 800; text-transform: uppercase; }
        thead th span { display: block; margin-top: 2px; font-size: 0.56rem; font-weight: 600; }
        tbody td { padding: 9px 10px; border-top: 1px solid var(--line); font-size: 0.74rem; }
        .num { text-align: right; font-variant-numeric: tabular-nums; }
        
        /* BASE FINANCEIRA */
        .bottom-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
          gap: 12px;
          align-items: start;
          margin-top: 0;
        }
        .payment-stack { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; border: 1px solid var(--line); border-radius: 12px; padding: 8px 10px; background: #fff; }
        .payment-line span { display: block; font-size: 0.66rem; color: var(--muted); }
        .payment-line strong { display: block; font-size: 0.76rem; margin-top: 2px; }
        .payment-line p { margin: 2px 0 0; font-size: 0.7rem; color: var(--muted); }
        .notes-plain p { margin: 0; font-size: 0.68rem; line-height: 1.25; color: var(--muted); }
        .totals-card { background: var(--panel); border-radius: 12px; padding: 10px; border: 1px solid var(--line); }
        .total-row { display: flex; justify-content: space-between; align-items: end; padding: 12px 0; border-top: 1px solid #e2e8f0; }
        .total-row:first-child { border-top: none; padding-top: 0; }
        .total-row strong { font-size: 0.84rem; font-weight: 800; }
        .total-row small { font-size: 0.62rem; }
        .total-row--highlight { margin-top: 8px; border-top: none; border-radius: 10px; background: var(--accent); padding: 10px; color: white; }
        .total-row--highlight small, .total-row--highlight strong { color: white; }
        
        .stamp { margin-top: 16px; width: 140px; text-align: center; margin-left: auto; }
        .stamp img { width: 100%; height: auto; object-fit: contain; opacity: 0.95; mix-blend-mode: multiply; }
        .stamp small { margin-top: 6px; display: block; font-size: 0.64rem; }
        
        /* RODAPÉ 100% RICO E FIXO NO FUNDO */
        .footer-rich {
          margin-top: auto;
          background: #f8fafc;
          border-top: 1px solid var(--line);
          padding: 10px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }
        .footer-info { display: flex; flex-direction: column; gap: 6px; }
        .footer-info p { margin: 0; font-size: 0.68rem; color: var(--muted); font-weight: 500; }
        .footer-slogan { text-align: right; }
        .footer-slogan strong { display: block; font-size: 0.72rem; color: var(--ink); font-weight: 800; }
        .footer-slogan span { font-size: 0.62rem; color: var(--accent); font-weight: 600; letter-spacing: 0.4px; }

        @media (max-width: 900px) {
          .top-grid { grid-template-columns: 1fr; }
          .bottom-grid { grid-template-columns: 1fr; }
          .doc-mark { text-align: left; }
        }

        /* OTIMIZAÇÃO DE IMPRESSÃO - PREVENIR PÁGINAS EM BRANCO */
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body { width: 210mm; min-height: 297mm; height: 297mm; margin: 0; padding: 0; background: white; }
          
          .sheet {
            width: 100%;
            min-height: 297mm;
            height: 297mm;
            margin: 0;
            border-radius: 0;
            border: none;
            box-shadow: none;
          }

          .content {
            flex: 1 1 auto;
          }
          
          /* Elementos que não podem ser cortados ao meio */
          .wave-table-shell, .totals-card, .party-card, .payment-stack {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .footer-rich {
            border-radius: 0;
            margin-top: auto;
          }
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        <header class="hero">
          <div class="brand">
            ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="Company logo" />` : `<div class="brand-fallback">${escapeHtml((companyName || 'P').slice(0, 1))}</div>`}
          </div>
          <div>
            <h1 class="company-name">${escapeHtml(companyName)}</h1>
            <div class="company-copy">
              ${company.nuit ? `NUIT: ${escapeHtml(company.nuit)}<br/>` : ''}
              ${escapeHtml(companyLine2)}
            </div>
          </div>
          <div class="doc-mark">
            <div class="doc-kicker">${escapeHtml(hero.kickerPt || '')} ${hero.kickerEn ? `/ ${escapeHtml(hero.kickerEn)}` : ''}</div>
            <div class="doc-title">${escapeHtml(hero.titlePt || '')}</div>
            <div class="doc-subtitle">${escapeHtml(hero.titleEn || '')}</div>
            <div class="doc-number">${escapeHtml(document.number || '')}</div>
            ${document.operator ? `<div class="doc-operator">${escapeHtml(document.operator)}</div>` : ''}
          </div>
        </header>

        <main class="content">
          <div class="top-grid">
            ${counterparty ? `<div class="party-card"><small>${escapeHtml(counterparty.labelPt || '')}<span>${escapeHtml(counterparty.labelEn || '')}</span></small><strong>${escapeHtml(counterparty.value || '—')}</strong>${counterpartyDetails.length ? counterpartyDetails.map((line) => `<p>${escapeHtml(line)}</p>`).join('') : ''}</div>` : ''}
            <div class="meta-stack">${metaHtml}</div>
          </div>
          
          ${lineTableHtml}
          
          <div class="bottom-grid">
            <div>
              <div class="payment-stack">${paymentHtml}</div>
              ${notesHtml}
            </div>
            
            <div class="totals-card">
              ${totalsHtml}
              ${stampUrl ? `<div class="stamp"><img src="${escapeHtml(stampUrl)}" alt="Carimbo" /><small>Carimbo eletrónico<br/><span>Electronic seal</span></small></div>` : ''}
            </div>
          </div>
        </main>
        
        <footer class="footer-rich">
          <div class="footer-info">
            <p>${escapeHtml(contactLine)}</p>
            <p>${escapeHtml(footerNote || 'Documento emitido pelo PLUSE com identidade corporativa bilingue.')}</p>
          </div>
          <div class="footer-slogan">
            <strong>${escapeHtml(slogan)}</strong>
            <span>MIGUEL M.C ERP</span>
          </div>
        </footer>
      </div>
    </body>
  </html>`
}