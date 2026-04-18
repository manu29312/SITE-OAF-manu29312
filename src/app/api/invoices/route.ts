import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { createInvoice, getInvoices } from '@/lib/mock-db';
import { apiData, apiError, fromCaughtError } from '@/lib/api-response';
import { isInvoiceStatus, isIsoDate, isNonNegativeNumber, isPositiveAmount, requireText } from '@/lib/validators';

export async function GET() {
  try {
    const clerkUserId = await requireClerkUserId();
    const appUserId = await ensureAppUser(clerkUserId);
    const invoices = await getInvoices(appUserId);
    return apiData(invoices);
  } catch (error) {
    return fromCaughtError(error);
  }
}

export async function POST(request: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const appUserId = await ensureAppUser(clerkUserId);
    const body = await request.json();
    const amountHt = Number(body?.amountHt ?? 0);
    const taxRate = Number(body?.taxRate ?? 20);
    const rawStatus = isInvoiceStatus(body?.status) ? body.status : 'brouillon';
    const requestedStatus = rawStatus === 'payee' ? 'brouillon' : rawStatus;

    if (
      !requireText(body?.clientId ?? '') ||
      !isIsoDate(body?.dueDate ?? '') ||
      !isPositiveAmount(amountHt) ||
      !isNonNegativeNumber(taxRate)
    ) {
      return apiError('Payload facture invalide.', 'VALIDATION_ERROR', 400);
    }

    const created = await createInvoice(appUserId, {
      clientId: body.clientId,
      amountHt,
      taxRate,
      dueDate: body.dueDate,
      status: requestedStatus ?? 'brouillon',
    });

    return apiData(created, 201);
  } catch (error) {
    return fromCaughtError(error);
  }
}
