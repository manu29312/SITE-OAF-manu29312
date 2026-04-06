import type { Client } from '@/types/client';
import type { Contract } from '@/types/contract';
import type { Invoice } from '@/types/invoice';

let clients: Client[] = [
  {
    id: 'c1',
    name: 'Emma Renaud',
    email: 'emma.renaud@atelier-oaf.fr',
    company: 'Atelier OAF',
    status: 'actif',
    city: 'Lyon',
  },
  {
    id: 'c2',
    name: 'Paul Martin',
    email: 'paul.martin@studio-mk.fr',
    company: 'Studio MK',
    status: 'actif',
    city: 'Nantes',
  },
  {
    id: 'c3',
    name: 'Chloe Garnier',
    email: 'chloe.garnier@northline.fr',
    company: 'Northline',
    status: 'inactif',
    city: 'Lille',
  },
];

let invoices: Invoice[] = [
  {
    id: 'i1',
    clientId: 'c1',
    number: 'FAC-2026-001',
    amountHt: 1200,
    amountTtc: 1440,
    dueDate: '2026-04-18',
    status: 'envoyee',
  },
  {
    id: 'i2',
    clientId: 'c2',
    number: 'FAC-2026-002',
    amountHt: 850,
    amountTtc: 1020,
    dueDate: '2026-04-14',
    status: 'brouillon',
  },
  {
    id: 'i3',
    clientId: 'c3',
    number: 'FAC-2026-003',
    amountHt: 2200,
    amountTtc: 2640,
    dueDate: '2026-04-01',
    status: 'retard',
  },
];

let contracts: Contract[] = [
  {
    id: 'k1',
    clientId: 'c1',
    title: 'Maintenance trimestrielle',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    amount: 4800,
    status: 'actif',
  },
  {
    id: 'k2',
    clientId: 'c2',
    title: 'Refonte interface B2B',
    startDate: '2026-02-10',
    endDate: '2026-06-30',
    amount: 12500,
    status: 'a_renouveler',
  },
  {
    id: 'k3',
    clientId: 'c3',
    title: 'Support annuel',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    amount: 3200,
    status: 'expire',
  },
];

export async function getClients(): Promise<Client[]> {
  return clients;
}

export async function createClient(input: Omit<Client, 'id'>): Promise<Client> {
  const created: Client = {
    id: `c${Date.now()}`,
    ...input,
  };
  clients = [created, ...clients];
  return created;
}

export async function getInvoices(): Promise<Invoice[]> {
  return invoices;
}

export async function createInvoice(input: Omit<Invoice, 'id'>): Promise<Invoice> {
  const created: Invoice = {
    id: `i${Date.now()}`,
    ...input,
  };
  invoices = [created, ...invoices];
  return created;
}

export async function getContracts(): Promise<Contract[]> {
  return contracts;
}

export async function createContract(input: Omit<Contract, 'id'>): Promise<Contract> {
  const created: Contract = {
    id: `k${Date.now()}`,
    ...input,
  };
  contracts = [created, ...contracts];
  return created;
}
