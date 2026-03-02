import { expect, test, type Page } from "@playwright/test";

import { registerE2ELogging } from "./utils/test-logging";

const CHAT_ROUTE = "**/api/chat";
const MESSAGE_INPUT_PLACEHOLDER = "Ask about a coin, movers, or market summary...";
const UNKNOWN_SYMBOL_FALLBACK =
  "I couldn’t find market data for that symbol in the current dataset. Please verify the ticker and try again.";
const TOOL_FAILURE_FALLBACK =
  "I’m having trouble reaching market-data tools right now. Please try again shortly.";

function createAssistantSse(text: string): string {
  const textId = "assistant-text-1";
  const chunks = [
    { type: "start", messageId: "assistant-message-1" },
    { type: "text-start", id: textId },
    { type: "text-delta", id: textId, delta: text },
    { type: "text-end", id: textId },
    { type: "finish", finishReason: "stop" },
  ];

  return `${chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("")}data: [DONE]\n\n`;
}

function createChunkedAssistantSse(deltas: string[]): string {
  const textId = "assistant-text-stream";
  const chunks = [{ type: "start", messageId: "assistant-message-stream" }, { type: "text-start", id: textId }];

  deltas.forEach((delta) => {
    chunks.push({ type: "text-delta", id: textId, delta });
  });

  chunks.push({ type: "text-end", id: textId });
  chunks.push({ type: "finish", finishReason: "stop" });

  return `${chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("")}data: [DONE]\n\n`;
}

async function mockAssistantResponse(page: Page, text: string): Promise<void> {
  await page.route(CHAT_ROUTE, async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache",
      },
      body: createAssistantSse(text),
    });
  });
}

test.describe("Assistant flows", () => {
  registerE2ELogging("Assistant flows");

  test("shows assistant response from streamed chat payload", async ({ page }) => {
    await test.step("Mock streamed assistant chat response and open assistant page", async () => {
      await page.route(CHAT_ROUTE, async (route) => {
        await route.fulfill({
          status: 200,
          headers: {
            "content-type": "text/event-stream; charset=utf-8",
            "cache-control": "no-cache",
          },
          body: createChunkedAssistantSse([
            "Market snapshot: BTC is active. ",
            "Source: /api/coins\nAs of: 2026-03-02T12:00:00.000Z",
          ]),
        });
      });

      await page.goto("/assistant");
      await expect(page.getByRole("heading", { level: 1, name: "Warehouse-Aware Crypto Assistant" })).toBeVisible();
    });

    await test.step("Send prompt and verify streamed assistant text appears", async () => {
      await page.getByPlaceholder(MESSAGE_INPUT_PLACEHOLDER).fill("Top movers right now");
      await page.getByRole("button", { name: "Send" }).click();

      await expect(page.getByText(/Market snapshot: BTC is active\./)).toBeVisible();
      await expect(page.getByText(/Source:\s*\/api\/coins/)).toBeVisible();
      await expect(page.getByText(/As of:\s*2026-03-02T12:00:00.000Z/)).toBeVisible();
    });
  });

  test("shows graceful unknown symbol message", async ({ page }) => {
    await test.step("Mock unknown-symbol fallback response", async () => {
      await mockAssistantResponse(page, UNKNOWN_SYMBOL_FALLBACK);
      await page.goto("/assistant");
    });

    await test.step("Submit unknown symbol question and verify safe fallback text", async () => {
      await page.getByPlaceholder(MESSAGE_INPUT_PLACEHOLDER).fill("Price for QQQNOTREAL");
      await page.getByRole("button", { name: "Send" }).click();

      await expect(page.getByText(UNKNOWN_SYMBOL_FALLBACK)).toBeVisible();
    });
  });

  test("shows friendly tool failure fallback message", async ({ page }) => {
    await test.step("Mock tool failure fallback response", async () => {
      await mockAssistantResponse(page, TOOL_FAILURE_FALLBACK);
      await page.goto("/assistant");
    });

    await test.step("Submit market question and verify fallback message", async () => {
      await page.getByPlaceholder(MESSAGE_INPUT_PLACEHOLDER).fill("Give me a current market summary");
      await page.getByRole("button", { name: "Send" }).click();

      await expect(page.getByText(TOOL_FAILURE_FALLBACK)).toBeVisible();
    });
  });

  test("uses compare symbols context for list-vs-market questions", async ({ context, page }) => {
    await test.step("Seed compare symbols in localStorage before app load", async () => {
      await context.addInitScript(() => {
        window.localStorage.setItem("coinsight.compare", JSON.stringify(["bitcoin", "ethereum", "solana"]));
      });
    });

    await test.step("Mock coin lookup and assert selectedSymbols context sent to chat", async () => {
      await page.route("**/api/coins", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            { id: "bitcoin", symbol: "btc" },
            { id: "ethereum", symbol: "eth" },
            { id: "solana", symbol: "sol" },
          ]),
        });
      });

      await page.route(CHAT_ROUTE, async (route) => {
        const payload = route.request().postDataJSON() as {
          context?: { selectedSymbols?: string[] };
        };

        const selectedSymbols = payload.context?.selectedSymbols ?? [];
        const expectedSymbols = ["BTC", "ETH", "SOL"];

        if (JSON.stringify(selectedSymbols) !== JSON.stringify(expectedSymbols)) {
          throw new Error(
            `Expected selectedSymbols ${JSON.stringify(expectedSymbols)}, received ${JSON.stringify(selectedSymbols)}.`,
          );
        }

        await route.fulfill({
          status: 200,
          headers: {
            "content-type": "text/event-stream; charset=utf-8",
            "cache-control": "no-cache",
          },
          body: createAssistantSse("List vs market comparison ready. Source: /api/coins\nAs of: 2026-03-02T12:01:00.000Z"),
        });
      });

      await page.goto("/assistant");
    });

    await test.step("Ask list-vs-market question and verify visible response", async () => {
      await page
        .getByPlaceholder(MESSAGE_INPUT_PLACEHOLDER)
        .fill("How is my selected list doing versus the market baseline?");
      await page.getByRole("button", { name: "Send" }).click();

      await expect(page.getByText(/List vs market comparison ready\./)).toBeVisible();
      await expect(page.getByText(/Source:\s*\/api\/coins/)).toBeVisible();
    });
  });
});
