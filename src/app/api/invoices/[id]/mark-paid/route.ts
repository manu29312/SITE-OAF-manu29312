import { ensureAppUser, requireAuthUserId } from '@/lib/auth-user';
import { markInvoicePaid } from '@/lib/mock-db';
import { apiData, fromCaughtError } from '@/lib/api-response';

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const authUserId = await requireAuthUserId();
    const appUserId = await ensureAppUser(authUserId);
    const invoice = await markInvoicePaid(appUserId, id);

    return apiData(invoice);
  } catch (error) {
    return fromCaughtError(error, {
      NOT_FOUND: {
        status: 404,
        message: 'Facture introuvable.',
        code: 'NOT_FOUND',
      },
    });
  }
}
