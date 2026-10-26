/**
 * Datas "puras" (yyyy-mm-dd) são tratadas em UTC para não "voltarem um dia"
 * quando exibidas no fuso horário do Brasil.
 */
export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return Number.isNaN(date.getTime()) ? null : date;
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "2027-01-05" → "05/01/2027". Retorna string vazia para datas inválidas. */
export function formatDate(value: string): string {
  const date = parseIsoDate(value);
  return date ? dateFormatter.format(date) : '';
}
