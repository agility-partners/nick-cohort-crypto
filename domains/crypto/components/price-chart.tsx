"use client";

import { useRef, useState } from "react";

import type { OHLCDataPoint } from "@/domains/crypto/types/crypto.types";
import ChartGrid from "./chart-grid";
import LineChartLayer from "./line-chart-layer";
import CandlestickLayer from "./candlestick-layer";
import {
  formatPrice,
  getChartGeometry,
  getHighLow,
  computeLineGeometry,
  computeCandleGeometry,
  computeTooltip,
} from "./chart-helpers";

export type { OHLCDataPoint };

interface PriceChartProps {
  values: number[];
  labels: string[];
  symbol: string;
  chartType?: "line" | "candlestick";
  ohlcData?: OHLCDataPoint[];
  timeRangeLabel?: string;
}

/* ── Component ── */

export default function PriceChart({
  values,
  labels,
  symbol,
  chartType = "line",
  ohlcData,
  timeRangeLabel,
}: PriceChartProps) {
  const geo = getChartGeometry();
  const { width, height, padding, innerH } = geo;
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isCandlestick = chartType === "candlestick" && ohlcData && ohlcData.length > 0;

  const { high, low, priceRange } = getHighLow(!!isCandlestick, values, ohlcData);
  const { points, polylinePoints, areaPath } = computeLineGeometry(values, geo, !!isCandlestick);
  const { candleStep, bodyWidth, scaleY } = computeCandleGeometry(
    !!isCandlestick,
    ohlcData,
    geo,
    low,
    priceRange,
  );
  const { tooltipX, tooltipY, ttW, ttH } = computeTooltip(
    !!isCandlestick,
    activeIndex,
    points,
    ohlcData,
    geo,
    candleStep,
    scaleY,
  );

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * width;

    if (isCandlestick && ohlcData) {
      const idx = Math.floor((svgX - padding) / candleStep);
      setActiveIndex(Math.max(0, Math.min(ohlcData.length - 1, idx)));
      return;
    }

    let closest = 0;
    let closestDist = Infinity;

    for (let i = 0; i < points.length; i++) {
      const dist = Math.abs(points[i].x - svgX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    }

    setActiveIndex(closest);
  };

  const handleMouseLeave = () => setActiveIndex(null);

  const subtitle = timeRangeLabel
    ? `${timeRangeLabel} · ${symbol}/USD`
    : `Mock 7D trend · ${symbol}/USD`;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
      {/* ── Header ── */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Price Chart
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>
        </div>
        <div className="text-right text-xs text-[var(--text-secondary)]">
          <p>High: {formatPrice(high)}</p>
          <p>Low: {formatPrice(low)}</p>
        </div>
      </div>

      {/* ── SVG ── */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-64 w-full cursor-crosshair text-[var(--accent)]"
        role="img"
        aria-label={`${symbol} price chart`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="line-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <ChartGrid padding={padding} width={width} innerH={innerH} />

        {!isCandlestick && (
          <LineChartLayer
            points={points}
            polylinePoints={polylinePoints}
            areaPath={areaPath}
            padding={padding}
            height={height}
            activeIndex={activeIndex}
            values={values}
            labels={labels}
            tooltipX={tooltipX}
            tooltipY={tooltipY}
            ttW={ttW}
            ttH={ttH}
            formatPrice={formatPrice}
          />
        )}

        {isCandlestick && (
          <CandlestickLayer
            ohlcData={ohlcData!}
            padding={padding}
            innerH={innerH}
            candleStep={candleStep}
            bodyWidth={bodyWidth}
            scaleY={scaleY}
            activeIndex={activeIndex}
            labels={labels}
            tooltipX={tooltipX}
            tooltipY={tooltipY}
            ttW={ttW}
            ttH={ttH}
            formatPrice={formatPrice}
          />
        )}
      </svg>
    </div>
  );
}
