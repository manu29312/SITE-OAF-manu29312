const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');

function showView(viewId) {
  navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.view === viewId);
  });

  views.forEach((view) => {
    view.classList.toggle('active', view.id === viewId);
  });
}

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    showView(item.dataset.view);
  });
});

const toggleCaDetailsButton = document.querySelector('#toggle-ca-details');
const caDetailsPanel = document.querySelector('#ca-details');

if (toggleCaDetailsButton && caDetailsPanel) {
  toggleCaDetailsButton.addEventListener('click', () => {
    const isHidden = caDetailsPanel.hasAttribute('hidden');
    if (isHidden) {
      caDetailsPanel.removeAttribute('hidden');
      toggleCaDetailsButton.textContent = 'Masquer le detail';
      return;
    }

    caDetailsPanel.setAttribute('hidden', '');
    toggleCaDetailsButton.textContent = 'Voir le detail';
  });
}

const profileMenuContainer = document.querySelector('#company-profile-menu');
const profileMenuTrigger = document.querySelector('#profile-menu-trigger');
const profileMenuList = document.querySelector('#profile-menu-list');

function closeProfileMenu() {
  if (!profileMenuTrigger || !profileMenuList) {
    return;
  }

  profileMenuList.setAttribute('hidden', '');
  profileMenuTrigger.setAttribute('aria-expanded', 'false');
}

if (profileMenuTrigger && profileMenuList && profileMenuContainer) {
  profileMenuTrigger.addEventListener('click', () => {
    const isHidden = profileMenuList.hasAttribute('hidden');
    if (isHidden) {
      profileMenuList.removeAttribute('hidden');
      profileMenuTrigger.setAttribute('aria-expanded', 'true');
      return;
    }

    closeProfileMenu();
  });

  document.addEventListener('click', (event) => {
    if (!profileMenuContainer.contains(event.target)) {
      closeProfileMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeProfileMenu();
    }
  });
}

const amountInput = document.querySelector('#amount');
const vatRateInput = document.querySelector('#vat');
const totalHtValue = document.querySelector('#invoice-total-ht');
const totalVatValue = document.querySelector('#invoice-total-vat');
const totalTtcValue = document.querySelector('#invoice-total-ttc');

function formatAmount(value) {
  return `${value.toFixed(2)} EUR`;
}

function updateInvoiceTotals() {
  if (!amountInput || !vatRateInput || !totalHtValue || !totalVatValue || !totalTtcValue) {
    return;
  }

  const amountHt = Number(amountInput.value) || 0;
  const vatRate = Number(vatRateInput.value) || 0;
  const amountVat = amountHt * (vatRate / 100);
  const amountTtc = amountHt + amountVat;

  totalHtValue.textContent = formatAmount(amountHt);
  totalVatValue.textContent = formatAmount(amountVat);
  totalTtcValue.textContent = formatAmount(amountTtc);
}

if (amountInput && vatRateInput) {
  amountInput.addEventListener('input', updateInvoiceTotals);
  vatRateInput.addEventListener('input', updateInvoiceTotals);
  updateInvoiceTotals();
}

const invoiceStatusInput = document.querySelector('#invoice-status');
const addInvoiceButton = document.querySelector('#add-invoice');
const clientBoard = document.querySelector('#clients-board');
const clientsFilterInput = document.querySelector('#clients-filter');

const invoiceStatusConfig = {
  paid: { label: 'Payees', badgeClass: 'ok' },
  pending: { label: 'En attente', badgeClass: 'wait' },
  late: { label: 'En retard', badgeClass: 'late' },
  draft: { label: 'Brouillons', badgeClass: 'draft' },
};

const clientsData = {
  'Studio Delta': [
    { number: 'FAC-2026-028', status: 'paid', amountTtc: 1850, issuedAt: '2026-03-12' },
    { number: 'FAC-2026-031', status: 'pending', amountTtc: 960, issuedAt: '2026-03-20' },
  ],
  'Pixel Forge': [
    { number: 'FAC-2026-021', status: 'paid', amountTtc: 1810, issuedAt: '2026-03-05' },
    { number: 'FAC-2026-033', status: 'late', amountTtc: 730, issuedAt: '2026-03-24' },
  ],
  'Nova Events': [
    { number: 'FAC-2026-026', status: 'paid', amountTtc: 1320, issuedAt: '2026-03-10' },
  ],
};

let invoiceCounter = 35;
let openClientHistory = null;
let selectedClientFilter = 'all';

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatInvoiceList(invoices) {
  if (invoices.length === 0) {
    return '<ul class="client-status-list empty"><li>Aucune facture</li></ul>';
  }

  return `<ul class="client-status-list">${invoices
    .map(
      (invoice) =>
        `<li>${escapeHtml(invoice.number)} - ${formatAmount(invoice.amountTtc)}</li>`,
    )
    .join('')}</ul>`;
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return 'Date inconnue';
  }

  return date.toLocaleDateString('fr-FR');
}

function formatInvoiceHistoryList(invoices) {
  if (invoices.length === 0) {
    return '<ul class="client-history-list empty"><li>Aucune ancienne facture</li></ul>';
  }

  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
  );

  return `<ul class="client-history-list">${sortedInvoices
    .map(
      (invoice) =>
        `<li>${escapeHtml(invoice.number)} - ${formatAmount(invoice.amountTtc)} - ${formatDate(invoice.issuedAt)}</li>`,
    )
    .join('')}</ul>`;
}

function buildStatusBlock(title, badgeClass, invoices) {
  return `
    <section class="client-status-block">
      <div class="client-status-title">
        <span class="badge ${badgeClass}">${title} (${invoices.length})</span>
      </div>
      ${formatInvoiceList(invoices)}
    </section>
  `;
}

function getFilteredInvoices(invoices) {
  if (selectedClientFilter === 'all') {
    return invoices;
  }

  return invoices.filter((invoice) => invoice.status === selectedClientFilter);
}

function buildStatusGrid(filteredInvoices) {
  if (selectedClientFilter === 'all') {
    return `
      ${buildStatusBlock(
        invoiceStatusConfig.paid.label,
        invoiceStatusConfig.paid.badgeClass,
        filteredInvoices.filter((invoice) => invoice.status === 'paid'),
      )}
      ${buildStatusBlock(
        invoiceStatusConfig.pending.label,
        invoiceStatusConfig.pending.badgeClass,
        filteredInvoices.filter((invoice) => invoice.status === 'pending'),
      )}
      ${buildStatusBlock(
        invoiceStatusConfig.late.label,
        invoiceStatusConfig.late.badgeClass,
        filteredInvoices.filter((invoice) => invoice.status === 'late'),
      )}
      ${buildStatusBlock(
        invoiceStatusConfig.draft.label,
        invoiceStatusConfig.draft.badgeClass,
        filteredInvoices.filter((invoice) => invoice.status === 'draft'),
      )}
    `;
  }

  return buildStatusBlock(
    invoiceStatusConfig[selectedClientFilter].label,
    invoiceStatusConfig[selectedClientFilter].badgeClass,
    filteredInvoices,
  );
}

function renderClientsBoard() {
  if (!clientBoard) {
    return;
  }

  const cards = Object.entries(clientsData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([clientName, invoices]) => {
      const filteredInvoices = getFilteredInvoices(invoices);
      if (filteredInvoices.length === 0) {
        return '';
      }

      const isHistoryOpen = openClientHistory === clientName;

      return `
        <article class="client-card">
          <div class="client-header">
            <button class="client-name-toggle" type="button" data-client-name="${escapeHtml(clientName)}" aria-expanded="${isHistoryOpen ? 'true' : 'false'}">
              ${escapeHtml(clientName)}
            </button>
            <span class="badge client-total">${filteredInvoices.length}/${invoices.length} facture(s)</span>
          </div>
          <div class="client-status-grid">
            ${buildStatusGrid(filteredInvoices)}
          </div>
          <section class="client-history ${isHistoryOpen ? '' : 'hidden'}">
            <h4>Anciennes factures</h4>
            ${formatInvoiceHistoryList(filteredInvoices)}
          </section>
        </article>
      `;
    })
    .join('');

  clientBoard.innerHTML = cards || '<article class="client-card"><p>Aucun client pour ce filtre.</p></article>';
}

function addInvoiceToClient() {
  if (!amountInput || !vatRateInput || !invoiceStatusInput || !addInvoiceButton) {
    return;
  }

  const clientName = (document.querySelector('#client')?.value || '').trim();
  if (!clientName) {
    return;
  }

  const amountHt = Number(amountInput.value) || 0;
  const vatRate = Number(vatRateInput.value) || 0;
  const amountTtc = amountHt + amountHt * (vatRate / 100);
  const invoiceStatus = invoiceStatusInput.value;

  const generatedNumber = `FAC-2026-${String(invoiceCounter).padStart(3, '0')}`;
  invoiceCounter += 1;

  if (!clientsData[clientName]) {
    clientsData[clientName] = [];
  }

  clientsData[clientName].push({
    number: generatedNumber,
    status: invoiceStatus,
    amountTtc,
    issuedAt: new Date().toISOString(),
  });

  renderClientsBoard();
  showView('clients');
  amountInput.value = '';
}

if (addInvoiceButton) {
  addInvoiceButton.addEventListener('click', addInvoiceToClient);
}

if (clientBoard) {
  clientBoard.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const toggleButton = target.closest('.client-name-toggle');
    if (!toggleButton) {
      return;
    }

    const clientName = toggleButton.dataset.clientName;
    if (!clientName) {
      return;
    }

    openClientHistory = openClientHistory === clientName ? null : clientName;
    renderClientsBoard();
  });
}

if (clientsFilterInput) {
  clientsFilterInput.addEventListener('change', () => {
    selectedClientFilter = clientsFilterInput.value;
    openClientHistory = null;
    renderClientsBoard();
  });
}

renderClientsBoard();
