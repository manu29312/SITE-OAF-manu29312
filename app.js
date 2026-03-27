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
const clientBoardLoading = document.querySelector('#clients-board-loading');
const clientBoardEmpty = document.querySelector('#clients-board-empty');
const invoiceStatusBoard = document.querySelector('#invoices-status-board');
const invoicesFilterInput = document.querySelector('#invoices-filter');
const invoiceSearchInput = document.querySelector('#invoice-search-input');
const invoiceSearchButton = document.querySelector('#invoice-search-button');
const invoiceSearchResetButton = document.querySelector('#invoice-search-reset');
const quickDraftToggleButton = document.querySelector('#toggle-quick-draft');
const quickDraftPanel = document.querySelector('#quick-draft-panel');
const invoicesTableLoading = document.querySelector('#invoices-table-loading');
const invoicesTableEmpty = document.querySelector('#invoices-table-empty');
const invoicesTableWrap = document.querySelector('#invoices-table-wrap');
const invoicesTableBody = document.querySelector('#invoices-table-body');
const invoicesTableSummary = document.querySelector('#invoices-table-summary');
const invoicesSortHeaders = document.querySelectorAll('.sort-header');
const toastContainer = document.querySelector('#toast-container');
const revenueViewModeInput = document.querySelector('#revenue-view-mode');
const revenueYearInput = document.querySelector('#revenue-year');
const revenueSummary = document.querySelector('#revenue-summary');
const revenueChartCanvas = document.querySelector('#revenue-chart');
const revenueXLabels = document.querySelector('#revenue-x-labels');
const kpiTotalInvoices = document.querySelector('#kpi-total-invoices');
const kpiPendingInvoices = document.querySelector('#kpi-pending-invoices');
const kpiLateInvoices = document.querySelector('#kpi-late-invoices');
const kpiSignatureRate = document.querySelector('#kpi-signature-rate');
const reminderJm3 = document.querySelector('#reminder-jm3');
const reminderJp3 = document.querySelector('#reminder-jp3');
const reminderJp10 = document.querySelector('#reminder-jp10');
const manualReminderButton = document.querySelector('#manual-reminder-btn');
const manualReminderResult = document.querySelector('#manual-reminder-result');
const cronStatus = document.querySelector('#cron-status');
const cronLastRun = document.querySelector('#cron-last-run');
const contractSearchInput = document.querySelector('#contract-search-input');
const contractSearchButton = document.querySelector('#contract-search-button');
const contractSearchResetButton = document.querySelector('#contract-search-reset');
const contractTemplateCards = document.querySelectorAll('#contracts-template-grid .template-card');
const contractSearchFeedback = document.querySelector('#contract-search-feedback');

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

const revenueDataByYear = {
  2023: [2900, 3400, 3800, 4200, 4600, 5100, 4900, 5300, 5600, 5900, 6200, 6400],
  2024: [3600, 4100, 4700, 5300, 5900, 6500, 6100, 6900, 7400, 7800, 8200, 8700],
  2025: [4300, 5000, 5600, 6300, 7100, 7700, 7400, 8100, 8800, 9400, 9800, 10400],
  2026: [4800, 5400, 6200, 6900, 7600, 8300, 7900, 8600, 9300, 9800, 10400, 11200],
};

const contractsData = [
  { id: 'CTR-2026-01', status: 'signed' },
  { id: 'CTR-2026-02', status: 'signed' },
  { id: 'CTR-2026-03', status: 'sent' },
  { id: 'CTR-2026-04', status: 'signed' },
  { id: 'CTR-2026-05', status: 'draft' },
  { id: 'CTR-2026-06', status: 'signed' },
];

const revenueMonthLabels = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

let invoiceCounter = 35;
let openClientHistory = null;
let selectedInvoiceFilter = 'all';
let selectedInvoiceSearchQuery = '';
let isInvoiceTableLoading = true;
let isClientsBoardLoading = true;
let invoiceSort = { key: 'issuedAt', direction: 'desc' };

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return 'Date inconnue';
  }

  return date.toLocaleDateString('fr-FR');
}

function formatShortAmount(value) {
  return `${Math.round(value).toLocaleString('fr-FR')} EUR`;
}

function showToast(message, type = 'success') {
  if (!toastContainer) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2600);
}

function getRevenueYears() {
  return Object.keys(revenueDataByYear)
    .map((year) => Number(year))
    .sort((a, b) => a - b);
}

function getRevenueSeries() {
  const mode = revenueViewModeInput?.value || 'yearly';
  const years = getRevenueYears();

  if (mode === 'monthly') {
    const selectedYear = Number(revenueYearInput?.value || years[years.length - 1]);
    const values = revenueDataByYear[selectedYear] || [];
    return {
      labels: revenueMonthLabels,
      values,
      mode,
      selectedYear,
    };
  }

  return {
    labels: years.map((year) => String(year)),
    values: years.map((year) => (revenueDataByYear[year] || []).reduce((sum, value) => sum + value, 0)),
    mode,
  };
}

function populateRevenueYears() {
  if (!revenueYearInput) {
    return;
  }

  const years = getRevenueYears();
  revenueYearInput.innerHTML = years
    .map((year) => `<option value="${year}">${year}</option>`)
    .join('');

  revenueYearInput.value = String(years[years.length - 1]);
}

function renderRevenueAxisLabels(labels) {
  if (!revenueXLabels) {
    return;
  }

  revenueXLabels.innerHTML = labels.map((label) => `<span>${label}</span>`).join('');
  revenueXLabels.style.gridTemplateColumns = `repeat(${labels.length}, minmax(0, 1fr))`;
}

function drawRevenueChart(labels, values) {
  if (!revenueChartCanvas) {
    return;
  }

  const context = revenueChartCanvas.getContext('2d');
  if (!context) {
    return;
  }

  const width = revenueChartCanvas.clientWidth;
  const height = revenueChartCanvas.clientHeight;
  const dpr = window.devicePixelRatio || 1;

  revenueChartCanvas.width = Math.floor(width * dpr);
  revenueChartCanvas.height = Math.floor(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  if (values.length === 0) {
    return;
  }

  const padding = { top: 18, right: 20, bottom: 26, left: 24 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...values, 1);
  const stepY = chartHeight / 4;

  context.strokeStyle = '#e8dcca';
  context.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + i * stepY;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
  }

  const points = values.map((value, index) => {
    const x =
      padding.left +
      (labels.length === 1 ? chartWidth / 2 : (index / (labels.length - 1)) * chartWidth);
    const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
    return { x, y };
  });

  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
      return;
    }

    context.lineTo(point.x, point.y);
  });

  context.strokeStyle = '#c4572a';
  context.lineWidth = 3;
  context.stroke();

  context.beginPath();
  context.moveTo(points[0].x, padding.top + chartHeight);
  points.forEach((point) => {
    context.lineTo(point.x, point.y);
  });
  context.lineTo(points[points.length - 1].x, padding.top + chartHeight);
  context.closePath();

  const gradient = context.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
  gradient.addColorStop(0, 'rgba(196, 87, 42, 0.26)');
  gradient.addColorStop(1, 'rgba(196, 87, 42, 0.02)');
  context.fillStyle = gradient;
  context.fill();

  context.fillStyle = '#17616f';
  points.forEach((point) => {
    context.beginPath();
    context.arc(point.x, point.y, 4, 0, Math.PI * 2);
    context.fill();
  });
}

function renderRevenueEvolution() {
  if (!revenueViewModeInput || !revenueYearInput) {
    return;
  }

  const series = getRevenueSeries();
  const total = series.values.reduce((sum, value) => sum + value, 0);

  revenueYearInput.disabled = series.mode !== 'monthly';

  if (revenueSummary) {
    if (series.mode === 'monthly') {
      revenueSummary.textContent = `Vue mensuelle ${series.selectedYear} - Total annuel: ${formatShortAmount(total)}`;
    } else {
      revenueSummary.textContent = `Vue annuelle - Cumul periode: ${formatShortAmount(total)}`;
    }
  }

  renderRevenueAxisLabels(series.labels);
  drawRevenueChart(series.labels, series.values);
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

function collectInvoiceEntries() {
  return Object.entries(clientsData).flatMap(([clientName, invoices]) =>
    invoices.map((invoice) => ({
      clientName,
      ...invoice,
    })),
  );
}

function updateDashboardKpis() {
  const allInvoices = collectInvoiceEntries();
  const totalInvoices = allInvoices.length;
  const pendingInvoices = allInvoices.filter((entry) => entry.status === 'pending').length;
  const lateInvoices = allInvoices.filter((entry) => entry.status === 'late').length;
  const signedContracts = contractsData.filter((contract) => contract.status === 'signed').length;
  const signatureRate = contractsData.length === 0 ? 0 : Math.round((signedContracts / contractsData.length) * 100);

  if (kpiTotalInvoices) {
    kpiTotalInvoices.textContent = String(totalInvoices);
  }

  if (kpiPendingInvoices) {
    kpiPendingInvoices.textContent = String(pendingInvoices);
  }

  if (kpiLateInvoices) {
    kpiLateInvoices.textContent = String(lateInvoices);
  }

  if (kpiSignatureRate) {
    kpiSignatureRate.textContent = `${signatureRate}%`;
  }
}

function getActiveReminderOffsets() {
  const offsets = [];
  if (reminderJm3?.checked) offsets.push('J-3');
  if (reminderJp3?.checked) offsets.push('J+3');
  if (reminderJp10?.checked) offsets.push('J+10');
  return offsets;
}

function updateCronStatus() {
  const activeOffsets = getActiveReminderOffsets();
  if (!cronStatus) {
    return;
  }

  if (activeOffsets.length === 0) {
    cronStatus.classList.remove('ok');
    cronStatus.classList.add('wait');
    cronStatus.textContent = 'Cron actif - aucun rappel configure';
    return;
  }

  cronStatus.classList.remove('wait');
  cronStatus.classList.add('ok');
  cronStatus.textContent = `Cron quotidien actif (${activeOffsets.join(', ')})`;
}

function runManualReminders() {
  const activeOffsets = getActiveReminderOffsets();
  const dueInvoices = collectInvoiceEntries().filter(
    (entry) => entry.status === 'pending' || entry.status === 'late',
  );

  if (manualReminderResult) {
    if (activeOffsets.length === 0) {
      manualReminderResult.textContent = 'Active au moins une planification de rappel (J-3, J+3 ou J+10).';
    } else {
      manualReminderResult.textContent = `${dueInvoices.length} relance(s) preparee(s) en mode manuel (${activeOffsets.join(', ')}).`;
    }
  }

  if (cronLastRun) {
    const now = new Date();
    cronLastRun.textContent = `Dernier job cron: ${now.toLocaleDateString('fr-FR')} a ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }
}

function filterInvoiceEntries(entries) {
  return entries.filter((entry) => {
    const statusMatch =
      selectedInvoiceFilter === 'all' || entry.status === selectedInvoiceFilter;

    if (!statusMatch) {
      return false;
    }

    if (!selectedInvoiceSearchQuery) {
      return true;
    }

    const companyName = entry.clientName.toLowerCase();
    const invoiceNumber = entry.number.toLowerCase();
    return (
      companyName.includes(selectedInvoiceSearchQuery) ||
      invoiceNumber.includes(selectedInvoiceSearchQuery)
    );
  });
}

function compareInvoiceEntries(a, b) {
  if (invoiceSort.key === 'amountTtc') {
    return invoiceSort.direction === 'asc' ? a.amountTtc - b.amountTtc : b.amountTtc - a.amountTtc;
  }

  if (invoiceSort.key === 'issuedAt') {
    const aTime = new Date(a.issuedAt).getTime();
    const bTime = new Date(b.issuedAt).getTime();
    return invoiceSort.direction === 'asc' ? aTime - bTime : bTime - aTime;
  }

  const aValue = String(a[invoiceSort.key] || '').toLowerCase();
  const bValue = String(b[invoiceSort.key] || '').toLowerCase();
  if (aValue === bValue) {
    return 0;
  }

  const baseCompare = aValue > bValue ? 1 : -1;
  return invoiceSort.direction === 'asc' ? baseCompare : -baseCompare;
}

function updateInvoiceSortHeadersState() {
  invoicesSortHeaders.forEach((header) => {
    const key = header.dataset.sortKey;
    if (key === invoiceSort.key) {
      header.setAttribute('aria-sort', invoiceSort.direction === 'asc' ? 'ascending' : 'descending');
      return;
    }

    header.setAttribute('aria-sort', 'none');
  });
}

function renderInvoicesTable() {
  if (!invoicesTableBody || !invoicesTableLoading || !invoicesTableEmpty || !invoicesTableWrap) {
    return;
  }

  if (isInvoiceTableLoading) {
    invoicesTableLoading.removeAttribute('hidden');
    invoicesTableWrap.setAttribute('hidden', '');
    invoicesTableEmpty.setAttribute('hidden', '');
    if (invoicesTableSummary) {
      invoicesTableSummary.textContent = 'Chargement...';
    }
    return;
  }

  const allEntries = collectInvoiceEntries();
  const filteredEntries = filterInvoiceEntries(allEntries).sort(compareInvoiceEntries);

  if (invoicesTableSummary) {
    invoicesTableSummary.textContent = `${filteredEntries.length} facture(s) affichee(s)`;
  }

  if (filteredEntries.length === 0) {
    invoicesTableLoading.setAttribute('hidden', '');
    invoicesTableWrap.setAttribute('hidden', '');
    invoicesTableEmpty.removeAttribute('hidden');
    invoicesTableBody.innerHTML = '';
    updateInvoiceSortHeadersState();
    return;
  }

  invoicesTableBody.innerHTML = filteredEntries
    .map(
      (entry) => `
        <tr>
          <td>${escapeHtml(entry.number)}</td>
          <td>${escapeHtml(entry.clientName)}</td>
          <td>${formatAmount(entry.amountTtc)}</td>
          <td>${formatDate(entry.issuedAt)}</td>
          <td><span class="badge ${invoiceStatusConfig[entry.status].badgeClass}">${invoiceStatusConfig[entry.status].label}</span></td>
        </tr>
      `,
    )
    .join('');

  invoicesTableLoading.setAttribute('hidden', '');
  invoicesTableEmpty.setAttribute('hidden', '');
  invoicesTableWrap.removeAttribute('hidden');
  updateInvoiceSortHeadersState();
}

function formatStatusInvoiceList(entries) {
  if (entries.length === 0) {
    return '<ul class="client-status-list empty"><li>Aucune facture</li></ul>';
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
  );

  return `<ul class="client-status-list">${sorted
    .map(
      (entry) =>
        `<li>${escapeHtml(entry.clientName)} - ${escapeHtml(entry.number)} - ${formatAmount(entry.amountTtc)}</li>`,
    )
    .join('')}</ul>`;
}

function buildInvoiceStatusBlock(title, badgeClass, entries) {
  return `
    <section class="client-status-block">
      <div class="client-status-title">
        <span class="badge ${badgeClass}">${title} (${entries.length})</span>
      </div>
      ${formatStatusInvoiceList(entries)}
    </section>
  `;
}

function renderInvoiceStatusBoard() {
  if (!invoiceStatusBoard) {
    return;
  }

  const allEntries = collectInvoiceEntries();
  const filteredEntries = filterInvoiceEntries(allEntries);

  if (selectedInvoiceFilter === 'all') {
    invoiceStatusBoard.innerHTML = `
      <div class="invoice-status-grid">
        ${buildInvoiceStatusBlock(
          invoiceStatusConfig.paid.label,
          invoiceStatusConfig.paid.badgeClass,
          filteredEntries.filter((entry) => entry.status === 'paid'),
        )}
        ${buildInvoiceStatusBlock(
          invoiceStatusConfig.pending.label,
          invoiceStatusConfig.pending.badgeClass,
          filteredEntries.filter((entry) => entry.status === 'pending'),
        )}
        ${buildInvoiceStatusBlock(
          invoiceStatusConfig.late.label,
          invoiceStatusConfig.late.badgeClass,
          filteredEntries.filter((entry) => entry.status === 'late'),
        )}
        ${buildInvoiceStatusBlock(
          invoiceStatusConfig.draft.label,
          invoiceStatusConfig.draft.badgeClass,
          filteredEntries.filter((entry) => entry.status === 'draft'),
        )}
      </div>
    `;
    return;
  }

  invoiceStatusBoard.innerHTML = `
    <div class="invoice-status-grid">
      ${buildInvoiceStatusBlock(
        invoiceStatusConfig[selectedInvoiceFilter].label,
        invoiceStatusConfig[selectedInvoiceFilter].badgeClass,
        filteredEntries,
      )}
    </div>
  `;
}

function renderClientsBoard() {
  if (!clientBoard || !clientBoardLoading || !clientBoardEmpty) {
    return;
  }

  if (isClientsBoardLoading) {
    clientBoardLoading.removeAttribute('hidden');
    clientBoardEmpty.setAttribute('hidden', '');
    clientBoard.setAttribute('hidden', '');
    return;
  }

  const cards = Object.entries(clientsData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([clientName, invoices]) => {
      const isHistoryOpen = openClientHistory === clientName;

      return `
        <article class="client-card">
          <div class="client-header">
            <button class="client-name-toggle" type="button" data-client-name="${escapeHtml(clientName)}" aria-expanded="${isHistoryOpen ? 'true' : 'false'}">
              ${escapeHtml(clientName)}
            </button>
            <span class="badge client-total">${invoices.length} facture(s)</span>
          </div>
          <section class="client-history ${isHistoryOpen ? '' : 'hidden'}">
            <h4>Anciennes factures</h4>
            ${formatInvoiceHistoryList(invoices)}
          </section>
        </article>
      `;
    })
    .join('');

  if (!cards) {
    clientBoardLoading.setAttribute('hidden', '');
    clientBoard.setAttribute('hidden', '');
    clientBoardEmpty.removeAttribute('hidden');
    clientBoard.innerHTML = '';
    return;
  }

  clientBoardLoading.setAttribute('hidden', '');
  clientBoardEmpty.setAttribute('hidden', '');
  clientBoard.removeAttribute('hidden');
  clientBoard.innerHTML = cards;
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
  renderInvoiceStatusBoard();
  renderInvoicesTable();
  updateDashboardKpis();
  showView('invoices');
  amountInput.value = '';
  showToast('Facture ajoutee avec succes.', 'success');
}

function runContractSearch() {
  const rawQuery = contractSearchInput?.value || '';
  const query = rawQuery.trim().toLowerCase();
  let visibleCount = 0;

  contractTemplateCards.forEach((card) => {
    const contractName = (card.getAttribute('data-contract-name') || card.textContent || '').toLowerCase();
    const isVisible = query.length === 0 || contractName.includes(query);
    card.style.display = isVisible ? '' : 'none';
    if (isVisible) {
      visibleCount += 1;
    }
  });

  if (!contractSearchFeedback) {
    return;
  }

  if (query.length === 0) {
    contractSearchFeedback.setAttribute('hidden', '');
    contractSearchFeedback.textContent = '';
    return;
  }

  contractSearchFeedback.removeAttribute('hidden');
  if (visibleCount === 0) {
    contractSearchFeedback.textContent = 'Aucun contrat trouve pour cette recherche.';
    return;
  }

  contractSearchFeedback.textContent = `${visibleCount} contrat(s) trouve(s).`;
}

function resetContractSearch() {
  if (contractSearchInput) {
    contractSearchInput.value = '';
  }

  runContractSearch();
}

function runInvoiceSearch() {
  const query = (invoiceSearchInput?.value || '').trim().toLowerCase();
  selectedInvoiceSearchQuery = query;
  renderInvoiceStatusBoard();
  renderInvoicesTable();
}

function resetInvoiceSearch() {
  selectedInvoiceSearchQuery = '';
  if (invoiceSearchInput) {
    invoiceSearchInput.value = '';
  }

  renderInvoiceStatusBoard();
  renderInvoicesTable();
  showToast('Recherche facture reinitialisee.', 'info');
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

if (invoicesFilterInput) {
  invoicesFilterInput.addEventListener('change', () => {
    selectedInvoiceFilter = invoicesFilterInput.value;
    renderInvoiceStatusBoard();
    renderInvoicesTable();
  });
}

invoicesSortHeaders.forEach((header) => {
  header.addEventListener('click', () => {
    const key = header.dataset.sortKey;
    if (!key) {
      return;
    }

    if (invoiceSort.key === key) {
      invoiceSort.direction = invoiceSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      invoiceSort = {
        key,
        direction: key === 'issuedAt' || key === 'amountTtc' ? 'desc' : 'asc',
      };
    }

    renderInvoicesTable();
  });
});

if (contractSearchButton) {
  contractSearchButton.addEventListener('click', runContractSearch);
}

if (contractSearchResetButton) {
  contractSearchResetButton.addEventListener('click', resetContractSearch);
}

if (contractSearchInput) {
  contractSearchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      runContractSearch();
    }
  });
}

if (invoiceSearchButton) {
  invoiceSearchButton.addEventListener('click', runInvoiceSearch);
}

if (invoiceSearchResetButton) {
  invoiceSearchResetButton.addEventListener('click', resetInvoiceSearch);
}

if (invoiceSearchInput) {
  invoiceSearchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      runInvoiceSearch();
    }
  });
}

if (quickDraftToggleButton && quickDraftPanel) {
  quickDraftToggleButton.addEventListener('click', () => {
    const isHidden = quickDraftPanel.hasAttribute('hidden');
    if (isHidden) {
      quickDraftPanel.removeAttribute('hidden');
      quickDraftToggleButton.setAttribute('aria-expanded', 'true');
      quickDraftToggleButton.textContent = 'Masquer brouillon rapide';
      return;
    }

    quickDraftPanel.setAttribute('hidden', '');
    quickDraftToggleButton.setAttribute('aria-expanded', 'false');
    quickDraftToggleButton.textContent = 'Ouvrir brouillon rapide';
  });
}

[reminderJm3, reminderJp3, reminderJp10].forEach((input) => {
  input?.addEventListener('change', updateCronStatus);
});

if (manualReminderButton) {
  manualReminderButton.addEventListener('click', () => {
    runManualReminders();
    showToast('Relance manuelle executee.', 'info');
  });
}

if (revenueViewModeInput) {
  updateDashboardKpis();
  updateCronStatus();
  revenueViewModeInput.addEventListener('change', renderRevenueEvolution);
}

if (revenueYearInput) {
  revenueYearInput.addEventListener('change', renderRevenueEvolution);
}

window.addEventListener('resize', renderRevenueEvolution);

renderClientsBoard();
renderInvoiceStatusBoard();
renderInvoicesTable();
populateRevenueYears();
renderRevenueEvolution();

window.setTimeout(() => {
  isClientsBoardLoading = false;
  renderClientsBoard();
}, 320);

window.setTimeout(() => {
  isInvoiceTableLoading = false;
  renderInvoicesTable();
}, 420);
