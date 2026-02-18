"use client";

import { useMemo, useState } from "react";

import PriceChart, { type OHLCDataPoint } from "./PriceChart";

/* ── Types ── */

export type TimeRange = "1D" | "7D" | "30D" | "90D" | "1Y" | "ALL";
export type ChartType = "line" | "candlestick";

const TIME_RANGES: TimeRange[] = ["1D", "7D", "30D", "90D", "1Y", "ALL"];

const RANGE_CONFIG: Record<
  TimeRange,
  {
    points: number;
    durationMs: number;
    labelFormat: Intl.DateTimeFormatOptions;
    volatility: number;
  }
> = {
  "1D": {
    points: 24,
    durationMs: 24 * 60 * 60 * 1000,
    labelFormat: { hour: "numeric", minute: "2-digit" },
    volatility: 0.005,
  },
  "7D": {
    points: 36,
    durationMs: 7 * 24 * 60 * 60 * 1000,
    labelFormat: { month: "short", day: "numeric", hour: "numeric" },
    volatility: 0.01,
  },
  "30D": {
    points: 30,
    durationMs: 30 * 24 * 60 * 60 * 1000,
    labelFormat: { month: "short", day: "numeric" },
    volatility: 0.02,
  },
  "90D": {
    points: 45,
    durationMs: 90 * 24 * 60 * 60 * 1000,
    labelFormat: { month: "short", day: "numeric" },
    volatility: 0.03,
  },
  "1Y": {
    points: 52,
    durationMs: 365 * 24 * 60 * 60 * 1000,
    labelFormat: { month: "short", year: "2-digit" },
    volatility: 0.04,
  },
  ALL: {
    points: 60,
    durationMs: 5 * 365 * 24 * 60 * 60 * 1000,
    labelFormat: { month: "short", year: "2-digit" },
    volatility: 0.05,
  },
};

const RANGE_LABELS: Record<TimeRange, string> = {
  "1D": "1 day",
  "7D": "7 day",
  "30D": "30 day",
  "90D": "90 day",
  "1Y": "1 year",
  ALL: "All time",
};

/* ── Props ── */

interface ChartSectionProps {
  cryptoId: string;
  symbol: string;
  price: number;
  change24h: number;
}

/* ── Seeded PRNG helpers ── */

function getSeedFromId(id: string, extra = 0) {
  return (id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) || 1) + extra;
}

function nextRandom(seed: number): [number, number] {
  const next = (seed * 1664525 + 1013904223) % 4294967296;
  return [next, next / 4294967296];
}

/* ── Mock data generation ── */

function generateMockData(
  cryptoId: string,
  price: number,
  change24h: number,
  timeRange: TimeRange,
): { values: number[]; labels: string[]; ohlcData: OHLCDataPoint[] } {
  const config = RANGE_CONFIG[timeRange];
  const { points, durationMs, labelFormat, volatility } = config;

  // Include time range in seed so each range produces a unique chart
  const rangeOffset = TIME_RANGES.indexOf(timeRange) * 1000;
  let seed = getSeedFromId(cryptoId, rangeOffset);

  // ── Close prices ──
  const values: number[] = [];
  let current = Math.max(price * (1 - change24h / 100), 0.0001);
  const trendStep = change24h / 100 / points;

  for (let i = 0; i < points; i++) {
    let random: number;
    [seed, random] = nextRandom(seed);
    const noise = (random - 0.5) * volatility;
    current = Math.max(current * (1 + trendStep + noise), 0.0001);
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
      open: Math.max(open, 0.0001),
      high: Math.max(high, Math.max(open, close)),
      low: Math.max(low, 0.0001),
      close: Math.max(close, 0.0001),
    };
  });

  return { values, labels, ohlcData };
}

/* ── Component ── */

export default function ChartSection({ cryptoId, symbol, price, change24h }: ChartSectionProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7D");
  const [chartType, setChartType] = useState<ChartType>("line");

  const { values, labels, ohlcData } = useMemo(
    () => generateMockData(cryptoId, price, change24h, timeRange),
    [cryptoId, price, change24h, timeRange],
  );

  return (
    <div>
      {/* ── Controls row ── */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {/* Time-range selector */}
        <div className="flex gap-1 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                timeRange === range
                  ? "bg-[var(--accent)]/20 text-[var(--accent)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--badge-bg)]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Chart-type toggle */}
        <div className="flex gap-1 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-1">
          <button
            onClick={() => setChartType("line")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              chartType === "line"
                ? "bg-[var(--accent)]/20 text-[var(--accent)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--badge-bg)]"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <polyline
                points="1,10 4,6 7,8 10,3 13,5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            Line
          </button>

          <button
            onClick={() => setChartType("candlestick")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              chartType === "candlestick"
                ? "bg-[var(--accent)]/20 text-[var(--accent)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--badge-bg)]"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <line x1="4" y1="1" x2="4" y2="13" stroke="currentColor" strokeWidth="1.2" />
              <rect x="2" y="4" width="4" height="5" rx="0.5" fill="currentColor" opacity="0.7" />
              <line x1="10" y1="2" x2="10" y2="12" stroke="currentColor" strokeWidth="1.2" />
              <rect x="8" y="5" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.7" />
            </svg>
            Candle
          </button>
        </div>
      </div>

      {/* ── Chart ── */}
      <PriceChart
        values={values}
        labels={labels}
        symbol={symbol}
        chartType={chartType}
        ohlcData={ohlcData}
        timeRangeLabel={`Mock ${RANGE_LABELS[timeRange]} trend`}
      />
    </div>
  );
}
