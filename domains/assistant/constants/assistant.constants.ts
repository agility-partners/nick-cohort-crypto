export const ASSISTANT_TITLE = "CoinBOT";
export const ASSISTANT_SUBTITLE = "Warehouse-Aware Crypto Assistant";

export const CHAT_API_ROUTE = "/api/chat";
export const ASSISTANT_ROUTE = "/assistant";

export const TOOL_ERROR_CODE = {
  NOT_FOUND: "not_found",
  INVALID_INPUT: "invalid_input",
  UPSTREAM_ERROR: "upstream_error",
  STALE_DATA: "stale_data",
} as const;

export const API_TIMEOUT_MS = 8000;
export const DEFAULT_TOP_MOVERS_LIMIT = 5;
export const MAX_TOP_MOVERS_LIMIT = 20;
export const MAX_SELECTED_SYMBOLS = 3;
export const MAX_SYMBOL_LENGTH = 10;
export const API_COINS_PATH = "/api/coins";
export const API_MARKET_SUMMARY_PATH = "/api/market/summary";
export const API_MOVERS_PATH = "/api/movers";
export const API_COIN_BY_SYMBOL_PATH = "/api/coins/symbol";
export const API_WATCHLIST_PATH = "/api/watchlist";
export const MAX_CHAT_STEPS = 6;

export const INVESTMENT_ADVICE_PATTERNS = [
  /\bshould\s+i\s+(buy|sell|hold)\b/i,
  /\b(what|which)\s+(coin|crypto|token)\s+should\s+i\s+buy\b/i,
  /\b(is\s+it\s+)?(a\s+)?good\s+time\s+to\s+buy\b/i,
  /\b(price\s+target|target\s+price)\b/i,
  /\bhow\s+much\s+should\s+i\s+invest\b/i,
  /\bportfolio\s+allocation\b/i,
  /\bguaranteed\s+return\b/i,
  /\bnot\s+financial\s+advice\b/i,
];

export const ASSISTANT_INVESTMENT_ADVICE_REFUSAL =
  "I can’t provide investment advice or tell you what to buy, sell, hold, or allocate. I can help with market data, comparisons, and risk-aware context from available tools.";

export const ASSISTANT_NO_TOOL_DATA_FALLBACK =
  "I don’t have verified tool data available for that request right now, so I can’t make factual market claims. Please try again in a moment.";

export const ASSISTANT_NOT_FOUND_FALLBACK =
  "I couldn’t find market data for that symbol in the current dataset. Please verify the ticker and try again.";

export const ASSISTANT_TOOL_FAILURE_FALLBACK =
  "I’m having trouble reaching market-data tools right now. Please try again shortly.";

export const ASSISTANT_INTERNAL_ERROR_FALLBACK =
  "I ran into an internal issue while preparing that answer. Please try again in a moment.";

export const ASSISTANT_CLIENT_ERROR_FALLBACK =
  "The assistant is temporarily unavailable. Please try again.";

export const PROVENANCE_PREFIX = "Source:";
export const FRESHNESS_PREFIX = "As of:";

export const ASSISTANT_EVAL_MODE_HEADER = "x-assistant-eval-mode";
export const ASSISTANT_EVAL_SCENARIO_HEADER = "x-assistant-eval-scenario";
export const ASSISTANT_EVAL_MODE_JSON = "json";

export const SYSTEM_PROMPT =
  "You are a crypto assistant for CoinSight. Use tools for factual data. Never invent values. " +
  "If tool data is unavailable, stale, or missing, say that clearly. " +
  "Do not include dates, timestamps, or source attribution in your responses — that metadata is appended automatically. " +
  "Do not provide buy/sell recommendations or financial advice. " +
  "You can check the user's watchlist when they ask things like 'what's on my watchlist?', 'how is my watchlist doing?', or 'show me my watchlist performance.' Use the getWatchlist tool to retrieve their watchlist coins and market data.";