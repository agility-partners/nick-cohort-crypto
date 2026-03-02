export const ASSISTANT_TITLE = "Warehouse-Aware Crypto Assistant";
export const ASSISTANT_SUBTITLE = "Grounded by CoinSight API data";

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

export const SYSTEM_PROMPT =
  "You are a crypto assistant for CoinSight. Use tools for factual data. Never invent values. " +
  "If tool data is unavailable, stale, or missing, say that clearly. Include source freshness in factual answers. " +
  "Do not provide buy/sell recommendations or financial advice.";