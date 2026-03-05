"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import CryptoDetailWatchlistToggle from "@/domains/crypto/components/crypto-detail-watchlist-toggle";
import PriceChart from "./price-chart";
import type { ChartType, TimeRange, OHLCDataPoint } from "@/domains/crypto/types/crypto.types";
import { MIN_PRICE } from "@/domains/crypto/constants";
import { generateMockData } from "./generate-mock-chart-data";
import type { MockChartData } from "./generate-mock-chart-data";
import { RANGE_CONFIG, RANGE_LABELS } from "./chart-config";
import { fetchPriceHistory } from "@/domains/crypto/services/crypto-api";
import type { PriceHistoryPoint } from "@/domains/crypto/services/crypto-api";

export type { ChartType };

/* ── Ranges we have real data for ── */

const AVAILABLE_RANGES: TimeRange[] = ["1D", "7D", "30D"];

/* ── Props ── */

interface ChartSectionProps {
  cryptoId: string;
  symbol: string;
  price: number;
  change24h: number;
  allTimeHigh?: number;
  allTimeLow?: number;
}

/* ── Helpers ── */

function transformApiData(
  points: PriceHistoryPoint[],
  range: TimeRange,
): MockChartData {
  const { labelFormat } = RANGE_CONFIG[range];
  const formatter = new Intl.DateTimeFormat("en-US", labelFormat);

  const values = points.map((p) => p.price);
  const labels = points.map((p) => formatter.format(new Date(p.timestamp)));

  const ohlcData: OHLCDataPoint[] = values.map((close, i) => {
    const open = i > 0 ? values[i - 1] : close;
    const spread = Math.abs(close - open) * 0.5 + close * 0.005;
    const high = Math.max(open, close) + spread;
    const low = Math.max(Math.min(open, close) - spread, MIN_PRICE);

    return {
      open: Math.max(open, MIN_PRICE),
      high: Math.max(high, Math.max(open, close)),
      low,
      close: Math.max(close, MIN_PRICE),
    };
  });

  return { values, labels, ohlcData };
}

/* ── Component ── */

export default function ChartSection({ cryptoId, symbol, price, change24h }: ChartSectionProps) {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [timeRange, setTimeRange] = useState<TimeRange>("30D");
  const [apiData, setApiData] = useState<PriceHistoryPoint[] | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPriceHistory = useCallback(async (range: TimeRange) => {
    setLoading(true);
    try {
      const data = await fetchPriceHistory(cryptoId, range);
      setApiData(data.length > 0 ? data : null);
    } catch {
      setApiData(null);
    } finally {
      setLoading(false);
    }
  }, [cryptoId]);

  useEffect(() => {
    loadPriceHistory(timeRange);
  }, [timeRange, loadPriceHistory]);

  const chartData: MockChartData = useMemo(() => {
    if (apiData && apiData.length > 0) {
      const data = transformApiData(apiData, timeRange);

      // Replace the last value with the current price so the chart
      // line terminates at exactly the price shown in the detail header.
      if (data.values.length > 0) {
        data.values[data.values.length - 1] = price;

        // Recompute the last OHLC candle to match
        if (data.ohlcData.length > 0) {
          const last = data.ohlcData[data.ohlcData.length - 1];
          last.close = price;
          last.high = Math.max(last.high, price);
          last.low = Math.min(last.low, price);
        }
      }

      return data;
    }

    return generateMockData(cryptoId, price, change24h, timeRange);
  }, [apiData, timeRange, cryptoId, price, change24h]);

  const { values, labels, ohlcData } = chartData;

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <CryptoDetailWatchlistToggle cryptoId={cryptoId} />
      </div>

      {/* ── Controls row ── */}
      <div className="mb-3 flex items-center justify-between">
        {/* Time range selector */}
        <div className="flex gap-1 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-1">
          {AVAILABLE_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
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
      <div className={loading ? "opacity-50 transition-opacity" : "transition-opacity"}>
        <PriceChart
          values={values}
          labels={labels}
          symbol={symbol}
          chartType={chartType}
          ohlcData={ohlcData}
          timeRangeLabel={RANGE_LABELS[timeRange]}
        />
      </div>
    </div>
  );
}
