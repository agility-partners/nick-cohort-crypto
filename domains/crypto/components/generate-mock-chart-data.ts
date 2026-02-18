import type { TimeRange, OHLCDataPoint } from "@/domains/crypto/types/crypto.types";
import {
  LCG_MULTIPLIER,
  LCG_INCREMENT,
  LCG_MODULUS,
  MIN_PRICE,
  RANGE_SEED_OFFSET,
  PERCENTAGE_DIVISOR,
} from "@/domains/crypto/constants";
import { TIME_RANGES, RANGE_CONFIG } from "./chart-config";

/* ── Seeded PRNG helpers ── */

function getSeedFromId(id: string, extra = 0) {
  return (id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) || 1) + extra;
}

function nextRandom(seed: number): [number, number] {
  const next = (seed * LCG_MULTIPLIER + LCG_INCREMENT) % LCG_MODULUS;
  return [next, next / LCG_MODULUS];
}

/* ── Mock data generation ── */

export interface MockChartData {
  values: number[];
  labels: string[];
  ohlcData: OHLCDataPoint[];
}

export function generateMockData(
  cryptoId: string,
  price: number,
  change24h: number,
  timeRange: TimeRange,
): MockChartData {
  const config = RANGE_CONFIG[timeRange];
  const { points, durationMs, labelFormat, volatility } = config;

  const rangeOffset = TIME_RANGES.indexOf(timeRange) * RANGE_SEED_OFFSET;
  let seed = getSeedFromId(cryptoId, rangeOffset);

  // ── Close prices ──
  const values: number[] = [];
  let current = Math.max(price * (1 - change24h / PERCENTAGE_DIVISOR), MIN_PRICE);
  const trendStep = change24h / PERCENTAGE_DIVISOR / points;

  for (let i = 0; i < points; i++) {
    let random: number;
    [seed, random] = nextRandom(seed);
    const noise = (random - 0.5) * volatility;
    current = Math.max(current * (1 + trendStep + noise), MIN_PRICE);
    values.push(current);
  }
  values[values.length - 1] = price;

  // ── Date labels ──
  const labels: string[] = [];
  const now = new Date();
  const stepMs = durationMs / Math.max(points - 1, 1);
  const formatter = new Intl.DateTimeFormat("en-US", labelFormat);

  for (let i = 0; i < points; i++) {
    const timestamp = new Date(now.getTime() - (points - 1 - i) * stepMs);
    labels.push(formatter.format(timestamp));
  }

  // ── OHLC data derived from close prices ──
  const ohlcData: OHLCDataPoint[] = values.map((close, i) => {
    const open = i > 0 ? values[i - 1] : close * (1 - trendStep);

    let r1: number;
    let r2: number;
    [seed, r1] = nextRandom(seed);
    [seed, r2] = nextRandom(seed);

    const spread = Math.abs(close - open) + close * volatility * 0.5;
    const high = Math.max(open, close) + spread * r1 * 0.5;
    const low = Math.min(open, close) - spread * r2 * 0.5;

    return {
      open: Math.max(open, MIN_PRICE),
      high: Math.max(high, Math.max(open, close)),
      low: Math.max(low, MIN_PRICE),
      close: Math.max(close, MIN_PRICE),
    };
  });

  return { values, labels, ohlcData };
}
