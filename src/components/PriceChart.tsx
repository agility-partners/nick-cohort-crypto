"use client";

import { useCallback, useRef, useState } from "react";

interface PriceChartProps {
  values: number[];
  labels: string[];
  symbol: string;
}

function toChartPoints(values: number[], width: number, height: number, padding: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  return values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * innerWidth;
    const y = height - padding - ((value - min) / range) * innerHeight;
    return { x, y };
  });
}

function formatPrice(price: number) {
  if (price >= 1) {
    return price.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

export default function PriceChart({ values, labels, symbol }: PriceChartProps) {
  const width = 720;
  const height = 320;
  const padding = 28;
  const points = toChartPoints(values, width, height, padding);
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const areaPath = `M ${first.x} ${height - padding} L ${polylinePoints} L ${last.x} ${height - padding} Z`;

  const high = Math.max(...values);
  const low = Math.min(...values);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * width;

      // Find the nearest data point by x
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
    },
    [points, width]
  );

  const handleMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  // Tooltip positioning helpers
  const activePoint = activeIndex !== null ? points[activeIndex] : null;
  const tooltipWidth = 160;
  const tooltipHeight = 48;
  const tooltipMargin = 10;

  let tooltipX = 0;
  let tooltipY = 0;
  if (activePoint) {
    // Horizontal: prefer right of the line, flip to left if near right edge
    tooltipX =
      activePoint.x + tooltipMargin + tooltipWidth > width - padding
        ? activePoint.x - tooltipMargin - tooltipWidth
        : activePoint.x + tooltipMargin;
    // Vertical: above the dot, but clamp within chart
    tooltipY = Math.max(padding, activePoint.y - tooltipHeight - 12);
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Price Chart</h2>
          <p className="mt-1 text-xs text-gray-500">Mock 7D trend · {symbol}/USD</p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>High: ${high.toFixed(2)}</p>
          <p>Low: ${low.toFixed(2)}</p>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-64 w-full cursor-crosshair text-green-400"
        role="img"
        aria-label={`${symbol} 7 day mock price chart`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="line-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((tick) => {
          const y = padding + (tick / 3) * (height - padding * 2);
          return (
            <line
              key={tick}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}

        <path d={areaPath} fill="url(#line-fill)" />

        <polyline
          points={polylinePoints}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <circle cx={last.x} cy={last.y} r="5" fill="currentColor" />

        {/* Crosshair + tooltip */}
        {activePoint && activeIndex !== null && (
          <g>
            {/* Vertical crosshair line */}
            <line
              x1={activePoint.x}
              y1={padding}
              x2={activePoint.x}
              y2={height - padding}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              strokeDasharray="4 3"
              pointerEvents="none"
            />

            {/* Dot on the price line */}
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="6"
              fill="currentColor"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth="2"
              pointerEvents="none"
            />

            {/* Tooltip background */}
            <rect
              x={tooltipX}
              y={tooltipY}
              width={tooltipWidth}
              height={tooltipHeight}
              rx={8}
              fill="rgba(17,17,17,0.92)"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
              pointerEvents="none"
            />

            {/* Tooltip price text */}
            <text
              x={tooltipX + tooltipWidth / 2}
              y={tooltipY + 20}
              textAnchor="middle"
              fill="#e5e7eb"
              fontSize="14"
              fontWeight="600"
              pointerEvents="none"
            >
              {formatPrice(values[activeIndex])}
            </text>

            {/* Tooltip date text */}
            <text
              x={tooltipX + tooltipWidth / 2}
              y={tooltipY + 38}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="11"
              pointerEvents="none"
            >
              {labels[activeIndex]}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}