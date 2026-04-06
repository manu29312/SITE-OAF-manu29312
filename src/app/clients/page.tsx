import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { ClientsPanel } from '@/features/clients/ClientsPanel';
import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { getClients } from '@/lib/mock-db';

export default async function ClientsPage() {
  const clerkUserId = await requireClerkUserId();
  const appUserId = await ensureAppUser(clerkUserId);
  const clients = await getClients(appUserId);

  return (
    <main className="app-shell">
      <Header
        title="Clients"
        subtitle="Acces direct a la liste des clients relies a ton compte authentifie."
      />

      <div className="shell-grid">
        <Sidebar
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Clients', href: '/clients', active: true },
            { label: 'Factures', href: '/dashboard' },
            { label: 'Contrats', href: '/dashboard' },
            { label: 'Parametres', href: '/dashboard' },
          ]}
        />

        <div className="content-column">
          <section className="panel">
            <h2>Page clients</h2>
            <p className="panel-meta">
              Cette page est protegee par Clerk et affiche uniquement les clients de ton espace.
            </p>
          </section>

          <ClientsPanel clients={clients} />
        </div>
      </div>
    </main>
  );
}