export function requireText(value: string): boolean {
  return value.trim().length > 1;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isPositiveAmount(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function isNonNegativeNumber(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function isClientStatus(value: unknown): value is 'actif' | 'inactif' {
  return value === 'actif' || value === 'inactif';
}

export function isContractStatus(value: unknown): value is 'actif' | 'a_renouveler' | 'expire' {
  return value === 'actif' || value === 'a_renouveler' || value === 'expire';
}

export function isInvoiceStatus(value: unknown): value is 'brouillon' | 'envoyee' | 'payee' | 'retard' {
  return value === 'brouillon' || value === 'envoyee' || value === 'payee' || value === 'retard';
}
