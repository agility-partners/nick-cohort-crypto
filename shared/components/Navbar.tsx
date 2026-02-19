"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useWatchlist } from "@/domains/crypto/hooks/use-watchlist";
import { DEFAULT_VIEW, isViewMode, NAV_ITEMS, VIEW_MODE } from "@/domains/crypto/constants";

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { watchlistIds } = useWatchlist();
  const hasWatchlist = isClient && watchlistIds.length > 0;
  const requestedView = searchParams.get("view");
  const defaultView = hasWatchlist ? DEFAULT_VIEW : VIEW_MODE.ALL;
  const resolvedView = isViewMode(requestedView) ? requestedView : defaultView;
  const currentView = !hasWatchlist && resolvedView === VIEW_MODE.WATCHLIST ? VIEW_MODE.ALL : resolvedView;
  const navItems = hasWatchlist
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => item.view !== VIEW_MODE.WATCHLIST);
  const isHome = pathname === "/";
  const isWatchlistRoute = pathname.startsWith("/watchlist");

  return (
    <nav className="border-b border-[var(--card-border)] bg-[var(--header-bg)] backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex h-11 items-center gap-1" role="list">
          {navItems.map((item) => {
            const isActive =
              (isHome && currentView === item.view) ||
              (isWatchlistRoute && item.view === VIEW_MODE.WATCHLIST);
            return (
              <li key={item.view}>
                <Link
                  href={item.href}
                  className={`relative block whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-green-500/[0.1] text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--badge-bg)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-2 -bottom-[9px] h-0.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
