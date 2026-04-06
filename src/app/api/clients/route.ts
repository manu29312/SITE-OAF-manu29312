import { NextResponse } from 'next/server';
import { createClient, getClients } from '@/lib/mock-db';
import { isEmail, requireText } from '@/lib/validators';

export async function GET() {
  const clients = await getClients();
  return NextResponse.json({ data: clients });
}

export async function POST(request: Request) {
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

  const created = await createClient({
    name: body.name,
    email: body.email,
    company: body.company,
    status: body.status === 'inactif' ? 'inactif' : 'actif',
    city: body.city ?? 'Non renseignee',
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
