import { test } from "@playwright/test";
import { registerE2ELogging } from "./utils/test-logging";
import {
  AssistantPage,
  CHAT_ROUTE,
  UNKNOWN_SYMBOL_FALLBACK,
  TOOL_FAILURE_FALLBACK,
  createAssistantSse,
  createChunkedAssistantSse,
  mockAssistantResponse,
} from "./pages/AssistantPage";

test.describe("Assistant flows", () => {
  registerE2ELogging("Assistant flows");

  test("shows assistant response from streamed chat payload", async ({ page }) => {
    const assistant = new AssistantPage(page);

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

      await assistant.goto();
      await assistant.isLoaded();
    });

    await test.step("Send prompt and verify streamed assistant text appears", async () => {
      await assistant.fillAndSend("Top movers right now");

      await assistant.expectResponseText(/Market snapshot: BTC is active\./);
      await assistant.expectResponseText(/Source:\s*\/api\/coins/);
      await assistant.expectResponseText(/As of:\s*2026-03-02T12:00:00.000Z/);
    });
  });

  test("shows graceful unknown symbol message", async ({ page }) => {
    const assistant = new AssistantPage(page);

    await test.step("Mock unknown-symbol fallback response", async () => {
      await mockAssistantResponse(page, UNKNOWN_SYMBOL_FALLBACK);
      await assistant.goto();
    });

    await test.step("Submit unknown symbol question and verify safe fallback text", async () => {
      await assistant.fillAndSend("Price for QQQNOTREAL");
      await assistant.expectResponseText(UNKNOWN_SYMBOL_FALLBACK);
    });
  });

  test("shows friendly tool failure fallback message", async ({ page }) => {
    const assistant = new AssistantPage(page);

    await test.step("Mock tool failure fallback response", async () => {
      await mockAssistantResponse(page, TOOL_FAILURE_FALLBACK);
      await assistant.goto();
    });

    await test.step("Submit market question and verify fallback message", async () => {
      await assistant.fillAndSend("Give me a current market summary");
      await assistant.expectResponseText(TOOL_FAILURE_FALLBACK);
    });
  });

  test("uses compare symbols context for list-vs-market questions", async ({ context, page }) => {
    const assistant = new AssistantPage(page);

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

      await assistant.goto();
    });

    await test.step("Ask list-vs-market question and verify visible response", async () => {
      await assistant.fillAndSend("How is my selected list doing versus the market baseline?");

      await assistant.expectResponseText(/List vs market comparison ready\./);
      await assistant.expectResponseText(/Source:\s*\/api\/coins/);
    });
  });
});
