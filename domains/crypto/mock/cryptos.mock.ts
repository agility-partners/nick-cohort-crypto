import type { Crypto } from "@/domains/crypto/types/crypto.types";

export type { Crypto };

export const mockCryptos: Crypto[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    price: 68245.12,
    change24h: 2.14,
    marketCap: 1340000000000,
    volume24h: 31200000000,
    image: "https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png",
    circulatingSupply: 19000000, // Mock data
    allTimeHigh: 69000, // Mock data
    allTimeLow: 65, // Mock data
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    price: 3489.77,
    change24h: -1.08,
    marketCap: 419000000000,
    volume24h: 16800000000,
    image: "https://coin-images.coingecko.com/coins/images/279/small/ethereum.png",
    circulatingSupply: 120000000, // Mock data
    allTimeHigh: 4800, // Mock data
    allTimeLow: 0.42, // Mock data
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    price: 161.43,
    change24h: 4.62,
    marketCap: 74400000000,
    volume24h: 2900000000,
    image: "https://coin-images.coingecko.com/coins/images/4128/small/solana.png",
    circulatingSupply: 370000000, // Mock data
    allTimeHigh: 260, // Mock data
    allTimeLow: 0.5, // Mock data
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    price: 0.74,
    change24h: -0.89,
    marketCap: 26200000000,
    volume24h: 680000000,
    image: "https://coin-images.coingecko.com/coins/images/975/small/cardano.png",
    circulatingSupply: 35000000000, // Mock data
    allTimeHigh: 3.1, // Mock data
    allTimeLow: 0.02, // Mock data
  },
  {
    id: "ripple",
    name: "XRP",
    symbol: "XRP",
    price: 0.63,
    change24h: 1.73,
    marketCap: 34700000000,
    volume24h: 1240000000,
    image: "https://coin-images.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
    circulatingSupply: 55000000000, // Mock data
    allTimeHigh: 3.84, // Mock data
    allTimeLow: 0.002, // Mock data
  },
  {
    id: "binancecoin",
    name: "BNB",
    symbol: "BNB",
    price: 578.21,
    change24h: -2.31,
    marketCap: 84200000000,
    volume24h: 1570000000,
    image: "https://coin-images.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    circulatingSupply: 156000000, // Mock data
    allTimeHigh: 686, // Mock data
    allTimeLow: 0.0398, // Mock data
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    symbol: "DOGE",
    price: 0.15,
    change24h: 5.04,
    marketCap: 21900000000,
    volume24h: 930000000,
    image: "https://coin-images.coingecko.com/coins/images/5/small/dogecoin.png",
    circulatingSupply: 145000000000, // Mock data
    allTimeHigh: 0.74, // Mock data
    allTimeLow: 0.0002, // Mock data
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    price: 38.56,
    change24h: -1.44,
    marketCap: 14600000000,
    volume24h: 540000000,
    image:
      "https://coin-images.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
    circulatingSupply: 380000000, // Mock data
    allTimeHigh: 145, // Mock data
    allTimeLow: 0.26, // Mock data
  },
  {
    id: "polkadot",
    name: "Polkadot",
    symbol: "DOT",
    price: 7.82,
    change24h: 3.15,
    marketCap: 10700000000,
    volume24h: 320000000,
    image: "https://coin-images.coingecko.com/coins/images/12171/small/polkadot.png",
    circulatingSupply: 1368000000, // Mock data
    allTimeHigh: 54.98, // Mock data
    allTimeLow: 0.12, // Mock data
  },
  {
    id: "chainlink",
    name: "Chainlink",
    symbol: "LINK",
    price: 18.45,
    change24h: 1.92,
    marketCap: 11200000000,
    volume24h: 580000000,
    image: "https://coin-images.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
    circulatingSupply: 607000000, // Mock data
    allTimeHigh: 52, // Mock data
    allTimeLow: 0.09, // Mock data
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    price: 0.58,
    change24h: -2.67,
    marketCap: 5400000000,
    volume24h: 290000000,
    image: "https://coin-images.coingecko.com/coins/images/4713/small/polygon.png",
    circulatingSupply: 9300000000, // Mock data
    allTimeHigh: 2.92, // Mock data
    allTimeLow: 0.003, // Mock data
  },
  {
    id: "litecoin",
    name: "Litecoin",
    symbol: "LTC",
    price: 92.34,
    change24h: 0.87,
    marketCap: 6900000000,
    volume24h: 410000000,
    image: "https://coin-images.coingecko.com/coins/images/2/small/litecoin.png",
    circulatingSupply: 73500000, // Mock data
    allTimeHigh: 420, // Mock data
    allTimeLow: 1.15, // Mock data
  },
  {
    id: "uniswap",
    name: "Uniswap",
    symbol: "UNI",
    price: 11.27,
    change24h: -3.41,
    marketCap: 8500000000,
    volume24h: 260000000,
    image: "https://cryptologos.cc/logos/uniswap-uni-logo.png",
    circulatingSupply: 750000000, // Mock data
    allTimeHigh: 44.92, // Mock data
    allTimeLow: 0.44, // Mock data
  },
  {
    id: "cosmos",
    name: "Cosmos",
    symbol: "ATOM",
    price: 9.14,
    change24h: 2.08,
    marketCap: 3600000000,
    volume24h: 180000000,
    image: "https://coin-images.coingecko.com/coins/images/1481/small/cosmos_hub.png",
    circulatingSupply: 392000000, // Mock data
    allTimeHigh: 20.15, // Mock data
    allTimeLow: 0.51, // Mock data
  },
  {
    id: "stellar",
    name: "Stellar",
    symbol: "XLM",
    price: 0.12,
    change24h: 1.35,
    marketCap: 3500000000,
    volume24h: 120000000,
    image: "https://coin-images.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png",
    circulatingSupply: 29000000000, // Mock data
    allTimeHigh: 0.88, // Mock data
    allTimeLow: 0.0009, // Mock data
  },
  {
    id: "near",
    name: "NEAR Protocol",
    symbol: "NEAR",
    price: 5.67,
    change24h: 6.23,
    marketCap: 6200000000,
    volume24h: 340000000,
    image: "https://coin-images.coingecko.com/coins/images/10365/small/near.jpg",
    circulatingSupply: 1090000000, // Mock data
    allTimeHigh: 20.76, // Mock data
    allTimeLow: 0.098, // Mock data
  },
  {
    id: "filecoin",
    name: "Filecoin",
    symbol: "FIL",
    price: 5.89,
    change24h: -1.76,
    marketCap: 3200000000,
    volume24h: 150000000,
    image: "https://coin-images.coingecko.com/coins/images/12817/small/filecoin.png",
    circulatingSupply: 543000000, // Mock data
    allTimeHigh: 209, // Mock data
    allTimeLow: 0.49, // Mock data
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    symbol: "ARB",
    price: 1.14,
    change24h: 4.38,
    marketCap: 4600000000,
    volume24h: 420000000,
    image:
      "https://coin-images.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
    circulatingSupply: 4030000000, // Mock data
    allTimeHigh: 2.81, // Mock data
    allTimeLow: 0.61, // Mock data
  },
  {
    id: "optimism",
    name: "Optimism",
    symbol: "OP",
    price: 2.53,
    change24h: 3.72,
    marketCap: 3100000000,
    volume24h: 210000000,
    image: "https://coin-images.coingecko.com/coins/images/25244/small/Optimism.png",
    circulatingSupply: 1220000000, // Mock data
    allTimeHigh: 4.68, // Mock data
    allTimeLow: 0.34, // Mock data
  },
  {
    id: "aptos",
    name: "Aptos",
    symbol: "APT",
    price: 8.91,
    change24h: -2.19,
    marketCap: 3900000000,
    volume24h: 190000000,
    image: "https://coin-images.coingecko.com/coins/images/26455/small/aptos_round.png",
    circulatingSupply: 436000000, // Mock data
    allTimeHigh: 13.14, // Mock data
    allTimeLow: 7.16, // Mock data
  },
  {
    id: "sui",
    name: "Sui",
    symbol: "SUI",
    price: 1.47,
    change24h: 7.84,
    marketCap: 4100000000,
    volume24h: 380000000,
    image: "https://coin-images.coingecko.com/coins/images/26375/small/sui-ocean-square.png",
    circulatingSupply: 2790000000, // Mock data
    allTimeHigh: 4.27, // Mock data
    allTimeLow: 0.28, // Mock data
  },
  {
    id: "toncoin",
    name: "Toncoin",
    symbol: "TON",
    price: 5.32,
    change24h: 1.16,
    marketCap: 13200000000,
    volume24h: 270000000,
    image: "https://coin-images.coingecko.com/coins/images/17980/small/ton_symbol.png",
    circulatingSupply: 2479000000, // Mock data
    allTimeHigh: 8.92, // Mock data
    allTimeLow: 0.42, // Mock data
  },
  {
    id: "render",
    name: "Render",
    symbol: "RNDR",
    price: 7.62,
    change24h: 5.47,
    marketCap: 3800000000,
    volume24h: 310000000,
    image: "https://coin-images.coingecko.com/coins/images/11636/small/rndr.png",
    circulatingSupply: 498000000, // Mock data
    allTimeHigh: 27.02, // Mock data
    allTimeLow: 0.4, // Mock data
  },
  {
    id: "injective",
    name: "Injective",
    symbol: "INJ",
    price: 24.18,
    change24h: -0.93,
    marketCap: 2400000000,
    volume24h: 140000000,
    image: "https://coin-images.coingecko.com/coins/images/12882/small/Secondary_Symbol.png",
    circulatingSupply: 99000000, // Mock data
    allTimeHigh: 52.9, // Mock data
    allTimeLow: 0.41, // Mock data
  },
];

export function getCryptoById(id: string): Crypto | undefined {
  return mockCryptos.find((crypto) => crypto.id === id);
}
