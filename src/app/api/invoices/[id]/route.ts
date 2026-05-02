import { ensureAppUser, requireAuthUserId } from '@/lib/auth-user';
import { getInvoiceById } from '@/lib/mock-db';
import { apiData, apiError, fromCaughtError } from '@/lib/api-response';

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const authUserId = await requireAuthUserId();
    const appUserId = await ensureAppUser(authUserId);
    const invoice = await getInvoiceById(appUserId, id);

    if (!invoice) {
      return apiError('Facture introuvable.', 'NOT_FOUND', 404);
    }

    return apiData(invoice);
  } catch (error) {
    return fromCaughtError(error);
  }
}
