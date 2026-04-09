import { ContractsWorkspace } from '@/features/contracts/ContractsWorkspace';
import { ensureAppUser, requireClerkUserIdOrRedirect } from '@/lib/auth-user';
import { getClients, getContracts } from '@/lib/mock-db';

export default async function ContratsPage() {
  const clerkUserId = await requireClerkUserIdOrRedirect();
  const appUserId = await ensureAppUser(clerkUserId);
  const [contracts, clients] = await Promise.all([
    getContracts(appUserId),
    getClients(appUserId),
  ]);

  return <ContractsWorkspace initialContracts={contracts} clients={clients} />;
}
