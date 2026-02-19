"use client";

import type { Crypto } from "@/domains/crypto/types/crypto.types";
import { MAX_COMPARE_ASSETS } from "@/domains/crypto/constants";
import CryptoLogo from "@/domains/crypto/components/crypto-logo";

interface CompareSelectorProps {
  cryptos: Crypto[];
  selectedIds: string[];
  isAtLimit: boolean;
  onToggle: (cryptoId: string) => void;
  onClear: () => void;
}

export default function CompareSelector({
  cryptos,
  selectedIds,
  isAtLimit,
  onToggle,
  onClear,
}: CompareSelectorProps) {
  return (
    <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Select up to {MAX_COMPARE_ASSETS} coins
        </h3>
        <button
          type="button"
          onClick={onClear}
          disabled={selectedIds.length === 0}
          className="rounded-md border border-[var(--card-border)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--card-hover-border)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear
        </button>
      </div>

      <p className="mb-3 text-xs text-[var(--text-muted)]">
        {selectedIds.length}/{MAX_COMPARE_ASSETS} selected
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {cryptos.map((crypto) => {
          const isSelected = selectedIds.includes(crypto.id);
          const isDisabled = !isSelected && isAtLimit;

          return (
            <button
              key={crypto.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onToggle(crypto.id)}
              className={`rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                isSelected
                  ? "border-[var(--card-hover-border)] bg-[var(--accent)]/10"
                  : "border-[var(--card-border)] bg-transparent hover:border-[var(--card-hover-border)]"
              } ${isDisabled ? "cursor-not-allowed opacity-45" : ""}`}
            >
              <div className="flex items-center gap-2">
                <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--badge-bg)] ring-1 ring-[var(--ring-color)]">
                  <CryptoLogo
                    src={crypto.image}
                    name={crypto.name}
                    symbol={crypto.symbol}
                    size={28}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium leading-tight text-[var(--text-primary)]">
                    {crypto.name}
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                    {crypto.symbol}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
