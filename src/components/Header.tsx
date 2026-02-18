import Link from "next/link";
import { mockCryptos } from "@/src/data/mockCryptos";
import CoinSightLogo from "./CoinSightLogo";
import ThemeToggle from "./ThemeToggle";

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
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5">
          <CoinSightLogo size={36} className="drop-shadow-lg transition-transform group-hover:scale-105" />
          <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-xl font-extrabold tracking-tight text-transparent sm:text-2xl">
            CoinSight
          </span>
        </Link>

        {/* Market snapshot chips + theme toggle */}
        <div className="flex items-center gap-2">
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
          <ThemeToggle />
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
      ? "text-[var(--positive)]"
      : color === "negative"
        ? "text-[var(--negative)]"
        : "text-[var(--text-primary)]";

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-2.5 py-1">
      <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </span>
      <span className={`text-xs font-semibold ${valueColor}`}>{value}</span>
    </div>
  );
}
