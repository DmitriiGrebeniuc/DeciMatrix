function getStartOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function formatDatePart(value: number): string {
  return value.toString().padStart(2, '0');
}

export function getNowIso(): string {
  return new Date().toISOString();
}

export function formatDecisionDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const today = getStartOfDay(new Date());
  const targetDate = getStartOfDay(date);
  const dayDifference =
    (today.getTime() - targetDate.getTime()) / (24 * 60 * 60 * 1000);

  if (dayDifference === 0) {
    return 'сегодня';
  }

  if (dayDifference === 1) {
    return 'вчера';
  }

  const day = formatDatePart(date.getDate());
  const month = formatDatePart(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}
