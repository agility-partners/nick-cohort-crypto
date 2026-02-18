interface StatChipProps {
  label: string;
  value: string;
  color?: "positive" | "negative" | "neutral";
}

export default function StatChip({ label, value, color = "neutral" }: StatChipProps) {
  const valueColor =
    color === "positive"
      ? "text-[var(--positive)]"
      : color === "negative"
        ? "text-[var(--negative)]"
        : "text-[var(--text-primary)]";

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-2.5 py-1">
      <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      <span className={`text-xs font-semibold ${valueColor}`}>{value}</span>
    </div>
  );
}
