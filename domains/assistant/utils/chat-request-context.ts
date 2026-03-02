import { z } from "zod";

import {
  API_COINS_PATH,
  MAX_SELECTED_SYMBOLS,
  MAX_SYMBOL_LENGTH,
} from "@/domains/assistant/constants/assistant.constants";
import type { ChatRequestContext } from "@/domains/assistant/types/assistant.types";
import { COMPARE_STORAGE_KEY } from "@/domains/crypto/constants";

const coinLookupSchema = z.array(
  z.object({
    id: z.string(),
    symbol: z.string().trim().min(2).max(MAX_SYMBOL_LENGTH),
  }),
);

function sanitizeCompareIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueIds: string[] = [];

  value.forEach((entry) => {
    if (typeof entry === "string" && !uniqueIds.includes(entry)) {
      uniqueIds.push(entry);
    }
  });

  return uniqueIds.slice(0, MAX_SELECTED_SYMBOLS);
}

export async function buildChatRequestContext(): Promise<ChatRequestContext> {
  const storedValue = window.localStorage.getItem(COMPARE_STORAGE_KEY);

  if (!storedValue) {
    return {};
  }

  let compareIds: string[] = [];

  try {
    compareIds = sanitizeCompareIds(JSON.parse(storedValue) as unknown);
  } catch {
    return {};
  }

  if (compareIds.length === 0) {
    return {};
  }

  try {
    const response = await fetch(API_COINS_PATH, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return {};
    }

    const payload = (await response.json()) as unknown;
    const parsedCoins = coinLookupSchema.safeParse(payload);

    if (!parsedCoins.success) {
      return {};
    }

    const symbols: string[] = [];

    compareIds.forEach((compareId) => {
      const matchingCoin = parsedCoins.data.find((coin) => coin.id === compareId);

      if (matchingCoin) {
        const symbol = matchingCoin.symbol.toUpperCase();

        if (!symbols.includes(symbol)) {
          symbols.push(symbol);
        }
      }
    });

    if (symbols.length === 0) {
      return {};
    }

    return {
      selectedSymbols: symbols.slice(0, MAX_SELECTED_SYMBOLS),
    };
  } catch {
    return {};
  }
}
