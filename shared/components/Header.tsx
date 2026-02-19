import Link from "next/link";
import CoinSightLogo from "./coin-sight-logo";
import ThemeToggle from "./theme-toggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5">
          <CoinSightLogo
            size={36}
            className="drop-shadow-lg transition-transform group-hover:scale-105"
          />
          <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-xl font-extrabold tracking-tight text-transparent sm:text-2xl">
            CoinSight
          </span>
        </Link>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
