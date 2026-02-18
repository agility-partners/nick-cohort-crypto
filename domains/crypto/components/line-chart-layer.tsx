interface ChartPoint {
  x: number;
  y: number;
}

interface LineChartLayerProps {
  points: ChartPoint[];
  polylinePoints: string;
  areaPath: string;
  padding: number;
  height: number;
  activeIndex: number | null;
  values: number[];
  labels: string[];
  tooltipX: number;
  tooltipY: number;
  ttW: number;
  ttH: number;
  formatPrice: (price: number) => string;
}

/** Renders the line chart path, area fill, last-point dot, and hover tooltip. */
export default function LineChartLayer({
  points,
  polylinePoints,
  areaPath,
  padding,
  height,
  activeIndex,
  values,
  labels,
  tooltipX,
  tooltipY,
  ttW,
  ttH,
  formatPrice,
}: LineChartLayerProps) {
  const last = points[points.length - 1];

  return (
    <>
      {/* Area + line */}
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

      {/* Tooltip */}
      {activeIndex !== null && points[activeIndex] && (
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
    </>
  );
}
