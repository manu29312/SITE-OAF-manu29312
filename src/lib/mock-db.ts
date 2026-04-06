import type {
  ClientStatus as PrismaClientStatus,
  ContractStatus as PrismaContractStatus,
  InvoiceStatus as PrismaInvoiceStatus,
} from '@prisma/client';
import type { Client } from '@/types/client';
import type { Contract } from '@/types/contract';
import type { Invoice } from '@/types/invoice';
import { prisma } from '@/lib/prisma';

type CreateClientInput = Omit<Client, 'id'>;

type CreateContractInput = Omit<Contract, 'id'>;

type CreateInvoiceInput = {
  clientId: string;
  dueDate: string;
  amountHt: number;
  taxRate: number;
  status?: Invoice['status'];
};

function toClientStatus(value: PrismaClientStatus): Client['status'] {
  return value === 'ACTIF' ? 'actif' : 'inactif';
}

function toInvoiceStatus(value: PrismaInvoiceStatus): Invoice['status'] {
  switch (value) {
    case 'ENVOYEE':
      return 'envoyee';
    case 'PAYEE':
      return 'payee';
    case 'RETARD':
      return 'retard';
    default:
      return 'brouillon';
  }
}

function toContractStatus(value: PrismaContractStatus): Contract['status'] {
  switch (value) {
    case 'A_RENOUVELER':
      return 'a_renouveler';
    case 'EXPIRE':
      return 'expire';
    default:
      return 'actif';
  }
}

function fromClientStatus(value: Client['status']): PrismaClientStatus {
  return value === 'inactif' ? 'INACTIF' : 'ACTIF';
}

function fromInvoiceStatus(value: Invoice['status']): PrismaInvoiceStatus {
  switch (value) {
    case 'envoyee':
      return 'ENVOYEE';
    case 'payee':
      return 'PAYEE';
    case 'retard':
      return 'RETARD';
    default:
      return 'BROUILLON';
  }
}

function fromContractStatus(value: Contract['status']): PrismaContractStatus {
  switch (value) {
    case 'a_renouveler':
      return 'A_RENOUVELER';
    case 'expire':
      return 'EXPIRE';
    default:
      return 'ACTIF';
  }
}

function to2Decimals(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function computeTotals(amountHt: number, taxRate: number) {
  const amountTax = to2Decimals((amountHt * taxRate) / 100);
  const amountTtc = to2Decimals(amountHt + amountTax);

  return {
    amountHt: to2Decimals(amountHt),
    taxRate: to2Decimals(taxRate),
    amountTax,
    amountTtc,
  };
}

async function generateNextInvoiceNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;

  const latest = await prisma.invoice.findFirst({
    where: {
      userId,
      number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      number: 'desc',
    },
    select: {
      number: true,
    },
  });

  const latestSequence = latest ? Number(latest.number.slice(prefix.length)) || 0 : 0;
  const nextSequence = String(latestSequence + 1).padStart(4, '0');

  return `${prefix}${nextSequence}`;
}

export async function getClients(userId: string): Promise<Client[]> {
  const records = await prisma.client.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return records.map((item: any) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    company: item.company,
    status: toClientStatus(item.status),
    city: item.city ?? 'Non renseignee',
  }));
}

export async function createClient(userId: string, input: CreateClientInput): Promise<Client> {
  const created = await prisma.client.create({
    data: {
      userId,
      name: input.name,
      email: input.email,
      company: input.company,
      city: input.city,
      status: fromClientStatus(input.status),
    },
  });

  return {
    id: created.id,
    name: created.name,
    email: created.email,
    company: created.company,
    city: created.city ?? 'Non renseignee',
    status: toClientStatus(created.status),
  };
}

export async function getInvoices(userId: string): Promise<Invoice[]> {
  const records = await prisma.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return records.map((item: any) => ({
    id: item.id,
    clientId: item.clientId,
    number: item.number,
    amountHt: Number(item.amountHt),
    amountTtc: Number(item.amountTtc),
    dueDate: item.dueDate.toISOString().slice(0, 10),
    status: toInvoiceStatus(item.status),
  }));
}

export async function getInvoiceById(userId: string, id: string): Promise<Invoice | null> {
  const item = await prisma.invoice.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!item) {
    return null;
  }

  return {
    id: item.id,
    clientId: item.clientId,
    number: item.number,
    amountHt: Number(item.amountHt),
    amountTtc: Number(item.amountTtc),
    dueDate: item.dueDate.toISOString().slice(0, 10),
    status: toInvoiceStatus(item.status),
  };
}

export async function createInvoice(userId: string, input: CreateInvoiceInput): Promise<Invoice> {
  const number = await generateNextInvoiceNumber(userId);
  const totals = computeTotals(input.amountHt, input.taxRate);

  const created = await prisma.invoice.create({
    data: {
      userId,
      clientId: input.clientId,
      number,
      dueDate: new Date(input.dueDate),
      amountHt: totals.amountHt,
      taxRate: totals.taxRate,
      amountTax: totals.amountTax,
      amountTtc: totals.amountTtc,
      status: fromInvoiceStatus(input.status ?? 'brouillon'),
    },
  });

  return {
    id: created.id,
    clientId: created.clientId,
    number: created.number,
    amountHt: Number(created.amountHt),
    amountTtc: Number(created.amountTtc),
    dueDate: created.dueDate.toISOString().slice(0, 10),
    status: toInvoiceStatus(created.status),
  };
}

export async function markInvoicePaid(userId: string, id: string): Promise<Invoice> {
  const existing = await prisma.invoice.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existing) {
    throw new Error('NOT_FOUND');
  }

  if (existing.status === 'PAYEE') {
    return {
      id: existing.id,
      clientId: existing.clientId,
      number: existing.number,
      amountHt: Number(existing.amountHt),
      amountTtc: Number(existing.amountTtc),
      dueDate: existing.dueDate.toISOString().slice(0, 10),
      status: 'payee',
    };
  }

  const updated = await prisma.invoice.update({
    where: { id: existing.id },
    data: {
      status: 'PAYEE',
      paidAt: new Date(),
    },
  });

  return {
    id: updated.id,
    clientId: updated.clientId,
    number: updated.number,
    amountHt: Number(updated.amountHt),
    amountTtc: Number(updated.amountTtc),
    dueDate: updated.dueDate.toISOString().slice(0, 10),
    status: 'payee',
  };
}

export async function getContracts(userId: string): Promise<Contract[]> {
  const records = await prisma.contract.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return records.map((item: any) => ({
    id: item.id,
    clientId: item.clientId,
    title: item.title,
    startDate: item.startDate.toISOString().slice(0, 10),
    endDate: item.endDate.toISOString().slice(0, 10),
    amount: Number(item.amount),
    status: toContractStatus(item.status),
  }));
}

export async function createContract(userId: string, input: CreateContractInput): Promise<Contract> {
  const created = await prisma.contract.create({
    data: {
      userId,
      clientId: input.clientId,
      title: input.title,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      amount: input.amount,
      status: fromContractStatus(input.status),
    },
  });

  return {
    id: created.id,
    clientId: created.clientId,
    title: created.title,
    startDate: created.startDate.toISOString().slice(0, 10),
    endDate: created.endDate.toISOString().slice(0, 10),
    amount: Number(created.amount),
    status: toContractStatus(created.status),
  };
}
