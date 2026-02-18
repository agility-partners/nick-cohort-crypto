/* ── Core domain model ── */

export interface Crypto {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  image: string;
}

/* ── Sorting ── */

export type SortKey = "name" | "price" | "change24h" | "marketCap" | "volume24h";
export type SortDirection = "asc" | "desc";

/* ── Chart ── */

export type TimeRange = "1D" | "7D" | "30D" | "90D" | "1Y" | "ALL";
export type ChartType = "line" | "candlestick";

export interface OHLCDataPoint {
  open: number;
  high: number;
  low: number;
  close: number;
}
