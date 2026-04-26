import Link from 'next/link';
import { ensureAppUser, requireClerkUserIdOrRedirect } from '@/lib/auth-user';
import { formatCurrency } from '@/lib/formatters';
import { buildMainNavigation } from '@/lib/main-navigation';
import { getClients, getContracts, getInvoices } from '@/lib/mock-db';

type RevenuePoint = {
  label: string;
  value: number;
};

function buildRevenueSeries(invoices: Array<{ dueDate: string; amountTtc: number }>): RevenuePoint[] {
  const now = new Date();
  const points: RevenuePoint[] = [];

  for (let index = 3; index >= 0; index -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();
    const value = invoices
      .filter((invoice) => {
        const invoiceDate = new Date(invoice.dueDate);
        return invoiceDate.getMonth() === month && invoiceDate.getFullYear() === year;
      })
      .reduce((sum, invoice) => sum + invoice.amountTtc, 0);

    points.push({
      label: new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(monthDate),
      value,
    });
  }

  return points;
}

function buildChartPath(values: number[], width: number, height: number): string {
  if (!values.length) {
    return '';
  }

  const maxValue = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = index * step;
      const y = height - (value / maxValue) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export default async function DashboardPage() {
  const clerkUserId = await requireClerkUserIdOrRedirect();
  const appUserId = await ensureAppUser(clerkUserId);

  const [clientsResult, contractsResult, invoicesResult] = await Promise.allSettled([
    getClients(appUserId),
    getContracts(appUserId),
    getInvoices(appUserId),
  ]);

  const clients = clientsResult.status === 'fulfilled' ? clientsResult.value : [];
  const contracts = contractsResult.status === 'fulfilled' ? contractsResult.value : [];
  const invoices = invoicesResult.status === 'fulfilled' ? invoicesResult.value : [];

  const dataErrors = [
    clientsResult.status === 'rejected' ? 'clients' : null,
    contractsResult.status === 'rejected' ? 'contrats' : null,
    invoicesResult.status === 'rejected' ? 'factures' : null,
  ].filter(Boolean) as string[];

  const now = new Date();
  const monthlyRevenue = invoices
    .filter((invoice) => {
      const dueDate = new Date(invoice.dueDate);
      return dueDate.getMonth() === now.getMonth() && dueDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, invoice) => sum + invoice.amountTtc, 0);
  const overdueCount = invoices.filter((invoice) => invoice.status === 'retard').length;
  const pendingAmount = invoices
    .filter((invoice) => invoice.status === 'envoyee' || invoice.status === 'retard')
    .reduce((sum, invoice) => sum + invoice.amountTtc, 0);
  const signedRate = contracts.length ? Math.round((contracts.filter((item) => item.status === 'actif').length / contracts.length) * 100) : 0;
  const profileCompletion = Math.min(100, 25 + (clients.length > 0 ? 25 : 0) + (invoices.length > 0 ? 25 : 0) + (contracts.length > 0 ? 25 : 0));

  const revenueSeries = buildRevenueSeries(invoices);
  const chartValues = revenueSeries.map((item) => item.value);
  const chartPath = buildChartPath(chartValues, 690, 180);
  const maxChartValue = Math.max(...chartValues, 1);
  const chartArea = chartPath ? `${chartPath} L 690 180 L 0 180 Z` : '';

  return (
    <main className="app-shell">
      <section className="dashboard-topbar panel">
        <div className="dashboard-brand">
          <span className="brand-dot" aria-hidden="true" />
          <h1>OAF Admin</h1>
        </div>
        <div className="panel-actions split">
          <Link className="header-cta" href="/factures">Nouvelle facture</Link>
          <Link className="header-cta solid" href="/contrats">Nouveau contrat</Link>
        </div>
      </section>

      <div className="content-column">
        {dataErrors.length ? (
          <section className="panel dashboard-alert">
            <div className="panel-head-inline">
              <h2>Sources de donnees partiellement indisponibles</h2>
              <span className="status-chip warn">Mode degrade</span>
            </div>
            <p className="panel-meta">
              Impossible de charger: {dataErrors.join(', ')}. Les sections restantes affichent les donnees disponibles.
            </p>
          </section>
        ) : null}

        <section className="panel profile-panel">
          <div>
            <p className="eyebrow">Onboarding profil</p>
            <h2>Profil entreprise</h2>
            <p className="panel-meta">Completer les infos legales pour produire des documents valides FR/EU.</p>
            <div className="profile-progress-row" aria-label="Progression profil">
              <div className="profile-progress-track" aria-hidden="true">
                <span style={{ width: `${profileCompletion}%` }} />
              </div>
              <strong>{profileCompletion}%</strong>
            </div>
            <p className="panel-meta">
              {clients.length} client(s), {contracts.length} contrat(s), {invoices.length} facture(s) dans ton espace.
            </p>
            <p className="panel-meta">
              Les rappels sont geres dans les parametres de l entreprise.
            </p>
          </div>
          <Link href="/parametres" className="header-cta settings-pill">Completer profil</Link>
        </section>

        <nav className="dashboard-tabs panel" aria-label="Navigation dashboard">
          {buildMainNavigation('dashboard').map((item) => (
            <Link key={item.href} href={item.href} className={`dashboard-tab ${item.active ? 'active' : ''}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="dashboard-metrics">
          <article className="panel metric-card">
            <p className="metric-label">CA du mois</p>
            <p className="metric-value">{formatCurrency(monthlyRevenue)}</p>
            <p className="panel-meta">Cumule des factures dues ce mois-ci.</p>
          </article>

          <section className="panel chart-panel metric-chart-panel">
            <div className="chart-head">
              <div>
                <h2>Evolution du chiffre d affaires</h2>
                <p className="panel-meta">Vue annuelle simplifiee pour pilotage freelance</p>
              </div>

              <div className="chart-filters">
                <select aria-label="Periode">
                  <option>Annuel</option>
                </select>
                <select aria-label="Annee">
                  <option>2026</option>
                </select>
              </div>
            </div>

            <div className="chart-surface" role="img" aria-label="Evolution du chiffre d affaires de 2023 a 2026">
              <svg viewBox="0 0 740 260" preserveAspectRatio="none">
                <line x1="25" y1="35" x2="715" y2="35" className="grid-line" />
                <line x1="25" y1="95" x2="715" y2="95" className="grid-line" />
                <line x1="25" y1="155" x2="715" y2="155" className="grid-line" />
                <line x1="25" y1="215" x2="715" y2="215" className="grid-line" />

                {chartPath ? <path d={chartPath} className="chart-line" transform="translate(25, 35)" /> : null}
                {chartArea ? <path d={chartArea} className="chart-fill" transform="translate(25, 35)" /> : null}

                {chartValues.map((value, index) => {
                  const step = chartValues.length > 1 ? 690 / (chartValues.length - 1) : 0;
                  const x = 25 + index * step;
                  const y = 35 + (180 - (value / maxChartValue) * 180);
                  return <circle key={`${value}-${index}`} cx={x} cy={y} r="5" className="chart-dot" />;
                })}
              </svg>
            </div>

            <div className="chart-years" aria-hidden="true">
              {revenueSeries.map((point) => (
                <span key={point.label}>{point.label}</span>
              ))}
            </div>
          </section>

          <article className="panel metric-card">
            <p className="metric-label">Encours a collecter</p>
            <p className="metric-value">{formatCurrency(pendingAmount)}</p>
            <p className="panel-meta">Factures envoyees + retard.</p>
          </article>

          <article className="panel metric-card">
            <p className="metric-label">Factures en retard</p>
            <p className="metric-value">{overdueCount}</p>
          </article>

          <article className="panel metric-card metric-card-accent">
            <p className="metric-label">Taux de signature</p>
            <p className="metric-value">{signedRate}%</p>
          </article>
        </section>

      </div>
    </main>
  );
}
