import { ContractsWorkspace } from '@/features/contracts/ContractsWorkspace';
import { ensureAppUser, requireAuthUserIdOrRedirect } from '@/lib/auth-user';
import { getClients, getContracts } from '@/lib/mock-db';

export default async function ContratsPage() {
  const authUserId = await requireAuthUserIdOrRedirect();
  const appUserId = await ensureAppUser(authUserId);
  const [contracts, clients] = await Promise.all([
    getContracts(appUserId),
    getClients(appUserId),
  ]);

  return <ContractsWorkspace initialContracts={contracts} clients={clients} />;
}
