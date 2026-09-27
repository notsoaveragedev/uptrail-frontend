import { REGIONS } from "@/lib/monitors";
import type { RegionCode } from "@/types/monitor";
import { MONITORS } from "./monitors";
import { hashString, seeded } from "./random";

export const BACKTEST_STEP_SECONDS = 60;
export const BACKTEST_POINTS = 24 * 60;

export type BacktestSample = {
  latency: number;
  status: "up" | "down" | "degraded";
  errorRate: number;
  statusCode: number;
};

export type BacktestRegion = {
  code: RegionCode;
  samples: BacktestSample[];
};

export type BacktestSeries = {
  timestamps: number[];
  sslDaysRemaining: number;
  regions: BacktestRegion[];
};

type Episode = {
  start: number;
  end: number;
  severity: number;
  regions: RegionCode[];
};

function monitorRegions(monitorId: string) {
  const monitor = MONITORS.find((item) => item.id === monitorId);
  return monitor?.regions.map((region) => region.code) ?? REGIONS.slice(0, 3).map((region) => region.code);
}

function buildEpisodes(random: () => number, regions: RegionCode[]): Episode[] {
  const count = 3 + Math.floor(random() * 3);
  return Array.from({ length: count }, () => {
    const start = Math.floor(random() * (BACKTEST_POINTS - 60));
    const affected = regions.filter(() => random() > 0.45);
    return {
      start,
      end: start + 6 + Math.floor(random() * 40),
      severity: 1.8 + random() * 2.6,
      regions: affected.length > 0 ? affected : [regions[0]],
    };
  });
}

function sample(base: number, minute: number, random: () => number, episode: Episode | undefined): BacktestSample {
  const daily = 1 + 0.15 * Math.sin((minute / BACKTEST_POINTS) * Math.PI * 2);
  const blip = random() < 0.02 ? 1.8 : 1;
  const normal = base * daily * blip * (0.8 + random() * 0.4);

  if (!episode) {
    return {
      latency: Math.round(normal),
      status: "up",
      errorRate: Number((random() * 0.6).toFixed(2)),
      statusCode: 200,
    };
  }

  const latency = Math.round(Math.min(normal * episode.severity, 4000));
  const isDown = episode.severity > 3.6;
  return {
    latency,
    status: isDown ? "down" : latency > 1000 ? "degraded" : "up",
    errorRate: Number((episode.severity * 1.4 + random() * 3 + (isDown ? 40 : 0)).toFixed(2)),
    statusCode: isDown ? 503 : random() < 0.2 ? 500 : 200,
  };
}

export function backtestSeries(monitorId: string, now = Date.now()): BacktestSeries {
  const hash = hashString(monitorId);
  const random = seeded(hash);
  const regions = monitorRegions(monitorId);
  const episodes = buildEpisodes(random, regions);
  const base = 180 + (hash % 260);
  const end = Math.floor(now / 60_000) * 60;
  const timestamps = Array.from(
    { length: BACKTEST_POINTS },
    (_, index) => end - (BACKTEST_POINTS - 1 - index) * BACKTEST_STEP_SECONDS,
  );

  return {
    timestamps,
    sslDaysRemaining: monitorId === "mon_cdn" ? 9 : 40 + (hash % 200),
    regions: regions.map((code) => ({
      code,
      samples: timestamps.map((_, minute) => {
        const episode = episodes.find(
          (item) => minute >= item.start && minute < item.end && item.regions.includes(code),
        );
        return sample(base, minute, random, episode);
      }),
    })),
  };
}
