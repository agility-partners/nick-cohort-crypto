"use client";

import { FormEvent, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import {
  ASSISTANT_CLIENT_ERROR_FALLBACK,
  ASSISTANT_SUBTITLE,
  ASSISTANT_TITLE,
  CHAT_API_ROUTE,
} from "@/domains/assistant/constants/assistant.constants";
import { buildChatRequestContext } from "@/domains/assistant/utils/chat-request-context";

function getMessageText(parts: Array<{ type: string; text?: string }>): string {
  const textPart = parts.find((part) => part.type === "text");
  return textPart?.text ?? "";
}

export default function AssistantContent() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: CHAT_API_ROUTE,
      prepareSendMessagesRequest: async ({ body }) => {
        const context = await buildChatRequestContext();

        return {
          body: {
            ...(body ?? {}),
            context,
          },
        };
      },
    }),
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      return;
    }

    sendMessage({ text: trimmedInput });
    setInput("");
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-lg backdrop-blur-xl sm:p-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{ASSISTANT_TITLE}</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{ASSISTANT_SUBTITLE}</p>
      </header>

      <div className="min-h-96 space-y-3 rounded-xl border border-[var(--card-border)] bg-[var(--badge-bg)] p-3">
        {error ? (
          <article className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rose-300">
              Assistant Error
            </p>
            <p className="text-sm text-rose-100">{ASSISTANT_CLIENT_ERROR_FALLBACK}</p>
          </article>
        ) : null}

        {messages.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            Try: “Top 5 gainers and BTC dominance right now.”
          </p>
        ) : null}

        {messages.map((message) => {
          const content = getMessageText(message.parts);

          return (
            <article
              key={message.id}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-3"
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {message.role}
              </p>
              <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{content}</p>
            </article>
          );
        })}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          name="message"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about a coin, movers, or market summary..."
          className="w-full rounded-lg border border-[var(--card-border)] bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--ring-color)] placeholder:text-[var(--text-muted)] focus:ring"
        />
        <button
          type="submit"
          disabled={status === "streaming"}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "streaming" ? "Thinking..." : "Send"}
        </button>
      </form>
    </section>
  );
}