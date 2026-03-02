"use client";

import { createContext, useContext, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { CHAT_API_ROUTE } from "@/domains/assistant/constants/assistant.constants";
import { buildChatRequestContext } from "@/domains/assistant/utils/chat-request-context";

type ChatContextValue = ReturnType<typeof useChat>;

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: CHAT_API_ROUTE,
      prepareSendMessagesRequest: async ({ body, messages: requestMessages }) => {
        const context = await buildChatRequestContext();

        return {
          body: {
            ...(body ?? {}),
            messages: requestMessages,
            context,
          },
        };
      },
    }),
  });

  const value = useMemo(() => chat, [chat]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useAssistantChat(): ChatContextValue {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useAssistantChat must be used within a ChatProvider");
  }

  return context;
}
