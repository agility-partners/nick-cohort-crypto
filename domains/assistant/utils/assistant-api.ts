import "server-only";

import {
  API_COINS_PATH,
  API_TIMEOUT_MS,
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

  const coins = await fetchCoins();
  if (!Array.isArray(coins)) {
    return coins;
  }

  const matchingCoin = coins.find((coin) => coin.symbol.toLowerCase() === trimmedSymbol);
  if (!matchingCoin) {
    return createToolError(TOOL_ERROR_CODE.NOT_FOUND, `No coin found for symbol: ${symbol}.`);
  }

  return {
    coin: matchingCoin,
    source: API_COINS_PATH,
    asOf: new Date().toISOString(),
  };
}

export async function getTopMovers(
  requestedLimit: number,
): Promise<TopMoversResult | ToolErrorResult> {
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_TOP_MOVERS_LIMIT);
  const coins = await fetchCoins();
  if (!Array.isArray(coins)) {
    return coins;
  }

  const byGainers = [...coins].sort((a, b) => b.change24h - a.change24h).slice(0, limit);
  const byLosers = [...coins].sort((a, b) => a.change24h - b.change24h).slice(0, limit);

  return {
    gainers: byGainers,
    losers: byLosers,
    source: API_COINS_PATH,
    asOf: new Date().toISOString(),
  };
}

export async function getMarketSummary(): Promise<MarketSummaryResult | ToolErrorResult> {
  const coins = await fetchCoins();
  if (!Array.isArray(coins)) {
    return coins;
  }

  if (coins.length === 0) {
    return createToolError(TOOL_ERROR_CODE.STALE_DATA, "No coin data is available right now.");
  }

  const totalMarketCap = coins.reduce((sum, coin) => sum + coin.marketCap, 0);
  const totalVolume24h = coins.reduce((sum, coin) => sum + coin.volume24h, 0);
  const advancers = coins.filter((coin) => coin.change24h > 0).length;
  const decliners = coins.filter((coin) => coin.change24h < 0).length;
  const unchanged = coins.length - advancers - decliners;
  const btc = coins.find((coin) => coin.symbol.toLowerCase() === "btc");
  const bitcoinDominance =
    btc && totalMarketCap > 0 ? (btc.marketCap / totalMarketCap) * 100 : null;

  return {
    totalMarketCap,
    totalVolume24h,
    advancers,
    decliners,
    unchanged,
    bitcoinDominance,
    source: API_COINS_PATH,
    asOf: new Date().toISOString(),
  };
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