# Chart System

The chart system is split into four layers for separation of concerns. No external charting library is used — everything is custom SVG.

---

## Architecture Overview

```
ChartSection (state owner)
  → PriceChart (SVG orchestrator)
      → ChartGrid (axis lines + labels)
      → LineChartLayer (polyline + gradient fill)    ← shown in line mode
      → CandlestickLayer (OHLC wicks + bodies)      ← shown in candle mode
```

---

## ChartSection — State & Data

`domains/crypto/components/chart-section.tsx` owns two pieces of state:
- `timeRange` (default `"7D"`) — which time window to display
- `chartType` (default `"line"`) — line or candlestick mode

When state or coin props change, `useMemo` calls `generateMockData()` from `generate-mock-chart-data.ts`:

1. A **seeded PRNG** (Linear Congruential Generator) derives a seed from the coin ID + time range, producing a unique but deterministic series per combination.
2. Generates **close-price values** with range-specific point counts (24 for 1D → 60 for ALL) and volatility settings from `chart-config.ts`.
3. Derives **OHLC candlestick data** from the close prices (open = previous close, high/low spread by volatility).
4. Formats **date labels** with range-appropriate `Intl.DateTimeFormat` options.

The pill-bar buttons update `timeRange` → re-memo → new chart data.
The Line/Candle toggle updates `chartType` → `PriceChart` switches rendering mode.

---

## PriceChart — SVG Orchestration

`domains/crypto/components/price-chart.tsx` receives data and delegates:
- Calls `chart-helpers.ts` pure functions to compute chart geometry, coordinate mapping, and tooltip positioning.
- Renders `<svg>` containing `ChartGrid`, then conditionally `LineChartLayer` or `CandlestickLayer`.
- Owns a single `activeIndex` state for hover tracking.

---

## Chart Sub-Layers

| Layer | File | Responsibility |
| ----- | ---- | -------------- |
| `ChartGrid` | `chart-grid.tsx` | Horizontal grid lines, Y-axis price labels, X-axis date labels |
| `LineChartLayer` | `line-chart-layer.tsx` | SVG polyline, gradient fill area, crosshair line, hover dot, tooltip |
| `CandlestickLayer` | `candlestick-layer.tsx` | OHLC wick lines, candle bodies, highlight band, OHLC tooltip |

---

## Hover Interaction (both modes)

1. `onMouseMove` on the SVG maps cursor x-position to the nearest data point index.
2. **Line mode**: crosshair line + dot + price/date tooltip at the active point.
3. **Candlestick mode**: dashed crosshair + highlight band + four-row OHLC tooltip (Open, High, Low, Close) color-coded with `--candle-up`/`--candle-down`.
4. Tooltip flips sides when near chart edges to avoid clipping.
5. `onMouseLeave` clears the active index.

---

## Key Files

| File | Role |
| ---- | ---- |
| `chart-section.tsx` | State owner: time range + chart type |
| `chart-config.ts` | Range configs and label mappings |
| `generate-mock-chart-data.ts` | Seeded PRNG data generator |
| `chart-helpers.ts` | Pure geometry/coordinate/tooltip utilities |
| `price-chart.tsx` | SVG orchestrator |
| `chart-grid.tsx` | Grid lines + axis labels |
| `line-chart-layer.tsx` | Line + gradient fill layer |
| `candlestick-layer.tsx` | OHLC candle layer |
