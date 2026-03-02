"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import {
  ASSISTANT_CLIENT_ERROR_FALLBACK,
  ASSISTANT_SUBTITLE,
  ASSISTANT_TITLE,
} from "@/domains/assistant/constants/assistant.constants";
import { useAssistantChat } from "@/domains/assistant/hooks/use-assistant-chat";

function getMessageText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

function RobotIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a1 1 0 0 1 1 1v1.07A7.002 7.002 0 0 1 19 11v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-5a7.002 7.002 0 0 1 6-6.93V3a1 1 0 0 1 1-1ZM9.5 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM3 12a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm18 0a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export default function AssistantContent() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status, error } = useAssistantChat();

  const isLoading = status === "submitted" || status === "streaming";

  const lastMessage = messages[messages.length - 1];
  const lastAssistantText =
    lastMessage?.role === "assistant" ? getMessageText(lastMessage.parts) : "";
  const showTypingIndicator = isLoading && !lastAssistantText;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput || isLoading) {
      return;
    }

    sendMessage({ text: trimmedInput });
    setInput("");
  }

  return (
    <section className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-black">
          <RobotIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-[var(--text-primary)]">{ASSISTANT_TITLE}</h1>
          <p className="text-xs text-[var(--text-muted)]">{ASSISTANT_SUBTITLE}</p>
        </div>
      </header>

      <div className="mx-auto h-px w-full max-w-3xl bg-[var(--card-border)]" />

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6"
      >
        {error ? (
          <div className="mx-auto my-2 max-w-xs rounded-lg bg-rose-500/10 px-4 py-2 text-center text-sm text-rose-300">
            {ASSISTANT_CLIENT_ERROR_FALLBACK}
          </div>
        ) : null}

        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.29 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.68-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">Ask me anything about crypto</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">I have access to live market data, prices, and trends.</p>
            </div>
            <p className="rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-xs text-[var(--text-muted)]">
              Try: &quot;Top 5 gainers and BTC dominance right now.&quot;
            </p>
          </div>
        ) : null}

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {messages.map((message) => {
            const content = getMessageText(message.parts);
            const isUser = message.role === "user";

            if (!isUser && !content && isLoading) return null;

            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser ? (
                  <div className="mr-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-black">
                    <RobotIcon className="h-4 w-4" />
                  </div>
                ) : null}

                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? "rounded-br-md border border-[var(--user-msg-border)] bg-[var(--user-msg-bg)] backdrop-blur-xl text-[var(--text-primary)]"
                      : "rounded-bl-md border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm text-[var(--text-primary)]"
                  }`}
                >
                  {content}
                </div>

                {isUser ? (
                  <div className="ml-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--text-muted)]/20 text-[10px] font-bold text-[var(--text-muted)]">
                    You
                  </div>
                ) : null}
              </div>
            );
          })}

          {showTypingIndicator ? (
            <div className="flex justify-start">
              <div className="mr-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-black">
                <RobotIcon className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-bl-md border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="animate-typing-dot inline-block h-2 w-2 rounded-full bg-[var(--accent)]" style={{ animationDelay: "0ms" }} />
                  <span className="animate-typing-dot inline-block h-2 w-2 rounded-full bg-[var(--accent)]" style={{ animationDelay: "200ms" }} />
                  <span className="animate-typing-dot inline-block h-2 w-2 rounded-full bg-[var(--accent)]" style={{ animationDelay: "400ms" }} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-8 pt-2">
        <form
          onSubmit={onSubmit}
          className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 backdrop-blur-xl"
        >
          <input
            name="message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about any coin, market trends, or portfolio ideas..."
            className="flex-1 bg-transparent px-1 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-black transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}
