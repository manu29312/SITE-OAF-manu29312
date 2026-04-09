import { InvoicesWorkspace } from '@/features/invoices/InvoicesWorkspace';
import { ensureAppUser, requireClerkUserIdOrRedirect } from '@/lib/auth-user';
import { getClients, getInvoices } from '@/lib/mock-db';

export default async function FacturesPage() {
  const clerkUserId = await requireClerkUserIdOrRedirect();
  const appUserId = await ensureAppUser(clerkUserId);
  const [invoices, clients] = await Promise.all([
    getInvoices(appUserId),
    getClients(appUserId),
  ]);

  return <InvoicesWorkspace initialInvoices={invoices} clients={clients} />;
}
