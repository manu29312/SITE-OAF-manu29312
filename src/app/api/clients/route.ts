import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { createClient, getClients } from '@/lib/mock-db';
import { apiData, apiError, fromCaughtError } from '@/lib/api-response';
import { isClientStatus, isEmail, requireText } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const appUserId = await ensureAppUser(clerkUserId);
    const clients = await getClients(appUserId);
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('query') ?? '').trim().toLowerCase();

    if (!query) {
      return apiData(clients);
    }

    const filtered = clients.filter((client) => {
      return (
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.company.toLowerCase().includes(query)
      );
    });

    return apiData(filtered);
  } catch (error) {
    return fromCaughtError(error);
  }
}

export async function POST(request: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const appUserId = await ensureAppUser(clerkUserId);
    const body = await request.json();

    if (
      !requireText(body?.name ?? '') ||
      !requireText(body?.company ?? '') ||
      !isEmail(body?.email ?? '')
    ) {
      return apiError('Payload client invalide.', 'VALIDATION_ERROR', 400);
    }

    const status = isClientStatus(body?.status) ? body.status : 'actif';

    const created = await createClient(appUserId, {
      name: body.name,
      email: body.email,
      company: body.company,
      kbis: requireText(body?.kbis ?? '') ? body.kbis : undefined,
      status,
      city: body.city ?? 'Non renseignee',
    });

    return apiData(created, 201);
  } catch (error) {
    return fromCaughtError(error);
  }
}
