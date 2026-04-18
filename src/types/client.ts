export type ClientStatus = 'actif' | 'inactif';

export type Client = {
  id: string;
  name: string;
  email: string;
  company: string;
  kbis?: string;
  status: ClientStatus;
  city: string;
};
