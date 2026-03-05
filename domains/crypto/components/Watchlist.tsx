"use client";

import type { Crypto } from "@/domains/crypto/types/crypto.types";

import CryptoGrid from "./crypto-grid";

interface WatchlistProps {
  cryptos: Crypto[];
  from?: string;
}

export default function Watchlist({ cryptos, from }: WatchlistProps) {
  return <CryptoGrid cryptos={cryptos} from={from} />;
}
