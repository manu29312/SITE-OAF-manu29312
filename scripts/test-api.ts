type ApiResponse<T> = {
  data?: T;
  error?: string;
};

type ClientPayload = {
  id: string;
  name: string;
  email: string;
  company: string;
  kbis?: string;
  city: string;
  status: 'actif' | 'inactif';
};

type InvoicePayload = {
  id: string;
  clientId: string;
  number: string;
  amountHt: number;
  amountTtc: number;
  dueDate: string;
  status: 'brouillon' | 'envoyee' | 'payee' | 'retard';
};

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
const clientCompany = `Test Societe ${Date.now()}`;
const clientKbis = `RCS TEST ${Date.now()}`;

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  return (await response.json()) as ApiResponse<T>;
}

async function assert(condition: boolean, message: string): Promise<void> {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  if (process.env.LOCAL_DEV_AUTH !== 'true') {
    throw new Error('Ce script est pense pour fonctionner avec LOCAL_DEV_AUTH=true.');
  }

  console.log(`Base URL: ${baseUrl}`);

  const createClientResponse = await fetch(`${baseUrl}/api/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Test Prenom Nom',
      company: clientCompany,
      kbis: clientKbis,
      email: `test-${Date.now()}@example.com`,
      city: 'Lyon',
      status: 'actif',
    }),
  });

  const createdClientPayload = await readJson<ClientPayload>(createClientResponse);
  await assert(createClientResponse.ok, `POST /api/clients a echoue: ${createdClientPayload.error ?? 'erreur inconnue'}`);
  await assert(Boolean(createdClientPayload.data), 'POST /api/clients ne renvoie pas de data.');

  const createdClient = createdClientPayload.data as ClientPayload;
  await assert(createdClient.company === clientCompany, 'La societe ne correspond pas au payload envoye.');
  await assert(createdClient.kbis === clientKbis, 'Le KBIS n est pas conserve separement.');

  const listClientsResponse = await fetch(`${baseUrl}/api/clients?query=${encodeURIComponent(clientCompany)}`);
  const listClientsPayload = await readJson<ClientPayload[]>(listClientsResponse);
  await assert(listClientsResponse.ok, `GET /api/clients a echoue: ${listClientsPayload.error ?? 'erreur inconnue'}`);
  await assert(
    Array.isArray(listClientsPayload.data) &&
      listClientsPayload.data.some((client) => client.id === createdClient.id && client.company === clientCompany),
    'Le client cree ne ressort pas correctement dans la liste.',
  );

  const createInvoiceResponse = await fetch(`${baseUrl}/api/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId: createdClient.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      amountHt: 100,
      taxRate: 20,
      status: 'payee',
    }),
  });

  const createdInvoicePayload = await readJson<InvoicePayload>(createInvoiceResponse);
  await assert(createInvoiceResponse.ok, `POST /api/invoices a echoue: ${createdInvoicePayload.error ?? 'erreur inconnue'}`);
  await assert(Boolean(createdInvoicePayload.data), 'POST /api/invoices ne renvoie pas de data.');

  const createdInvoice = createdInvoicePayload.data as InvoicePayload;
  await assert(createdInvoice.status === 'brouillon', 'Le statut payee ne doit pas etre autorise a la creation.');

  console.log('OK: point 3 et point 5 valides.');
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Echec du test API: ${message}`);
  process.exit(1);
});