import { ClientsWorkspace } from '@/features/clients/ClientsWorkspace';
import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { getClients } from '@/lib/mock-db';

export default async function ClientsPage() {
  const clerkUserId = await requireClerkUserId();
  const appUserId = await ensureAppUser(clerkUserId);
  const clients = await getClients(appUserId);

  return (
    <main className="app-shell">
      <ClientsWorkspace clients={clients} />
    </main>
  );
}