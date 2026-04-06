import { NextResponse } from 'next/server';
import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { createClient, getClients } from '@/lib/mock-db';
import { isEmail, requireText } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const appUserId = await ensureAppUser(clerkUserId);
    const clients = await getClients(appUserId);
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('query') ?? '').trim().toLowerCase();

    if (!query) {
      return NextResponse.json({ data: clients });
    }

    const filtered = clients.filter((client) => {
      return (
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.company.toLowerCase().includes(query)
      );
    });

    return NextResponse.json({ data: filtered });
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

    if (
      !requireText(body?.name ?? '') ||
      !requireText(body?.company ?? '') ||
      !isEmail(body?.email ?? '')
    ) {
      return NextResponse.json(
        { error: 'Payload client invalide.' },
        { status: 400 }
      );
    }

    const created = await createClient(appUserId, {
      name: body.name,
      email: body.email,
      company: body.company,
      status: body.status === 'inactif' ? 'inactif' : 'actif',
      city: body.city ?? 'Non renseignee',
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
