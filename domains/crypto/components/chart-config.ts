import type { TimeRange } from "@/domains/crypto/types/crypto.types";
import { MS_PER_DAY, MS_PER_YEAR } from "@/domains/crypto/constants";

export const TIME_RANGES: TimeRange[] = ["1D", "7D", "30D", "90D", "1Y", "ALL"];

export const RANGE_CONFIG: Record<
  TimeRange,
  {
    points: number;
    durationMs: number;
    labelFormat: Intl.DateTimeFormatOptions;
    volatility: number;
  }
> = {
  "1D": {
    points: 24,
    durationMs: MS_PER_DAY,
    labelFormat: { hour: "numeric", minute: "2-digit" },
    volatility: 0.005,
  },
  "7D": {
    points: 36,
    durationMs: 7 * MS_PER_DAY,
    labelFormat: { month: "short", day: "numeric", hour: "numeric" },
    volatility: 0.01,
  },
  "30D": {
    points: 30,
    durationMs: 30 * MS_PER_DAY,
    labelFormat: { month: "short", day: "numeric" },
    volatility: 0.02,
  },
  "90D": {
    points: 45,
    durationMs: 90 * MS_PER_DAY,
    labelFormat: { month: "short", day: "numeric" },
    volatility: 0.03,
  },
  "1Y": {
    points: 52,
    durationMs: MS_PER_YEAR,
    labelFormat: { month: "short", year: "2-digit" },
    volatility: 0.04,
  },
  ALL: {
    points: 60,
    durationMs: 5 * MS_PER_YEAR,
    labelFormat: { month: "short", year: "2-digit" },
    volatility: 0.05,
  },
};

export const RANGE_LABELS: Record<TimeRange, string> = {
  "1D": "1 day",
  "7D": "7 day",
  "30D": "30 day",
  "90D": "90 day",
  "1Y": "1 year",
  ALL: "All time",
};
