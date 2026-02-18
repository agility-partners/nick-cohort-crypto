/* ── View modes ── */

export const VIEW_MODE = {
  ALL: "all",
  GAINERS: "gainers",
  LOSERS: "losers",
  VOLUME: "volume",
} as const;

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

export const VIEW_META: Record<ViewMode, { title: string }> = {
  [VIEW_MODE.ALL]: { title: "Market Cap" },
  [VIEW_MODE.GAINERS]: { title: "Top Gainers" },
  [VIEW_MODE.LOSERS]: { title: "Top Losers" },
  [VIEW_MODE.VOLUME]: { title: "Highest Volume" },
};

/* ── Nav items ── */

export const NAV_ITEMS = [
  { label: "Market Cap", view: VIEW_MODE.ALL, href: "/" },
  { label: "Top Gainers", view: VIEW_MODE.GAINERS, href: "/?view=gainers" },
  { label: "Top Losers", view: VIEW_MODE.LOSERS, href: "/?view=losers" },
  { label: "Highest Volume", view: VIEW_MODE.VOLUME, href: "/?view=volume" },
] as const;

/* ── Chart dimensions ── */

export const CHART_WIDTH = 720;
export const CHART_HEIGHT = 320;
export const CHART_PADDING = 28;

/* ── Time ── */

export const MS_PER_HOUR = 60 * 60 * 1000;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
export const MS_PER_YEAR = 365 * MS_PER_DAY;

/* ── PRNG (Linear Congruential Generator) ── */

export const LCG_MULTIPLIER = 1664525;
export const LCG_INCREMENT = 1013904223;
export const LCG_MODULUS = 4294967296;

/* ── Misc numeric thresholds ── */

export const MIN_PRICE = 0.0001;
export const RANGE_SEED_OFFSET = 1000;
export const PERCENTAGE_DIVISOR = 100;
