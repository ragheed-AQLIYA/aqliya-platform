export function parseDate(str: string): Date {
  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date string: "${str}"`);
  }
  return parsed;
}

export function isExpired(expires: string, now?: Date): boolean {
  const expiry = parseDate(expires);
  const reference = now ?? new Date();
  return reference >= expiry;
}

export function daysUntilExpiry(expires: string): number {
  const expiry = parseDate(expires);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
