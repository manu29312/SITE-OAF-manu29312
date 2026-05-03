import { ContractsWorkspace } from '@/features/contracts/ContractsWorkspace';
import { ensureAppUser, requireAuthUserIdOrRedirect } from '@/lib/auth-user';
import { getClients, getInvoices } from '@/lib/mock-db';

export default async function ContratsPage() {
  const authUserId = await requireAuthUserIdOrRedirect();
  const appUserId = await ensureAppUser(authUserId);
  const [invoices, clients] = await Promise.all([
    getInvoices(appUserId),
    getClients(appUserId),
  ]);

  return <ContractsWorkspace clients={clients} invoices={invoices} />;
}
