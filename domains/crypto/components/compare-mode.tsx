"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { Crypto, TimeRange } from "@/domains/crypto/types/crypto.types";
import { RANGE_LABELS } from "@/domains/crypto/components/chart-config";
import { useCompareList } from "@/domains/crypto/hooks/use-compare-list";
import CompareChart from "@/domains/crypto/components/compare-chart";
import CompareSelector from "@/domains/crypto/components/compare-selector";
import { generateMockData } from "@/domains/crypto/components/generate-mock-chart-data";
import { COMPARE_PRESELECT_QUERY_KEY } from "@/domains/crypto/constants";

interface CompareModeProps {
  allCryptos: Crypto[];
  availableCryptos: Crypto[];
}

export default function CompareMode({ allCryptos, availableCryptos }: CompareModeProps) {
  const searchParams = useSearchParams();
  const [timeRange, setTimeRange] = useState<TimeRange>("7D");
  const { compareIds, isAtLimit, setSingleCompare, toggleCompare, clearCompare } = useCompareList();
  const preselectedCoinId = searchParams.get(COMPARE_PRESELECT_QUERY_KEY);

  useEffect(() => {
    if (!preselectedCoinId) {
      return;
    }

    const isValidCrypto = allCryptos.some((crypto) => crypto.id === preselectedCoinId);

    if (!isValidCrypto) {
      return;
    }

    setSingleCompare(preselectedCoinId);
  }, [allCryptos, preselectedCoinId, setSingleCompare]);

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
