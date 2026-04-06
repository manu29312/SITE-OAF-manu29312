export type ContractStatus = 'actif' | 'a_renouveler' | 'expire';

export type Contract = {
  id: string;
  clientId: string;
  title: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: ContractStatus;
};
