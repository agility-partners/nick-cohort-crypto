"use client";

import { useRef, useState } from "react";

import type { Crypto } from "@/domains/crypto/types/crypto.types";
import type { TimeRange } from "@/domains/crypto/types/crypto.types";
import { TIME_RANGES } from "@/domains/crypto/components/chart-config";

interface CompareSeries {
  crypto: Crypto;
  values: number[];
  labels: string[];
}

interface CompareChartProps {
  series: CompareSeries[];
  timeRange: TimeRange;
  timeRangeLabel: string;
  onTimeRangeChange: (timeRange: TimeRange) => void;
}

const SERIES_COLORS = ["#22c55e", "#3b82f6", "#a855f7"];

function normalizeSeries(values: number[]): number[] {
  const baseValue = values[0] ?? 1;

  return values.map((value) => (value / baseValue) * 100);
}

function createPath(points: number[][]): string {
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
}

function formatIndexValue(value: number): string {
  return `${value.toFixed(2)}`;
}

export default function CompareChart({
  series,
  timeRange,
  timeRangeLabel,
  onTimeRangeChange,
}: CompareChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (series.length < 2) {
    return (
      <section className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card-bg)] p-8 text-center">
        <p className="text-sm font-medium text-[var(--text-primary)]">Choose at least 2 coins to compare</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Selected coins will be normalized to 100 at start</p>
      </section>
    );
  }

  const normalizedSeries = series.map((entry) => ({
    crypto: entry.crypto,
    values: normalizeSeries(entry.values),
  }));

  const width = 720;
  const height = 280;
  const padding = 24;
  const maxPoints = Math.max(...normalizedSeries.map((entry) => entry.values.length));
  const allValues = normalizedSeries.flatMap((entry) => entry.values);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = Math.max(maxValue - minValue, 1);
  const pointCount = Math.max(maxPoints - 1, 1);
  const activeX =
    activeIndex === null ? null : padding + ((width - padding * 2) * activeIndex) / pointCount;
  const activeLabel = activeIndex === null ? null : (series[0]?.labels[activeIndex] ?? null);

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) {
      return;
    }

    const ctm = svg.getScreenCTM();
    if (!ctm) {
      return;
    }

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const localPoint = point.matrixTransform(ctm.inverse());

    const clampedX = Math.min(width - padding, Math.max(padding, localPoint.x));
    const ratio = (clampedX - padding) / (width - padding * 2);
    const nextIndex = Math.round(ratio * pointCount);
    setActiveIndex(Math.max(0, Math.min(maxPoints - 1, nextIndex)));
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Compare Performance
          </h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Mock {timeRangeLabel} trend · base index 100</p>
        </div>

        <div className="flex gap-1 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => onTimeRangeChange(range)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                timeRange === range
                  ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--badge-bg)] hover:text-[var(--text-primary)]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="min-w-0 flex-1">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="h-64 w-full cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="var(--grid-line)"
              strokeWidth="1"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="var(--grid-line)"
              strokeWidth="1"
            />

            {normalizedSeries.map((entry, seriesIndex) => {
              const points = entry.values.map((value, valueIndex) => {
                const x =
                  padding + ((width - padding * 2) * valueIndex) / Math.max(maxPoints - 1, 1);
                const y =
                  height -
                  padding -
                  ((value - minValue) / range) * (height - padding * 2);

                return [x, y];
              });

              return (
                <path
                  key={entry.crypto.id}
                  d={createPath(points)}
                  fill="none"
                  stroke={SERIES_COLORS[seriesIndex]}
                  strokeWidth={2}
                />
              );
            })}

            {activeX !== null && (
              <line
                x1={activeX}
                y1={padding}
                x2={activeX}
                y2={height - padding}
                stroke="var(--crosshair)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            )}

            {activeIndex !== null &&
              normalizedSeries.map((entry, seriesIndex) => {
                const activeValue = entry.values[activeIndex] ?? entry.values[entry.values.length - 1];
                const y =
                  height -
                  padding -
                  ((activeValue - minValue) / range) * (height - padding * 2);

                return (
                  <circle
                    key={`${entry.crypto.id}-point`}
                    cx={activeX ?? 0}
                    cy={y}
                    r={3}
                    fill={SERIES_COLORS[seriesIndex]}
                    stroke="var(--card-bg)"
                    strokeWidth="1.5"
                  />
                );
              })}
          </svg>
        </div>

        <aside className="h-64 w-full rounded-lg border border-[var(--card-border)] bg-[var(--badge-bg)] p-3 lg:w-52">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            {activeLabel ?? "Hover chart"}
          </p>

          {activeIndex === null ? (
            <div className="flex h-[calc(100%-1.5rem)] items-center justify-center text-center">
              <p className="text-xs text-[var(--text-muted)]">
                Drag across the chart to see values
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {normalizedSeries.map((entry, index) => {
                const value = entry.values[activeIndex] ?? entry.values[entry.values.length - 1];

                return (
                  <div
                    key={`${entry.crypto.id}-hover`}
                    className="rounded-md border border-[var(--card-border)] px-2 py-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: SERIES_COLORS[index] }}
                        />
                        <span className="text-xs font-medium text-[var(--text-secondary)]">
                          {entry.crypto.symbol}
                        </span>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: SERIES_COLORS[index] }}>
                        {formatIndexValue(value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {normalizedSeries.map((entry, index) => {
          const start = entry.values[0] ?? 100;
          const end = entry.values[entry.values.length - 1] ?? 100;
          const pctChange = ((end - start) / start) * 100;

          return (
            <div key={entry.crypto.id} className="rounded-lg border border-[var(--card-border)] px-3 py-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SERIES_COLORS[index] }}
                />
                <p
                  className="text-sm font-medium"
                  style={{ color: SERIES_COLORS[index] }}
                >
                  {entry.crypto.symbol}
                </p>
              </div>
              <p className={`mt-1 text-xs font-semibold ${pctChange >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                {pctChange >= 0 ? "+" : ""}
                {pctChange.toFixed(2)}%
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
