"use client";

import type { SortKey, SortDirection } from "@/domains/crypto/types/crypto.types";

export type { SortKey, SortDirection };

interface SortControlsProps {
  sortKey: SortKey;
  sortDirection: SortDirection;
  searchQuery: string;
  onSortKeyChange: (key: SortKey) => void;
  onSearchQueryChange: (query: string) => void;
  onDirectionToggle: () => void;
}

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "marketCap", label: "Market Cap" },
  { value: "price", label: "Price" },
  { value: "change24h", label: "24h Change" },
  { value: "volume24h", label: "24h Volume" },
  { value: "name", label: "Name" },
];

export default function SortControls({
  sortKey,
  sortDirection,
  searchQuery,
  onSortKeyChange,
  onSearchQueryChange,
  onDirectionToggle,
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="crypto-search" className="sr-only">
        Search coins
      </label>
      <input
        id="crypto-search"
        type="search"
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        placeholder="Search coins"
        className="w-44 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-1.5 text-sm text-[var(--text-primary)] shadow-sm backdrop-blur-xl outline-none transition-colors placeholder:text-[var(--text-muted)] hover:border-[var(--card-hover-border)] focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
      />

      <label htmlFor="sort-select" className="text-sm text-[var(--text-secondary)]">
        Sort by
      </label>

      <select
        id="sort-select"
        value={sortKey}
        onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
        className="appearance-none rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-1.5 text-sm text-[var(--text-primary)] shadow-sm backdrop-blur-xl outline-none transition-colors hover:border-[var(--card-hover-border)] focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
      >
        {sortOptions.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-[var(--select-bg)] text-[var(--text-primary)]"
          >
            {opt.label}
          </option>
        ))}
      </select>

      <button
        onClick={onDirectionToggle}
        aria-label={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
        title={sortDirection === "asc" ? "Ascending" : "Descending"}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-secondary)] backdrop-blur-xl transition-colors hover:border-[var(--card-hover-border)] hover:text-[var(--accent)]"
      >
        <span
          className="inline-block transition-transform duration-200"
          style={{ transform: sortDirection === "asc" ? "scaleY(1)" : "scaleY(-1)" }}
        >
          ▲
        </span>
      </button>
    </div>
  );
}
