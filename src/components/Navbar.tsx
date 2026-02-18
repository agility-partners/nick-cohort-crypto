"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const navItems = [
  { label: "All Coins", view: "all", href: "/" },
  { label: "Top Gainers", view: "gainers", href: "/?view=gainers" },
  { label: "Top Losers", view: "losers", href: "/?view=losers" },
  { label: "Highest Volume", view: "volume", href: "/?view=volume" },
];

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "all";
  const isHome = pathname === "/";

  return (
    <nav className="border-b border-white/[0.04] bg-[#0a0f0d]/60 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex h-11 items-center gap-1" role="list">
          {navItems.map((item) => {
            const isActive = isHome && currentView === item.view;
            return (
              <li key={item.view}>
                <Link
                  href={item.href}
                  className={`relative block whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-green-500/[0.1] text-green-400"
                      : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200"
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
