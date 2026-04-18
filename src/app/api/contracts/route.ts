import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { createContract, getContracts } from '@/lib/mock-db';
import { apiData, apiError, fromCaughtError } from '@/lib/api-response';
import { isContractStatus, isIsoDate, isPositiveAmount, requireText } from '@/lib/validators';

export async function GET() {
  try {
    const clerkUserId = await requireClerkUserId();
    const appUserId = await ensureAppUser(clerkUserId);
    const contracts = await getContracts(appUserId);
    return apiData(contracts);
  } catch (error) {
    return fromCaughtError(error);
  }
}

export async function POST(request: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const appUserId = await ensureAppUser(clerkUserId);
    const body = await request.json();
    const amount = Number(body?.amount ?? 0);
    const status = isContractStatus(body?.status) ? body.status : 'actif';

    if (
      !requireText(body?.clientId ?? '') ||
      !requireText(body?.title ?? '') ||
      !isIsoDate(body?.startDate ?? '') ||
      !isIsoDate(body?.endDate ?? '') ||
      !isPositiveAmount(amount)
    ) {
      return apiError('Payload contrat invalide.', 'VALIDATION_ERROR', 400);
    }

    if (new Date(body.startDate) > new Date(body.endDate)) {
      return apiError('Les dates du contrat sont invalides.', 'VALIDATION_ERROR', 400);
    }

    const created = await createContract(appUserId, {
      clientId: body.clientId,
      title: body.title,
      startDate: body.startDate,
      endDate: body.endDate,
      amount,
      status,
    });

    return apiData(created, 201);
  } catch (error) {
    return fromCaughtError(error);
  }
}
