/* ── View modes ── */

export const VIEW_MODE = {
  WATCHLIST: "watchlist",
  ALL: "all",
  COMPARE: "compare",
} as const;

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

export const DEFAULT_VIEW = VIEW_MODE.ALL;

export function isViewMode(value: string | null): value is ViewMode {
  if (!value) {
    return false;
  }

  return Object.values(VIEW_MODE).includes(value as ViewMode);
}

export const VIEW_META: Record<ViewMode, { title: string }> = {
  [VIEW_MODE.WATCHLIST]: { title: "Watchlist" },
  [VIEW_MODE.ALL]: { title: "All Coins" },
  [VIEW_MODE.COMPARE]: { title: "Compare Coins" },
};

export const ALL_COINS_SORT = {
  MARKET_CAP: "market-cap",
  TOP_GAINERS: "top-gainers",
  HIGHEST_VOLUME: "highest-volume",
} as const;

export type AllCoinsSort = (typeof ALL_COINS_SORT)[keyof typeof ALL_COINS_SORT];

export const ALL_COINS_SORT_OPTIONS: ReadonlyArray<{ label: string; value: AllCoinsSort }> = [
  { label: "Market Cap", value: ALL_COINS_SORT.MARKET_CAP },
  { label: "Top Gainers", value: ALL_COINS_SORT.TOP_GAINERS },
  { label: "Highest Volume", value: ALL_COINS_SORT.HIGHEST_VOLUME },
];

export const DEFAULT_ALL_COINS_SORT = ALL_COINS_SORT.MARKET_CAP;

/* ── Nav items ── */

export const NAV_ITEMS = [
  { label: "All Coins", view: VIEW_MODE.ALL, href: "/?view=all" },
  { label: "Watchlist", view: VIEW_MODE.WATCHLIST, href: "/?view=watchlist" },
  { label: "Compare", view: VIEW_MODE.COMPARE, href: "/?view=compare" },
] as const;

export const ADD_WATCHLIST_HREF = "/watchlist/add";
export const WATCHLIST_STORAGE_KEY = "coinsight.watchlist";
export const COMPARE_STORAGE_KEY = "coinsight.compare";
export const MAX_COMPARE_ASSETS = 3;

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
