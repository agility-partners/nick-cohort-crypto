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

/* ── All-time data anchored to real ATH / ATL ── */

export function generateAllTimeData(
  cryptoId: string,
  price: number,
  allTimeHigh: number,
  allTimeLow: number,
): MockChartData {
  const POINTS = 60;
  const PEAK_IDX = 40; // ATH locked at ~67% through — classic crypto bull-run shape

  let seed = getSeedFromId(cryptoId, 7777);
  const values: number[] = [];

  for (let i = 0; i < POINTS; i++) {
    // Hard-lock the three anchor points
    if (i === 0) { values.push(allTimeLow); continue; }
    if (i === PEAK_IDX) { values.push(allTimeHigh); continue; }
    if (i === POINTS - 1) { values.push(price); continue; }

    let r: number;
    [seed, r] = nextRandom(seed);

    let base: number;
    if (i < PEAK_IDX) {
      // Rising phase: quadratic ease (slow accumulation → parabolic run to ATH)
      const t = i / PEAK_IDX;
      base = allTimeLow + (allTimeHigh - allTimeLow) * (t * t);
    } else {
      // Falling phase: smoothstep from ATH back to current price
      const t = (i - PEAK_IDX) / (POINTS - 1 - PEAK_IDX);
      const eased = t * t * (3 - 2 * t);
      base = allTimeHigh + (price - allTimeHigh) * eased;
    }

    // Proportional noise: ±4% of current base — clamped to [MIN_PRICE, allTimeHigh]
    const noise = (r - 0.5) * 0.08 * base;
    values.push(Math.min(Math.max(base + noise, MIN_PRICE), allTimeHigh));
  }

  // ── Date labels (reuse ALL config) ──
  const { durationMs, labelFormat } = RANGE_CONFIG["ALL"];
  const labels: string[] = [];
  const now = new Date();
  const stepMs = durationMs / Math.max(POINTS - 1, 1);
  const formatter = new Intl.DateTimeFormat("en-US", labelFormat);

  for (let i = 0; i < POINTS; i++) {
    const timestamp = new Date(now.getTime() - (POINTS - 1 - i) * stepMs);
    labels.push(formatter.format(timestamp));
  }

  // ── OHLC derived from close prices ──
  const OHLC_VOLATILITY = 0.035;
  const ohlcData: OHLCDataPoint[] = values.map((close, i) => {
    const open = i > 0 ? values[i - 1] : close * 0.99;

    let r1: number;
    let r2: number;
    [seed, r1] = nextRandom(seed);
    [seed, r2] = nextRandom(seed);

    const spread = Math.abs(close - open) + close * OHLC_VOLATILITY * 0.5;
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
