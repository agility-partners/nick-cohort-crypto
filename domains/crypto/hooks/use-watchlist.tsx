"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { WATCHLIST_STORAGE_KEY } from "@/domains/crypto/constants";
import type {
  WatchlistContextValue,
  WatchlistProviderProps,
} from "@/domains/crypto/types/watchlist.types";

const WatchlistContext = createContext<WatchlistContextValue | undefined>(undefined);

function sanitizeWatchlistIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueIds: string[] = [];

  value.forEach((entry) => {
    if (typeof entry === "string" && !uniqueIds.includes(entry)) {
      uniqueIds.push(entry);
    }
  });

  return uniqueIds;
}

export function WatchlistProvider({ children }: WatchlistProviderProps) {
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);

    if (!storedValue) {
      setIsHydrated(true);
      return;
    }

    try {
      const parsedValue = JSON.parse(storedValue) as unknown;
      setWatchlistIds(sanitizeWatchlistIds(parsedValue));
    } catch {
      setWatchlistIds([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlistIds));
  }, [isHydrated, watchlistIds]);

  const isInWatchlist = useCallback(
    (cryptoId: string) => watchlistIds.includes(cryptoId),
    [watchlistIds],
  );

  const addToWatchlist = useCallback((cryptoId: string) => {
    setWatchlistIds((currentIds) => {
      if (currentIds.includes(cryptoId)) {
        return currentIds;
      }

      return [...currentIds, cryptoId];
    });
  }, []);

  const removeFromWatchlist = useCallback((cryptoId: string) => {
    setWatchlistIds((currentIds) => currentIds.filter((currentId) => currentId !== cryptoId));
  }, []);

  const toggleWatchlist = useCallback((cryptoId: string) => {
    setWatchlistIds((currentIds) => {
      if (currentIds.includes(cryptoId)) {
        return currentIds.filter((currentId) => currentId !== cryptoId);
      }

      return [...currentIds, cryptoId];
    });
  }, []);

  const addManyToWatchlist = useCallback((cryptoIds: string[]) => {
    setWatchlistIds((currentIds) => {
      const nextIds = [...currentIds];

      cryptoIds.forEach((cryptoId) => {
        if (!nextIds.includes(cryptoId)) {
          nextIds.push(cryptoId);
        }
      });

      return nextIds;
    });
  }, []);

  const value = useMemo(
    () => ({
      watchlistIds,
      isInWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      addManyToWatchlist,
    }),
    [addManyToWatchlist, addToWatchlist, isInWatchlist, removeFromWatchlist, toggleWatchlist, watchlistIds],
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist(): WatchlistContextValue {
  const context = useContext(WatchlistContext);

  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }

  return context;
}
