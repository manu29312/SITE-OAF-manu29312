import { Header } from '@/components/Header';
import { InfoCard } from '@/components/InfoCard';
import { SectionPanel } from '@/components/SectionPanel';
import { Sidebar } from '@/components/Sidebar';
import { ClientsPanel } from '@/features/clients/ClientsPanel';
import { ContractsPanel } from '@/features/contracts/ContractsPanel';
import { InvoiceCreatePanel } from '@/features/invoices/InvoiceCreatePanel';
import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { formatCurrency } from '@/lib/formatters';
import { getClients, getContracts, getInvoices } from '@/lib/mock-db';
import {
  frameworkStack,
  legacyToNextMap,
  migrationSteps,
  projectGoals,
} from '@/lib/site-data';

export default async function DashboardPage() {
  const clerkUserId = await requireClerkUserId();
  const appUserId = await ensureAppUser(clerkUserId);

  const [clients, contracts, invoices] = await Promise.all([
    getClients(appUserId),
    getContracts(appUserId),
    getInvoices(appUserId),
  ]);

  const overdueCount = invoices.filter((invoice) => invoice.status === 'retard').length;

  return (
    <main className="app-shell">
      <Header
        title="Migration vers une base Next.js propre et professionnelle"
        subtitle="Cette base structure le projet par composants, pages, donnees et fonctionnalites pour rendre la migration plus simple et plus lisible."
      />

      <div className="shell-grid">
        <Sidebar
          items={[
            { label: 'Dashboard', href: '/dashboard', active: true },
            { label: 'Clients', href: '/clients' },
            { label: 'Factures', href: '/dashboard' },
            { label: 'Contrats', href: '/dashboard' },
            { label: 'Parametres', href: '/dashboard' },
          ]}
        />

        <div className="content-column">
          <section className="grid two-col">
            <SectionPanel title="Objectifs du projet">
              <ul className="list">
                {projectGoals.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>
            </SectionPanel>

            <SectionPanel title="Point de depart" tone="highlight">
              <p>
                Le front statique peut rester comme reference pendant que la nouvelle
                base Next.js prend le relais progressivement.
              </p>
            </SectionPanel>
          </section>

          <section className="grid two-col">
            <SectionPanel title="Point 3 - Migration metier" tone="highlight">
              <ul className="list">
                <li>{clients.length} clients migres dans un module metier dedie.</li>
                <li>Formulaire de creation facture avec calcul HT/TTC.</li>
                <li>{contracts.length} contrats relies a une vue metier.</li>
                <li>Routes API disponibles sur /api/clients, /api/invoices, /api/contracts.</li>
              </ul>
            </SectionPanel>

            <SectionPanel title="Controle rapide">
              <ul className="list">
                <li>Factures en retard: {overdueCount}</li>
                <li>
                  Montant TTC total: {formatCurrency(invoices.reduce((sum, item) => sum + item.amountTtc, 0))}
                </li>
                <li>Creation et listing API prets pour tests Postman/Thunder Client.</li>
                <li>
                  <a href="/clients">Ouvrir la page clients</a>
                </li>
              </ul>
            </SectionPanel>
          </section>

          <ClientsPanel clients={clients} />
          <InvoiceCreatePanel />
          <ContractsPanel contracts={contracts} />

          <section className="panel">
            <h2>Routes API de base</h2>
            <p className="panel-meta">GET et POST disponibles pour chaque domaine metier.</p>
            <div className="api-grid">
              <div>
                <strong>Clients</strong>
                <p>GET /api/clients</p>
                <p>POST /api/clients</p>
              </div>
              <div>
                <strong>Factures</strong>
                <p>GET /api/invoices</p>
                <p>POST /api/invoices</p>
                <p>GET /api/invoices/[id]</p>
                <p>POST /api/invoices/[id]/mark-paid</p>
              </div>
              <div>
                <strong>Contrats</strong>
                <p>GET /api/contracts</p>
                <p>POST /api/contracts</p>
              </div>
            </div>
          </section>

          <section className="section-block">
            <div className="section-head">
              <h2>Stack recommandee</h2>
              <p>Base technique simple a maintenir et adaptee a l application.</p>
            </div>

            <div className="card-grid">
              {frameworkStack.map((item) => (
                <InfoCard key={item.title} title={item.title} description={item.description} tone="accent" />
              ))}
            </div>
          </section>

          <section className="grid two-col">
            <SectionPanel title="Etapes de migration">
              <ol className="list ordered">
                {migrationSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </SectionPanel>

            <SectionPanel title="Correspondance legacy -&gt; Next">
              <ul className="mapping-list">
                {legacyToNextMap.map((item) => (
                  <li key={item.legacy}>
                    <strong>{item.legacy}</strong>
                    <span>{item.next}</span>
                  </li>
                ))}
              </ul>
            </SectionPanel>
          </section>

          <section className="panel final-callout">
            <h2>Base de travail</h2>
            <p>
              Le but est d utiliser Next.js comme structure principale, puis de
              reconnecter progressivement les ecrans factures, clients, contrats et
              parametres.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
