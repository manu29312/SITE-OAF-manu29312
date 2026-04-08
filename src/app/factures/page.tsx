import { InvoicesWorkspace } from '@/features/invoices/InvoicesWorkspace';
import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { getClients, getInvoices } from '@/lib/mock-db';

export default async function FacturesPage() {
  const clerkUserId = await requireClerkUserId();
  const appUserId = await ensureAppUser(clerkUserId);
  const [invoices, clients] = await Promise.all([
    getInvoices(appUserId),
    getClients(appUserId),
  ]);

  return <InvoicesWorkspace initialInvoices={invoices} clients={clients} />;
}
