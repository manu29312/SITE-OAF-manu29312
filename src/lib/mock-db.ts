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

type MemoryStore = {
  clients: Client[];
  contracts: Contract[];
  invoices: Invoice[];
};

const memoryStoreByUser = new Map<string, MemoryStore>();

function getMemoryStore(userId: string): MemoryStore {
  const existing = memoryStoreByUser.get(userId);
  if (existing) {
    return existing;
  }

  const initial: MemoryStore = {
    clients: [],
    contracts: [],
    invoices: [],
  };
  memoryStoreByUser.set(userId, initial);
  return initial;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isDatabaseUnavailable(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === 'PrismaClientInitializationError' ||
    error.message.includes("Can't reach database server") ||
    error.message.includes('P1001')
  );
}

function logDatabaseFallback(operation: string, userId: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[mock-db] fallback memory used for ${operation} (user=${userId}) - ${message}`);
}

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
  try {
    const records = await prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      company: item.company,
      kbis: item.vatNumber ?? undefined,
      status: toClientStatus(item.status),
      city: item.city ?? 'Non renseignee',
    }));
  } catch (error) {
    if (!isDatabaseUnavailable(error)) {
      throw error;
    }

    logDatabaseFallback('getClients', userId, error);

    return [...getMemoryStore(userId).clients];
  }
}

export async function createClient(userId: string, input: CreateClientInput): Promise<Client> {
  try {
    const created = await prisma.client.create({
      data: {
        userId,
        name: input.name,
        email: input.email,
        company: input.company,
        vatNumber: input.kbis,
        city: input.city,
        status: fromClientStatus(input.status),
      },
    });

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      company: created.company,
      kbis: created.vatNumber ?? undefined,
      city: created.city ?? 'Non renseignee',
      status: toClientStatus(created.status),
    };
  } catch (error) {
    if (!isDatabaseUnavailable(error)) {
      throw error;
    }

    logDatabaseFallback('createClient', userId, error);

    const created: Client = {
      id: generateId('client'),
      name: input.name,
      email: input.email,
      company: input.company,
      kbis: input.kbis,
      city: input.city,
      status: input.status,
    };

    const store = getMemoryStore(userId);
    store.clients.unshift(created);

    return created;
  }
}

export async function getInvoices(userId: string): Promise<Invoice[]> {
  try {
    const records = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((item) => ({
      id: item.id,
      clientId: item.clientId,
      number: item.number,
      amountHt: Number(item.amountHt),
      amountTtc: Number(item.amountTtc),
      dueDate: item.dueDate.toISOString().slice(0, 10),
      status: toInvoiceStatus(item.status),
    }));
  } catch (error) {
    if (!isDatabaseUnavailable(error)) {
      throw error;
    }

    logDatabaseFallback('getInvoices', userId, error);

    return [...getMemoryStore(userId).invoices];
  }
}

export async function getInvoiceById(userId: string, id: string): Promise<Invoice | null> {
  try {
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
  } catch (error) {
    if (!isDatabaseUnavailable(error)) {
      throw error;
    }

    logDatabaseFallback('getInvoiceById', userId, error);

    return getMemoryStore(userId).invoices.find((item) => item.id === id) ?? null;
  }
}

export async function createInvoice(userId: string, input: CreateInvoiceInput): Promise<Invoice> {
  const initialStatus = input.status === 'payee' ? 'brouillon' : input.status;

  try {
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
        status: fromInvoiceStatus(initialStatus ?? 'brouillon'),
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
  } catch (error) {
    if (!isDatabaseUnavailable(error)) {
      throw error;
    }

    logDatabaseFallback('createInvoice', userId, error);

    const store = getMemoryStore(userId);
    const totals = computeTotals(input.amountHt, input.taxRate);
    const year = new Date().getFullYear();
    const prefix = `FAC-${year}-`;
    const nextSequence = String(store.invoices.length + 1).padStart(4, '0');

    const created: Invoice = {
      id: generateId('invoice'),
      clientId: input.clientId,
      number: `${prefix}${nextSequence}`,
      amountHt: totals.amountHt,
      amountTtc: totals.amountTtc,
      dueDate: input.dueDate,
      status: initialStatus ?? 'brouillon',
    };

    store.invoices.unshift(created);
    return created;
  }
}

export async function markInvoicePaid(userId: string, id: string): Promise<Invoice> {
  try {
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
  } catch (error) {
    if (!isDatabaseUnavailable(error)) {
      throw error;
    }

    logDatabaseFallback('markInvoicePaid', userId, error);

    const store = getMemoryStore(userId);
    const invoice = store.invoices.find((item) => item.id === id);
    if (!invoice) {
      throw new Error('NOT_FOUND');
    }

    if (invoice.status !== 'payee') {
      invoice.status = 'payee';
    }

    return { ...invoice };
  }
}

export async function getContracts(userId: string): Promise<Contract[]> {
  try {
    const records = await prisma.contract.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((item) => ({
      id: item.id,
      clientId: item.clientId,
      title: item.title,
      startDate: item.startDate.toISOString().slice(0, 10),
      endDate: item.endDate.toISOString().slice(0, 10),
      amount: Number(item.amount),
      status: toContractStatus(item.status),
    }));
  } catch (error) {
    if (!isDatabaseUnavailable(error)) {
      throw error;
    }

    logDatabaseFallback('getContracts', userId, error);

    return [...getMemoryStore(userId).contracts];
  }
}

export async function createContract(userId: string, input: CreateContractInput): Promise<Contract> {
  try {
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
  } catch (error) {
    if (!isDatabaseUnavailable(error)) {
      throw error;
    }

    logDatabaseFallback('createContract', userId, error);

    const created: Contract = {
      id: generateId('contract'),
      clientId: input.clientId,
      title: input.title,
      startDate: input.startDate,
      endDate: input.endDate,
      amount: input.amount,
      status: input.status,
    };

    const store = getMemoryStore(userId);
    store.contracts.unshift(created);

    return created;
  }
}
