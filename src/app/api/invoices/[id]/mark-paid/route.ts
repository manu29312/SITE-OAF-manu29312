import { NextResponse } from 'next/server';
import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { markInvoicePaid } from '@/lib/mock-db';

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const clerkUserId = await requireClerkUserId();
    const appUserId = await ensureAppUser(clerkUserId);
    const invoice = await markInvoicePaid(appUserId, id);

    return NextResponse.json({ data: invoice });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Facture introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
