import "server-only";

import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import {
  MAX_SELECTED_SYMBOLS,
  MAX_SYMBOL_LENGTH,
  SYSTEM_PROMPT,
} from "@/domains/assistant/constants/assistant.constants";
import {
  getCoinBySymbol,
  getListPerformance,
  getMarketSummary,
  getTopMovers,
  resolveTopMoversLimit,
} from "@/domains/assistant/utils/assistant-api";
import type { ChatRequestBody } from "@/domains/assistant/types/assistant.types";

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
  const selectedSymbols = (context?.selectedSymbols ?? []).map((symbol) => symbol.toUpperCase());
  const modelMessages = await convertToModelMessages(
    messages.map((message) => {
      const { id, ...messageWithoutId } = message;
      void id;
      return messageWithoutId;
    }),
  );

  const result = streamText({
    model: openai("gpt-4.1-mini"),
    system: getSystemPrompt(selectedSymbols),
    messages: modelMessages,
    stopWhen: stepCountIs(6),
    tools: {
      getCoinBySymbol: tool({
        description: "Get latest coin data by ticker symbol.",
        inputSchema: z.object({
          symbol: z.string().trim().min(2).max(10),
        }),
        execute: async ({ symbol }) => getCoinBySymbol(symbol),
      }),
      getTopMovers: tool({
        description: "Get top gainers and losers from latest market data.",
        inputSchema: z.object({
          limit: z.number().int().min(1).max(20).optional(),
        }),
        execute: async ({ limit }) => getTopMovers(resolveTopMoversLimit(limit)),
      }),
      getMarketSummary: tool({
        description: "Get market-wide summary metrics and BTC dominance.",
        inputSchema: z.object({}),
        execute: async () => getMarketSummary(),
      }),
      getListPerformance: tool({
        description:
          "Compare selected symbol list 24h cap-weighted performance against 24h cap-weighted market baseline.",
        inputSchema: z.object({
          symbols: z.array(symbolSchema).min(1).max(MAX_SELECTED_SYMBOLS),
        }),
        execute: async ({ symbols }) => getListPerformance(symbols),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}