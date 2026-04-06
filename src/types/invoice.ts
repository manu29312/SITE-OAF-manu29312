export type InvoiceStatus = 'brouillon' | 'envoyee' | 'payee' | 'retard';

export type Invoice = {
  id: string;
  clientId: string;
  number: string;
  amountHt: number;
  amountTtc: number;
  dueDate: string;
  status: InvoiceStatus;
};
