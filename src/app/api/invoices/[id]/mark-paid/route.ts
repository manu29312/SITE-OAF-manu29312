import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { markInvoicePaid } from '@/lib/mock-db';
import { apiData, fromCaughtError } from '@/lib/api-response';

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const clerkUserId = await requireClerkUserId();
    const appUserId = await ensureAppUser(clerkUserId);
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
