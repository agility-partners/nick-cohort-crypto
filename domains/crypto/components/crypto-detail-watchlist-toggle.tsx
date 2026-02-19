"use client";

import {
  WATCHLIST_STATUS_TEXT,
  WATCHLIST_TOGGLE_ARIA_LABEL,
} from "@/domains/crypto/constants";
import { useWatchlist } from "@/domains/crypto/hooks/use-watchlist";

interface CryptoDetailWatchlistToggleProps {
  cryptoId: string;
}

export default function CryptoDetailWatchlistToggle({
  cryptoId,
}: CryptoDetailWatchlistToggleProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const isAdded = isInWatchlist(cryptoId);

  const statusText = isAdded ? WATCHLIST_STATUS_TEXT.ADDED : WATCHLIST_STATUS_TEXT.ADD;
  const ariaLabel = isAdded
    ? WATCHLIST_TOGGLE_ARIA_LABEL.REMOVE
    : WATCHLIST_TOGGLE_ARIA_LABEL.ADD;

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="rounded-full bg-[var(--badge-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
        {statusText}
      </span>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={isAdded}
        onClick={() => toggleWatchlist(cryptoId)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-secondary)] transition-colors hover:border-[var(--card-hover-border)] hover:text-[var(--accent)]"
      >
        <svg
          viewBox="0 0 24 24"
          fill={isAdded ? "currentColor" : "none"}
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.42 4.37a1 1 0 00.95.69h4.595c.969 0 1.371 1.24.588 1.81l-3.717 2.7a1 1 0 00-.364 1.118l1.42 4.37c.3.921-.755 1.688-1.538 1.118l-3.717-2.7a1 1 0 00-1.176 0l-3.717 2.7c-.783.57-1.838-.197-1.539-1.118l1.42-4.37a1 1 0 00-.363-1.118l-3.718-2.7c-.783-.57-.38-1.81.588-1.81h4.596a1 1 0 00.95-.69l1.42-4.37z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
