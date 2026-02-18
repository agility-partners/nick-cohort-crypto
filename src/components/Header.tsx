import Link from "next/link";
import { mockCryptos } from "@/src/data/mockCryptos";

const compactFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

export default function Header() {
  const totalCoins = mockCryptos.length;
  const totalMarketCap = mockCryptos.reduce((sum, c) => sum + c.marketCap, 0);
  const avgChange =
    mockCryptos.reduce((sum, c) => sum + c.change24h, 0) / mockCryptos.length;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0f0d]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/25 transition-shadow group-hover:shadow-green-500/40">
            <span className="text-sm font-bold tracking-tight text-white">CS</span>
          </div>
          <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-xl font-extrabold tracking-tight text-transparent sm:text-2xl">
            CoinSight
          </span>
        </Link>

        {/* Market snapshot chips */}
        <div className="hidden items-center gap-2 sm:flex">
          <StatChip label="Coins" value={String(totalCoins)} />
          <StatChip
            label="Total MCap"
            value={compactFormatter.format(totalMarketCap)}
          />
          <StatChip
            label="Avg 24h"
            value={`${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`}
            color={avgChange >= 0 ? "positive" : "negative"}
          />
        </div>
      </div>
    </header>
  );
}

/* ── tiny stat badge used inside the header ── */
function StatChip({
  label,
  value,
  color = "neutral",
}: {
  label: string;
  value: string;
  color?: "positive" | "negative" | "neutral";
}) {
  const valueColor =
    color === "positive"
      ? "text-green-400"
      : color === "negative"
        ? "text-rose-400"
        : "text-gray-200";

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">
      <span className="text-[11px] uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <span className={`text-xs font-semibold ${valueColor}`}>{value}</span>
    </div>
  );
}
