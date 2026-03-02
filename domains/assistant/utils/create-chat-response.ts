import "server-only";

import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  stepCountIs,
  tool,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import {
  ASSISTANT_INTERNAL_ERROR_FALLBACK,
  ASSISTANT_INVESTMENT_ADVICE_REFUSAL,
  ASSISTANT_NO_TOOL_DATA_FALLBACK,
  ASSISTANT_TOOL_FAILURE_FALLBACK,
  FRESHNESS_PREFIX,
  INVESTMENT_ADVICE_PATTERNS,
  MAX_CHAT_STEPS,
  MAX_SELECTED_SYMBOLS,
  MAX_SYMBOL_LENGTH,
  PROVENANCE_PREFIX,
  SYSTEM_PROMPT,
} from "@/domains/assistant/constants/assistant.constants";
import type {
  ChatRequestBody,
  ResponseProvenance,
  ToolErrorResult,
  ToolSuccessMeta,
} from "@/domains/assistant/types/assistant.types";
import {
  getCoinBySymbol,
  getListPerformance,
  getMarketSummary,
  getTopMovers,
  resolveTopMoversLimit,
} from "@/domains/assistant/utils/assistant-api";

const symbolSchema = z.string().trim().min(2).max(MAX_SYMBOL_LENGTH);

const chatRequestBodySchema: z.ZodType<ChatRequestBody> = z.object({
  messages: z.array(z.custom<UIMessage>()).default([]),
  context: z
    .object({
      selectedSymbols: z.array(symbolSchema).max(MAX_SELECTED_SYMBOLS).optional(),
    })
    .optional(),
});

function getSystemPrompt(selectedSymbols: string[]): string {
  if (selectedSymbols.length === 0) {
    return SYSTEM_PROMPT;
  }

  return (
    `${SYSTEM_PROMPT} ` +
    `The user's current selected compare-list symbols are: ${selectedSymbols.join(", ")}. ` +
    "When a user asks about their selected list or list-vs-market performance, call getListPerformance using these symbols unless the user provides a different symbol list."
  );
}

function getLatestUserMessageText(messages: UIMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role !== "user") {
      continue;
    }

    const textPart = message.parts.find((part) => part.type === "text");
    return textPart?.type === "text" ? textPart.text.trim() : "";
  }

  return "";
}

function isInvestmentAdviceRequest(userText: string): boolean {
  if (!userText) {
    return false;
  }

  return INVESTMENT_ADVICE_PATTERNS.some((pattern) => pattern.test(userText));
}

function isToolErrorResult(result: ToolErrorResult | ToolSuccessMeta): result is ToolErrorResult {
  return "error" in result;
}

function getFreshestAsOf(results: ToolSuccessMeta[]): string {
  const withTimestamps = results.map((result) => ({
    value: result.asOf,
    timestamp: Date.parse(result.asOf),
  }));

  const validTimestamps = withTimestamps.filter((item) => Number.isFinite(item.timestamp));

  if (validTimestamps.length === 0) {
    return results[results.length - 1]?.asOf ?? new Date().toISOString();
  }

  const freshest = validTimestamps.reduce((latest, candidate) =>
    candidate.timestamp > latest.timestamp ? candidate : latest,
  );

  return freshest.value;
}

function buildProvenance(results: ToolSuccessMeta[]): ResponseProvenance {
  const uniqueSources = [...new Set(results.map((result) => result.source))];

  return {
    sources: uniqueSources,
    freshestAsOf: getFreshestAsOf(results),
  };
}

function appendProvenanceLine(text: string, provenance: ResponseProvenance): string {
  const normalizedText = text.trim();
  const sourceLine = `${PROVENANCE_PREFIX} ${provenance.sources.join(", ") || "CoinSight API"}`;
  const freshnessLine = `${FRESHNESS_PREFIX} ${provenance.freshestAsOf}`;

  if (!normalizedText) {
    return `${sourceLine}\n${freshnessLine}`;
  }

  return `${normalizedText}\n\n${sourceLine}\n${freshnessLine}`;
}

function createStaticAssistantResponse(text: string): Response {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const textId = crypto.randomUUID();
      writer.write({ type: "text-start", id: textId });
      writer.write({ type: "text-delta", id: textId, delta: text });
      writer.write({ type: "text-end", id: textId });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

export async function createChatResponse(request: Request): Promise<Response> {
  const bodyPayload = (await request.json()) as unknown;
  const parseResult = chatRequestBodySchema.safeParse(bodyPayload);

  if (!parseResult.success) {
    return Response.json(
      {
        error: "invalid_request",
        message: "Invalid chat request payload.",
      },
      { status: 400 },
    );
  }

  const { messages, context } = parseResult.data;
  const latestUserText = getLatestUserMessageText(messages);

  if (isInvestmentAdviceRequest(latestUserText)) {
    return createStaticAssistantResponse(ASSISTANT_INVESTMENT_ADVICE_REFUSAL);
  }

  const selectedSymbols = (context?.selectedSymbols ?? []).map((symbol) => symbol.toUpperCase());
  const modelMessages = await convertToModelMessages(
    messages.map((message) => {
      const { id, ...messageWithoutId } = message;
      void id;
      return messageWithoutId;
    }),
  );

  const successfulToolMeta: ToolSuccessMeta[] = [];
  let hasToolError = false;

  function captureToolResult(result: ToolErrorResult | ToolSuccessMeta): void {
    if (isToolErrorResult(result)) {
      hasToolError = true;
      return;
    }

    successfulToolMeta.push({ source: result.source, asOf: result.asOf });
  }

  try {
    const result = await generateText({
      model: openai("gpt-4.1-mini"),
      system: getSystemPrompt(selectedSymbols),
      messages: modelMessages,
      stopWhen: stepCountIs(MAX_CHAT_STEPS),
      toolChoice: "required",
      tools: {
        getCoinBySymbol: tool({
          description: "Get latest coin data by ticker symbol.",
          inputSchema: z.object({
            symbol: z.string().trim().min(2).max(10),
          }),
          execute: async ({ symbol }) => {
            const toolResult = await getCoinBySymbol(symbol);
            captureToolResult(toolResult);
            return toolResult;
          },
        }),
        getTopMovers: tool({
          description: "Get top gainers and losers from latest market data.",
          inputSchema: z.object({
            limit: z.number().int().min(1).max(20).optional(),
          }),
          execute: async ({ limit }) => {
            const toolResult = await getTopMovers(resolveTopMoversLimit(limit));
            captureToolResult(toolResult);
            return toolResult;
          },
        }),
        getMarketSummary: tool({
          description: "Get market-wide summary metrics and BTC dominance.",
          inputSchema: z.object({}),
          execute: async () => {
            const toolResult = await getMarketSummary();
            captureToolResult(toolResult);
            return toolResult;
          },
        }),
        getListPerformance: tool({
          description:
            "Compare selected symbol list 24h cap-weighted performance against 24h cap-weighted market baseline.",
          inputSchema: z.object({
            symbols: z.array(symbolSchema).min(1).max(MAX_SELECTED_SYMBOLS),
          }),
          execute: async ({ symbols }) => {
            const toolResult = await getListPerformance(symbols);
            captureToolResult(toolResult);
            return toolResult;
          },
        }),
      },
    });

    if (successfulToolMeta.length === 0) {
      return createStaticAssistantResponse(
        hasToolError ? ASSISTANT_TOOL_FAILURE_FALLBACK : ASSISTANT_NO_TOOL_DATA_FALLBACK,
      );
    }

    const responseText = appendProvenanceLine(result.text, buildProvenance(successfulToolMeta));
    return createStaticAssistantResponse(responseText);
  } catch {
    return createStaticAssistantResponse(
      hasToolError ? ASSISTANT_TOOL_FAILURE_FALLBACK : ASSISTANT_INTERNAL_ERROR_FALLBACK,
    );
  }
}