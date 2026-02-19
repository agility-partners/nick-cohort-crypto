"use client";

import Link from "next/link";

interface AddToWatchlistErrorProps {
  reset: () => void;
}

export default function AddToWatchlistError({ reset }: AddToWatchlistErrorProps) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 backdrop-blur-xl sm:p-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
          Unable to load watchlist form
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Something went wrong while opening the add-to-watchlist page.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--card-hover-border)] hover:text-[var(--accent)]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--header-bg)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--card-hover-border)] hover:text-[var(--text-primary)]"
          >
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
