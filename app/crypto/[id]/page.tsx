import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import CryptoLogo from "@/src/components/CryptoLogo";
import PriceChart from "@/src/components/PriceChart";
import PriceDisplay from "@/src/components/PriceDisplay";
import { type Crypto, getCryptoById, mockCryptos } from "@/src/data/mockCryptos";

interface CryptoDetailPageProps {
  params: Promise<{ id: string }>;
}

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

function getSeedFromId(id: string) {
  return id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) || 1;
}

function createMockSeries(crypto: Crypto, points = 36) {
  const values: number[] = [];
  let seed = getSeedFromId(crypto.id);
  let current = Math.max(crypto.price * (1 - crypto.change24h / 100), 0.0001);
  const trendStep = (crypto.change24h / 100) / points;

  for (let index = 0; index < points; index += 1) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const random = seed / 4294967296;
    const noise = (random - 0.5) * 0.02;

    current = Math.max(current * (1 + trendStep + noise), 0.0001);
    values.push(current);
  }

  values[values.length - 1] = crypto.price;
  return values;
}

export function generateStaticParams() {
  return mockCryptos.map((crypto) => ({ id: crypto.id }));
}

export async function generateMetadata({ params }: CryptoDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const crypto = getCryptoById(id);

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
  const crypto = getCryptoById(id);

  if (!crypto) {
    notFound();
  }

  const mockSeries = createMockSeries(crypto);

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

      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-lg shadow-black/20 backdrop-blur-xl sm:p-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div>
            <header className="mb-8 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <CryptoLogo
                  src={crypto.image}
                  name={crypto.name}
                  symbol={crypto.symbol}
                  size={56}
                  className="h-14 w-14 rounded-full object-cover ring-1 ring-white/10"
                  priority
                />
                <div className="min-w-0">
                  <h1 className="truncate text-3xl font-bold text-gray-100 sm:text-4xl">{crypto.name}</h1>
                  <p className="mt-1 text-sm font-medium uppercase tracking-wider text-gray-400">
                    {crypto.symbol}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pr-4 sm:pr-6">
                <PriceDisplay price={crypto.price} change={crypto.change24h} size="lg" />
              </div>
            </header>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <dt className="text-xs uppercase tracking-wider text-gray-500">Market Cap</dt>
                <dd className="mt-2 text-xl font-semibold text-gray-100">
                  {compactCurrencyFormatter.format(crypto.marketCap)}
                </dd>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <dt className="text-xs uppercase tracking-wider text-gray-500">24h Volume</dt>
                <dd className="mt-2 text-xl font-semibold text-gray-100">
                  {compactCurrencyFormatter.format(crypto.volume24h)}
                </dd>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <dt className="text-xs uppercase tracking-wider text-gray-500">24h Change</dt>
                <dd
                  className={`mt-2 text-xl font-semibold ${crypto.change24h >= 0 ? "text-green-400" : "text-rose-400"}`}
                >
                  {crypto.change24h >= 0 ? "+" : ""}
                  {crypto.change24h.toFixed(2)}%
                </dd>
              </div>
            </dl>
          </div>

          <div className="min-w-0 xl:mt-8">
            <PriceChart values={mockSeries} symbol={crypto.symbol} />
          </div>
        </div>
      </section>
    </main>
  );
}