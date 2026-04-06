import { NextResponse } from 'next/server';
import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { getInvoiceById } from '@/lib/mock-db';

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const clerkUserId = await requireClerkUserId();
    const appUserId = await ensureAppUser(clerkUserId);
    const invoice = await getInvoiceById(appUserId, id);

    if (!invoice) {
      return NextResponse.json({ error: 'Facture introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ data: invoice });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
