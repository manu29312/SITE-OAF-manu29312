import { NextResponse } from 'next/server';
import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { createInvoice, getInvoices } from '@/lib/mock-db';
import { isPositiveAmount, requireText } from '@/lib/validators';

export async function GET() {
  try {
    const clerkUserId = await requireClerkUserId();
    const appUserId = await ensureAppUser(clerkUserId);
    const invoices = await getInvoices(appUserId);
    return NextResponse.json({ data: invoices });
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
    const amountHt = Number(body?.amountHt ?? 0);
    const taxRate = Number(body?.taxRate ?? 20);

    if (
      !requireText(body?.clientId ?? '') ||
      !requireText(body?.dueDate ?? '') ||
      !isPositiveAmount(amountHt) ||
      !Number.isFinite(taxRate) ||
      taxRate < 0
    ) {
      return NextResponse.json(
        { error: 'Payload facture invalide.' },
        { status: 400 }
      );
    }

    const created = await createInvoice(appUserId, {
      clientId: body.clientId,
      amountHt,
      taxRate,
      dueDate: body.dueDate,
      status: body.status ?? 'brouillon',
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
