import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
      },
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com",
      },
      {
        protocol: "https",
        hostname: "cryptologos.cc",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
