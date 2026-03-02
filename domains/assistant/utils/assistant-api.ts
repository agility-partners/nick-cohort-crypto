import "server-only";

import {
  API_COIN_BY_SYMBOL_PATH,
  API_COINS_PATH,
  API_MARKET_SUMMARY_PATH,
  API_MOVERS_PATH,
  API_TIMEOUT_MS,
  API_WATCHLIST_PATH,
  DEFAULT_TOP_MOVERS_LIMIT,
  MAX_SELECTED_SYMBOLS,
  MAX_SYMBOL_LENGTH,
  MAX_TOP_MOVERS_LIMIT,
  TOOL_ERROR_CODE,
} from "@/domains/assistant/constants/assistant.constants";
import type {
  CoinBySymbolResult,
  ListPerformanceItem,
  ListPerformanceResult,
  MarketSummaryResult,
  ToolErrorResult,
  TopMoversResult,
  WatchlistResult,
} from "@/domains/assistant/types/assistant.types";
import type { Crypto } from "@/domains/crypto/types/crypto.types";

function getServerApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
}

function createToolError(error: ToolErrorResult["error"], message: string): ToolErrorResult {
  return {
    error,
    message,
    source: API_COINS_PATH,
    asOf: new Date().toISOString(),
  };
}

function normalizeSymbols(symbols: string[]): string[] {
  const uniqueSymbols: string[] = [];

  symbols.forEach((symbol) => {
    const normalizedSymbol = symbol.trim().toLowerCase();

    if (
      normalizedSymbol.length >= 2 &&
      normalizedSymbol.length <= MAX_SYMBOL_LENGTH &&
      !uniqueSymbols.includes(normalizedSymbol)
    ) {
      uniqueSymbols.push(normalizedSymbol);
    }
  });

  return uniqueSymbols.slice(0, MAX_SELECTED_SYMBOLS);
}

async function fetchCoins(): Promise<Crypto[] | ToolErrorResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT_MS);

  try {
    const response = await fetch(`${getServerApiBaseUrl()}${API_COINS_PATH}`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return createToolError(
        TOOL_ERROR_CODE.UPSTREAM_ERROR,
        "Coin data source is currently unavailable.",
      );
    }

    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) {
      return createToolError(
        TOOL_ERROR_CODE.UPSTREAM_ERROR,
        "Coin data source returned an invalid payload.",
      );
    }

    return data as Crypto[];
  } catch {
    return createToolError(
      TOOL_ERROR_CODE.UPSTREAM_ERROR,
      "Coin data source request failed or timed out.",
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function getCoinBySymbol(
  symbol: string,
): Promise<CoinBySymbolResult | ToolErrorResult> {
  const trimmedSymbol = symbol.trim().toLowerCase();

  if (!trimmedSymbol) {
    return createToolError(TOOL_ERROR_CODE.INVALID_INPUT, "Symbol is required.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT_MS);

  try {
    const url = `${getServerApiBaseUrl()}${API_COIN_BY_SYMBOL_PATH}/${encodeURIComponent(trimmedSymbol)}`;
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    if (response.status === 404) {
      return createToolError(TOOL_ERROR_CODE.NOT_FOUND, `No coin found for symbol: ${symbol}.`);
    }

    if (!response.ok) {
      return createToolError(
        TOOL_ERROR_CODE.UPSTREAM_ERROR,
        "Coin data source is currently unavailable.",
      );
    }

    const coin = (await response.json()) as Crypto;
    return {
      coin,
      source: `${API_COIN_BY_SYMBOL_PATH}/${trimmedSymbol}`,
      asOf: new Date().toISOString(),
    };
  } catch {
    return createToolError(
      TOOL_ERROR_CODE.UPSTREAM_ERROR,
      "Coin data source request failed or timed out.",
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function getTopMovers(
  requestedLimit: number,
): Promise<TopMoversResult | ToolErrorResult> {
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_TOP_MOVERS_LIMIT);
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${getServerApiBaseUrl()}${API_MOVERS_PATH}?limit=${limit}`,
      { method: "GET", cache: "no-store", signal: controller.signal },
    );

    if (!response.ok) {
      return createToolError(
        TOOL_ERROR_CODE.UPSTREAM_ERROR,
        "Top movers data is currently unavailable.",
      );
    }

    const data = (await response.json()) as { gainers: Crypto[]; losers: Crypto[] };
    return {
      gainers: data.gainers,
      losers: data.losers,
      source: API_MOVERS_PATH,
      asOf: new Date().toISOString(),
    };
  } catch {
    return createToolError(
      TOOL_ERROR_CODE.UPSTREAM_ERROR,
      "Top movers request failed or timed out.",
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function getMarketSummary(): Promise<MarketSummaryResult | ToolErrorResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${getServerApiBaseUrl()}${API_MARKET_SUMMARY_PATH}`,
      { method: "GET", cache: "no-store", signal: controller.signal },
    );

    if (!response.ok) {
      return createToolError(
        TOOL_ERROR_CODE.UPSTREAM_ERROR,
        "Market summary data is currently unavailable.",
      );
    }

    const data = (await response.json()) as {
      totalMarketCap: number;
      totalVolume24h: number;
      advancers: number;
      decliners: number;
      unchanged: number;
      bitcoinDominance: number | null;
    };

    return {
      totalMarketCap: data.totalMarketCap,
      totalVolume24h: data.totalVolume24h,
      advancers: data.advancers,
      decliners: data.decliners,
      unchanged: data.unchanged,
      bitcoinDominance: data.bitcoinDominance,
      source: API_MARKET_SUMMARY_PATH,
      asOf: new Date().toISOString(),
    };
  } catch {
    return createToolError(
      TOOL_ERROR_CODE.UPSTREAM_ERROR,
      "Market summary request failed or timed out.",
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function getWatchlist(): Promise<WatchlistResult | ToolErrorResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${getServerApiBaseUrl()}${API_WATCHLIST_PATH}`,
      { method: "GET", cache: "no-store", signal: controller.signal },
    );

    if (!response.ok) {
      return createToolError(
        TOOL_ERROR_CODE.UPSTREAM_ERROR,
        "Watchlist data is currently unavailable.",
      );
    }

    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) {
      return createToolError(
        TOOL_ERROR_CODE.UPSTREAM_ERROR,
        "Watchlist data source returned an invalid payload.",
      );
    }

    return {
      coins: data as Crypto[],
      source: API_WATCHLIST_PATH,
      asOf: new Date().toISOString(),
    };
  } catch {
    return createToolError(
      TOOL_ERROR_CODE.UPSTREAM_ERROR,
      "Watchlist request failed or timed out.",
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function getListPerformance(
  symbols: string[],
): Promise<ListPerformanceResult | ToolErrorResult> {
  const normalizedSymbols = normalizeSymbols(symbols);

  if (normalizedSymbols.length === 0) {
    return createToolError(
      TOOL_ERROR_CODE.INVALID_INPUT,
      "At least one valid symbol is required to compare list performance.",
    );
  }

  const coins = await fetchCoins();
  if (!Array.isArray(coins)) {
    return coins;
  }

  if (coins.length === 0) {
    return createToolError(TOOL_ERROR_CODE.STALE_DATA, "No coin data is available right now.");
  }

  const listCoins: Crypto[] = [];
  const matchedSymbols: string[] = [];

  normalizedSymbols.forEach((symbol) => {
    const matchingCoin = coins.find((coin) => coin.symbol.toLowerCase() === symbol);

    if (matchingCoin) {
      listCoins.push(matchingCoin);
      matchedSymbols.push(symbol.toUpperCase());
    }
  });

  if (listCoins.length === 0) {
    return createToolError(
      TOOL_ERROR_CODE.NOT_FOUND,
      "None of the provided symbols were found in the current market data.",
    );
  }

  const missingSymbols = normalizedSymbols
    .filter((symbol) => !matchedSymbols.includes(symbol.toUpperCase()))
    .map((symbol) => symbol.toUpperCase());

  const listMarketCap = listCoins.reduce((sum, coin) => sum + coin.marketCap, 0);
  const totalMarketCap = coins.reduce((sum, coin) => sum + coin.marketCap, 0);

  if (listMarketCap <= 0 || totalMarketCap <= 0) {
    return createToolError(
      TOOL_ERROR_CODE.STALE_DATA,
      "Market capitalization data is unavailable for list performance comparison.",
    );
  }

  const listWeightedChange24h =
    listCoins.reduce((sum, coin) => sum + coin.change24h * coin.marketCap, 0) / listMarketCap;

  const marketWeightedChange24h =
    coins.reduce((sum, coin) => sum + coin.change24h * coin.marketCap, 0) / totalMarketCap;

  const items: ListPerformanceItem[] = listCoins.map((coin) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    change24h: coin.change24h,
    marketCap: coin.marketCap,
  }));

  return {
    requestedSymbols: normalizedSymbols.map((symbol) => symbol.toUpperCase()),
    matchedSymbols,
    missingSymbols,
    listCount: listCoins.length,
    listMarketCap,
    listWeightedChange24h,
    marketWeightedChange24h,
    performanceDelta24h: listWeightedChange24h - marketWeightedChange24h,
    baseline: "market_cap_weighted_24h",
    items,
    source: API_COINS_PATH,
    asOf: new Date().toISOString(),
  };
}

export function resolveTopMoversLimit(limit: number | undefined): number {
  if (!limit) {
    return DEFAULT_TOP_MOVERS_LIMIT;
  }

  return Math.min(Math.max(limit, 1), MAX_TOP_MOVERS_LIMIT);
}