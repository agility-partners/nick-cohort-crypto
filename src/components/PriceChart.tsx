interface PriceChartProps {
  values: number[];
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

export default function PriceChart({ values, symbol }: PriceChartProps) {
  const width = 720;
  const height = 320;
  const padding = 28;
  const points = toChartPoints(values, width, height, padding);

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const areaPath = `M ${first.x} ${height - padding} L ${polylinePoints} L ${last.x} ${height - padding} Z`;

  const high = Math.max(...values);
  const low = Math.min(...values);

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
        viewBox={`0 0 ${width} ${height}`}
        className="h-64 w-full text-green-400"
        role="img"
        aria-label={`${symbol} 7 day mock price chart`}
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
      </svg>
    </div>
  );
}