"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Watchlist from "@/src/components/Watchlist";
import SortControls, { type SortDirection, type SortKey } from "@/src/components/SortControls";
import { mockCryptos, type Crypto } from "@/src/data/mockCryptos";

/* ── view definitions ── */
type ViewMode = "all" | "gainers" | "losers" | "volume";

const viewMeta: Record<ViewMode, { title: string }> = {
  all:     { title: "Market Cap" },
  gainers: { title: "Top Gainers" },
  losers:  { title: "Top Losers" },
  volume:  { title: "Highest Volume" },
};

function getDefaultSort(view: ViewMode): { key: SortKey; dir: SortDirection } {
  switch (view) {
    case "gainers": return { key: "change24h", dir: "desc" };
    case "losers":  return { key: "change24h", dir: "asc" };
    case "volume":  return { key: "volume24h", dir: "desc" };
    default:        return { key: "marketCap", dir: "desc" };
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

/* ── inner content (reads search-params) ── */
function HomeContent() {
  const searchParams = useSearchParams();
  const view = (searchParams.get("view") || "all") as ViewMode;

  const [sortKey, setSortKey] = useState<SortKey>(() => getDefaultSort(view).key);
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => getDefaultSort(view).dir);

  /* sync sort state when the navbar view changes */
  useEffect(() => {
    const defaults = getDefaultSort(view);
    setSortKey(defaults.key);
    setSortDirection(defaults.dir);
  }, [view]);

  const sorted = useMemo(
    () => sortCryptos(mockCryptos, sortKey, sortDirection),
    [sortKey, sortDirection],
  );

  const { title } = viewMeta[view];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl font-bold text-gray-100 sm:text-3xl">{title}</h2>
          <span className="ml-1 rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-gray-400">
            {mockCryptos.length}
          </span>
        </div>

        <SortControls
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortKeyChange={setSortKey}
          onDirectionToggle={() =>
            setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
          }
        />
      </div>

      <Watchlist cryptos={sorted} />
    </>
  );
}

/* ── page shell ── */
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense>
        <HomeContent />
      </Suspense>
    </main>
  );
}
