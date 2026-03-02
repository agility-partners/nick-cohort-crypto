import "server-only";

import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import {
  ASSISTANT_EVAL_MODE_HEADER,
  ASSISTANT_EVAL_MODE_JSON,
  ASSISTANT_EVAL_SCENARIO_HEADER,
  ASSISTANT_INTERNAL_ERROR_FALLBACK,
  ASSISTANT_INVESTMENT_ADVICE_REFUSAL,
  ASSISTANT_NO_TOOL_DATA_FALLBACK,
  ASSISTANT_NOT_FOUND_FALLBACK,
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
  AssistantEvalResponse,
  AssistantEvalScenario,
  AssistantEvalTrace,
  ChatRequestBody,
  GuardrailFallbackReason,
  ResponseProvenance,
  ToolErrorResult,
  ToolSuccessMeta,
} from "@/domains/assistant/types/assistant.types";
import {
  getCoinBySymbol,
  getListPerformance,
  getMarketSummary,
  getTopMovers,
  getWatchlist,
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

function formatAsOfTimestamp(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return isoString;
  }
  return date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
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
  const freshnessLine = `${FRESHNESS_PREFIX} ${formatAsOfTimestamp(provenance.freshestAsOf)}`;

  if (!normalizedText) {
    return `${sourceLine}\n${freshnessLine}`;
  }

  return `${normalizedText}\n\n${sourceLine}\n${freshnessLine}`;
}

function getAssistantEvalScenario(value: string | null): AssistantEvalScenario {
  if (value === "simulate_unavailable_data" || value === "simulate_stale_data") {
    return value;
  }

  return "none";
}

function createAssistantResponse(text: string, evalResponse?: AssistantEvalResponse): Response {
  if (evalResponse) {
    return Response.json(evalResponse);
  }

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

  if (messages.length === 0) {
    return Response.json(
      {
        error: "invalid_request",
        message: "At least one user message is required.",
      },
      { status: 400 },
    );
  }

  const requestUrl = new URL(request.url);
  const evalModeHeader = request.headers.get(ASSISTANT_EVAL_MODE_HEADER);
  const evalModeQuery = requestUrl.searchParams.get("evalMode");
  const isEvalMode =
    evalModeHeader === ASSISTANT_EVAL_MODE_JSON || evalModeQuery === ASSISTANT_EVAL_MODE_JSON;
  const evalScenarioHeader = request.headers.get(ASSISTANT_EVAL_SCENARIO_HEADER);
  const evalScenarioQuery = requestUrl.searchParams.get("evalScenario");
  const evalScenario = getAssistantEvalScenario(evalScenarioHeader ?? evalScenarioQuery);
  const latestUserText = getLatestUserMessageText(messages);
  const toolCallCounts: Record<string, number> = {
    getCoinBySymbol: 0,
    getTopMovers: 0,
    getMarketSummary: 0,
    getListPerformance: 0,
    getWatchlist: 0,
  };
  const successfulToolMeta: ToolSuccessMeta[] = [];

  let toolErrorCount = 0;
  let fallbackReason: GuardrailFallbackReason = "none";
  let refusedForAdvice = false;

  const getEvalTrace = (): AssistantEvalTrace => ({
    toolCallCounts,
    successfulToolCallCount: successfulToolMeta.length,
    toolErrorCount,
    fallbackReason,
    refusedForAdvice,
  });

  const createResponse = (text: string): Response => {
    if (!isEvalMode) {
      return createAssistantResponse(text);
    }

    return createAssistantResponse(text, {
      text,
      trace: getEvalTrace(),
    });
  };

  function recordToolCall(toolName: keyof typeof toolCallCounts): void {
    toolCallCounts[toolName] += 1;
  }

  function createSimulatedToolError(code: ToolErrorResult["error"]): ToolErrorResult {
    return {
      error: code,
      message:
        code === "stale_data"
          ? "Simulated stale market data for eval."
          : "Simulated unavailable market data for eval.",
      source: "CoinSight Eval Harness",
      asOf: new Date().toISOString(),
    };
  }

  if (isInvestmentAdviceRequest(latestUserText)) {
    refusedForAdvice = true;
    return createResponse(ASSISTANT_INVESTMENT_ADVICE_REFUSAL);
  }

  const selectedSymbols = (context?.selectedSymbols ?? []).map((symbol) => symbol.toUpperCase());
  const modelMessages = await convertToModelMessages(
    messages.map((message) => {
      const { id, ...messageWithoutId } = message;
      void id;
      return messageWithoutId;
    }),
  );

  if (modelMessages.length === 0) {
    return Response.json(
      {
        error: "invalid_request",
        message: "No valid prompt content was provided.",
      },
      { status: 400 },
    );
  }

  let hasToolError = false;
  let hasNotFoundError = false;

  function captureToolResult(result: ToolErrorResult | ToolSuccessMeta): void {
    if (isToolErrorResult(result)) {
      toolErrorCount += 1;
      if (result.error === "not_found") {
        hasNotFoundError = true;
        return;
      }

      hasToolError = true;
      return;
    }

    successfulToolMeta.push({ source: result.source, asOf: result.asOf });
  }

  const assistantTools = {
    getCoinBySymbol: tool({
      description: "Get latest coin data by ticker symbol.",
      inputSchema: z.object({
        symbol: z.string().trim().min(2).max(10),
      }),
      execute: async ({ symbol }) => {
        recordToolCall("getCoinBySymbol");
        const toolResult =
          evalScenario === "simulate_unavailable_data"
            ? createSimulatedToolError("upstream_error")
            : evalScenario === "simulate_stale_data"
              ? createSimulatedToolError("stale_data")
              : await getCoinBySymbol(symbol);
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
        recordToolCall("getTopMovers");
        const toolResult =
          evalScenario === "simulate_unavailable_data"
            ? createSimulatedToolError("upstream_error")
            : evalScenario === "simulate_stale_data"
              ? createSimulatedToolError("stale_data")
              : await getTopMovers(resolveTopMoversLimit(limit));
        captureToolResult(toolResult);
        return toolResult;
      },
    }),
    getMarketSummary: tool({
      description: "Get market-wide summary metrics and BTC dominance.",
      inputSchema: z.object({}),
      execute: async () => {
        recordToolCall("getMarketSummary");
        const toolResult =
          evalScenario === "simulate_unavailable_data"
            ? createSimulatedToolError("upstream_error")
            : evalScenario === "simulate_stale_data"
              ? createSimulatedToolError("stale_data")
              : await getMarketSummary();
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
        recordToolCall("getListPerformance");
        const toolResult =
          evalScenario === "simulate_unavailable_data"
            ? createSimulatedToolError("upstream_error")
            : evalScenario === "simulate_stale_data"
              ? createSimulatedToolError("stale_data")
              : await getListPerformance(symbols);
        captureToolResult(toolResult);
        return toolResult;
      },
    }),
    getWatchlist: tool({
      description:
        "Get all coins currently on the user's watchlist with their latest market data.",
      inputSchema: z.object({}),
      execute: async () => {
        recordToolCall("getWatchlist");
        const toolResult =
          evalScenario === "simulate_unavailable_data"
            ? createSimulatedToolError("upstream_error")
            : evalScenario === "simulate_stale_data"
              ? createSimulatedToolError("stale_data")
              : await getWatchlist();
        captureToolResult(toolResult);
        return toolResult;
      },
    }),
  };

  if (!isEvalMode) {
    const streamResult = streamText({
      model: openai("gpt-4.1-mini"),
      system: getSystemPrompt(selectedSymbols),
      messages: modelMessages,
      stopWhen: stepCountIs(MAX_CHAT_STEPS),
      toolChoice: "auto",
      tools: assistantTools,
    });

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const uiStream = streamResult.toUIMessageStream();
        const reader = uiStream.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            writer.write(value);
            if (value.type === "text-delta") {
              await new Promise((resolve) => setTimeout(resolve, 15));
            }
          }
        } catch {
          return;
        }

        if (successfulToolMeta.length > 0) {
          const provenance = buildProvenance(successfulToolMeta);
          const sourceLine = `${PROVENANCE_PREFIX} ${provenance.sources.join(", ") || "CoinSight API"}`;
          const freshnessLine = `${FRESHNESS_PREFIX} ${formatAsOfTimestamp(provenance.freshestAsOf)}`;
          const textId = crypto.randomUUID();
          writer.write({ type: "text-start", id: textId });
          writer.write({ type: "text-delta", id: textId, delta: `\n\n${sourceLine}\n${freshnessLine}` });
          writer.write({ type: "text-end", id: textId });
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  }

  try {
    const result = await generateText({
      model: openai("gpt-4.1-mini"),
      system: getSystemPrompt(selectedSymbols),
      messages: modelMessages,
      stopWhen: stepCountIs(MAX_CHAT_STEPS),
      toolChoice: "auto",
      tools: assistantTools,
    });

    if (successfulToolMeta.length === 0) {
      if (hasNotFoundError) {
        fallbackReason = "not_found";
        return createResponse(ASSISTANT_NOT_FOUND_FALLBACK);
      }

      fallbackReason = hasToolError ? "tool_error" : "no_tool_data";
      return createResponse(hasToolError ? ASSISTANT_TOOL_FAILURE_FALLBACK : ASSISTANT_NO_TOOL_DATA_FALLBACK);
    }

    const normalizedResultText = result.text.trim();
    if (!normalizedResultText) {
      fallbackReason = "none";
      return createResponse(
        appendProvenanceLine(
          "I retrieved verified market data but couldn’t produce a full summary. Please ask again with a specific request.",
          buildProvenance(successfulToolMeta),
        ),
      );
    }

    const responseText = appendProvenanceLine(normalizedResultText, buildProvenance(successfulToolMeta));
    fallbackReason = "none";
    return createResponse(responseText);
  } catch (error) {
    console.error("Assistant chat generation failed", error);
    fallbackReason = hasToolError ? "tool_error" : "internal_error";
    return createResponse(hasToolError ? ASSISTANT_TOOL_FAILURE_FALLBACK : ASSISTANT_INTERNAL_ERROR_FALLBACK);
  }
}