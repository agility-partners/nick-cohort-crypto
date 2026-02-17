"use client";

import { useMemo, useState } from "react";
import Watchlist from "@/src/components/Watchlist";
import SortControls, { type SortDirection, type SortKey } from "@/src/components/SortControls";
import { mockCryptos, type Crypto } from "@/src/data/mockCryptos";

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
      default:
        return 0;
    }
  });

  return dir === "desc" ? sorted.reverse() : sorted;
}

export default function Home() {
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sorted = useMemo(
    () => sortCryptos(mockCryptos, sortKey, sortDirection),
    [sortKey, sortDirection],
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        {/* header */}
        <header>
          <h1 className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl drop-shadow-[0_0_24px_rgba(34,197,94,0.3)] leading-tight pb-2">
            CoinSight
          </h1>
        </header>
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
    </main>
  );
}
