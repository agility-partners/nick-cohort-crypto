"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { VIEW_MODE } from "@/domains/crypto/constants";
import { useWatchlist } from "@/domains/crypto/hooks/use-watchlist";
import { mockCryptos } from "@/domains/crypto/mock/cryptos.mock";

const WATCHLIST_ROUTE = `/?view=${VIEW_MODE.WATCHLIST}`;
const SEARCH_PLACEHOLDER = "Search coins";

export default function WatchlistAddContent() {
  const router = useRouter();
  const { addManyToWatchlist, watchlistIds } = useWatchlist();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableCryptos = useMemo(
    () =>
      [...mockCryptos]
        .filter((crypto) => !watchlistIds.includes(crypto.id))
        .sort((a, b) => b.marketCap - a.marketCap),
    [watchlistIds],
  );

  const filteredCryptos = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return availableCryptos;
    }

    return availableCryptos.filter((crypto) => {
      const normalizedName = crypto.name.toLowerCase();
      const normalizedSymbol = crypto.symbol.toLowerCase();

      return (
        normalizedName.includes(normalizedQuery) || normalizedSymbol.includes(normalizedQuery)
      );
    });
  }, [availableCryptos, searchQuery]);

  const selectedAvailableIds = useMemo(() => {
    const availableIds = new Set(availableCryptos.map((crypto) => crypto.id));

    return selectedIds.filter((id) => availableIds.has(id));
  }, [availableCryptos, selectedIds]);

  const toggleSelectedId = (cryptoId: string) => {
    setFormError(null);

    setSelectedIds((currentIds) => {
      if (currentIds.includes(cryptoId)) {
        return currentIds.filter((id) => id !== cryptoId);
      }

      return [...currentIds, cryptoId];
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedAvailableIds.length === 0) {
      setFormError("Select at least one cryptocurrency before submitting.");
      return;
    }

    try {
      addManyToWatchlist(selectedAvailableIds);
      setFormError(null);
      startTransition(() => {
        router.push(WATCHLIST_ROUTE);
      });
    } catch {
      setFormError("Unable to update your watchlist. Please try again.");
    }
  };

  return (
    <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 backdrop-blur-xl sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">Add to watchlist</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Select one or more coins from the market and add them to your watchlist.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="watchlist-search" className="sr-only">
            Search coins
          </label>
          <input
            id="watchlist-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            className="w-44 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm backdrop-blur-xl outline-none transition-colors placeholder:text-[var(--text-muted)] hover:border-[var(--card-hover-border)] focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
          />
          <span className="rounded-full bg-[var(--badge-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
            {selectedAvailableIds.length} selected
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <fieldset disabled={isPending}>
          <legend className="sr-only">Crypto selections</legend>
          {availableCryptos.length === 0 ? (
            <p className="rounded-xl border border-[var(--card-border)] bg-[var(--header-bg)] p-4 text-sm text-[var(--text-muted)]">
              All available coins are already in your watchlist.
            </p>
          ) : filteredCryptos.length === 0 ? (
            <p className="rounded-xl border border-[var(--card-border)] bg-[var(--header-bg)] p-4 text-sm text-[var(--text-muted)]">
              No coins match your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCryptos.map((crypto) => {
                const isChecked = selectedAvailableIds.includes(crypto.id);

                return (
                  <label
                    key={crypto.id}
                    htmlFor={`crypto-option-${crypto.id}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                      isChecked
                        ? "border-green-500/40 bg-green-500/[0.08]"
                        : "border-[var(--card-border)] bg-[var(--header-bg)]"
                    }`}
                  >
                    <input
                      id={`crypto-option-${crypto.id}`}
                      type="checkbox"
                      checked={isChecked}
                      disabled={isPending}
                      onChange={() => toggleSelectedId(crypto.id)}
                      className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--card-bg)] text-green-500 focus:ring-green-500/30"
                    />
                    <Image
                      src={crypto.image}
                      alt={`${crypto.name} logo`}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">{crypto.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{crypto.symbol}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>

        <div className="mt-4 min-h-5" aria-live="polite">
          {formError && <p className="text-sm text-[var(--negative)]">{formError}</p>}
          {isPending && (
            <p className="text-sm text-[var(--text-secondary)]">Saving your watchlist changes...</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Link
            href={WATCHLIST_ROUTE}
            aria-disabled={isPending}
            className="inline-flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--header-bg)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--card-hover-border)] hover:text-[var(--text-primary)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={selectedAvailableIds.length === 0 || isPending}
            className="inline-flex items-center rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Add selected"}
          </button>
        </div>
      </form>
    </section>
  );
}
