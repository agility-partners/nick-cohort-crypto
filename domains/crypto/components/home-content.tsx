"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";

import Watchlist from "./watchlist";
import type { Crypto } from "@/domains/crypto/types/crypto.types";
import { useWatchlist } from "@/domains/crypto/hooks/use-watchlist";
import { mockCryptos } from "@/domains/crypto/mock/cryptos.mock";
import {
  ADD_WATCHLIST_HREF,
  DEFAULT_VIEW,
  isViewMode,
  VIEW_META,
  VIEW_MODE,
  type ViewMode,
} from "@/domains/crypto/constants";

type SortOrder = "desc" | "asc";

const SORT_ORDER_LABEL: Record<SortOrder, string> = {
  desc: "High to low",
  asc: "Low to high",
};

const SEARCH_PLACEHOLDER = "Search coins";

function sortByViewAndOrder(cryptos: Crypto[], view: ViewMode, order: SortOrder): Crypto[] {
  const sorted = [...cryptos];

  if (view === VIEW_MODE.WATCHLIST) {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }

  if (view === VIEW_MODE.ALL) {
    sorted.sort((a, b) => a.marketCap - b.marketCap);
  } else if (view === VIEW_MODE.GAINERS || view === VIEW_MODE.LOSERS) {
    sorted.sort((a, b) => a.change24h - b.change24h);
  } else {
    sorted.sort((a, b) => a.volume24h - b.volume24h);
  }

  return order === "desc" ? sorted.reverse() : sorted;
}

function getMarketCryptos(view: ViewMode, order: SortOrder): Crypto[] {
  if (view === VIEW_MODE.WATCHLIST) {
    return [];
  }

  return sortByViewAndOrder(mockCryptos, view, order);
}

function filterCryptos(cryptos: Crypto[], query: string): Crypto[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return cryptos;
  }

  return cryptos.filter((crypto) => {
    const normalizedName = crypto.name.toLowerCase();
    const normalizedSymbol = crypto.symbol.toLowerCase();

    return (
      normalizedName.includes(normalizedQuery) || normalizedSymbol.includes(normalizedQuery)
    );
  });
}

/* ── component ── */
export default function HomeContent() {
  const searchParams = useSearchParams();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { watchlistIds } = useWatchlist();
  const hasWatchlist = isClient && watchlistIds.length > 0;
  const requestedView = searchParams.get("view");
  const defaultView = hasWatchlist ? DEFAULT_VIEW : VIEW_MODE.ALL;
  const resolvedView = isViewMode(requestedView) ? requestedView : defaultView;
  const view = !hasWatchlist && resolvedView === VIEW_MODE.WATCHLIST ? VIEW_MODE.ALL : resolvedView;
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchQuery, setSearchQuery] = useState("");

  const cryptoById = useMemo(
    () => new Map<string, Crypto>(mockCryptos.map((crypto) => [crypto.id, crypto])),
    [],
  );

  const watchlistCryptos = useMemo(
    () =>
      watchlistIds
        .map((cryptoId) => cryptoById.get(cryptoId))
        .filter((crypto): crypto is Crypto => Boolean(crypto)),
    [cryptoById, watchlistIds],
  );

  const orderedCryptos =
    view === VIEW_MODE.WATCHLIST
      ? sortByViewAndOrder(watchlistCryptos, view, sortOrder)
      : getMarketCryptos(view, sortOrder);

  const displayedCryptos = useMemo(
    () => filterCryptos(orderedCryptos, searchQuery),
    [orderedCryptos, searchQuery],
  );

  const { title } = VIEW_META[view];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">{title}</h2>
          <span className="ml-1 rounded-full bg-[var(--badge-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
            {displayedCryptos.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="crypto-search" className="sr-only">
            Search coins
          </label>
          <input
            id="crypto-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            className="w-44 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm backdrop-blur-xl outline-none transition-colors placeholder:text-[var(--text-muted)] hover:border-[var(--card-hover-border)] focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
          />

          {view !== VIEW_MODE.WATCHLIST && (
            <button
              type="button"
              onClick={() =>
                setSortOrder((currentOrder) => (currentOrder === "desc" ? "asc" : "desc"))
              }
              className="inline-flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] backdrop-blur-xl transition-colors hover:border-[var(--card-hover-border)] hover:text-[var(--accent)]"
            >
              {SORT_ORDER_LABEL[sortOrder]}
            </button>
          )}

          <Link
            href={ADD_WATCHLIST_HREF}
            className="inline-flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] backdrop-blur-xl transition-colors hover:border-[var(--card-hover-border)] hover:text-[var(--accent)]"
          >
            Add to watchlist
          </Link>
        </div>
      </div>

      <Watchlist cryptos={displayedCryptos} />
    </>
  );
}
