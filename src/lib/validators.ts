export function requireText(value: string): boolean {
  return value.trim().length > 1;
}

export function isEmail(value: string): boolean {
  return /.+@.+\..+/.test(value.trim());
}

export function isPositiveAmount(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}
