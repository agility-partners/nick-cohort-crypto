"use client";

import { useMemo, useState } from "react";

import CryptoDetailWatchlistToggle from "@/domains/crypto/components/crypto-detail-watchlist-toggle";
import PriceChart from "./price-chart";
import type { TimeRange, ChartType } from "@/domains/crypto/types/crypto.types";
import { TIME_RANGES, RANGE_LABELS } from "./chart-config";
import { generateMockData } from "./generate-mock-chart-data";

export type { TimeRange, ChartType };

/* ── Props ── */

interface ChartSectionProps {
  cryptoId: string;
  symbol: string;
  price: number;
  change24h: number;
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
      <div className="mb-3 flex justify-end">
        <CryptoDetailWatchlistToggle cryptoId={cryptoId} />
      </div>

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
