import type { ReactNode } from "react";

export interface WatchlistContextValue {
  watchlistIds: string[];
  isInWatchlist: (cryptoId: string) => boolean;
  addToWatchlist: (cryptoId: string) => void;
  removeFromWatchlist: (cryptoId: string) => void;
  toggleWatchlist: (cryptoId: string) => void;
  addManyToWatchlist: (cryptoIds: string[]) => void;
}

export interface WatchlistProviderProps {
  children: ReactNode;
}
