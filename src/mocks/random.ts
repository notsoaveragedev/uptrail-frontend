import type { TimeRange } from "@/types/overview";

const MODULUS = 2147483647;

export const RANGE_BUCKETS: Record<TimeRange, { count: number; stepMinutes: number }> = {
  "1h": { count: 60, stepMinutes: 1 },
  "24h": { count: 288, stepMinutes: 5 },
  "7d": { count: 168, stepMinutes: 60 },
  "30d": { count: 180, stepMinutes: 240 },
};

export function seeded(seed: number) {
  let value = seed % MODULUS || 1;
  return () => {
    value = (value * 16807) % MODULUS;
    return (value - 1) / (MODULUS - 1);
  };
}

export function hashString(text: string) {
  return [...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % MODULUS, 7) || 1;
}
