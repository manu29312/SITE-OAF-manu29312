import { NextResponse } from 'next/server';
import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { createContract, getContracts } from '@/lib/mock-db';
import { isPositiveAmount, requireText } from '@/lib/validators';

export async function GET() {
  try {
    const clerkUserId = await requireClerkUserId();
    const appUserId = await ensureAppUser(clerkUserId);
    const contracts = await getContracts(appUserId);
    return NextResponse.json({ data: contracts });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const appUserId = await ensureAppUser(clerkUserId);
    const body = await request.json();
    const amount = Number(body?.amount ?? 0);

    if (
      !requireText(body?.clientId ?? '') ||
      !requireText(body?.title ?? '') ||
      !requireText(body?.startDate ?? '') ||
      !requireText(body?.endDate ?? '') ||
      !isPositiveAmount(amount)
    ) {
      return NextResponse.json(
        { error: 'Payload contrat invalide.' },
        { status: 400 }
      );
    }

    const created = await createContract(appUserId, {
      clientId: body.clientId,
      title: body.title,
      startDate: body.startDate,
      endDate: body.endDate,
      amount,
      status: body.status ?? 'actif',
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
