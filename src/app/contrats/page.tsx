import Link from 'next/link';
import { ContractsPanel } from '@/features/contracts/ContractsPanel';
import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { formatCurrency } from '@/lib/formatters';
import { buildMainNavigation } from '@/lib/main-navigation';
import { getContracts } from '@/lib/mock-db';

export default async function ContratsPage() {
  const clerkUserId = await requireClerkUserId();
  const appUserId = await ensureAppUser(clerkUserId);
  const contracts = await getContracts(appUserId);

  const activeCount = contracts.filter((contract) => contract.status === 'actif').length;
  const renewableCount = contracts.filter((contract) => contract.status === 'a_renouveler').length;
  const expiringCount = contracts.filter((contract) => contract.status === 'expire').length;
  const totalAmount = contracts.reduce((sum, contract) => sum + contract.amount, 0);

  return (
    <main className="app-shell">
      <section className="dashboard-topbar panel">
        <div className="dashboard-brand">
          <span className="brand-dot" aria-hidden="true" />
          <h1>OAF Admin</h1>
        </div>
        <button className="header-cta" type="button">Nouveau document</button>
      </section>

      <nav className="dashboard-tabs panel" aria-label="Navigation principale">
        {buildMainNavigation('contrats').map((item) => (
          <Link key={item.href} href={item.href} className={`dashboard-tab ${item.active ? 'active' : ''}`}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="content-column">
        <section className="panel contract-toolbar-panel">
          <div className="contract-toolbar-head">
            <h2>Contrats</h2>
            <div className="contract-toolbar-actions">
              <input type="text" placeholder="Rechercher un contrat" aria-label="Rechercher un contrat" />
              <button type="button" className="header-cta solid">Rechercher</button>
              <button type="button" className="invoice-ghost-btn">Reinitialiser</button>
              <button type="button" className="header-cta solid">Nouveau contrat</button>
            </div>
          </div>
        </section>

        <section className="panel contract-template-panel">
          <h2>Templates disponibles</h2>
          <div className="contract-template-grid">
            <button type="button" className="contract-template-item">Prestation de service</button>
            <button type="button" className="contract-template-item">NDA</button>
            <button type="button" className="contract-template-item">Cession de droits</button>
          </div>
        </section>

        <section className="grid two-col">
          <section className="panel">
            <h2>Suivi rapide</h2>
            <ul className="list">
              <li>Contrats total: {contracts.length}</li>
              <li>Actifs: {activeCount}</li>
              <li>A renouveler: {renewableCount}</li>
              <li>Expires: {expiringCount}</li>
            </ul>
          </section>

          <section className="panel">
            <h2>Montants</h2>
            <ul className="list">
              <li>Montant cumule: {formatCurrency(totalAmount)}</li>
              <li>Module dedie a la gestion des contrats freelance.</li>
            </ul>
          </section>
        </section>

        <ContractsPanel contracts={contracts} />
      </div>
    </main>
  );
}
