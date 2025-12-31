export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getDate()} ${d.getFullYear()}`;
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getDate()}`;
}

export function formatDateISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}