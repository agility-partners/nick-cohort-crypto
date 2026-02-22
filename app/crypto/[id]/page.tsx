import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ChartSection from "@/domains/crypto/components/chart-section";
import PriceDisplay from "@/domains/crypto/components/price-display";
import { COMPARE_PRESELECT_QUERY_KEY, COMPARE_VIEW_HREF } from "@/domains/crypto/constants";
import { fetchCoinById } from "@/domains/crypto/services/crypto-api";

interface CryptoDetailPageProps {
  params: Promise<{ id: string }>;
}

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CryptoDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const crypto = await fetchCoinById(id);

  if (!crypto) {
    return {
      title: "Crypto Not Found | CoinSight",
      description: "The requested cryptocurrency could not be found.",
    };
  }

  return {
    title: `${crypto.name} (${crypto.symbol}) | CoinSight`,
    description: `View ${crypto.name} market data in CoinSight.`,
  };
}

export default async function CryptoDetailPage({ params }: CryptoDetailPageProps) {
  const { id } = await params;
  const crypto = await fetchCoinById(id);

  if (!crypto) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-400 transition-colors hover:text-green-400"
        >
          ← Back to watchlist
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border p-6 shadow-lg backdrop-blur-xl sm:p-8" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)', boxShadow: '0 10px 15px -3px var(--shadow-color)' }}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div>
            <header className="mb-8 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <Image
                  src={crypto.image}
                  alt={`${crypto.name} logo`}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover ring-1 ring-white/10"
                  priority
                />
                <div className="min-w-0">
                  <h1 className="truncate text-3xl font-bold text-foreground sm:text-4xl">
                    {crypto.name}
                  </h1>
                  <p className="mt-1 text-sm font-medium uppercase tracking-wider text-gray-400">
                    {crypto.symbol}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pr-4 sm:pr-6">
                <PriceDisplay price={crypto.price} change={crypto.change24h} size="lg" />
              </div>
            </header>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                <dt className="text-xs uppercase tracking-wider text-gray-500">Market Cap</dt>
                <dd className="mt-2 text-xl font-semibold text-foreground">
                  {compactCurrencyFormatter.format(crypto.marketCap)}
                </dd>
              </div>

              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                <dt className="text-xs uppercase tracking-wider text-gray-500">24h Volume</dt>
                <dd className="mt-2 text-xl font-semibold text-foreground">
                  {compactCurrencyFormatter.format(crypto.volume24h)}
                </dd>
              </div>

              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                <dt className="text-xs uppercase tracking-wider text-gray-500">24h Change</dt>
                <dd
                  className={`mt-2 text-xl font-semibold ${crypto.change24h >= 0 ? "text-green-400" : "text-rose-400"}`}
                >
                  {crypto.change24h >= 0 ? "+" : ""}
                  {crypto.change24h.toFixed(2)}%
                </dd>
              </div>

              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                <dt className="text-xs uppercase tracking-wider text-gray-500">Circulating Supply</dt>
                <dd className="mt-2 text-xl font-semibold text-foreground">
                  {compactCurrencyFormatter.format(crypto.circulatingSupply)}
                </dd>
              </div>

              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                <dt className="text-xs uppercase tracking-wider text-gray-500">All-Time High</dt>
                <dd className="mt-2 text-xl font-semibold text-green-400">
                  ${crypto.allTimeHigh.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>

              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                <dt className="text-xs uppercase tracking-wider text-gray-500">All-Time Low</dt>
                <dd className="mt-2 text-xl font-semibold text-rose-400">
                  ${crypto.allTimeLow.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: crypto.allTimeLow < 0.01 ? 8 : 2,
                  })}
                </dd>
              </div>
            </dl>
          </div>

          <div className="min-w-0">
            <ChartSection
              cryptoId={crypto.id}
              symbol={crypto.symbol}
              price={crypto.price}
              change24h={crypto.change24h}
            />
            <div className="mt-4">
              <Link
                href={`${COMPARE_VIEW_HREF}&${COMPARE_PRESELECT_QUERY_KEY}=${crypto.id}`}
                className="inline-flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] backdrop-blur-xl transition-colors hover:border-[var(--card-hover-border)] hover:text-[var(--accent)]"
              >
                Compare with another coin
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
