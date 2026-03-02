import type { Crypto } from "@/domains/crypto/types/crypto.types";
import type { TOOL_ERROR_CODE } from "@/domains/assistant/constants/assistant.constants";
import type { UIMessage } from "ai";

export type ToolErrorCode = (typeof TOOL_ERROR_CODE)[keyof typeof TOOL_ERROR_CODE];

export interface ToolErrorResult {
  error: ToolErrorCode;
  message: string;
  source: string;
  asOf: string;
}

export interface ToolSuccessMeta {
  source: string;
  asOf: string;
}

export type GuardrailDecision = "allow" | "refuse_investment_advice";

export type GuardrailFallbackReason =
  | "none"
  | "no_tool_data"
  | "tool_error"
  | "provider_error"
  | "internal_error";

export interface GuardrailEvaluation {
  decision: GuardrailDecision;
  fallbackReason: GuardrailFallbackReason;
}

export interface ResponseProvenance {
  sources: string[];
  freshestAsOf: string;
}

export interface ChatRequestContext {
  selectedSymbols?: string[];
}

export interface ChatRequestBody {
  messages: UIMessage[];
  context?: ChatRequestContext;
}

export interface CoinBySymbolResult extends ToolSuccessMeta {
  coin: Crypto;
}

export interface TopMoversResult extends ToolSuccessMeta {
  gainers: Crypto[];
  losers: Crypto[];
}

export interface MarketSummaryResult extends ToolSuccessMeta {
  totalMarketCap: number;
  totalVolume24h: number;
  advancers: number;
  decliners: number;
  unchanged: number;
  bitcoinDominance: number | null;
}

export interface ListPerformanceItem {
  id: string;
  name: string;
  symbol: string;
  change24h: number;
  marketCap: number;
}

export interface ListPerformanceResult extends ToolSuccessMeta {
  requestedSymbols: string[];
  matchedSymbols: string[];
  missingSymbols: string[];
  listCount: number;
  listMarketCap: number;
  listWeightedChange24h: number;
  marketWeightedChange24h: number;
  performanceDelta24h: number;
  baseline: "market_cap_weighted_24h";
  items: ListPerformanceItem[];
}