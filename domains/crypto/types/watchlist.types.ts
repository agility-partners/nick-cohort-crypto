import type { ReactNode } from "react";

export interface WatchlistContextValue {
  watchlistIds: string[];
  isInWatchlist: (cryptoId: string) => boolean;
  addToWatchlist: (cryptoId: string) => Promise<void>;
  removeFromWatchlist: (cryptoId: string) => Promise<void>;
  toggleWatchlist: (cryptoId: string) => Promise<void>;
  addManyToWatchlist: (cryptoIds: string[]) => Promise<void>;
}

export interface WatchlistProviderProps {
  children: ReactNode;
}
