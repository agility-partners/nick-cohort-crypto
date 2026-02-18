"use client";

import type { Crypto } from "@/domains/crypto/types/crypto.types";

import CryptoGrid from "./crypto-grid";

interface WatchlistProps {
  cryptos: Crypto[];
}

export default function Watchlist({ cryptos }: WatchlistProps) {
  return <CryptoGrid cryptos={cryptos} />;
}
