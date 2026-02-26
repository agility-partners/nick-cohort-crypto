import { CHART_WIDTH, CHART_HEIGHT, CHART_PADDING } from "@/domains/crypto/constants";
import type { OHLCDataPoint } from "@/domains/crypto/types/crypto.types";

/* ── Types ── */

export interface ChartPoint {
  x: number;
  y: number;
}

export interface ChartGeometry {
  width: number;
  height: number;
  padding: number;
  innerW: number;
  innerH: number;
}

export interface LineGeometry {
  points: ChartPoint[];
  polylinePoints: string;
  areaPath: string;
}

export interface CandleGeometry {
  candleCount: number;
  candleStep: number;
  bodyWidth: number;
  scaleY: (v: number) => number;
}

export interface TooltipPosition {
  tooltipX: number;
  tooltipY: number;
  ttW: number;
  ttH: number;
}

/* ── Chart dimensions ── */

export function getChartGeometry(): ChartGeometry {
  const width = CHART_WIDTH;
  const height = CHART_HEIGHT;
  const padding = CHART_PADDING;
  return {
    width,
    height,
    padding,
    innerW: width - padding * 2,
    innerH: height - padding * 2,
  };
}

/* ── Price formatting ── */

export function formatPrice(price: number): string {
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

/* ── Coordinate mapping ── */

export function toChartPoints(
  values: number[],
  width: number,
  height: number,
  padding: number,
  overrideMin?: number,
  overrideMax?: number,
): ChartPoint[] {
  const min = overrideMin ?? Math.min(...values);
  const max = overrideMax ?? Math.max(...values);
  const range = max - min || 1;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  return values.map((value, index) => ({
    x: padding + (index / Math.max(values.length - 1, 1)) * innerW,
    y: height - padding - ((value - min) / range) * innerH,
  }));
}

/* ── High / Low ── */

export function getHighLow(
  isCandlestick: boolean,
  values: number[],
  ohlcData?: OHLCDataPoint[],
): { high: number; low: number; priceRange: number } {
  const high = isCandlestick ? Math.max(...ohlcData!.map((d) => d.high)) : Math.max(...values);
  const low = isCandlestick ? Math.min(...ohlcData!.map((d) => d.low)) : Math.min(...values);
  return { high, low, priceRange: high - low || 1 };
}

/* ── Line geometry ── */

export function computeLineGeometry(
  values: number[],
  geo: ChartGeometry,
  isCandlestick: boolean,
  overrideMin?: number,
  overrideMax?: number,
): LineGeometry {
  const points = !isCandlestick
    ? toChartPoints(values, geo.width, geo.height, geo.padding, overrideMin, overrideMax)
    : [];
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const areaPath =
    first && last
      ? `M ${first.x} ${geo.height - geo.padding} L ${polylinePoints} L ${last.x} ${geo.height - geo.padding} Z`
      : "";

  return { points, polylinePoints, areaPath };
}

/* ── Candlestick geometry ── */

export function computeCandleGeometry(
  isCandlestick: boolean,
  ohlcData: OHLCDataPoint[] | undefined,
  geo: ChartGeometry,
  low: number,
  priceRange: number,
): CandleGeometry {
  const candleCount = isCandlestick ? ohlcData!.length : 0;
  const candleStep = candleCount > 0 ? geo.innerW / candleCount : 0;
  const bodyWidth = candleStep * 0.6;
  const scaleY = (v: number) =>
    geo.height - geo.padding - ((v - low) / priceRange) * geo.innerH;

  return { candleCount, candleStep, bodyWidth, scaleY };
}

/* ── Tooltip positioning ── */

export function computeTooltip(
  isCandlestick: boolean,
  activeIndex: number | null,
  points: ChartPoint[],
  ohlcData: OHLCDataPoint[] | undefined,
  geo: ChartGeometry,
  candleStep: number,
  scaleY: (v: number) => number,
): TooltipPosition {
  const ttW = isCandlestick ? 170 : 160;
  const ttH = isCandlestick ? 100 : 48;
  const ttMargin = 10;

  let tooltipX = 0;
  let tooltipY = 0;
  let anchor: ChartPoint | null = null;

  if (activeIndex !== null) {
    if (isCandlestick && ohlcData) {
      const cx = geo.padding + (activeIndex + 0.5) * candleStep;
      anchor = { x: cx, y: scaleY(ohlcData[activeIndex].high) };
    } else if (points[activeIndex]) {
      anchor = points[activeIndex];
    }
  }
  if (anchor) {
    tooltipX =
      anchor.x + ttMargin + ttW > geo.width - geo.padding
        ? anchor.x - ttMargin - ttW
        : anchor.x + ttMargin;
    tooltipY = Math.max(geo.padding, anchor.y - ttH - 12);
  }

  return { tooltipX, tooltipY, ttW, ttH };
}
