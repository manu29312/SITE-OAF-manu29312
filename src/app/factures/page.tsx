import { InvoicesWorkspace } from '@/features/invoices/InvoicesWorkspace';
import { ensureAppUser, requireAuthUserIdOrRedirect } from '@/lib/auth-user';
import { getClients, getInvoices } from '@/lib/mock-db';

export default async function FacturesPage() {
  const authUserId = await requireAuthUserIdOrRedirect();
  const appUserId = await ensureAppUser(authUserId);
  const [invoices, clients] = await Promise.all([
    getInvoices(appUserId),
    getClients(appUserId),
  ]);

  return <InvoicesWorkspace initialInvoices={invoices} clients={clients} />;
}
