"use client";

import type { Crypto } from "@/domains/crypto/mock/cryptos.mock";

import CryptoGrid from "./CryptoGrid";

interface WatchlistProps {
  cryptos: Crypto[];
}

export default function Watchlist({ cryptos }: WatchlistProps) {
  return <CryptoGrid cryptos={cryptos} />;
}
