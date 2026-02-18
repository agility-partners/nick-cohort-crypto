import type { OHLCDataPoint } from "@/domains/crypto/types/crypto.types";

interface CandlestickLayerProps {
  ohlcData: OHLCDataPoint[];
  padding: number;
  innerH: number;
  candleStep: number;
  bodyWidth: number;
  scaleY: (v: number) => number;
  activeIndex: number | null;
  labels: string[];
  tooltipX: number;
  tooltipY: number;
  ttW: number;
  ttH: number;
  formatPrice: (price: number) => string;
}

/** Renders candlestick bodies, wicks, and hover tooltip with OHLC values. */
export default function CandlestickLayer({
  ohlcData,
  padding,
  innerH,
  candleStep,
  bodyWidth,
  scaleY,
  activeIndex,
  labels,
  tooltipX,
  tooltipY,
  ttW,
  ttH,
  formatPrice,
}: CandlestickLayerProps) {
  return (
    <>
      {/* Candles */}
      {ohlcData.map((candle, i) => {
        const cx = padding + (i + 0.5) * candleStep;
        const openY = scaleY(candle.open);
        const closeY = scaleY(candle.close);
        const highY = scaleY(candle.high);
        const lowY = scaleY(candle.low);
        const isUp = candle.close >= candle.open;
        const color = isUp ? "var(--candle-up)" : "var(--candle-down)";

        return (
          <g key={i}>
            <line x1={cx} y1={highY} x2={cx} y2={lowY} stroke={color} strokeWidth={1.5} />
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

      {/* Tooltip */}
      {activeIndex !== null && ohlcData[activeIndex] && (
        <g pointerEvents="none">
          {/* Crosshair */}
          <line
            x1={padding + (activeIndex + 0.5) * candleStep}
            y1={padding}
            x2={padding + (activeIndex + 0.5) * candleStep}
            y2={padding + innerH}
            stroke="var(--crosshair)"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          {/* Highlight band */}
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
            O {formatPrice(ohlcData[activeIndex].open)}
          </text>
          <text x={tooltipX + 12} y={tooltipY + 34} fill="var(--tooltip-text)" fontSize="11" fontWeight="600">
            H {formatPrice(ohlcData[activeIndex].high)}
          </text>
          <text x={tooltipX + 12} y={tooltipY + 50} fill="var(--tooltip-text)" fontSize="11" fontWeight="600">
            L {formatPrice(ohlcData[activeIndex].low)}
          </text>
          <text x={tooltipX + 12} y={tooltipY + 66} fill="var(--candle-down)" fontSize="11" fontWeight="600">
            C {formatPrice(ohlcData[activeIndex].close)}
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
    </>
  );
}
