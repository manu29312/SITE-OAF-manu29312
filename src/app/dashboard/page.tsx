import Link from 'next/link';
import { cookies } from 'next/headers';
import { ensureAppUser, requireAuthUserIdOrRedirect } from '@/lib/auth-user';
import { formatCurrency } from '@/lib/formatters';
import { buildMainNavigation } from '@/lib/main-navigation';
import { getClients, getContracts, getInvoices } from '@/lib/mock-db';
import { RevenueChart } from '@/features/dashboard/RevenueChart';

const COMPANY_NAME_COOKIE = 'site-oaf.company-name';

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
  const authUserId = await requireAuthUserIdOrRedirect();
  const appUserId = await ensureAppUser(authUserId);
  const companyName = decodeURIComponent(cookies().get(COMPANY_NAME_COOKIE)?.value ?? '').trim() || 'OAF Admin';

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
  const showOnboarding = profileCompletion < 100;

  return (
    <main className="app-shell">
      <section className="dashboard-topbar panel">
        <div className="dashboard-brand">
          <span className="brand-dot" aria-hidden="true" />
          <h1>{companyName}</h1>
        </div>
        <div className="panel-actions split">
          <span className="dashboard-revenue-pill">
            CA du mois <strong>{formatCurrency(monthlyRevenue)}</strong>
          </span>
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

        {showOnboarding ? (
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
        ) : null}

        <nav className="dashboard-tabs panel" aria-label="Navigation dashboard">
          {buildMainNavigation('dashboard').map((item) => (
            <Link key={item.href} href={item.href} className={`dashboard-tab ${item.active ? 'active' : ''}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="dashboard-metrics">
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

            <RevenueChart points={revenueSeries} />
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
