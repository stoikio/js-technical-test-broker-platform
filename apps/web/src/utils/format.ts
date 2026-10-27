import type { Money } from '@/api/types';

const LOCALE = 'en-GB';

export const formatMoney = ({ amount, currency }: Money) =>
  new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(amount / 100);

/** `YYYY-MM-DD` or an ISO timestamp, shown as `12 Mar 2026`. */
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value.length === 10 ? `${value}T00:00:00Z` : value));

export const todayIso = () => new Date().toISOString().slice(0, 10);
