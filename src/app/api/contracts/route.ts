import { NextResponse } from 'next/server';
import { createContract, getContracts } from '@/lib/mock-db';
import { isPositiveAmount, requireText } from '@/lib/validators';

export async function GET() {
  const contracts = await getContracts();
  return NextResponse.json({ data: contracts });
}

export async function POST(request: Request) {
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

  const created = await createContract({
    clientId: body.clientId,
    title: body.title,
    startDate: body.startDate,
    endDate: body.endDate,
    amount,
    status: body.status ?? 'actif',
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
