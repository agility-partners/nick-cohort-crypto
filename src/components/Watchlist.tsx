"use client";

import type { Crypto } from "@/src/data/mockCryptos";

import CryptoGrid from "./CryptoGrid";

interface WatchlistProps {
  cryptos: Crypto[];
}

export default function Watchlist({ cryptos }: WatchlistProps) {
  return <CryptoGrid cryptos={cryptos} />;
}
