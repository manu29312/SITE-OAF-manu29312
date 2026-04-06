/**
 * OAF Admin - App Optimisé
 * Structure modulaire avec performance improvements
 */

// ============================================================================
// UTILITIES
// ============================================================================

function debounce(fn, delay = 300) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, delay = 300) {
  let lastCall = 0;
  return function throttled(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatAmount(value) {
  return `${value.toFixed(2)} EUR`;
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

// ============================================================================
// DOM MANAGER - Caching selector queries
// ============================================================================

class DOMManager {
  constructor() {
    this.cache = new Map();
  }

  get(selector) {
    if (!this.cache.has(selector)) {
      const element = document.querySelector(selector);
      this.cache.set(selector, element);
    }
    return this.cache.get(selector);
  }

  getAll(selector) {
    return document.querySelectorAll(selector);
  }

  // Empty cache if needed
  clearCache() {
    this.cache.clear();
  }
}

// ============================================================================
// STATE MANAGER
// ============================================================================

class StateManager {
  constructor() {
    this.state = {
      selectedFilter: 'all',
      selectedSearchQuery: '',
      invoiceSort: { key: 'issuedAt', direction: 'desc' },
      openClientHistory: null,
      invoiceCounter: 35,
    };
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  getState() {
    return this.state;
  }
}

// ============================================================================
// UI UTILS
// ============================================================================

class UIManager {
  constructor(domManager, toastContainer) {
    this.dom = domManager;
    this.toastContainer = toastContainer;
  }

  showToast(message, type = 'success') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    this.toastContainer.appendChild(toast);

    setTimeout(() => toast.remove(), 2600);
  }

  /**
   * Toggle helper - réutilisable pour tous les toggles
   */
  createToggle(trigger, target, callbacks = {}) {
    if (!trigger || !target) return;

    const onToggle = (isOpen) => {
      if (isOpen) {
        target.removeAttribute('hidden');
        trigger.setAttribute('aria-expanded', 'true');
        callbacks.onOpen?.();
      } else {
        target.setAttribute('hidden', '');
        trigger.setAttribute('aria-expanded', 'false');
        callbacks.onClose?.();
      }
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = target.hasAttribute('hidden');
      onToggle(isHidden);
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !target.hasAttribute('hidden')) {
        onToggle(false);
      }
    });
  }

  /**
   * Toggle visibility - réutilisable
   */
  toggleVisibility(element, show) {
    if (show) {
      element.removeAttribute('hidden');
    } else {
      element.setAttribute('hidden', '');
    }
  }
}

// ============================================================================
// NAVIGATION MANAGER
// ============================================================================

class NavigationManager {
  constructor(domManager) {
    this.dom = domManager;
    this.init();
  }

  init() {
    const navItems = this.dom.getAll('.nav-item');
    const views = this.dom.getAll('.view');

    navItems.forEach((item) => {
      item.addEventListener('click', () => {
        const viewId = item.dataset.view;
        this.showView(viewId, navItems, views);
      });
    });
  }

  showView(viewId, navItems, views) {
    navItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.view === viewId);
    });

    views.forEach((view) => {
      view.classList.toggle('active', view.id === viewId);
    });
  }
}

// ============================================================================
// INVOICE CALCULATOR
// ============================================================================

class InvoiceCalculator {
  constructor(domManager, uiManager) {
    this.dom = domManager;
    this.ui = uiManager;
    this.init();
  }

  init() {
    const amountInput = this.dom.get('#amount');
    const vatRateInput = this.dom.get('#vat');

    if (!amountInput || !vatRateInput) return;

    const updateHandler = debounce(() => this.updateTotals(), 150);

    amountInput.addEventListener('input', updateHandler);
    vatRateInput.addEventListener('input', updateHandler);

    // Initial calculation
    this.updateTotals();
  }

  updateTotals() {
    const amountInput = this.dom.get('#amount');
    const vatRateInput = this.dom.get('#vat');
    const totalHtValue = this.dom.get('#invoice-total-ht');
    const totalVatValue = this.dom.get('#invoice-total-vat');
    const totalTtcValue = this.dom.get('#invoice-total-ttc');

    if (!amountInput || !vatRateInput) return;

    const amountHt = Number(amountInput.value) || 0;
    const vatRate = Number(vatRateInput.value) || 0;
    const amountVat = amountHt * (vatRate / 100);
    const amountTtc = amountHt + amountVat;

    if (totalHtValue) totalHtValue.textContent = formatAmount(amountHt);
    if (totalVatValue) totalVatValue.textContent = formatAmount(amountVat);
    if (totalTtcValue) totalTtcValue.textContent = formatAmount(amountTtc);
  }
}

// ============================================================================
// PROFILE MENU MANAGER
// ============================================================================

class ProfileMenuManager {
  constructor(domManager, uiManager) {
    this.dom = domManager;
    this.ui = uiManager;
    this.init();
  }

  init() {
    const trigger = this.dom.get('#profile-menu-trigger');
    const menu = this.dom.get('#profile-menu-list');
    const container = this.dom.get('#company-profile-menu');

    if (!trigger || !menu || !container) return;

    // Use toggle helper
    this.ui.createToggle(trigger, menu);

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        this.ui.toggleVisibility(menu, false);
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// ============================================================================
// CA DETAILS MANAGER
// ============================================================================

class CADetailsManager {
  constructor(domManager, uiManager) {
    this.dom = domManager;
    this.ui = uiManager;
    this.init();
  }

  init() {
    const button = this.dom.get('#toggle-ca-details');
    const panel = this.dom.get('#ca-details');

    if (!button || !panel) return;

    button.addEventListener('click', () => {
      const isHidden = panel.hasAttribute('hidden');
      this.ui.toggleVisibility(panel, isHidden);
      button.textContent = isHidden ? 'Masquer le detail' : 'Voir le detail';
    });
  }
}

// ============================================================================
// QUICK DRAFT MANAGER
// ============================================================================

class QuickDraftManager {
  constructor(domManager, uiManager) {
    this.dom = domManager;
    this.ui = uiManager;
    this.init();
  }

  init() {
    const button = this.dom.get('#toggle-quick-draft');
    const panel = this.dom.get('#quick-draft-panel');

    if (!button || !panel) return;

    button.addEventListener('click', () => {
      const isHidden = panel.hasAttribute('hidden');
      this.ui.toggleVisibility(panel, isHidden);
      button.setAttribute('aria-expanded', String(isHidden));
    });
  }
}

// ============================================================================
// REVENUE CHART MANAGER
// ============================================================================

class RevenueChartManager {
  constructor(domManager, uiManager) {
    this.dom = domManager;
    this.ui = uiManager;

    this.revenueDataByYear = {
      2023: [2900, 3400, 3800, 4200, 4600, 5100, 4900, 5300, 5600, 5900, 6200, 6400],
      2024: [3600, 4100, 4700, 5300, 5900, 6500, 6100, 6900, 7400, 7800, 8200, 8700],
      2025: [4300, 5000, 5600, 6300, 7100, 7700, 7400, 8100, 8800, 9400, 9800, 10400],
      2026: [4800, 5400, 6200, 6900, 7600, 8300, 7900, 8600, 9300, 9800, 10400, 11200],
    };

    this.revenueMonthLabels = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

    this.init();
  }

  init() {
    this.populateRevenueYears();
    this.renderRevenueEvolution();

    const viewModeInput = this.dom.get('#revenue-view-mode');
    const yearInput = this.dom.get('#revenue-year');

    if (viewModeInput) viewModeInput.addEventListener('change', () => this.renderRevenueEvolution());
    if (yearInput) yearInput.addEventListener('change', () => this.renderRevenueEvolution());
  }

  getRevenueYears() {
    return Object.keys(this.revenueDataByYear)
      .map((year) => Number(year))
      .sort((a, b) => a - b);
  }

  populateRevenueYears() {
    const yearInput = this.dom.get('#revenue-year');
    if (!yearInput) return;

    const years = this.getRevenueYears();
    yearInput.innerHTML = years
      .map((year) => `<option value="${year}">${year}</option>`)
      .join('');

    yearInput.value = String(years[years.length - 1]);
  }

  getRevenueSeries() {
    const viewModeInput = this.dom.get('#revenue-view-mode');
    const yearInput = this.dom.get('#revenue-year');
    const mode = viewModeInput?.value || 'yearly';
    const years = this.getRevenueYears();

    if (mode === 'monthly') {
      const selectedYear = Number(yearInput?.value || years[years.length - 1]);
      const values = this.revenueDataByYear[selectedYear] || [];
      return {
        labels: this.revenueMonthLabels,
        values,
        mode,
        selectedYear,
      };
    }

    return {
      labels: years.map((year) => String(year)),
      values: years.map((year) => (this.revenueDataByYear[year] || []).reduce((sum, value) => sum + value, 0)),
      mode,
    };
  }

  renderRevenueEvolution() {
    const series = this.getRevenueSeries();
    const total = series.values.reduce((sum, value) => sum + value, 0);
    const summary = this.dom.get('#revenue-summary');
    const yearInput = this.dom.get('#revenue-year');

    if (yearInput) yearInput.disabled = series.mode !== 'monthly';

    if (summary) {
      if (series.mode === 'monthly') {
        summary.textContent = `Vue mensuelle ${series.selectedYear} - Total annuel: ${formatShortAmount(total)}`;
      } else {
        summary.textContent = `Vue annuelle - Cumul periode: ${formatShortAmount(total)}`;
      }
    }

    this.renderRevenueAxisLabels(series.labels);
    this.drawRevenueChart(series.labels, series.values);
  }

  renderRevenueAxisLabels(labels) {
    const xLabels = this.dom.get('#revenue-x-labels');
    if (!xLabels) return;

    xLabels.innerHTML = labels.map((label) => `<span>${label}</span>`).join('');
    xLabels.style.gridTemplateColumns = `repeat(${labels.length}, minmax(0, 1fr))`;
  }

  drawRevenueChart(labels, values) {
    const canvas = this.dom.get('#revenue-chart');
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    if (values.length === 0) return;

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
}

// ============================================================================
// APP INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize managers
  const domManager = new DOMManager();
  const stateManager = new StateManager();
  const uiManager = new UIManager(
    domManager,
    domManager.get('#toast-container')
  );

  // Initialize feature managers
  new NavigationManager(domManager);
  new InvoiceCalculator(domManager, uiManager);
  new ProfileMenuManager(domManager, uiManager);
  new CADetailsManager(domManager, uiManager);
  new QuickDraftManager(domManager, uiManager);
  new RevenueChartManager(domManager, uiManager);

  // Optional: Log app ready
  console.log('✅ OAF Admin App initialized');
});
