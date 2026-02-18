"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import Watchlist from "./watchlist";
import type { Crypto, SortKey, SortDirection } from "@/domains/crypto/types/crypto.types";
import SortControls from "./sort-controls";
import { mockCryptos } from "@/domains/crypto/mock/cryptos.mock";
import { VIEW_MODE, VIEW_META, type ViewMode } from "@/domains/crypto/constants";

function getDefaultSort(view: ViewMode): { key: SortKey; dir: SortDirection } {
  switch (view) {
    case VIEW_MODE.GAINERS:
      return { key: "change24h", dir: "desc" };
    case VIEW_MODE.LOSERS:
      return { key: "change24h", dir: "asc" };
    case VIEW_MODE.VOLUME:
      return { key: "volume24h", dir: "desc" };
    default:
      return { key: "marketCap", dir: "desc" };
  }
}

/* ── sorting helper ── */
function sortCryptos(cryptos: Crypto[], key: SortKey, dir: SortDirection): Crypto[] {
  const sorted = [...cryptos].sort((a, b) => {
    switch (key) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price":
        return a.price - b.price;
      case "change24h":
        return a.change24h - b.change24h;
      case "marketCap":
        return a.marketCap - b.marketCap;
      case "volume24h":
        return a.volume24h - b.volume24h;
      default:
        return 0;
    }
  });

  return dir === "desc" ? sorted.reverse() : sorted;
}

function filterCryptos(cryptos: Crypto[], query: string): Crypto[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return cryptos;
  }

  return cryptos.filter(({ name, symbol }) => {
    const normalizedName = name.toLowerCase();
    const normalizedSymbol = symbol.toLowerCase();

    return (
      normalizedName.includes(normalizedQuery) || normalizedSymbol.includes(normalizedQuery)
    );
  });
}

/* ── component ── */
export default function HomeContent() {
  const searchParams = useSearchParams();
  const view = (searchParams.get("view") || VIEW_MODE.ALL) as ViewMode;

  const [sortKey, setSortKey] = useState<SortKey>(() => getDefaultSort(view).key);
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => getDefaultSort(view).dir);
  const [searchQuery, setSearchQuery] = useState("");

  /* sync sort state when the navbar view changes */
  useEffect(() => {
    const defaults = getDefaultSort(view);
    setSortKey(defaults.key);
    setSortDirection(defaults.dir);
  }, [view]);

  const filteredAndSorted = useMemo(() => {
    const filtered = filterCryptos(mockCryptos, searchQuery);
    return sortCryptos(filtered, sortKey, sortDirection);
  }, [searchQuery, sortKey, sortDirection]);

  const { title } = VIEW_META[view];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">{title}</h2>
          <span className="ml-1 rounded-full bg-[var(--badge-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
            {filteredAndSorted.length}
          </span>
        </div>

        <SortControls
          sortKey={sortKey}
          sortDirection={sortDirection}
          searchQuery={searchQuery}
          onSortKeyChange={setSortKey}
          onSearchQueryChange={setSearchQuery}
          onDirectionToggle={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
        />
      </div>

      <Watchlist cryptos={filteredAndSorted} />
    </>
  );
}
