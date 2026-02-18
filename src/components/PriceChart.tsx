"use client";

import { useCallback, useRef, useState } from "react";

/* ── Public types ── */

export interface OHLCDataPoint {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface PriceChartProps {
  values: number[];
  labels: string[];
  symbol: string;
  /** "line" (default) or "candlestick" */
  chartType?: "line" | "candlestick";
  /** OHLC data — required when chartType is "candlestick" */
  ohlcData?: OHLCDataPoint[];
  /** Subtitle override, e.g. "Mock 30 day trend" */
  timeRangeLabel?: string;
}

/* ── Helpers ── */

function toChartPoints(values: number[], width: number, height: number, padding: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  return values.map((value, index) => ({
    x: padding + (index / Math.max(values.length - 1, 1)) * innerW,
    y: height - padding - ((value - min) / range) * innerH,
  }));
}

function formatPrice(price: number) {
  if (price >= 1) {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
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
  const width = 720;
  const height = 320;
  const padding = 28;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isCandlestick = chartType === "candlestick" && ohlcData && ohlcData.length > 0;

  /* ── High / Low ── */
  const high = isCandlestick ? Math.max(...ohlcData!.map((d) => d.high)) : Math.max(...values);
  const low = isCandlestick ? Math.min(...ohlcData!.map((d) => d.low)) : Math.min(...values);
  const priceRange = high - low || 1;

  /* ── Line-chart geometry (only when needed) ── */
  const points = !isCandlestick ? toChartPoints(values, width, height, padding) : [];
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const areaPath =
    first && last
      ? `M ${first.x} ${height - padding} L ${polylinePoints} L ${last.x} ${height - padding} Z`
      : "";

  /* ── Candlestick geometry ── */
  const candleCount = isCandlestick ? ohlcData!.length : 0;
  const candleStep = candleCount > 0 ? innerW / candleCount : 0;
  const bodyWidth = candleStep * 0.6;
  const scaleY = (v: number) => height - padding - ((v - low) / priceRange) * innerH;

  /* ── Mouse interaction ── */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * width;

      if (isCandlestick && ohlcData) {
        const idx = Math.floor((svgX - padding) / candleStep);
        setActiveIndex(Math.max(0, Math.min(ohlcData.length - 1, idx)));
      } else {
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
      }
    },
    [points, width, isCandlestick, ohlcData, candleStep],
  );

  const handleMouseLeave = useCallback(() => setActiveIndex(null), []);

  /* ── Tooltip positioning ── */
  const ttW = isCandlestick ? 170 : 160;
  const ttH = isCandlestick ? 100 : 48;
  const ttMargin = 10;

  let tooltipX = 0;
  let tooltipY = 0;
  let anchor: { x: number; y: number } | null = null;

  if (activeIndex !== null) {
    if (isCandlestick && ohlcData) {
      const cx = padding + (activeIndex + 0.5) * candleStep;
      anchor = { x: cx, y: scaleY(ohlcData[activeIndex].high) };
    } else if (points[activeIndex]) {
      anchor = points[activeIndex];
    }
  }
  if (anchor) {
    tooltipX =
      anchor.x + ttMargin + ttW > width - padding
        ? anchor.x - ttMargin - ttW
        : anchor.x + ttMargin;
    tooltipY = Math.max(padding, anchor.y - ttH - 12);
  }

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

        {/* Grid lines */}
        {[0, 1, 2, 3].map((tick) => {
          const y = padding + (tick / 3) * innerH;
          return (
            <line
              key={tick}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="var(--grid-line)"
              strokeWidth="1"
            />
          );
        })}

        {/* ── Line chart ── */}
        {!isCandlestick && (
          <>
            <path d={areaPath} fill="url(#line-fill)" />
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {last && <circle cx={last.x} cy={last.y} r="5" fill="currentColor" />}
          </>
        )}

        {/* ── Candlestick chart ── */}
        {isCandlestick &&
          ohlcData!.map((candle, i) => {
            const cx = padding + (i + 0.5) * candleStep;
            const openY = scaleY(candle.open);
            const closeY = scaleY(candle.close);
            const highY = scaleY(candle.high);
            const lowY = scaleY(candle.low);
            const isUp = candle.close >= candle.open;
            const color = isUp ? "var(--candle-up)" : "var(--candle-down)";

            return (
              <g key={i}>
                {/* Wick */}
                <line x1={cx} y1={highY} x2={cx} y2={lowY} stroke={color} strokeWidth={1.5} />
                {/* Body */}
                <rect
                  x={cx - bodyWidth / 2}
                  y={Math.min(openY, closeY)}
                  width={bodyWidth}
                  height={Math.max(Math.abs(closeY - openY), 1)}
                  fill={color}
                  rx={1}
                />
              </g>
            );
          })}

        {/* ── Line tooltip ── */}
        {!isCandlestick && activeIndex !== null && points[activeIndex] && (
          <g pointerEvents="none">
            <line
              x1={points[activeIndex].x}
              y1={padding}
              x2={points[activeIndex].x}
              y2={height - padding}
              stroke="var(--crosshair)"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            <circle
              cx={points[activeIndex].x}
              cy={points[activeIndex].y}
              r="6"
              fill="currentColor"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth="2"
            />
            <rect
              x={tooltipX}
              y={tooltipY}
              width={ttW}
              height={ttH}
              rx={8}
              fill="var(--tooltip-bg)"
              stroke="var(--tooltip-border)"
              strokeWidth="1"
            />
            <text
              x={tooltipX + ttW / 2}
              y={tooltipY + 20}
              textAnchor="middle"
              fill="var(--tooltip-text)"
              fontSize="14"
              fontWeight="600"
            >
              {formatPrice(values[activeIndex])}
            </text>
            <text
              x={tooltipX + ttW / 2}
              y={tooltipY + 38}
              textAnchor="middle"
              fill="var(--tooltip-text-muted)"
              fontSize="11"
            >
              {labels[activeIndex]}
            </text>
          </g>
        )}

        {/* ── Candlestick tooltip ── */}
        {isCandlestick && activeIndex !== null && ohlcData![activeIndex] && (
          <g pointerEvents="none">
            {/* Crosshair */}
            <line
              x1={padding + (activeIndex + 0.5) * candleStep}
              y1={padding}
              x2={padding + (activeIndex + 0.5) * candleStep}
              y2={height - padding}
              stroke="var(--crosshair)"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            {/* Candle highlight band */}
            <rect
              x={padding + activeIndex * candleStep}
              y={padding}
              width={candleStep}
              height={innerH}
              fill="var(--crosshair)"
              opacity="0.12"
            />
            {/* Tooltip bg */}
            <rect
              x={tooltipX}
              y={tooltipY}
              width={ttW}
              height={ttH}
              rx={8}
              fill="var(--tooltip-bg)"
              stroke="var(--tooltip-border)"
              strokeWidth="1"
            />
            {/* OHLC values */}
            <text x={tooltipX + 12} y={tooltipY + 18} fill="var(--candle-up)" fontSize="11" fontWeight="600">
              O {formatPrice(ohlcData![activeIndex].open)}
            </text>
            <text x={tooltipX + 12} y={tooltipY + 34} fill="var(--tooltip-text)" fontSize="11" fontWeight="600">
              H {formatPrice(ohlcData![activeIndex].high)}
            </text>
            <text x={tooltipX + 12} y={tooltipY + 50} fill="var(--tooltip-text)" fontSize="11" fontWeight="600">
              L {formatPrice(ohlcData![activeIndex].low)}
            </text>
            <text x={tooltipX + 12} y={tooltipY + 66} fill="var(--candle-down)" fontSize="11" fontWeight="600">
              C {formatPrice(ohlcData![activeIndex].close)}
            </text>
            {/* Date */}
            <text
              x={tooltipX + ttW / 2}
              y={tooltipY + 88}
              textAnchor="middle"
              fill="var(--tooltip-text-muted)"
              fontSize="10"
            >
              {labels[activeIndex]}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}