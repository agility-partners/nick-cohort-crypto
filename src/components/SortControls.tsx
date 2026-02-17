"use client";

export type SortKey = "name" | "price" | "change24h" | "marketCap";
export type SortDirection = "asc" | "desc";

interface SortControlsProps {
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSortKeyChange: (key: SortKey) => void;
  onDirectionToggle: () => void;
}

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "marketCap", label: "Market Cap" },
  { value: "price", label: "Price" },
  { value: "change24h", label: "24h Change" },
  { value: "name", label: "Name" },
];

export default function SortControls({
  sortKey,
  sortDirection,
  onSortKeyChange,
  onDirectionToggle,
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm text-gray-400">
        Sort by
      </label>

      <select
        id="sort-select"
        value={sortKey}
        onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
        className="appearance-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm text-gray-200 shadow-sm backdrop-blur-xl outline-none transition-colors hover:border-green-500/30 focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0a0f0d] text-gray-200">
            {opt.label}
          </option>
        ))}
      </select>

      <button
        onClick={onDirectionToggle}
        aria-label={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
        title={sortDirection === "asc" ? "Ascending" : "Descending"}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-gray-400 backdrop-blur-xl transition-colors hover:border-green-500/30 hover:text-green-400"
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
