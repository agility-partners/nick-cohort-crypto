import type { Crypto } from "@/src/data/mockCryptos";

import CryptoCard from "./CryptoCard";

interface CryptoGridProps {
  cryptos: Crypto[];
}

/**
 * Renders a responsive grid of cryptocurrency cards with a fallback when no data is available.
 */
export default function CryptoGrid({ cryptos }: CryptoGridProps) {
  if (cryptos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] backdrop-blur-xl px-6 py-16 text-center">
        <span className="mb-3 text-4xl">📭</span>
        <p className="text-base font-medium text-gray-300">No cryptocurrencies found.</p>
        <p className="mt-1 text-sm text-gray-500">Add some coins to your watchlist to get started.</p>
      </div>
    );
  }

  return (
    <section
      aria-label="Cryptocurrency watchlist"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {cryptos.map((crypto) => (
        <CryptoCard key={crypto.id} crypto={crypto} />
      ))}
    </section>
  );
}