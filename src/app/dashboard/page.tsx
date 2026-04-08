import Link from 'next/link';
import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { formatCurrency } from '@/lib/formatters';
import { buildMainNavigation } from '@/lib/main-navigation';
import { getClients, getContracts, getInvoices } from '@/lib/mock-db';

export default async function DashboardPage() {
  const clerkUserId = await requireClerkUserId();
  const appUserId = await ensureAppUser(clerkUserId);

  const [clients, contracts, invoices] = await Promise.all([
    getClients(appUserId),
    getContracts(appUserId),
    getInvoices(appUserId),
  ]);

  const monthlyRevenue = invoices.reduce((sum, invoice) => sum + invoice.amountTtc, 0);
  const waitingInvoices = invoices.filter((invoice) => invoice.status === 'brouillon' || invoice.status === 'envoyee').length;
  const overdueCount = invoices.filter((invoice) => invoice.status === 'retard').length;
  const signedRate = contracts.length ? Math.round((contracts.filter((item) => item.status === 'actif').length / contracts.length) * 100) : 0;

  return (
    <main className="app-shell">
      <section className="dashboard-topbar panel">
        <div className="dashboard-brand">
          <span className="brand-dot" aria-hidden="true" />
          <h1>OAF Admin</h1>
        </div>
        <button className="header-cta" type="button">Nouveau document</button>
      </section>

      <div className="content-column">
        <section className="panel profile-panel">
          <div>
            <p className="eyebrow">Profil entreprise</p>
            <h2>OAF Studio</h2>
            <p className="panel-meta">SIREN 123 456 789 - Lyon</p>
          </div>
          <Link href="/parametres" className="header-cta settings-pill">Parametres</Link>
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
            <button className="metric-link" type="button">Voir le detail</button>
          </article>

          <article className="panel metric-card">
            <p className="metric-label">Total factures</p>
            <p className="metric-value">{invoices.length}</p>
          </article>

          <article className="panel metric-card">
            <p className="metric-label">Factures en attente</p>
            <p className="metric-value">{waitingInvoices}</p>
          </article>

          <article className="panel metric-card metric-card-accent">
            <p className="metric-label">Factures en retard</p>
            <p className="metric-value">{overdueCount}</p>
          </article>

          <article className="panel metric-card">
            <p className="metric-label">Taux signature contrats</p>
            <p className="metric-value">{signedRate}%</p>
          </article>
        </section>

        <section className="panel">
          <h2>Activite recente</h2>
          <ul className="list">
            <li>Facture FAC-2026-031 envoyee a Studio Delta</li>
            <li>Contrat NDA accepte par Pixel Forge</li>
            <li>Relance J+3 planifiee pour FAC-2026-025</li>
          </ul>
        </section>

        <section className="panel">
          <div className="panel-head-inline">
            <h2>Relances automatiques</h2>
            <span className="status-chip">Cron quotidien actif (J-3, J+3, J+10)</span>
          </div>
          <p className="panel-meta">Planification rappels auto: J-3, J+3, J+10</p>
          <div className="checkbox-row" role="group" aria-label="Regles de relance">
            <label><input type="checkbox" checked readOnly /> J-3 avant echeance</label>
            <label><input type="checkbox" checked readOnly /> J+3 apres echeance</label>
            <label><input type="checkbox" checked readOnly /> J+10 apres echeance</label>
          </div>

          <div className="panel-actions split">
            <button type="button" className="header-cta solid">Relance manuelle</button>
            <p className="panel-meta">Aucune relance manuelle lancee</p>
          </div>
          <p className="panel-meta">Dernier job cron: aujourd hui a 08:00</p>
        </section>

        <section className="panel chart-panel">
          <div className="chart-head">
            <div>
              <h2>Evolution du chiffre d affaires</h2>
              <p className="panel-meta">Vue annuelle - Cumul periode: 319 800 EUR</p>
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

              <path d="M25 130 L255 88 L485 50 L715 35" className="chart-line" />
              <path d="M25 130 L255 88 L485 50 L715 35 L715 215 L25 215 Z" className="chart-fill" />

              <circle cx="25" cy="130" r="5" className="chart-dot" />
              <circle cx="255" cy="88" r="5" className="chart-dot" />
              <circle cx="485" cy="50" r="5" className="chart-dot" />
              <circle cx="715" cy="35" r="5" className="chart-dot" />
            </svg>
          </div>

          <div className="chart-years" aria-hidden="true">
            <span>2023</span>
            <span>2024</span>
            <span>2025</span>
            <span>2026</span>
          </div>
        </section>

        <section className="panel dashboard-footer-note">
          <p>
            {clients.length} clients actifs dans ton espace et {contracts.length} contrats suivis.
          </p>
        </section>
      </div>
    </main>
  );
}
