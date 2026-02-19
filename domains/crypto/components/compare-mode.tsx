"use client";

import { useMemo, useState } from "react";

import type { Crypto, TimeRange } from "@/domains/crypto/types/crypto.types";
import { RANGE_LABELS } from "@/domains/crypto/components/chart-config";
import { useCompareList } from "@/domains/crypto/hooks/use-compare-list";
import CompareChart from "@/domains/crypto/components/compare-chart";
import CompareSelector from "@/domains/crypto/components/compare-selector";
import { generateMockData } from "@/domains/crypto/components/generate-mock-chart-data";

interface CompareModeProps {
  allCryptos: Crypto[];
  availableCryptos: Crypto[];
}

export default function CompareMode({ allCryptos, availableCryptos }: CompareModeProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7D");
  const { compareIds, isAtLimit, toggleCompare, clearCompare } = useCompareList();

  const cryptoById = useMemo(
    () => new Map<string, Crypto>(allCryptos.map((crypto) => [crypto.id, crypto])),
    [allCryptos],
  );

  const selectedCryptos = useMemo(
    () =>
      compareIds
        .map((compareId) => cryptoById.get(compareId))
        .filter((crypto): crypto is Crypto => Boolean(crypto)),
    [compareIds, cryptoById],
  );

  const series = useMemo(
    () =>
      selectedCryptos.map((crypto) => {
        const chartData = generateMockData(crypto.id, crypto.price, crypto.change24h, timeRange);

        return {
          crypto,
          values: chartData.values,
          labels: chartData.labels,
        };
      }),
    [selectedCryptos, timeRange],
  );

  return (
    <div className="space-y-4">
      <CompareChart
        series={series}
        timeRange={timeRange}
        timeRangeLabel={RANGE_LABELS[timeRange]}
        onTimeRangeChange={setTimeRange}
      />

      <CompareSelector
        cryptos={availableCryptos}
        selectedIds={compareIds}
        isAtLimit={isAtLimit}
        onToggle={toggleCompare}
        onClear={clearCompare}
      />
    </div>
  );
}
