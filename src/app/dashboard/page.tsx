import Link from 'next/link';
import { ensureAppUser, requireClerkUserIdOrRedirect } from '@/lib/auth-user';
import { formatCurrency } from '@/lib/formatters';
import { buildMainNavigation } from '@/lib/main-navigation';
import { getClients, getContracts, getInvoices } from '@/lib/mock-db';

export default async function DashboardPage() {
  const clerkUserId = await requireClerkUserIdOrRedirect();
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
  const profileCompletion = Math.min(100, 40 + (clients.length > 0 ? 20 : 0) + (invoices.length > 0 ? 20 : 0) + (contracts.length > 0 ? 20 : 0));

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
            <p className="panel-meta">Objectif suivi freelance en temps reel.</p>
          </article>

          <article className="panel metric-card">
            <p className="metric-label">En attente paiement</p>
            <p className="metric-value">{waitingInvoices}</p>
          </article>

          <article className="panel metric-card">
            <p className="metric-label">Factures en retard</p>
            <p className="metric-value">{overdueCount}</p>
          </article>

          <article className="panel metric-card metric-card-accent">
            <p className="metric-label">Taux de signature</p>
            <p className="metric-value">{signedRate}%</p>
          </article>

          <article className="panel metric-card">
            <p className="metric-label">Time to first invoice</p>
            <p className="metric-value">{invoices.length > 0 ? 'Actif' : 'A demarrer'}</p>
          </article>
        </section>

        <section className="panel">
          <h2>Timeline suivi & rappels</h2>
          <ul className="list">
            <li>Envoyee: suivi d ouverture des factures active.</li>
            <li>Echeance J+0: verification automatique des impayes.</li>
            <li>Retard J+7: relance intelligente plus directe.</li>
          </ul>
        </section>

        <section className="panel">
          <div className="panel-head-inline">
            <h2>Rappels intelligents</h2>
            <span className="status-chip">J-3, J+3, J+10</span>
          </div>
          <p className="panel-meta">Planification par defaut good-citizen, non agressive.</p>
          <div className="checkbox-row" role="group" aria-label="Regles de relance">
            <label><input type="checkbox" checked readOnly /> J-3 avant echeance</label>
            <label><input type="checkbox" checked readOnly /> J+3 apres echeance</label>
            <label><input type="checkbox" checked readOnly /> J+10 apres echeance</label>
          </div>

          <div className="panel-actions split">
            <button type="button" className="header-cta solid">Relance manuelle</button>
            <p className="panel-meta">Planifier un rappel auto personnalise</p>
          </div>
        </section>

        <section className="panel chart-panel">
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

        <section className="panel">
          <div className="panel-head-inline">
            <h2>Suivi factures</h2>
            <Link href="/factures" className="header-cta">Voir tout</Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Facture</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.number}</td>
                    <td>{clients.find((client) => client.id === invoice.clientId)?.company ?? 'Client inconnu'}</td>
                    <td>{formatCurrency(invoice.amountTtc)}</td>
                    <td>{invoice.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head-inline">
            <h2>Suivi contrats</h2>
            <Link href="/contrats" className="header-cta">Voir tout</Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contrat</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {contracts.slice(0, 5).map((contract) => (
                  <tr key={contract.id}>
                    <td>{contract.title}</td>
                    <td>{clients.find((client) => client.id === contract.clientId)?.company ?? 'Client inconnu'}</td>
                    <td>Prestation</td>
                    <td>{contract.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head-inline">
            <h2>Plans & KPI produit</h2>
            <span className="status-chip">Freemium / Pro / Business</span>
          </div>
          <ul className="list">
            <li>Freemium: 3 docs/mois + watermark leger.</li>
            <li>Pro: 12 EUR/mois - illimite, rappels auto, themes PDF.</li>
            <li>Business: 29 EUR/mois - multi-societes, signatures avancees, export comptable.</li>
            <li>KPI: activation profil, time-to-first-invoice, conversion freemium vers pro, DSO.</li>
          </ul>
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
