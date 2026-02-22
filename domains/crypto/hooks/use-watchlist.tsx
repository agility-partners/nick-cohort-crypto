"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  addToWatchlist as addToWatchlistRequest,
  fetchWatchlist,
  removeFromWatchlist as removeFromWatchlistRequest,
} from "@/domains/crypto/services/crypto-api";
import type {
  WatchlistContextValue,
  WatchlistProviderProps,
} from "@/domains/crypto/types/watchlist.types";

const WatchlistContext = createContext<WatchlistContextValue | undefined>(undefined);

export function WatchlistProvider({ children }: WatchlistProviderProps) {
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadWatchlist() {
      const watchlistCoins = await fetchWatchlist();
      if (!isMounted) {
        return;
      }

      setWatchlistIds(watchlistCoins.map((coin) => coin.id));
    }

    void loadWatchlist();

    return () => {
      isMounted = false;
    };
  }, []);

  const isInWatchlist = useCallback(
    (cryptoId: string) => watchlistIds.includes(cryptoId),
    [watchlistIds],
  );

  const addToWatchlist = useCallback(async (cryptoId: string) => {
    const result = await addToWatchlistRequest(cryptoId);
    if (!result || result === "not-found" || !result.coin) {
      return;
    }

    const addedCoinId = result.coin.id;

    setWatchlistIds((currentIds) => {
      if (currentIds.includes(addedCoinId)) {
        return currentIds;
      }

      return [...currentIds, addedCoinId];
    });
  }, []);

  const removeFromWatchlist = useCallback(async (cryptoId: string) => {
    const removed = await removeFromWatchlistRequest(cryptoId);
    if (!removed) {
      return;
    }

    setWatchlistIds((currentIds) => currentIds.filter((currentId) => currentId !== cryptoId));
  }, []);

  const toggleWatchlist = useCallback(
    async (cryptoId: string) => {
      if (watchlistIds.includes(cryptoId)) {
        await removeFromWatchlist(cryptoId);
        return;
      }

      await addToWatchlist(cryptoId);
    },
    [addToWatchlist, removeFromWatchlist, watchlistIds],
  );

  const addManyToWatchlist = useCallback(
    async (cryptoIds: string[]) => {
      await Promise.all(cryptoIds.map((cryptoId) => addToWatchlist(cryptoId)));
    },
    [addToWatchlist],
  );

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
