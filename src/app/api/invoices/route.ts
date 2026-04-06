import { NextResponse } from 'next/server';
import { createInvoice, getInvoices } from '@/lib/mock-db';
import { isPositiveAmount, requireText } from '@/lib/validators';

export async function GET() {
  const invoices = await getInvoices();
  return NextResponse.json({ data: invoices });
}

export async function POST(request: Request) {
  const body = await request.json();
  const amountHt = Number(body?.amountHt ?? 0);
  const amountTtc = Number(body?.amountTtc ?? 0);

  if (
    !requireText(body?.clientId ?? '') ||
    !requireText(body?.number ?? '') ||
    !requireText(body?.dueDate ?? '') ||
    !isPositiveAmount(amountHt) ||
    !isPositiveAmount(amountTtc)
  ) {
    return NextResponse.json(
      { error: 'Payload facture invalide.' },
      { status: 400 }
    );
  }

  const created = await createInvoice({
    clientId: body.clientId,
    number: body.number,
    amountHt,
    amountTtc,
    dueDate: body.dueDate,
    status: body.status ?? 'brouillon',
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
