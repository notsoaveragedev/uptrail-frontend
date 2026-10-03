import { formatDay, formatElapsed } from "./format";

export const MINUTE_MS = 60_000;

export const HOUR_MS = 60 * MINUTE_MS;

export const DAY_MS = 24 * HOUR_MS;

export function addDays(timestamp: number, days: number) {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

export function startOfDay(timestamp: number) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function dayLabel(timestamp: number, now: number) {
  const days = Math.round((startOfDay(now) - startOfDay(timestamp)) / DAY_MS);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return formatDay(timestamp);
}

type DayGroup<Item> = { key: string; label: string; items: Item[] };

export function groupByDay<Item>(items: Item[], readAt: (item: Item) => number, now: number): DayGroup<Item>[] {
  const days: DayGroup<Item>[] = [];
  for (const item of [...items].sort((a, b) => readAt(b) - readAt(a))) {
    const key = String(startOfDay(readAt(item)));
    const last = days.at(-1);
    if (last?.key === key) last.items.push(item);
    else days.push({ key, label: dayLabel(readAt(item), now), items: [item] });
  }
  return days;
}

export function formatRemaining(ms: number) {
  return ms >= 2 * DAY_MS ? `${Math.floor(ms / DAY_MS)}d` : formatElapsed(ms);
}

export function isExpiringSoon(expiresAt: number, now: number, withinMs = DAY_MS) {
  return expiresAt > now && expiresAt - now < withinMs;
}
