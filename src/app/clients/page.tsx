import { ClientsWorkspace } from '@/features/clients/ClientsWorkspace';
import { ensureAppUser, requireAuthUserIdOrRedirect } from '@/lib/auth-user';
import { getClients } from '@/lib/mock-db';

export default async function ClientsPage() {
  const authUserId = await requireAuthUserIdOrRedirect();
  const appUserId = await ensureAppUser(authUserId);
  const clients = await getClients(appUserId);

  return (
    <main className="app-shell">
      <ClientsWorkspace clients={clients} />
    </main>
  );
}