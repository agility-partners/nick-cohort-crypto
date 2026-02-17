interface PriceDisplayProps {
  price: number;
  change?: number;
  size?: "sm" | "lg";
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Displays a crypto price in USD and optionally a 24h percentage change
 * with color-coded directional arrow styling.
 */
export default function PriceDisplay({ price, change, size = "sm" }: PriceDisplayProps) {
  const hasChange = typeof change === "number";
  const isPositive = hasChange && change >= 0;

  const priceClasses =
    size === "lg"
      ? "text-2xl font-bold text-green-400"
      : "text-base font-semibold text-gray-200";

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className={priceClasses}>{usdFormatter.format(price)}</span>
      {hasChange && (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
            isPositive
              ? "bg-green-500/15 text-green-400"
              : "bg-rose-500/15 text-rose-400"
          }`}
        >
          <span aria-hidden="true">{isPositive ? "▲" : "▼"}</span>
          <span>{`${Math.abs(change).toFixed(2)}%`}</span>
        </span>
      )}
    </div>
  );
}