"use client";

import Link from "next/link";

import type { Crypto } from "@/src/data/mockCryptos";

import CryptoLogo from "./CryptoLogo";
import PriceDisplay from "./PriceDisplay";

interface CryptoCardProps {
  crypto: Crypto;
}

/**
 * Presents summary information for a single cryptocurrency inside a
 * glassmorphic card that links to its detail route.
 */
export default function CryptoCard({ crypto }: CryptoCardProps) {
  return (
    <Link
      href={`/crypto/${crypto.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:border-green-500/30 hover:bg-white/[0.08] hover:shadow-green-500/10"
      aria-label={`View details for ${crypto.name}`}
    >
      {/* subtle top-edge gradient accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {/* inner glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-green-500/[0.06] to-transparent" />

      <article className="flex items-center justify-between gap-4">
        <header className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
            <CryptoLogo
              src={crypto.image}
              name={crypto.name}
              symbol={crypto.symbol}
              size={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-gray-100">{crypto.name}</h2>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{crypto.symbol}</p>
          </div>
        </header>

        <PriceDisplay price={crypto.price} change={crypto.change24h} />
      </article>
    </Link>
  );
}