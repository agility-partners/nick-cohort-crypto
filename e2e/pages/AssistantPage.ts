import { expect, type Locator, type Page } from "@playwright/test";

const MESSAGE_INPUT_PLACEHOLDER = "Ask about any coin, market trends, or portfolio ideas...";

export const UNKNOWN_SYMBOL_FALLBACK =
  "I couldn't find market data for that symbol in the current dataset. Please verify the ticker and try again.";
export const TOOL_FAILURE_FALLBACK =
  "I'm having trouble reaching market-data tools right now. Please try again shortly.";

export class AssistantPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1, name: "CoinBOT" });
    this.messageInput = page.getByPlaceholder(MESSAGE_INPUT_PLACEHOLDER);
    this.sendButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto("/assistant");
  }

  async isLoaded() {
    await expect(this.heading).toBeVisible();
  }

  async fillMessage(text: string) {
    await this.messageInput.fill(text);
  }

  async sendMessage() {
    await this.sendButton.click();
  }

  async fillAndSend(text: string) {
    await this.fillMessage(text);
    await this.sendMessage();
  }

  async expectResponseText(text: string | RegExp) {
    await expect(this.page.getByText(text)).toBeVisible();
  }
}

export function createAssistantSse(text: string): string {
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

export function createChunkedAssistantSse(deltas: string[]): string {
  const textId = "assistant-text-stream";
  const chunks: Array<Record<string, string>> = [
    { type: "start", messageId: "assistant-message-stream" },
    { type: "text-start", id: textId },
  ];

  deltas.forEach((delta) => {
    chunks.push({ type: "text-delta", id: textId, delta });
  });

  chunks.push({ type: "text-end", id: textId });
  chunks.push({ type: "finish", finishReason: "stop" });

  return `${chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("")}data: [DONE]\n\n`;
}

export const CHAT_ROUTE = "**/api/chat";

export async function mockAssistantResponse(page: Page, text: string): Promise<void> {
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
