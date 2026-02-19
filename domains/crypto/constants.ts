/* ── View modes ── */

export const VIEW_MODE = {
  WATCHLIST: "watchlist",
  ALL: "all",
  GAINERS: "gainers",
  LOSERS: "losers",
  VOLUME: "volume",
} as const;

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

export const DEFAULT_VIEW = VIEW_MODE.WATCHLIST;

export function isViewMode(value: string | null): value is ViewMode {
  if (!value) {
    return false;
  }

  return Object.values(VIEW_MODE).includes(value as ViewMode);
}

export const VIEW_META: Record<ViewMode, { title: string }> = {
  [VIEW_MODE.WATCHLIST]: { title: "Watchlist" },
  [VIEW_MODE.ALL]: { title: "Market Cap" },
  [VIEW_MODE.GAINERS]: { title: "Top Gainers" },
  [VIEW_MODE.LOSERS]: { title: "Top Losers" },
  [VIEW_MODE.VOLUME]: { title: "Highest Volume" },
};

/* ── Nav items ── */

export const NAV_ITEMS = [
  { label: "Watchlist", view: VIEW_MODE.WATCHLIST, href: "/" },
  { label: "Market Cap", view: VIEW_MODE.ALL, href: "/?view=all" },
  { label: "Top Gainers", view: VIEW_MODE.GAINERS, href: "/?view=gainers" },
  { label: "Highest Volume", view: VIEW_MODE.VOLUME, href: "/?view=volume" },
] as const;

export const ADD_WATCHLIST_HREF = "/watchlist/add";
export const WATCHLIST_STORAGE_KEY = "coinsight.watchlist";

export const WATCHLIST_STATUS_TEXT = {
  ADDED: "Added to watchlist",
  ADD: "Add to watchlist",
} as const;

export const WATCHLIST_TOGGLE_ARIA_LABEL = {
  ADD: "Add coin to watchlist",
  REMOVE: "Remove coin from watchlist",
} as const;

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
