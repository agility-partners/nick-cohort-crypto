import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/shared/components/header";
import Navbar from "@/shared/components/navbar";
import ThemeProvider from "@/shared/components/theme-provider";
import { WatchlistProvider } from "@/domains/crypto/hooks/use-watchlist";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoinSight",
  description: "Track Crypto. All In One Place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <WatchlistProvider>
            {/* animated bouncing green blobs */}
            <div className="bg-blobs" aria-hidden="true">
              <div className="blob blob-1" />
              <div className="blob blob-2" />
            </div>

            <div className="relative z-10">
              <Header />
              <Suspense>
                <Navbar />
              </Suspense>
              {children}
            </div>
          </WatchlistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
